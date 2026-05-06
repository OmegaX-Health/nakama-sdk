#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';

const expectedRoot = resolve('docs/generated/api');

async function walk(root, base = root) {
  const entries = await readdir(root, { withFileTypes: true });
  const paths = [];
  for (const entry of entries) {
    const fullPath = join(root, entry.name);
    if (entry.isDirectory()) {
      paths.push(...(await walk(fullPath, base)));
    } else {
      paths.push(relative(base, fullPath).split('\\').join('/'));
    }
  }
  return paths.sort((left, right) => left.localeCompare(right));
}

async function readRelative(root, path) {
  return await readFile(join(root, path), 'utf8');
}

function runTypeDoc(outDir) {
  const result = spawnSync(
    'npx',
    ['typedoc', '--options', 'typedoc.json', '--out', outDir],
    {
      encoding: 'utf8',
      stdio: 'pipe',
    },
  );

  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout);
    process.exit(result.status ?? 1);
  }
}

async function main() {
  const tempRoot = await mkdtemp(join(tmpdir(), 'omegax-sdk-api-docs-'));
  try {
    runTypeDoc(tempRoot);

    const [expectedFiles, actualFiles] = await Promise.all([
      walk(expectedRoot),
      walk(tempRoot),
    ]);
    const expectedSet = new Set(expectedFiles);
    const actualSet = new Set(actualFiles);
    const missing = expectedFiles.filter((file) => !actualSet.has(file));
    const extra = actualFiles.filter((file) => !expectedSet.has(file));
    const changed = [];

    for (const file of actualFiles.filter((candidate) =>
      expectedSet.has(candidate),
    )) {
      const [expected, actual] = await Promise.all([
        readRelative(expectedRoot, file),
        readRelative(tempRoot, file),
      ]);
      if (expected !== actual) {
        changed.push(file);
      }
    }

    if (missing.length > 0 || extra.length > 0 || changed.length > 0) {
      console.error('Generated API docs are out of date.');
      for (const file of missing) console.error(`- missing: ${file}`);
      for (const file of extra) console.error(`- extra: ${file}`);
      for (const file of changed) console.error(`- changed: ${file}`);
      console.error('Run npm run docs:api:generate and commit the result.');
      process.exitCode = 1;
      return;
    }

    console.log(
      `Generated API docs check passed (${actualFiles.length} files).`,
    );
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
