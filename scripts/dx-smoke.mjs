#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve('.');
const smokeDir = mkdtempSync(join(tmpdir(), 'nakama-sdk-dx-'));
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
      npm_config_cache: join(smokeDir, '.npm-cache'),
      npm_config_logs_dir: join(smokeDir, '.npm-logs'),
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
  ETHEREUM_MAINNET_CAIP2,
  NAKAMA_ETHEREUM_MAINNET_DEPLOYMENT,
  NAKAMA_POLICY_REGISTRY_ABI,
} from '@nakama-health/protocol-sdk';
import { NakamaEthereumConfigError } from '@nakama-health/protocol-sdk/errors';
import {
  createEip1193TransactionSigningPayload,
  createEthereumPublicClient,
  type ProtocolTransactionRequestV2,
} from '@nakama-health/protocol-sdk/ethereum';
import {
  encodeEthereumCalldata,
  validateEthereumDeploymentManifest,
} from '@nakama-health/protocol-sdk/ethereum_contract';
import { claimRecipientNonceReplayKey } from '@nakama-health/protocol-sdk/ethereum_oracle';

const transaction: ProtocolTransactionRequestV2 = {
  from: '0x0000000000000000000000000000000000000001',
  to: '0x0000000000000000000000000000000000000002',
  data: '0x',
  value: '0x0',
  gas: '0x1000000',
};
const payload = createEip1193TransactionSigningPayload(transaction);
const client = createEthereumPublicClient();
const deployment = validateEthereumDeploymentManifest(
  NAKAMA_ETHEREUM_MAINNET_DEPLOYMENT,
);
const calldata = encodeEthereumCalldata({
  abi: NAKAMA_POLICY_REGISTRY_ABI,
  functionName: 'deriveClaimId',
  args: [
    ('0x' + '11'.repeat(32)) as ProtocolTransactionRequestV2['data'],
    transaction.from,
    ('0x' + '22'.repeat(32)) as ProtocolTransactionRequestV2['data'],
  ],
});

void NakamaEthereumConfigError;
void claimRecipientNonceReplayKey;
void calldata;
if (ETHEREUM_MAINNET_CAIP2 !== 'eip155:1' || client.chain?.id !== 1) {
  throw new Error('Ethereum mainnet identity mismatch.');
}
if (payload.transaction.gas !== '0x1000000') {
  throw new Error('EIP-7825 boundary was not preserved.');
}
if (deployment.status !== 'unconfigured') {
  throw new Error('Expected the unreleased deployment manifest to fail closed.');
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
  '@nakama-health/protocol-sdk/errors',
  '@nakama-health/protocol-sdk/ethereum',
  '@nakama-health/protocol-sdk/ethereum_contract',
  '@nakama-health/protocol-sdk/ethereum_oracle',
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
