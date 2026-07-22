#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const CONTRACT_NAMES = [
  'NakamaProtocolFactory',
  'NakamaCoverageProtocol',
  'NakamaPolicyRegistry',
  'ReserveVault',
];
const CANONICAL_PRODUCTION_DEPENDENCIES = ['viem'];
const LEGACY_OPTIONAL_PEERS = [
  '@coral-xyz/anchor',
  '@solana/web3.js',
  'bn.js',
  'bs58',
  'tweetnacl',
];
const DEPLOYMENT_PLAN = {
  transactionCount: 1,
  entryContract: 'NakamaProtocolFactory',
  factoryCreates: [
    { contractName: 'NakamaPolicyRegistry', nonce: 1 },
    { contractName: 'NakamaCoverageProtocol', nonce: 2 },
  ],
  templates: [
    {
      contractName: 'ReserveVault',
      deploymentKind: 'core-create2',
      saltDerivation: 'keccak256(abi.encode(domainId,assetToken))',
    },
  ],
};

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

function assertJsonEqual(actual, expected, label) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    fail(`${label} mismatch.`);
  }
}

function assertArrayEqual(actual, expected, label) {
  assertJsonEqual([...actual].sort(), [...expected].sort(), label);
}

function listTypeScriptFiles(root) {
  const files = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) files.push(...listTypeScriptFiles(path));
    if (entry.isFile() && entry.name.endsWith('.ts')) files.push(path);
  }
  return files;
}

const packageJson = readJson('package.json');
const manifest = readJson('SDK_RUNTIME.json');
const deployment = readJson(manifest.protocol.deploymentManifest);
const deploymentSchema = readJson(manifest.protocol.deploymentSchema);
const sourceText = listTypeScriptFiles('src')
  .map((path) => readFileSync(path, 'utf8'))
  .join('\n');
const rootEntrypoint = readFileSync('src/index.ts', 'utf8');

assertEqual(manifest.schemaVersion, 3, 'SDK runtime schemaVersion');
assertEqual(manifest.package.name, packageJson.name, 'package name');
assertEqual(manifest.package.version, packageJson.version, 'package version');
assertEqual(manifest.package.node, packageJson.engines?.node, 'node engine');
assertEqual(manifest.package.module, packageJson.type, 'module type');
assertArrayEqual(
  Object.keys(packageJson.dependencies ?? {}),
  CANONICAL_PRODUCTION_DEPENDENCIES,
  'canonical production dependencies',
);
assertArrayEqual(
  Object.keys(packageJson.peerDependencies ?? {}),
  LEGACY_OPTIONAL_PEERS,
  'legacy optional peer dependencies',
);
for (const dependency of LEGACY_OPTIONAL_PEERS) {
  if (!packageJson.devDependencies?.[dependency]) {
    fail(
      `Legacy peer ${dependency} must remain available for local compatibility tests.`,
    );
  }
  if (packageJson.peerDependenciesMeta?.[dependency]?.optional !== true) {
    fail(`Legacy peer ${dependency} must be marked optional.`);
  }
}
for (const legacyModule of [
  'claims',
  'oracle',
  'protocol',
  'protocol_models',
  'protocol_seeds',
  'rpc',
  'transactions',
  'types',
  'utils',
]) {
  if (rootEntrypoint.includes(`./${legacyModule}.js`)) {
    fail(
      `Canonical root entrypoint must not export legacy module ${legacyModule}.`,
    );
  }
}
assertEqual(manifest.protocol.chainFamily, 'eip155', 'chain family');
assertEqual(manifest.protocol.chainId, 1, 'chain ID');
assertEqual(manifest.protocol.caip2, 'eip155:1', 'CAIP-2 chain');
assertJsonEqual(
  manifest.protocol.deploymentPlan,
  DEPLOYMENT_PLAN,
  'factory deployment plan',
);
assertArrayEqual(
  Object.keys(manifest.protocol.contracts ?? {}),
  CONTRACT_NAMES,
  'runtime contract set',
);

