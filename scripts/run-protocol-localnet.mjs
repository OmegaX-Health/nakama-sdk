#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { Keypair, PublicKey } from '@solana/web3.js';

import {
  ensureProtocolWorkspace,
  protocolWorkspacePaths,
  resolveProtocolRepo,
} from './protocol-workspace.mjs';

const sdkRoot = process.cwd();
const protocolRepo = resolveProtocolRepo(sdkRoot);
const protocolPaths = ensureProtocolWorkspace(protocolRepo);
const artifactsRoot = resolve(sdkRoot, 'artifacts');
const keepArtifacts = process.env.OMEGAX_E2E_KEEP_ARTIFACTS === '1';
const skipBuild = process.env.OMEGAX_PROTOCOL_SKIP_BUILD === '1';
const protocolProgramId =
  process.env.PROTOCOL_PROGRAM_ID ??
  process.env.NEXT_PUBLIC_PROTOCOL_PROGRAM_ID ??
  'Bn6eixac1QEEVErGBvBjxAd6pgB9e2q4XHvAkinQ5y1B';
const classicTokenProgramId = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const zeroPubkey = new PublicKey('11111111111111111111111111111111');

function nowStamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function freePort(excludedPorts = new Set()) {
  const net = await import('node:net');
  for (let attempt = 0; attempt < 100; attempt += 1) {
    // Reserve an OS-assigned ephemeral port, then discard excluded candidates.
    const port = await new Promise((resolvePort, rejectPort) => {
      const server = net.createServer();
      server.unref();
      server.once('error', rejectPort);
      server.listen(0, '127.0.0.1', () => {
        const address = server.address();
        if (!address || typeof address === 'string') {
          server.close(() =>
            rejectPort(new Error('Unable to allocate a local port')),
          );
          return;
        }
        server.close((error) => {
          if (error) {
            rejectPort(error);
            return;
          }
          resolvePort(address.port);
        });
      });
    });

    if (!excludedPorts.has(port)) {
      return port;
    }
  }

  throw new Error(
    'Unable to allocate a free local port outside the excluded set',
  );
}

async function freeRpcPortPair() {
  const net = await import('node:net');
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const rpcPort = await freePort();
    const wsPort = rpcPort + 1;
    const probe = net.createServer();
    try {
      await new Promise((resolveListen, rejectListen) => {
        probe.unref();
        probe.once('error', rejectListen);
        probe.listen(wsPort, '127.0.0.1', resolveListen);
      });
      await new Promise((resolveClose, rejectClose) => {
        probe.close((error) => {
          if (error) {
            rejectClose(error);
            return;
          }
          resolveClose();
        });
      });
      return rpcPort;
    } catch {
      try {
        probe.close();
      } catch {
        // ignore best-effort cleanup
      }
    }
  }
  throw new Error('Unable to allocate validator RPC and websocket ports');
}

async function freeDynamicPortRangeStart(params) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const start = await freePort();
    const end = start + params.span - 1;
    const overlapsReserved = [...params.excludedPorts].some(
      (port) => port >= start && port <= end,
    );
    if (!overlapsReserved) {
      return start;
    }
  }

  throw new Error('Unable to allocate a validator dynamic port range');
}

function accountDiscriminator(name) {
  return createHash('sha256').update(`account:${name}`).digest().subarray(0, 8);
}

function encodeU16(value) {
  const encoded = Buffer.alloc(2);
  encoded.writeUInt16LE(value);
  return encoded;
}

function encodeString(value) {
  const encoded = Buffer.from(value, 'utf8');
  const length = Buffer.alloc(4);
  length.writeUInt32LE(encoded.length);
  return Buffer.concat([length, encoded]);
}

