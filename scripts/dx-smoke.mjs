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
    if (options.capture) process.stderr.write(result.stderr || result.stdout);
    process.exit(result.status ?? 1);
  }
  return result.stdout;
}

try {
  run('npm', ['run', 'build']);
  const [pack] = JSON.parse(
    run(
      'npm',
      ['pack', '--ignore-scripts', '--json', '--pack-destination', smokeDir],
      { capture: true },
    ),
  );
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
  NAKAMA_DECISION_ACTION,
  NAKAMA_DECISION_REVIEWER_ROLE,
  NAKAMA_DECISION_REVIEW_ROUND,
  ROBINHOOD_MAINNET_CAIP2,
  ROBINHOOD_MAINNET_CHAIN_ID,
  createNakamaDecisionSigningPayload,
  getGeneratedRobinhoodArtifactBundle,
  hashNakamaDecision,
  validateRobinhoodDeploymentManifest,
} from '@nakama-health/protocol-sdk';
import { toRobinhoodCaip10 } from '@nakama-health/protocol-sdk/robinhood';

const bundle = getGeneratedRobinhoodArtifactBundle();
const deployment = validateRobinhoodDeploymentManifest(
  bundle.deployments.mainnet,
  'mainnet',
);
const payload = createNakamaDecisionSigningPayload({
  network: 'mainnet',
  reviewer: '0x0000000000000000000000000000000000000001',
  decisionModule: '0x0000000000000000000000000000000000000002',
  message: {
    programId: ('0x' + '11'.repeat(32)) as \`0x\${string}\`,
    requestId: ('0x' + '22'.repeat(32)) as \`0x\${string}\`,
    termsCommitment: ('0x' + '33'.repeat(32)) as \`0x\${string}\`,
    evidenceManifestCommitment: ('0x' + '44'.repeat(32)) as \`0x\${string}\`,
    evidenceVersion: 1,
    reviewRound: NAKAMA_DECISION_REVIEW_ROUND.initial,
    reviewerRole: NAKAMA_DECISION_REVIEWER_ROLE.initialReviewer,
    action: NAKAMA_DECISION_ACTION.deny,
    approvedAmount: 0n,
    recipientCommitment: ('0x' + '00'.repeat(32)) as \`0x\${string}\`,
    publicReasonCode: ('0x' + '55'.repeat(32)) as \`0x\${string}\`,
    nonce: 0n,
    validUntil: 2_000_000_000n,
  },
});

void hashNakamaDecision(payload.typedData);
void toRobinhoodCaip10(
  'mainnet',
  '0x0000000000000000000000000000000000000001',
);
if (
  ROBINHOOD_MAINNET_CHAIN_ID !== 4663 ||
  ROBINHOOD_MAINNET_CAIP2 !== 'eip155:4663' ||
  bundle.status !== 'ready' ||
  deployment.status !== 'unconfigured'
) {
  throw new Error('Robinhood package identity or fail-closed deployment mismatch.');
}
`,
  );

  run('npx', ['tsc', '--noEmit'], { cwd: smokeDir });
  writeFileSync(
    join(smokeDir, 'runtime.mjs'),
    `import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
for (const subpath of [
  '@nakama-health/protocol-sdk',
  '@nakama-health/protocol-sdk/robinhood',
]) {
  const mod = await import(subpath);
  if (Object.keys(mod).length === 0) {
    throw new Error(subpath + ' exported nothing');
  }
}
const pkg = require('@nakama-health/protocol-sdk/package.json');
if (pkg.version !== ${JSON.stringify(expectedVersion)}) {
  throw new Error('unexpected package version ' + pkg.version);
}
console.log('DX smoke passed');
`,
  );
  run(process.execPath, ['runtime.mjs'], { cwd: smokeDir });
} finally {
  rmSync(smokeDir, { recursive: true, force: true });
}