const siblingArtifactPath = join(
  manifest.protocol.sourceRepo,
  manifest.protocol.sourceArtifact,
);
const siblingArtifact = existsSync(siblingArtifactPath)
  ? readJson(siblingArtifactPath)
  : null;
const siblingArtifactRaw = siblingArtifact
  ? readFileSync(siblingArtifactPath, 'utf8')
  : null;
if (siblingArtifact) {
  assertEqual(siblingArtifact.schemaVersion, 3, 'sibling schemaVersion');
  assertEqual(
    siblingArtifact.chainFamily,
    manifest.protocol.chainFamily,
    'sibling chain family',
  );
  assertEqual(
    siblingArtifact.canonicalChain,
    manifest.protocol.caip2,
    'sibling canonical chain',
  );
  assertJsonEqual(
    siblingArtifact.deploymentPlan,
    DEPLOYMENT_PLAN,
    'sibling deployment plan',
  );
  assertEqual(
    createHash('sha256').update(siblingArtifactRaw).digest('hex'),
    manifest.protocol.sourceArtifactSha256,
    'sibling artifact SHA-256',
  );
}

let functionCount = 0;
let eventCount = 0;
for (const contractName of CONTRACT_NAMES) {
  const contract = manifest.protocol.contracts[contractName];
  const abiRaw = readFileSync(contract.abiArtifact, 'utf8');
  const abi = JSON.parse(abiRaw);
  const metadata = readJson(contract.metadataArtifact);
  const abiSha256 = createHash('sha256').update(abiRaw).digest('hex');

  assertEqual(metadata.schemaVersion, 3, `${contractName} metadata schema`);
  assertEqual(metadata.contractName, contractName, `${contractName} metadata`);
  assertEqual(metadata.chainFamily, 'eip155', `${contractName} chain family`);
  assertEqual(
    metadata.canonicalChain,
    'eip155:1',
    `${contractName} canonical chain`,
  );
  assertEqual(metadata.abiSha256, abiSha256, `${contractName} metadata ABI`);
  assertEqual(contract.abiSha256, abiSha256, `${contractName} runtime ABI`);
  assertEqual(
    metadata.sourceArtifactSha256,
    manifest.protocol.sourceArtifactSha256,
    `${contractName} source artifact`,
  );
  for (const field of [
    'creationBytecodeHash',
    'creationBytecodeBytes',
    'runtimeBytecodeTemplateHash',
    'runtimeBytecodeBytes',
  ]) {
    assertEqual(metadata[field], contract[field], `${contractName} ${field}`);
  }
  assertJsonEqual(
    metadata.immutableReferences,
    contract.immutableReferences,
    `${contractName} immutable references`,
  );
  assertJsonEqual(
    metadata.deploymentPlan,
    DEPLOYMENT_PLAN,
    `${contractName} metadata deployment plan`,
  );

  if (siblingArtifact) {
    const siblingContract = siblingArtifact.contracts?.[contractName];
    assertJsonEqual(siblingContract?.abi, abi, `${contractName} sibling ABI`);
    for (const field of [
      'abiSha256',
      'creationBytecodeHash',
      'creationBytecodeBytes',
      'runtimeBytecodeTemplateHash',
      'runtimeBytecodeBytes',
      'immutableReferences',
    ]) {
      assertJsonEqual(
        siblingContract?.[field],
        contract[field],
        `${contractName} sibling ${field}`,
      );
    }
  }

  const siblingAbiPath = join(
    manifest.protocol.sourceRepo,
    `shared/ethereum/${contractName}.abi.json`,
  );
  if (existsSync(siblingAbiPath)) {
    assertEqual(
      readFileSync(siblingAbiPath, 'utf8'),
      abiRaw,
      `${contractName} standalone sibling ABI bytes`,
    );
  }

  functionCount += abi.filter((entry) => entry.type === 'function').length;
  eventCount += abi.filter((entry) => entry.type === 'event').length;
}

