#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    fail(`${label} mismatch: expected ${expected}, got ${actual}`);
  }
}

function assertArrayEqual(actual, expected, label) {
  const actualJson = JSON.stringify([...actual].sort());
  const expectedJson = JSON.stringify([...expected].sort());
  if (actualJson !== expectedJson) {
    fail(`${label} mismatch: expected ${expectedJson}, got ${actualJson}`);
  }
}

const packageJson = readJson('package.json');
const manifest = readJson('SDK_RUNTIME.json');
const idl = readJson('src/generated/omegax_protocol.idl.json');
const contractSource = readFileSync(
  'src/generated/protocol_contract.ts',
  'utf8',
);
const sourceText = [
  'src/claims.ts',
  'src/oracle.ts',
  'src/protocol.ts',
  'src/protocol_seeds.ts',
  'src/rpc.ts',
  'src/types.ts',
]
  .map((path) => readFileSync(path, 'utf8'))
  .join('\n');

const contractHash = contractSource.match(/contract_sha256: ([a-f0-9]+)/u)?.[1];
const programId = contractSource.match(
  /export const PROTOCOL_PROGRAM_ID =\s*['"]([^'"]+)['"]/u,
)?.[1];

if (manifest.schemaVersion !== 1) {
  fail(`SDK_RUNTIME.json schemaVersion must be 1.`);
}

assertEqual(manifest.package.name, packageJson.name, 'package name');
assertEqual(manifest.package.version, packageJson.version, 'package version');
assertEqual(manifest.package.node, packageJson.engines?.node, 'node engine');
assertEqual(manifest.package.module, packageJson.type, 'module type');
assertEqual(manifest.protocol.contractSha256, contractHash, 'contract sha256');
assertEqual(manifest.protocol.programId, programId, 'protocol program ID');
assertEqual(
  manifest.protocol.surface.instructions,
  idl.instructions?.length ?? 0,
  'instruction count',
);
assertEqual(
  manifest.protocol.surface.accounts,
  idl.accounts?.length ?? 0,
  'account count',
);
assertEqual(
  manifest.protocol.surface.types,
  idl.types?.length ?? 0,
  'type count',
);
assertArrayEqual(
  manifest.publicSubpaths,
  Object.keys(packageJson.exports ?? {}),
  'public subpaths',
);

if (!/^[0-9a-f]{7,40}$/iu.test(manifest.protocol.bindingRefreshCommit)) {
  fail('protocol.bindingRefreshCommit must be a git commit SHA.');
}

if (
  !packageJson.scripts?.[
    manifest.protocol.parityCommand.replace(/^npm run /u, '')
  ]
) {
  fail(
    `protocol.parityCommand is not a package script: ${manifest.protocol.parityCommand}`,
  );
}

if (existsSync(manifest.protocol.sourceRepo)) {
  const commitCheck = spawnSync(
    'git',
    [
      '-C',
      manifest.protocol.sourceRepo,
      'cat-file',
      '-e',
      `${manifest.protocol.bindingRefreshCommit}^{commit}`,
    ],
    { encoding: 'utf8' },
  );
  if (commitCheck.status !== 0) {
    fail(
      `protocol.bindingRefreshCommit ${manifest.protocol.bindingRefreshCommit} is not present in ${manifest.protocol.sourceRepo}.`,
    );
  }
}

const packageFiles = new Set(packageJson.files ?? []);
for (const required of [
  'dist',
  'docs',
  'examples/README.md',
  'examples/.env.example',
  'examples/*.ts',
  'templates',
  'SDK_QUALITY.md',
  'SDK_RUNTIME.json',
  'NOTICE',
]) {
  if (!packageFiles.has(required)) {
    fail(`package.json#files must include ${required}.`);
  }
}

for (const docPath of manifest.docs ?? []) {
  if (!existsSync(docPath)) {
    fail(`SDK_RUNTIME.json docs path does not exist: ${docPath}`);
  }
}

for (const command of manifest.validationGates ?? []) {
  if (command.startsWith('npm run ')) {
    const scriptName = command.replace(/^npm run /u, '').trim();
    if (!packageJson.scripts?.[scriptName]) {
      fail(
        `SDK_RUNTIME.json validation gate is not a package script: ${command}`,
      );
    }
  }
}

function sourceHasExportedName(name, kind) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
  if (kind === 'type') {
    return new RegExp(
      `export\\s+(?:type|interface)\\s+${escaped}\\b`,
      'u',
    ).test(sourceText);
  }
  if (kind === 'method') {
    return new RegExp(`\\b${escaped}\\s*\\(`, 'u').test(sourceText);
  }
  return new RegExp(
    `export\\s+(?:async\\s+)?function\\s+${escaped}\\b|export\\s+const\\s+${escaped}\\b`,
    'u',
  ).test(sourceText);
}

for (const lane of manifest.lanes ?? []) {
  for (const entrypoint of lane.entrypoints ?? []) {
    const name = String(entrypoint.name ?? '').trim();
    const kind = String(entrypoint.kind ?? '').trim();
    const subpath = String(entrypoint.subpath ?? '').trim();
    if (!name || !kind || !subpath) {
      fail(`Lane ${lane.id} has an incomplete entrypoint.`);
      continue;
    }
    if (!manifest.publicSubpaths.includes(subpath)) {
      fail(
        `Lane ${lane.id} entrypoint ${name} references unknown subpath ${subpath}.`,
      );
    }
    if (!sourceHasExportedName(name, kind)) {
      fail(`Lane ${lane.id} entrypoint ${name} is not found in source.`);
    }
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log(
  `SDK runtime manifest check passed (${manifest.publicSubpaths.length} public subpaths, ${idl.instructions.length} instructions).`,
);
