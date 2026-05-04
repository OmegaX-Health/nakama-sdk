#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

const allowedInstallScriptPackages = new Set([
  'node_modules/bigint-buffer',
  'node_modules/bufferutil',
  'node_modules/esbuild',
  'node_modules/fsevents',
  'node_modules/utf-8-validate',
]);

const lock = JSON.parse(await readFile('package-lock.json', 'utf8'));
const packages = lock.packages ?? {};
const discovered = Object.entries(packages)
  .filter(([, entry]) => entry?.hasInstallScript === true)
  .map(([name]) => name)
  .sort();

const unexpected = discovered.filter(
  (name) => !allowedInstallScriptPackages.has(name),
);
const missing = [...allowedInstallScriptPackages].filter(
  (name) => !discovered.includes(name),
);

if (unexpected.length > 0 || missing.length > 0) {
  console.error('Install-script allowlist check failed.');
  for (const name of unexpected) {
    console.error(`- Unexpected package with install script: ${name}`);
  }
  for (const name of missing) {
    console.error(
      `- Allowlisted package no longer has an install script: ${name}`,
    );
  }
  process.exit(1);
}

console.log(
  `Install-script allowlist passed (${discovered.length} known packages).`,
);
