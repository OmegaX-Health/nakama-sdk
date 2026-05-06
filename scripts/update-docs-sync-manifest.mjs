#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';

function parseArg(name) {
  const prefix = `--${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length).trim() : null;
}

function readGitHeadCommit(repoPath) {
  return execSync('git rev-parse HEAD', {
    cwd: repoPath,
    stdio: ['ignore', 'pipe', 'ignore'],
    encoding: 'utf8',
  }).trim();
}

function assertCommitSha(value) {
  if (!/^[0-9a-f]{7,40}$/i.test(value)) {
    throw new Error(`Invalid commit SHA: ${value}`);
  }
}

async function sha256File(path) {
  const bytes = await readFile(path);
  return createHash('sha256').update(bytes).digest('hex');
}

async function main() {
  const manifestPath = resolve(
    parseArg('manifest') ?? 'docs/OMEGAX_DOCS_SYNC.json',
  );
  const packagePath = resolve('package.json');
  const docsRepoPath = resolve(parseArg('docs-repo') ?? '../omegax-docs');
  const syncedBy =
    parseArg('synced-by') ?? String(process.env.USER ?? '').trim();

  if (!syncedBy || syncedBy.length < 2) {
    throw new Error('Missing synced-by. Pass --synced-by=<name> or set USER.');
  }

  const explicitCommit = parseArg('docs-commit');
  const docsCommit = explicitCommit
    ? explicitCommit
    : readGitHeadCommit(docsRepoPath);
  assertCommitSha(docsCommit);

  const [packageRaw, manifestRaw] = await Promise.all([
    readFile(packagePath, 'utf8'),
    readFile(manifestPath, 'utf8'),
  ]);

  const pkg = JSON.parse(packageRaw);
  const manifest = JSON.parse(manifestRaw);

  manifest.sdkVersion = String(pkg.version ?? '').trim();
  manifest.omegaxDocsCommit = docsCommit;
  manifest.syncedAt = new Date().toISOString();
  manifest.syncedBy = syncedBy;
  for (const page of manifest.pages ?? []) {
    if (page?.sdkDoc) {
      page.sdkDocSha256 = await sha256File(resolve(page.sdkDoc));
    }
  }

  await writeFile(
    manifestPath,
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );

  console.log(`Updated ${manifestPath}`);
  console.log(`sdkVersion: ${manifest.sdkVersion}`);
  console.log(`omegaxDocsCommit: ${manifest.omegaxDocsCommit}`);
  console.log(`syncedAt: ${manifest.syncedAt}`);
  console.log(`syncedBy: ${manifest.syncedBy}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
