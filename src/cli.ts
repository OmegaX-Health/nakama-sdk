#!/usr/bin/env node

import { cp, mkdir, readdir, readFile, rm } from 'node:fs/promises';
import { existsSync, realpathSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ROBINHOOD_CONTRACT_ROLES,
  getGeneratedRobinhoodArtifactBundle,
  validateRobinhoodDeploymentManifest,
} from './robinhood/artifacts.js';
import {
  getRobinhoodCaip2,
  getRobinhoodChainId,
  createRobinhoodPublicClient,
  normalizeRobinhoodAddress,
  type RobinhoodNetwork,
} from './robinhood/chains.js';
import {
  NakamaRobinhoodAddressError,
  NakamaRobinhoodError,
  NakamaRobinhoodWrongChainError,
} from './robinhood/errors.js';

const cliDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(cliDir, '..');
const templatesRoot = resolve(packageRoot, 'templates');
const packageJsonPath = resolve(packageRoot, 'package.json');
const supportedTemplates = ['node-backend', 'next-route', 'oracle-worker'];
const subpaths = [
  '@nakama-health/protocol-sdk',
  '@nakama-health/protocol-sdk/robinhood',
  '@nakama-health/protocol-sdk/errors',
  '@nakama-health/protocol-sdk/ethereum',
  '@nakama-health/protocol-sdk/ethereum_contract',
  '@nakama-health/protocol-sdk/ethereum_oracle',
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
    '  nakama-sdk doctor [--network mainnet|testnet] [--rpc-url <url>] [--json]',
    '  nakama-sdk scaffold <node-backend|next-route|oracle-worker> [--out <dir>] [--force]',
    '  nakama-sdk examples',
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
      ...(error instanceof NakamaRobinhoodError && error.details
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
  const network = options.network ?? 'mainnet';

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
    await collectDoctorCheck('robinhood-network', 'ROBINHOOD_NETWORK', () => {
      if (network !== 'mainnet' && network !== 'testnet') {
        throw new NakamaRobinhoodWrongChainError(
          `Robinhood network must be mainnet or testnet; received ${network}.`,
        );
      }
      return {
        network,
        chainId: getRobinhoodChainId(network),
        caip2: getRobinhoodCaip2(network),
      };
    }),
  );

  checks.push(
    await collectDoctorCheck(
      'deployment-manifest',
      'DEPLOYMENT_MANIFEST',
      () => {
        if (network !== 'mainnet' && network !== 'testnet') {
          throw new NakamaRobinhoodWrongChainError(
            `Cannot select a deployment for unsupported network ${network}.`,
          );
        }
        const bundle = getGeneratedRobinhoodArtifactBundle();
        const deployment = validateRobinhoodDeploymentManifest(
          bundle.deployments[network],
          network,
        );
        return {
          status: deployment.status,
          chainId: deployment.chainId,
          caip2: deployment.caip2,
          protocolRelease: deployment.protocolRelease,
          artifactBundleSha256: deployment.artifactBundleSha256,
          settlementAsset: deployment.settlementAsset,
          contracts: Object.fromEntries(
            ROBINHOOD_CONTRACT_ROLES.map((role) => [
              role,
              deployment.contracts[role] ?? null,
            ]),
          ),
        };
      },
    ),
  );

  checks.push(
    await collectDoctorCheck('contract-surface', 'CONTRACT_SURFACE', () => {
      const bundle = getGeneratedRobinhoodArtifactBundle();
      const contractCounts = Object.fromEntries(
        ROBINHOOD_CONTRACT_ROLES.map((role) => {
          const artifact = bundle.contracts[role];
          if (artifact == null) {
            throw new Error(`generated bundle is missing ${role}`);
          }
          return [
            role,
            {
              contractName: artifact.contractName,
              abiSha256: artifact.abiSha256,
              functions: artifact.abi.filter(
                (entry) => entry.type === 'function',
              ).length,
              events: artifact.abi.filter((entry) => entry.type === 'event')
                .length,
            },
          ];
        }),
      );
      if (
        Object.values(contractCounts).some((counts) => counts.functions === 0)
      ) {
        throw new Error('one or more contract ABI function surfaces are empty');
      }
      return { contracts: contractCounts };
    }),
  );

  checks.push(
    await collectDoctorCheck('typed-errors', 'TYPED_ERRORS', () => {
      try {
        normalizeRobinhoodAddress('not-a-robinhood-address');
      } catch (error) {
        if (
          error instanceof NakamaRobinhoodAddressError &&
          error.code === 'NAKAMA_ROBINHOOD_ADDRESS_ERROR'
        ) {
          return { code: error.code };
        }
        throw error;
      }
      throw new Error('invalid Robinhood address did not throw a typed error');
    }),
  );

  if (options.rpcUrl) {
    checks.push(
      await collectDoctorCheck(
        'rpc-connectivity',
        'RPC_CONNECTIVITY',
        async () => {
          if (network !== 'mainnet' && network !== 'testnet') {
            throw new NakamaRobinhoodWrongChainError(
              `Cannot create an RPC client for unsupported network ${network}.`,
            );
          }
          const selectedNetwork: RobinhoodNetwork = network;
          const client = createRobinhoodPublicClient({
            network: selectedNetwork,
            rpcUrl: options.rpcUrl!,
          });
          const chainId = await withTimeout(client.getChainId(), 5_000);
          const expectedChainId = getRobinhoodChainId(selectedNetwork);
          if (chainId !== expectedChainId) {
            throw new NakamaRobinhoodWrongChainError(
              `RPC returned chainId ${chainId}; expected Robinhood ${selectedNetwork} chainId ${expectedChainId}.`,
            );
          }
          return {
            rpcUrl: options.rpcUrl,
            chainId,
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
  console.log(`Nakama SDK doctor v${result.version}`);
  for (const check of result.checks) {
    const label = check.status === 'pass' ? 'PASS' : 'FAIL';
    console.log(`${label} ${check.name}: ${check.message}`);
  }
  if (result.ok) {
    console.log(
      'Doctor passed. Next: run `npx @nakama-health/protocol-sdk examples` or scaffold a template.',
    );
  } else {
    console.log(
      'Doctor failed. Rerun with `--json` for machine-readable details and see docs/TROUBLESHOOTING.md.',
    );
  }
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
    params.out ?? `nakama-${params.template}`,
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
      'Nakama SDK examples:',
      '  npm run example:smoke',
      '  npm run example:contract',
      '  npm run example:authorization',
      '  npm run dogfood:consumer',
      '',
      'Public docs:',
      '  https://docs.nakama.health/docs/sdk/sdk-getting-started',
      '  https://docs.nakama.health/docs/sdk/sdk-recipes',
      '  https://docs.nakama.health/docs/sdk/sdk-top-apis',
      '  https://docs.nakama.health/docs/sdk/sdk-error-catalog',
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
