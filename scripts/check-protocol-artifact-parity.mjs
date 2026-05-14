#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function sha256Hex(value) {
  return createHash('sha256').update(value).digest('hex');
}

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

const manifest = readJson('SDK_RUNTIME.json');
const protocolRepo = resolve(
  process.env.OMEGAX_PROTOCOL_REPO ?? manifest.protocol.sourceRepo,
);

if (!existsSync(protocolRepo)) {
  if (process.env.CI === 'true') {
    fail(`Protocol repo not found at ${protocolRepo}.`);
    process.exit(1);
  }
  console.warn(
    `Warning: protocol repo not found at ${protocolRepo}; skipping artifact parity.`,
  );
  process.exit(0);
}

const commit = spawnSync('git', ['-C', protocolRepo, 'rev-parse', 'HEAD'], {
  encoding: 'utf8',
});
if (commit.status !== 0) {
  fail(
    commit.stderr || `Unable to read protocol repo commit at ${protocolRepo}.`,
  );
} else if (
  process.env.OMEGAX_PROTOCOL_REPO_STRICT_HEAD === '1' &&
  !commit.stdout.trim().startsWith(manifest.protocol.bindingRefreshCommit)
) {
  fail(
    `Protocol repo HEAD ${commit.stdout.trim()} does not match SDK bindingRefreshCommit ${manifest.protocol.bindingRefreshCommit}.`,
  );
}

const bindingCommit = spawnSync(
  'git',
  [
    '-C',
    protocolRepo,
    'cat-file',
    '-e',
    `${manifest.protocol.bindingRefreshCommit}^{commit}`,
  ],
  {
    encoding: 'utf8',
  },
);
if (bindingCommit.status !== 0) {
  fail(
    `Protocol bindingRefreshCommit ${manifest.protocol.bindingRefreshCommit} is not present in ${protocolRepo}.`,
  );
}

const sdkIdl = readJson('src/generated/omegax_protocol.idl.json');
const protocolIdl = readJson(resolve(protocolRepo, 'idl/omegax_protocol.json'));
if (JSON.stringify(sdkIdl) !== JSON.stringify(protocolIdl)) {
  fail('SDK generated IDL does not semantically match the protocol repo IDL.');
}

const contractSource = readFileSync(
  'src/generated/protocol_contract.ts',
  'utf8',
);
const contractHash = contractSource.match(/contract_sha256: ([a-f0-9]+)/u)?.[1];
const protocolContract = readFileSync(
  resolve(protocolRepo, 'shared/protocol_contract.json'),
  'utf8',
);
if (contractHash !== sha256Hex(protocolContract)) {
  fail(
    'SDK protocol contract hash does not match the protocol repo contract JSON.',
  );
}

if (
  manifest.protocol.surface.instructions !== (sdkIdl.instructions?.length ?? 0)
) {
  fail('SDK_RUNTIME instruction count does not match generated IDL.');
}
if (manifest.protocol.surface.accounts !== (sdkIdl.accounts?.length ?? 0)) {
  fail('SDK_RUNTIME account count does not match generated IDL.');
}
if (manifest.protocol.surface.types !== (sdkIdl.types?.length ?? 0)) {
  fail('SDK_RUNTIME type count does not match generated IDL.');
}

if (process.exitCode) process.exit(process.exitCode);
console.log(
  `Protocol artifact parity passed (${manifest.protocol.bindingRefreshCommit}, ${sdkIdl.instructions.length} instructions).`,
);
