#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve('.');
const smokeDir = mkdtempSync(join(tmpdir(), 'omegax-sdk-dx-'));
const expectedVersion = JSON.parse(
  readFileSync(resolve(root, 'package.json'), 'utf8'),
).version;

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? root,
    encoding: 'utf8',
    stdio: options.capture ? 'pipe' : 'inherit',
    env: {
      ...process.env,
      ...options.env,
    },
  });
  if (result.status !== 0) {
    if (options.capture) {
      process.stderr.write(result.stderr || result.stdout);
    }
    process.exit(result.status ?? 1);
  }
  return result.stdout;
}

try {
  run('npm', ['run', 'build']);

  const packOutput = run(
    'npm',
    ['pack', '--ignore-scripts', '--json', '--pack-destination', smokeDir],
    { capture: true },
  );
  const [pack] = JSON.parse(packOutput);
  const tarball = join(smokeDir, pack.filename);

  writeFileSync(
    join(smokeDir, 'package.json'),
    JSON.stringify({ type: 'module', private: true }, null, 2),
  );
  run(
    'npm',
    ['install', '--ignore-scripts', tarball, 'typescript', '@types/node'],
    { cwd: smokeDir },
  );

  writeFileSync(
    join(smokeDir, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          strict: true,
          skipLibCheck: true,
          types: ['node'],
        },
      },
      null,
      2,
    ),
  );

  writeFileSync(
    join(smokeDir, 'consumer.ts'),
    `import {
  PROTOCOL_PROGRAM_ID,
  createConnection,
  createSafeProtocolClient,
  deriveReserveDomainPda,
  listProtocolAccountNames,
  listProtocolInstructionNames,
  type SafeProtocolClient,
  type SafeProtocolClientOptions,
  type SafeSettleObligationTxParams,
} from '@nakama-health/protocol-sdk';
import { validateSignedClaimTx } from '@nakama-health/protocol-sdk/claims';
import { OmegaXError } from '@nakama-health/protocol-sdk/errors';
import { createOracleSignerFromKmsAdapter } from '@nakama-health/protocol-sdk/oracle';
import { createProtocolClient } from '@nakama-health/protocol-sdk/protocol';
import { buildMemberReadModel } from '@nakama-health/protocol-sdk/protocol_models';
import { deriveHealthPlanPda } from '@nakama-health/protocol-sdk/protocol_seeds';
import { createRpcClient } from '@nakama-health/protocol-sdk/rpc';
import { serializeSolanaTransactionBase64 } from '@nakama-health/protocol-sdk/transactions';
import type { ClaimIntent } from '@nakama-health/protocol-sdk/types';
import { sha256Hex } from '@nakama-health/protocol-sdk/utils';

const options: SafeProtocolClientOptions = { programId: PROTOCOL_PROGRAM_ID };
const connection = createConnection({ network: 'devnet' });
const safe: SafeProtocolClient = createSafeProtocolClient(connection, options);
const raw = createProtocolClient(connection, PROTOCOL_PROGRAM_ID);
const rpc = createRpcClient(connection);
const reserveDomain = deriveReserveDomainPda({ domainId: 'dx-smoke' });
const healthPlan = deriveHealthPlanPda({
  reserveDomain,
  planId: 'dx-plan',
});
const maybeSettleParams = null as SafeSettleObligationTxParams | null;
const maybeIntent = null as ClaimIntent | null;

void safe;
void raw;
void rpc;
void healthPlan;
void maybeSettleParams;
void maybeIntent;
void OmegaXError;
void validateSignedClaimTx;
void createOracleSignerFromKmsAdapter;
void buildMemberReadModel;
void serializeSolanaTransactionBase64;
void sha256Hex;

if (listProtocolInstructionNames().length === 0) {
  throw new Error('No protocol instructions exported.');
}
if (listProtocolAccountNames().length === 0) {
  throw new Error('No protocol accounts exported.');
}
`,
  );

  run('npx', ['tsc', '--noEmit'], { cwd: smokeDir });

  writeFileSync(
    join(smokeDir, 'runtime.mjs'),
    `import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const subpaths = [
  '@nakama-health/protocol-sdk',
  '@nakama-health/protocol-sdk/claims',
  '@nakama-health/protocol-sdk/errors',
  '@nakama-health/protocol-sdk/oracle',
  '@nakama-health/protocol-sdk/protocol',
  '@nakama-health/protocol-sdk/protocol_models',
  '@nakama-health/protocol-sdk/protocol_seeds',
  '@nakama-health/protocol-sdk/rpc',
  '@nakama-health/protocol-sdk/transactions',
  '@nakama-health/protocol-sdk/types',
  '@nakama-health/protocol-sdk/utils',
];

for (const subpath of subpaths) {
  const mod = await import(subpath);
  if (Object.keys(mod).length === 0) {
    throw new Error(\`\${subpath} exported no runtime bindings\`);
  }
}

const pkg = require('@nakama-health/protocol-sdk/package.json');
if (pkg.version !== ${JSON.stringify(expectedVersion)}) {
  throw new Error(\`unexpected package version \${pkg.version}\`);
}

console.log('DX smoke passed');
`,
  );

  run(process.execPath, ['runtime.mjs'], { cwd: smokeDir });
} finally {
  rmSync(smokeDir, { recursive: true, force: true });
}
