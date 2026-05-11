#!/usr/bin/env node

import { cp, mkdir, readdir, readFile, rm } from 'node:fs/promises';
import { existsSync, realpathSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  PROTOCOL_PROGRAM_ID,
  createConnection,
  createSafeProtocolClient,
  getOmegaXNetworkInfo,
  listProtocolAccountNames,
  listProtocolInstructionNames,
} from './index.js';
import { OmegaXError, OmegaXProgramMismatchError } from './errors.js';

const cliDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(cliDir, '..');
const templatesRoot = resolve(packageRoot, 'templates');
const packageJsonPath = resolve(packageRoot, 'package.json');
const supportedTemplates = ['node-backend', 'next-route', 'oracle-worker'];
const subpaths = [
  '@omegax/protocol-sdk',
  '@omegax/protocol-sdk/claims',
  '@omegax/protocol-sdk/errors',
  '@omegax/protocol-sdk/oracle',
  '@omegax/protocol-sdk/protocol',
  '@omegax/protocol-sdk/protocol_models',
  '@omegax/protocol-sdk/protocol_seeds',
  '@omegax/protocol-sdk/rpc',
  '@omegax/protocol-sdk/transactions',
  '@omegax/protocol-sdk/types',
  '@omegax/protocol-sdk/utils',
];

type CheckStatus = 'pass' | 'fail';

interface DoctorCheck {
  name: string;
  status: CheckStatus;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

interface DoctorResult {
  ok: boolean;
  version: string;
  checks: DoctorCheck[];
}

interface CliOptions {
  json?: boolean;
  network?: string;
  rpcUrl?: string;
  out?: string;
  force?: boolean;
}

function usage(): string {
  return [
    'Usage:',
    '  omegax-sdk doctor [--network devnet] [--rpc-url <url>] [--json]',
    '  omegax-sdk scaffold <node-backend|next-route|oracle-worker> [--out <dir>] [--force]',
    '  omegax-sdk examples',
  ].join('\n');
}

function parseOptions(args: string[]): {
  command: string | null;
  positional: string[];
  options: CliOptions;
} {
  const [command = null, ...rest] = args;
  const options: CliOptions = {};
  const positional: string[] = [];

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    if (arg === '--json') {
      options.json = true;
      continue;
    }
    if (arg === '--force') {
      options.force = true;
      continue;
    }
    if (arg === '--network' || arg === '--rpc-url' || arg === '--out') {
      const value = rest[index + 1];
      if (!value || value.startsWith('--')) {
        throw new Error(`${arg} requires a value`);
      }
      if (arg === '--network') options.network = value;
      if (arg === '--rpc-url') options.rpcUrl = value;
      if (arg === '--out') options.out = value;
      index += 1;
      continue;
    }
    if (arg.startsWith('--')) {
      throw new Error(`Unknown option ${arg}`);
    }
    positional.push(arg);
  }

  return { command, positional, options };
}

