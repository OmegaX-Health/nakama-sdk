#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const result = spawnSync(
  'npm',
  ['pack', '--dry-run', '--ignore-scripts', '--json'],
  {
    encoding: 'utf8',
  },
);

if (result.status !== 0) {
  console.error(result.stderr || result.stdout);
  process.exit(result.status ?? 1);
}

const [pack] = JSON.parse(result.stdout);
const files = (pack?.files ?? []).map((entry) => entry.path).sort();
const allowed = files.filter(
  (path) =>
    path === 'package.json' ||
    path === 'README.md' ||
    path === 'LICENSE' ||
    path === 'NOTICE' ||
    path.startsWith('dist/') ||
    path.startsWith('templates/'),
);
const unexpected = files.filter((path) => !allowed.includes(path));

if (unexpected.length > 0) {
  console.error('Package manifest contains unexpected files:');
  for (const path of unexpected) {
    console.error(`- ${path}`);
  }
  process.exit(1);
}

console.log(`Package manifest check passed (${files.length} files).`);