assertEqual(deployment.schemaVersion, 3, 'deployment schemaVersion');
assertEqual(deployment.chainId, 1, 'deployment chain ID');
assertEqual(deployment.caip2, 'eip155:1', 'deployment CAIP-2');
assertEqual(
  deployment.entryContract,
  'NakamaProtocolFactory',
  'deployment entry contract',
);
assertEqual(
  deployment.status,
  manifest.protocol.deploymentStatus,
  'deployment status',
);
assertEqual(
  deploymentSchema.properties?.schemaVersion?.const,
  3,
  'final deployment schemaVersion',
);
assertEqual(
  deploymentSchema.properties?.entryContract?.const,
  'NakamaProtocolFactory',
  'final deployment schema entry contract',
);
assertEqual(
  deploymentSchema.additionalProperties,
  false,
  'final deployment schema additionalProperties',
);

const siblingDeploymentSchema = join(
  manifest.protocol.sourceRepo,
  'deployments/ethereum-mainnet.final.schema.json',
);
if (existsSync(siblingDeploymentSchema)) {
  assertJsonEqual(
    readJson(siblingDeploymentSchema),
    deploymentSchema,
    'sibling deployment schema',
  );
}

assertArrayEqual(
  manifest.publicSubpaths,
  Object.keys(packageJson.exports ?? {}),
  'public subpaths',
);
for (const subpath of [
  ...(manifest.canonicalSubpaths ?? []),
  ...(manifest.legacyReadMigrationSubpaths ?? []),
]) {
  if (!manifest.publicSubpaths.includes(subpath)) {
    fail(`Manifest subpath is not exported: ${subpath}`);
  }
}

for (const scriptField of ['parityCommand', 'importCommand']) {
  const command = manifest.protocol[scriptField];
  const script = command?.replace(/^npm run /u, '');
  if (!script || !packageJson.scripts?.[script]) {
    fail(`protocol.${scriptField} is not a package script: ${command}`);
  }
}

const packageFiles = new Set(packageJson.files ?? []);
for (const required of [
  'dist',
  'contracts',
  'deployments',
  'docs',
  'SDK_QUALITY.md',
  'SDK_RUNTIME.json',
  'NOTICE',
]) {
  if (!packageFiles.has(required)) {
    fail(`package.json#files must include ${required}.`);
  }
}
for (const docPath of manifest.docs ?? []) {
  if (!existsSync(docPath))
    fail(`SDK runtime docs path is missing: ${docPath}`);
}
for (const command of manifest.validationGates ?? []) {
  if (command.startsWith('npm run ')) {
    const scriptName = command.replace(/^npm run /u, '').trim();
    if (!packageJson.scripts?.[scriptName]) {
      fail(`SDK runtime validation gate is not a package script: ${command}`);
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
  return new RegExp(
    `export\\s+(?:async\\s+)?function\\s+${escaped}\\b|export\\s+const\\s+${escaped}\\b|export\\s+class\\s+${escaped}\\b`,
    'u',
  ).test(sourceText);
}

for (const lane of manifest.lanes ?? []) {
  for (const entrypoint of lane.entrypoints ?? []) {
    if (!manifest.publicSubpaths.includes(entrypoint.subpath)) {
      fail(
        `Lane ${lane.id} entrypoint ${entrypoint.name} references unknown subpath ${entrypoint.subpath}.`,
      );
    }
    if (!sourceHasExportedName(entrypoint.name, entrypoint.kind)) {
      fail(`Lane ${lane.id} entrypoint ${entrypoint.name} is not in source.`);
    }
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log(
  `SDK runtime manifest check passed (${CONTRACT_NAMES.length} contracts, ${functionCount} functions, ${eventCount} events, deployment ${deployment.status}).`,
);
