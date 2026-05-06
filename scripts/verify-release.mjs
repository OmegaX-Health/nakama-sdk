#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const strict = process.argv.includes('--strict');
const protocol = process.argv.includes('--protocol');

const checks = [
  ['npm', ['run', 'typecheck']],
  ['npm', ['run', 'lint']],
  ['npm', ['run', 'format:check']],
  ['npm', ['run', 'build']],
  ['npm', ['test']],
  ['npm', ['run', 'docs:api:check']],
  ['npm', ['run', 'docs:check']],
  ['npm', ['run', strict ? 'docs:sync:check:strict' : 'docs:sync:check']],
  ['npm', ['run', 'security:package']],
  ['npm', ['run', 'audit:prod']],
  ['npm', ['run', 'examples:check']],
  ['npm', ['run', 'dogfood:consumer']],
  ['npm', ['run', 'dx:smoke']],
  ['npm', ['pack', '--dry-run']],
];

if (protocol) {
  checks.push(['npm', ['run', 'verify:protocol:local']]);
}

for (const [command, args] of checks) {
  console.log(`[omegax-sdk] ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log(
  `[omegax-sdk] Release verification passed (${strict ? 'strict' : 'standard'}${protocol ? ', protocol' : ''}).`,
);