async function createLegacySchemaFixture(tempRoot) {
  const schemaKeyHashHex = createHash('sha256')
    .update('legacy-schema-without-dependency-ledger')
    .digest('hex');
  const schemaKeyHash = Buffer.from(schemaKeyHashHex, 'hex');
  const [schemaAddress, schemaBump] = PublicKey.findProgramAddressSync(
    [Buffer.from('schema'), schemaKeyHash],
    new PublicKey(protocolProgramId),
  );
  const schemaData = Buffer.concat([
    accountDiscriminator('OutcomeSchemaRegistryEntry'),
    schemaKeyHash,
    encodeString('legacy.schema'),
    encodeU16(1),
    createHash('sha256').update('legacy-schema-payload').digest(),
    zeroPubkey.toBuffer(),
    Buffer.from([0]),
    Buffer.from([0]),
    Buffer.from([0]),
    createHash('sha256').update('legacy-schema-interop').digest(),
    createHash('sha256').update('legacy-schema-codes').digest(),
    encodeU16(0),
    encodeString('https://legacy.schema.local/migrated'),
    Buffer.from([schemaBump]),
  ]);
  const dumpPath = join(tempRoot, 'legacy-schema-account.json');
  writeFileSync(
    dumpPath,
    JSON.stringify({
      pubkey: schemaAddress.toBase58(),
      account: {
        lamports: 1_000_000_000,
        data: [schemaData.toString('base64'), 'base64'],
        owner: protocolProgramId,
        executable: false,
        rentEpoch: 0,
        space: schemaData.length,
      },
    }),
    'utf8',
  );

  return {
    dumpPath,
    schemaAddress: schemaAddress.toBase58(),
    schemaKeyHashHex,
  };
}

async function createFundedSystemAccountFixture(tempRoot, label, keypair) {
  const dumpPath = join(tempRoot, `${label}-funded-account.json`);
  writeFileSync(
    dumpPath,
    JSON.stringify({
      pubkey: keypair.publicKey.toBase58(),
      account: {
        lamports: 5_000_000_000,
        data: ['', 'base64'],
        owner: zeroPubkey.toBase58(),
        executable: false,
        rentEpoch: 0,
        space: 0,
      },
    }),
    'utf8',
  );

  return {
    dumpPath,
    address: keypair.publicKey.toBase58(),
    secretKeyJson: JSON.stringify(Array.from(keypair.secretKey)),
  };
}

async function waitForRpc(rpcUrl) {
  const startedAt = Date.now();
  let lastError = 'validator not ready';

  while (Date.now() - startedAt < 30_000) {
    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getLatestBlockhash',
          params: [{ commitment: 'confirmed' }],
        }),
      });
      const payload = await response.json();
      if (payload?.result?.value?.blockhash) {
        const healthResponse = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 2,
            method: 'getHealth',
          }),
        });
        const healthPayload = await healthResponse.json();
        if (healthPayload?.result === 'ok') {
          return;
        }
        lastError = JSON.stringify(healthPayload);
      } else {
        lastError = JSON.stringify(payload);
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await new Promise((resolveSleep) => setTimeout(resolveSleep, 500));
  }

  throw new Error(
    `Timed out waiting for validator RPC at ${rpcUrl}: ${lastError}`,
  );
}

async function waitForProgram(rpcUrl, programId) {
  const startedAt = Date.now();
  let lastError = 'program account not ready';

  while (Date.now() - startedAt < 30_000) {
    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 3,
          method: 'getAccountInfo',
          params: [programId, { commitment: 'confirmed', encoding: 'base64' }],
        }),
      });
      const payload = await response.json();
      if (payload?.result?.value?.executable === true) {
        return;
      }
      lastError = JSON.stringify(payload);
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await new Promise((resolveSleep) => setTimeout(resolveSleep, 500));
  }

  throw new Error(
    `Timed out waiting for program ${programId} on ${rpcUrl}: ${lastError}`,
  );
}

async function runCommand(params) {
  await new Promise((resolveRun, rejectRun) => {
    const child = spawn(params.command, params.args, {
      cwd: params.cwd,
      env: params.env ?? process.env,
      stdio: 'inherit',
    });

    child.once('error', rejectRun);
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolveRun();
        return;
      }
      rejectRun(
        new Error(
          `${params.command} ${params.args.join(' ')} failed with code=${code ?? 'null'} signal=${signal ?? 'null'}`,
        ),
      );
    });
  });
}