async function packageVersion(): Promise<string> {
  const pkg = JSON.parse(await readFile(packageJsonPath, 'utf8')) as {
    version?: string;
  };
  return String(pkg.version ?? 'unknown');
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  let timeout: NodeJS.Timeout | null = null;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_resolve, reject) => {
        timeout = setTimeout(
          () => reject(new Error(`timed out after ${timeoutMs}ms`)),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

async function collectDoctorCheck(
  name: string,
  code: string,
  run: () =>
    | Promise<Record<string, unknown> | void>
    | Record<string, unknown>
    | void,
): Promise<DoctorCheck> {
  try {
    const details = await run();
    return {
      name,
      code,
      status: 'pass',
      message: 'ok',
      ...(details ? { details } : {}),
    };
  } catch (error) {
    return {
      name,
      code,
      status: 'fail',
      message: error instanceof Error ? error.message : String(error),
      ...(error instanceof OmegaXError && error.details
        ? { details: error.details }
        : {}),
    };
  }
}

export async function runDoctor(
  options: CliOptions = {},
): Promise<DoctorResult> {
  const version = await packageVersion();
  const checks: DoctorCheck[] = [];
  const network = options.network ?? 'devnet';

  checks.push(
    await collectDoctorCheck('node-version', 'NODE_VERSION', () => {
      const major = Number(process.versions.node.split('.')[0] ?? '0');
      if (major < 20) {
        throw new Error(`Node.js >=20 is required; found ${process.version}`);
      }
      return { node: process.version };
    }),
  );

  checks.push(
    await collectDoctorCheck('esm-runtime', 'ESM_RUNTIME', () => ({
      importMetaUrl: import.meta.url,
    })),
  );

  checks.push(
    await collectDoctorCheck('package-version', 'PACKAGE_VERSION', () => ({
      version,
    })),
  );

  checks.push(
    await collectDoctorCheck(
      'package-subpath-imports',
      'PACKAGE_SUBPATHS',
      async () => {
        for (const subpath of subpaths) {
          const imported = await import(subpath);
          if (Object.keys(imported).length === 0) {
            throw new Error(`${subpath} exported no runtime bindings`);
          }
        }
        return { subpaths };
      },
    ),
  );

  checks.push(
    await collectDoctorCheck('network-metadata', 'NETWORK_METADATA', () => {
      const networkInfo = getOmegaXNetworkInfo(network as never);
      return {
        network: networkInfo.network,
        cluster: networkInfo.solanaCluster,
        defaultRpcUrl: networkInfo.defaultRpcUrl,
        status: networkInfo.status,
      };
    }),
  );

  checks.push(
    await collectDoctorCheck('canonical-program-id', 'PROGRAM_ID', () => {
      const connection = createConnection({
        network: network as never,
        rpcUrl: options.rpcUrl,
        warnOnComingSoon: false,
      });
      const client = createSafeProtocolClient(connection, {
        programId: PROTOCOL_PROGRAM_ID,
      });
      if (client.getProgramId().toBase58() !== PROTOCOL_PROGRAM_ID) {
        throw new Error('safe client did not resolve the canonical program ID');
      }
      return { programId: client.getProgramId().toBase58() };
    }),
  );

  checks.push(
    await collectDoctorCheck('protocol-surface', 'PROTOCOL_SURFACE', () => {
      const instructions = listProtocolInstructionNames();
      const accounts = listProtocolAccountNames();
      if (instructions.length === 0 || accounts.length === 0) {
        throw new Error('protocol instruction/account surface is empty');
      }
      return { instructions: instructions.length, accounts: accounts.length };
    }),
  );

  checks.push(
    await collectDoctorCheck('typed-errors', 'TYPED_ERRORS', () => {
      try {
        createSafeProtocolClient(createConnection(), {
          programId: '11111111111111111111111111111111',
        });
      } catch (error) {
        if (
          error instanceof OmegaXProgramMismatchError &&
          error.code === 'OMEGAX_PROGRAM_MISMATCH'
        ) {
          return { code: error.code };
        }
        throw error;
      }
      throw new Error('custom program ID did not throw a typed error');
    }),
  );

  if (options.rpcUrl) {
    checks.push(
      await collectDoctorCheck(
        'rpc-connectivity',
        'RPC_CONNECTIVITY',
        async () => {
          const connection = createConnection({
            network: network as never,
            rpcUrl: options.rpcUrl,
            warnOnComingSoon: false,
          });
          const blockhash = await withTimeout(
            connection.getLatestBlockhash('confirmed'),
            5_000,
          );
          return {
            rpcUrl: options.rpcUrl,
            blockhash: blockhash.blockhash,
          };
        },
      ),
    );
  }

  return {
    ok: checks.every((check) => check.status === 'pass'),
    version,
    checks,
  };
}

function printDoctorHuman(result: DoctorResult): void {
  console.log(`OmegaX SDK doctor v${result.version}`);
  for (const check of result.checks) {
    const label = check.status === 'pass' ? 'PASS' : 'FAIL';
    console.log(`${label} ${check.name}: ${check.message}`);
  }
  console.log(result.ok ? 'Doctor passed.' : 'Doctor failed.');
}

async function directoryIsEmpty(path: string): Promise<boolean> {
  if (!existsSync(path)) return true;
  const entries = await readdir(path);
  return entries.length === 0;
}

export async function scaffoldTemplate(params: {
  template: string;
  out?: string;
  force?: boolean;
}): Promise<{ template: string; outDir: string }> {
  if (!supportedTemplates.includes(params.template)) {
    throw new Error(
      `Unknown template "${params.template}". Supported templates: ${supportedTemplates.join(', ')}`,
    );
  }

  const sourceDir = resolve(templatesRoot, params.template);
  const outDir = resolve(
    process.cwd(),
    params.out ?? `omegax-${params.template}`,
  );
  if (!existsSync(sourceDir)) {
    throw new Error(`Template files are missing for ${params.template}`);
  }
  if (!(await directoryIsEmpty(outDir))) {
    if (!params.force) {
      throw new Error(
        `Refusing to overwrite non-empty directory ${outDir}. Pass --force to replace it.`,
      );
    }
    await rm(outDir, { recursive: true, force: true });
  }

  await mkdir(dirname(outDir), { recursive: true });
  await cp(sourceDir, outDir, { recursive: true });
  return { template: params.template, outDir };
}

function printExamples(): void {
  console.log(
    [
      'OmegaX SDK examples:',
      '  npm run example:smoke',
      '  npm run example:app',
      '  npm run example:oracle',
      '  npm run dogfood:consumer',
      '',
      'Public docs:',
      '  https://docs.omegax.health/docs/sdk/sdk-getting-started',
      '  https://docs.omegax.health/docs/sdk/sdk-recipes',
      '  https://docs.omegax.health/docs/sdk/sdk-top-apis',
      '  https://docs.omegax.health/docs/sdk/sdk-error-catalog',
    ].join('\n'),
  );
}

export async function runCli(argv = process.argv.slice(2)): Promise<number> {
  try {
    const parsed = parseOptions(argv);

    if (
      !parsed.command ||
      parsed.command === 'help' ||
      parsed.command === '--help'
    ) {
      console.log(usage());
      return 0;
    }

    if (parsed.command === 'doctor') {
      const result = await runDoctor(parsed.options);
      if (parsed.options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        printDoctorHuman(result);
      }
      return result.ok ? 0 : 1;
    }

    if (parsed.command === 'scaffold') {
      const template = parsed.positional[0];
      if (!template) {
        throw new Error('scaffold requires a template name');
      }
      const result = await scaffoldTemplate({
        template,
        out: parsed.options.out,
        force: parsed.options.force,
      });
      console.log(`Created ${result.template} template at ${result.outDir}`);
      return 0;
    }

    if (parsed.command === 'examples') {
      printExamples();
      return 0;
    }

    throw new Error(`Unknown command ${parsed.command}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

function isDirectCliRun(): boolean {
  if (!process.argv[1]) return false;

  try {
    return (
      realpathSync(fileURLToPath(import.meta.url)) ===
      realpathSync(process.argv[1])
    );
  } catch {
    return false;
  }
}

if (isDirectCliRun()) {
  process.exitCode = await runCli();
}
