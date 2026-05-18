#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));

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
const fileSet = new Set(files);
const publicDocs = new Set([
  'docs/API_REFERENCE.md',
  'docs/CROSS_REPO_RELEASE_ORDER.md',
  'docs/DOCS_SYNC_WORKFLOW.md',
  'docs/ERROR_CATALOG.md',
  'docs/GETTING_STARTED.md',
  'docs/INDEX.md',
  'docs/OMEGAX_DOCS_SYNC.json',
  'docs/RECIPES.md',
  'docs/RELEASE.md',
  'docs/RELEASE_NOTES.md',
  'docs/REPOSITORY_STRUCTURE.md',
  'docs/TOP_APIS.md',
  'docs/TROUBLESHOOTING.md',
  'docs/WORKFLOWS.md',
  'docs/generated/README.md',
]);
const allowed = files.filter(
  (path) =>
    path === 'package.json' ||
    path === 'README.md' ||
    path === 'LICENSE' ||
    path === 'NOTICE' ||
    path === 'SDK_QUALITY.md' ||
    path === 'SDK_RUNTIME.json' ||
    publicDocs.has(path) ||
    path.startsWith('docs/generated/api/') ||
    path === 'examples/README.md' ||
    path === 'examples/.env.example' ||
    /^examples\/[^/]+\.ts$/u.test(path) ||
    path.startsWith('dist/') ||
    path.startsWith('templates/'),
);
const unexpected = files.filter((path) => !allowed.includes(path));

const required = [
  'SDK_QUALITY.md',
  'SDK_RUNTIME.json',
  'docs/GETTING_STARTED.md',
  'docs/API_REFERENCE.md',
  'docs/WORKFLOWS.md',
  'examples/README.md',
  'examples/devnet-smoke.ts',
  'examples/app-builder-read.ts',
  'examples/oracle-attestation.ts',
];
const packageTargets = [
  packageJson.main,
  packageJson.types,
  ...Object.values(packageJson.bin ?? {}),
  ...Object.values(packageJson.exports ?? {}).flatMap((entry) => {
    if (typeof entry === 'string') return [entry];
    return [entry.import, entry.types].filter(Boolean);
  }),
]
  .filter(Boolean)
  .map((path) => String(path).replace(/^\.\//, ''));
const missing = [...required, ...packageTargets].filter(
  (path, index, all) => all.indexOf(path) === index && !fileSet.has(path),
);

if (unexpected.length > 0 || missing.length > 0) {
  if (unexpected.length > 0) {
    console.error('Package manifest contains unexpected files:');
    for (const path of unexpected) {
      console.error(`- ${path}`);
    }
  }
  if (missing.length > 0) {
    console.error('Package manifest is missing required files:');
    for (const path of missing) {
      console.error(`- ${path}`);
    }
  }
  process.exit(1);
}

console.log(`Package manifest check passed (${files.length} files).`);