async function runPhase(params) {
  const phaseRoot = await mkdtemp(join(tmpdir(), `${params.name}-`));
  const ledgerDir = join(phaseRoot, 'ledger');
  const logPath = join(phaseRoot, 'validator.log');

  await mkdir(ledgerDir, { recursive: true });
  mkdirSync(artifactsRoot, { recursive: true });

  const rpcPort = await freeRpcPortPair();
  const wsPort = rpcPort + 1;
  const reservedPorts = new Set([rpcPort, wsPort]);
  const faucetPort = await freePort(reservedPorts);
  reservedPorts.add(faucetPort);
  const dynamicPortStart = await freeDynamicPortRangeStart({
    excludedPorts: reservedPorts,
    span: 33,
  });
  const dynamicPortEnd = dynamicPortStart + 32;
  const rpcUrl = `http://127.0.0.1:${rpcPort}`;
  const wsUrl = `ws://127.0.0.1:${wsPort}`;
  const legacySchemaFixture = params.preloadLegacySchemaFixture
    ? await createLegacySchemaFixture(phaseRoot)
    : null;
  const adminKeypair = Keypair.generate();
  const memberKeypair = Keypair.generate();
  const fundedSignerFixtures = params.preloadFundedSignerFixtures
    ? [
        await createFundedSystemAccountFixture(
          phaseRoot,
          'admin',
          adminKeypair,
        ),
        await createFundedSystemAccountFixture(
          phaseRoot,
          'member',
          memberKeypair,
        ),
      ]
    : [];

  const logStream = createWriteStream(logPath, { flags: 'a' });
  const validatorArgs = [
    '--reset',
    '--ledger',
    ledgerDir,
    '--bind-address',
    '127.0.0.1',
    '--rpc-port',
    String(rpcPort),
    '--faucet-port',
    String(faucetPort),
    '--dynamic-port-range',
    `${dynamicPortStart}-${dynamicPortEnd}`,
    '--url',
    'https://api.devnet.solana.com',
    '--clone-upgradeable-program',
    classicTokenProgramId,
  ];

  if (legacySchemaFixture) {
    validatorArgs.push(
      '--account',
      legacySchemaFixture.schemaAddress,
      legacySchemaFixture.dumpPath,
    );
  }

  for (const fixture of fundedSignerFixtures) {
    validatorArgs.push('--account', fixture.address, fixture.dumpPath);
  }

  validatorArgs.push(
    '--bpf-program',
    protocolProgramId,
    protocolPaths.programSoPath,
  );

  const validator = spawn('solana-test-validator', validatorArgs, {
    cwd: protocolRepo,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  validator.stdout.pipe(logStream);
  validator.stderr.pipe(logStream);

  const stopValidator = async () => {
    if (validator.killed) return;
    validator.kill('SIGTERM');
    await new Promise((resolveExit) => {
      const timeout = setTimeout(() => {
        validator.kill('SIGKILL');
      }, 5_000);
      validator.once('exit', () => {
        clearTimeout(timeout);
        resolveExit();
      });
    });
  };

  const preserveArtifacts = async () => {
    if (!keepArtifacts) {
      await rm(phaseRoot, { recursive: true, force: true });
      return;
    }

    const targetDir = resolve(artifactsRoot, `${params.name}-${nowStamp()}`);
    mkdirSync(targetDir, { recursive: true });
    writeFileSync(
      resolve(targetDir, 'validator.log'),
      readFileSync(logPath, 'utf8'),
      'utf8',
    );
  };

  process.once('exit', () => {
    try {
      validator.kill('SIGKILL');
    } catch {
      // ignore best-effort cleanup
    }
  });

  try {
    await waitForRpc(rpcUrl);
    await waitForProgram(rpcUrl, classicTokenProgramId);
    await waitForProgram(rpcUrl, protocolProgramId);
    await params.run({
      rpcUrl,
      wsUrl,
      wsPort,
      faucetPort,
      dynamicPortRange: `${dynamicPortStart}-${dynamicPortEnd}`,
      validatorLogPath: logPath,
      legacySchemaFixture,
      fundedSignerFixtures,
    });
  } finally {
    await stopValidator().catch(() => undefined);
    await preserveArtifacts().catch(() => undefined);
    logStream.end();
  }
}

async function main() {
  if (!existsSync(protocolPaths.e2eTestPath)) {
    throw new Error(
      `Protocol E2E suite not found at ${protocolPaths.e2eTestPath}`,
    );
  }

  if (!skipBuild) {
    console.log(`[omegax-sdk] Building protocol program in ${protocolRepo}`);
    await runCommand({
      command: 'npm',
      args: ['run', 'anchor:build:checked'],
      cwd: protocolRepo,
    });
  }

  if (!existsSync(protocolPaths.programSoPath)) {
    throw new Error(
      `Compiled program is missing at ${protocolPaths.programSoPath}`,
    );
  }

  await runPhase({
    name: 'sdk-localnet-smoke',
    preloadFundedSignerFixtures: true,
    run: async (context) => {
      console.log(
        `[omegax-sdk] Running SDK localnet smoke against ${context.rpcUrl}`,
      );
      await runCommand({
        command: 'node',
        args: [
          '--import',
          'tsx',
          '--test',
          '--test-concurrency=1',
          'e2e/sdk_protocol_smoke.test.ts',
        ],
        cwd: sdkRoot,
        env: {
          ...process.env,
          SOLANA_RPC_URL: context.rpcUrl,
          PROTOCOL_PROGRAM_ID: protocolProgramId,
          NEXT_PUBLIC_PROTOCOL_PROGRAM_ID: protocolProgramId,
          OMEGAX_SDK_E2E_ADMIN_KEYPAIR:
            context.fundedSignerFixtures[0]?.secretKeyJson ?? '',
          OMEGAX_SDK_E2E_MEMBER_KEYPAIR:
            context.fundedSignerFixtures[1]?.secretKeyJson ?? '',
        },
      });
    },
  });

  await runPhase({
    name: 'sdk-protocol-surface',
    preloadLegacySchemaFixture: true,
    run: async (context) => {
      const summaryPath = process.env.OMEGAX_PROTOCOL_SURFACE_SUMMARY_PATH
        ? resolve(sdkRoot, process.env.OMEGAX_PROTOCOL_SURFACE_SUMMARY_PATH)
        : resolve(
            artifactsRoot,
            `sdk-protocol-surface-summary-${nowStamp()}.json`,
          );
      console.log(
        `[omegax-sdk] Running protocol surface matrix through SDK adapter against ${context.rpcUrl}`,
      );
      await runCommand({
        command: 'node',
        args: [
          '--import',
          'tsx',
          '--import',
          resolve(sdkRoot, 'scripts/register-protocol-sdk-adapter.mjs'),
          '--test',
          '--test-concurrency=1',
          protocolWorkspacePaths(protocolRepo).e2eTestPath,
        ],
        cwd: sdkRoot,
        env: {
          ...process.env,
          SOLANA_RPC_URL: context.rpcUrl,
          PROTOCOL_PROGRAM_ID: protocolProgramId,
          NEXT_PUBLIC_PROTOCOL_PROGRAM_ID: protocolProgramId,
          OMEGAX_E2E_SUMMARY_PATH: summaryPath,
          OMEGAX_E2E_VALIDATOR_LOG: context.validatorLogPath,
          OMEGAX_E2E_RPC_PORT: String(new URL(context.rpcUrl).port),
          OMEGAX_E2E_WS_PORT: String(context.wsPort),
          OMEGAX_E2E_WS_URL: context.wsUrl,
          OMEGAX_E2E_FAUCET_PORT: String(context.faucetPort),
          OMEGAX_E2E_DYNAMIC_PORT_RANGE: context.dynamicPortRange,
          OMEGAX_E2E_LEGACY_SCHEMA_ADDRESS:
            context.legacySchemaFixture?.schemaAddress ?? '',
          OMEGAX_E2E_LEGACY_SCHEMA_KEY_HASH_HEX:
            context.legacySchemaFixture?.schemaKeyHashHex ?? '',
        },
      });
      console.log(`[omegax-sdk] Surface summary written to ${summaryPath}`);
    },
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
