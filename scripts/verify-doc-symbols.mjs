#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const DOCS_ROOT = resolve('docs');
const SOURCE_ROOT = resolve('src');
const REFERENCE_REGEX = /`([A-Za-z_][A-Za-z0-9_]*)\([^`]*\)`/g;
const SDK_SUBPATH_REGEX = /@omegax\/protocol-sdk(\/[A-Za-z0-9_-]+)?/g;

async function listFilesRecursively(rootPath, extension) {
  const entries = await readdir(rootPath, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(rootPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFilesRecursively(fullPath, extension)));
      continue;
    }
    if (entry.isFile() && fullPath.endsWith(extension)) {
      files.push(fullPath);
    }
  }
  return files;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function collectDocPaths() {
  const paths = [resolve('README.md')];
  if (existsSync(DOCS_ROOT)) {
    const docsFiles = await readdir(DOCS_ROOT, { withFileTypes: true });
    for (const file of docsFiles) {
      if (file.isFile() && file.name.endsWith('.md')) {
        paths.push(join(DOCS_ROOT, file.name));
      }
    }
  }
  return paths;
}

async function collectDocumentedSymbols(docPaths) {
  const symbols = new Set();
  for (const docPath of docPaths) {
    const text = await readFile(docPath, 'utf8');
    let match = REFERENCE_REGEX.exec(text);
    while (match) {
      symbols.add(match[1]);
      match = REFERENCE_REGEX.exec(text);
    }
    REFERENCE_REGEX.lastIndex = 0;
  }
  return [...symbols].sort();
}

async function collectDocumentedPackageSubpaths(docPaths) {
  const subpaths = new Set();
  for (const docPath of docPaths) {
    const text = await readFile(docPath, 'utf8');
    let match = SDK_SUBPATH_REGEX.exec(text);
    while (match) {
      const subpath = match[1] ? `.${match[1]}` : '.';
      subpaths.add(subpath);
      match = SDK_SUBPATH_REGEX.exec(text);
    }
    SDK_SUBPATH_REGEX.lastIndex = 0;
  }
  return [...subpaths].sort();
}

async function main() {
  const docPaths = await collectDocPaths();
  const packageJson = JSON.parse(
    await readFile(resolve('package.json'), 'utf8'),
  );
  const packageExports = new Set(Object.keys(packageJson.exports ?? {}));
  const sourcePaths = await listFilesRecursively(SOURCE_ROOT, '.ts');

  const sourceTextByFile = await Promise.all(
    sourcePaths.map(async (path) => ({
      path,
      text: await readFile(path, 'utf8'),
    })),
  );

  const symbols = await collectDocumentedSymbols(docPaths);
  const documentedSubpaths = await collectDocumentedPackageSubpaths(docPaths);
  const missing = [];
  const missingSubpaths = [];

  for (const symbol of symbols) {
    const matcher = new RegExp(`\\b${escapeRegExp(symbol)}\\b`);
    const found = sourceTextByFile.some((file) => matcher.test(file.text));
    if (!found) {
      missing.push(symbol);
    }
  }

  for (const subpath of documentedSubpaths) {
    if (!packageExports.has(subpath)) {
      missingSubpaths.push(subpath);
    }
  }

  if (missing.length > 0) {
    console.error('Documentation symbol check failed. Missing in source:');
    for (const symbol of missing) {
      console.error(`- ${symbol}`);
    }
    process.exitCode = 1;
    return;
  }

  if (missingSubpaths.length > 0) {
    console.error(
      'Documentation package subpath check failed. Missing in package exports:',
    );
    for (const subpath of missingSubpaths) {
      console.error(
        `- @omegax/protocol-sdk${subpath === '.' ? '' : subpath.slice(1)}`,
      );
    }
    process.exitCode = 1;
    return;
  }

  console.log(
    `Documentation symbol check passed (${symbols.length} callable references and ${documentedSubpaths.length} package subpaths verified).`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
