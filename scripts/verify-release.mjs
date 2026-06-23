#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const strict = process.argv.includes('--strict');
const protocol = process.argv.includes('--protocol');

const checks = [
  { command: 'npm', args: ['run', 'security:secrets'] },
  { command: 'npm', args: ['run', 'security:install-scripts'] },
  { command: 'npm', args: ['run', 'security:release-governance'] },
  { command: 'npm', args: ['run', 'typecheck'] },
  { command: 'npm', args: ['run', 'lint'] },
  { command: 'npm', args: ['run', 'format:check'] },
  { command: 'npm', args: ['run', 'build'] },
  { command: 'npm', args: ['test'] },
  { command: 'npm', args: ['run', 'docs:api:check'] },
  { command: 'npm', args: ['run', 'docs:check'] },
  {
    command: 'npm',
    args: ['run', strict ? 'docs:sync:check:strict' : 'docs:sync:check'],
  },
  { command: 'npm', args: ['run', 'runtime:check'] },
  { command: 'npm', args: ['run', 'protocol:artifact:check'] },
  { command: 'npm', args: ['run', 'security:package'] },
  { command: 'npm', args: ['run', 'audit:prod'] },
  { command: 'npm', args: ['run', 'examples:check'] },
  {
    command: 'npm',
    args: ['run', 'dogfood:consumer'],
    env: { OMEGAX_DOGFOOD_SKIP_TEMPLATES: '1' },
  },
  { command: 'npm', args: ['run', 'cli:check'] },
  { command: 'npm', args: ['run', 'templates:check'] },
  { command: 'npm', args: ['run', 'dx:smoke'] },
  { command: 'npm', args: ['run', 'release:state'] },
  { command: 'npm', args: ['pack', '--dry-run'] },
];

if (protocol) {
  checks.push({ command: 'npm', args: ['run', 'verify:protocol:local'] });
}

for (const { command, args, env } of checks) {
  console.log(`[nakama-sdk] ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    env: {
      ...process.env,
      ...(env ?? {}),
    },
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log(
  `[nakama-sdk] Release verification passed (${strict ? 'strict' : 'standard'}${protocol ? ', protocol' : ''}).`,
);
