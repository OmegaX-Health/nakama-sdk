#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { keccak256, stringToHex } from 'viem';

const CONTRACT_ROLES = Object.freeze({
  assetRegistry: 'AssetRegistry',
  templateRegistry: 'TemplateRegistry',
  poolRegistry: 'PoolRegistry',
  factory: 'NakamaFactory',
  program: 'ProtectionProgram',
  vault: 'PoolVault',
  membershipRegistry: 'MembershipRegistry',
  decisionModule: 'DecisionModule',
  requestManager: 'ClaimManager',
  settlementModule: 'SettlementModule',
  agentAuthorizationRegistry: 'AgentAuthorizationRegistry',
  safetyGuardian: 'SafetyGuardian',
});
const NETWORKS = Object.freeze({
  mainnet: Object.freeze({
    name: 'Robinhood Chain Mainnet',
    chainId: 4663,
    caip2: 'eip155:4663',
    deploymentManifest: 'deployments/robinhood-mainnet.json',
  }),
  testnet: Object.freeze({
    name: 'Robinhood Chain Testnet',
    chainId: 46630,
    caip2: 'eip155:46630',
    deploymentManifest: 'deployments/robinhood-testnet.json',
  }),
});
const CANONICAL_PRODUCTION_DEPENDENCIES = ['viem'];
const LEGACY_OPTIONAL_PEERS = [
  '@coral-xyz/anchor',
  '@solana/web3.js',
  'bn.js',
  'bs58',
  'tweetnacl',
];
const CANONICAL_SUBPATHS = ['.', './robinhood'];
const MAINNET_USDG = Object.freeze({
  name: 'Global Dollar',
  symbol: 'USDG',
  decimals: 6,
  mainnetAddress: '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168',
  testnetAddress: null,
});
const ECONOMIC_EVENT_SIGNATURE =
  'EconomicActivity(bytes32,bytes32,uint8,bytes32,address,address,address,int256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256)';
const ECONOMIC_EVENT_TOPIC0 = keccak256(stringToHex(ECONOMIC_EVENT_SIGNATURE));

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function sha256(raw) {
  return createHash('sha256').update(raw).digest('hex');
}

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    fail(
      `${label} mismatch: expected ${String(expected)}, got ${String(actual)}`,
    );
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
const sourceText = listTypeScriptFiles('src')
  .map((path) => readFileSync(path, 'utf8'))
  .join('\n');
const rootEntrypoint = readFileSync('src/index.ts', 'utf8');

assertEqual(manifest.schemaVersion, 6, 'SDK runtime schemaVersion');
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
      `Legacy peer ${dependency} must remain available for compatibility tests.`,
    );
  }
  if (packageJson.peerDependenciesMeta?.[dependency]?.optional !== true) {
    fail(`Legacy peer ${dependency} must be marked optional.`);
  }
}

if (!rootEntrypoint.includes("export * from './robinhood/index.js'")) {
  fail('Canonical root entrypoint must export the Robinhood surface.');
}
for (const legacyModule of [
  'claims',
  'ethereum',
  'ethereum_contract',
  'ethereum_oracle',
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
assertEqual(
  manifest.protocol.artifactSchemaVersion,
  2,
  'protocol artifact schema version',
);
assertEqual(manifest.protocol.protocolSuiteMajor, 2, 'protocol suite major');
assertEqual(
  manifest.protocol.economicEventSchemaVersion,
  2,
  'economic event schema version',
);
assertJsonEqual(
  manifest.protocol.economicEvent,
  {
    contractRole: 'vault',
    name: 'EconomicActivity',
    topic0: ECONOMIC_EVENT_TOPIC0,
  },
  'economic event identity',
);
assertJsonEqual(
  Object.fromEntries(
    Object.entries(manifest.protocol.networks ?? {}).map(([network, value]) => [
      network,
      {
        name: value.name,
        chainId: value.chainId,
        caip2: value.caip2,
        deploymentManifest: value.deploymentManifest,
      },
    ]),
  ),
  NETWORKS,
  'Robinhood networks',
);
assertJsonEqual(manifest.protocol.fundingAsset, MAINNET_USDG, 'funding asset');
assertArrayEqual(
  Object.keys(manifest.protocol.contracts ?? {}),
  Object.keys(CONTRACT_ROLES),
  'runtime contract roles',
);

const siblingArtifactPath = join(
  manifest.protocol.sourceRepo,
  manifest.protocol.sourceArtifact,
);
const siblingRepoAvailable = existsSync(manifest.protocol.sourceRepo);
const siblingArtifactAvailable = existsSync(siblingArtifactPath);
if (siblingRepoAvailable && !siblingArtifactAvailable) {
  fail(`Canonical Robinhood artifact is missing: ${siblingArtifactPath}`);
}
const checkedInArtifactRaw = readFileSync(
  'contracts/robinhood/protocol_contract.json',
  'utf8',
);
const checkedInArtifact = JSON.parse(checkedInArtifactRaw);

assertEqual(
  checkedInArtifact.schemaVersion,
  2,
  'checked-in artifact schemaVersion',
);
assertEqual(
  checkedInArtifact.protocolSuiteMajor,
  2,
  'checked-in protocol suite major',
);
assertEqual(
  checkedInArtifact.economicEventSchemaVersion,
  2,
  'checked-in economic event schema version',
);
assertEqual(checkedInArtifact.chainFamily, 'eip155', 'checked-in chain family');
if (
  typeof checkedInArtifact.sourceCommit !== 'string' ||
  !/^[0-9a-f]{40}$/.test(checkedInArtifact.sourceCommit) ||
  /^0{40}$/.test(checkedInArtifact.sourceCommit)
) {
  fail(
    'Checked-in artifact sourceCommit must be a nonzero full lowercase Git SHA.',
  );
}
assertEqual(
  checkedInArtifact.sourceCommit,
  manifest.protocol.sourceCommit,
  'checked-in artifact sourceCommit',
);
assertEqual(
  sha256(checkedInArtifactRaw),
  manifest.protocol.sourceArtifactSha256,
  'checked-in artifact SHA-256',
);
assertJsonEqual(
  checkedInArtifact.supportedChains,
  Object.values(NETWORKS).map(({ name, chainId, caip2 }) => ({
    name,
    chainId,
    caip2,
  })),
  'supported chains',
);
assertJsonEqual(
  checkedInArtifact.fundingAsset,
  MAINNET_USDG,
  'artifact funding asset',
);
assertEqual(
  checkedInArtifact.deploymentPlan?.deploymentCodeCommitment,
  manifest.protocol.deploymentCodeCommitment,
  'deployment code commitment',
);
assertEqual(
  checkedInArtifact.deploymentPlan?.deploymentKind,
  manifest.protocol.deploymentKind,
  'deployment kind',
);

if (siblingArtifactAvailable) {
  assertEqual(
    readFileSync(siblingArtifactPath, 'utf8'),
    checkedInArtifactRaw,
    'sibling artifact bytes',
  );
}

let functionCount = 0;
let eventCount = 0;
const abis = {};
for (const [role, contractName] of Object.entries(CONTRACT_ROLES)) {
  const contract = manifest.protocol.contracts[role];
  const artifactContract = checkedInArtifact.contracts?.[contractName];
  const abiRaw = readFileSync(contract.abiArtifact, 'utf8');
  const abi = JSON.parse(abiRaw);
  abis[role] = abi;
  const abiSha256 = sha256(abiRaw);

  assertEqual(contract.contractName, contractName, `${role} contract name`);
  assertEqual(
    contract.abiArtifact,
    `contracts/robinhood/${contractName}.abi.json`,
    `${contractName} ABI path`,
  );
  assertEqual(
    contract.abiSha256,
    abiSha256,
    `${contractName} runtime ABI hash`,
  );
  assertEqual(
    artifactContract?.abiSha256,
    abiSha256,
    `${contractName} artifact ABI hash`,
  );
  assertJsonEqual(artifactContract?.abi, abi, `${contractName} artifact ABI`);

  const siblingAbiPath = join(
    manifest.protocol.sourceRepo,
    `shared/robinhood/${contractName}.abi.json`,
  );
  if (siblingArtifactAvailable) {
    if (!existsSync(siblingAbiPath)) {
      fail(`Canonical Robinhood ABI is missing: ${siblingAbiPath}`);
    } else {
      assertEqual(
        readFileSync(siblingAbiPath, 'utf8'),
        abiRaw,
        `${contractName} sibling ABI bytes`,
      );
    }
  }

  functionCount += abi.filter((entry) => entry.type === 'function').length;
  eventCount += abi.filter((entry) => entry.type === 'event').length;
}

const economicEvent = abis.vault.find(
  (entry) => entry.type === 'event' && entry.name === 'EconomicActivity',
);
if (!economicEvent) fail('PoolVault EconomicActivity event is missing.');
const actualEconomicSignature = `${economicEvent?.name}(${(
  economicEvent?.inputs ?? []
)
  .map((input) => input.type)
  .join(',')})`;
assertEqual(
  actualEconomicSignature,
  ECONOMIC_EVENT_SIGNATURE,
  'economic event signature',
);
assertJsonEqual(
  (economicEvent?.inputs ?? []).map((input) => input.indexed === true),
  [
    true,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ],
  'economic event indexed fields',
);
assertEqual(
  keccak256(stringToHex(actualEconomicSignature)),
  ECONOMIC_EVENT_TOPIC0,
  'economic event topic0',
);

const blockedAttempt = abis.agentAuthorizationRegistry.find(
  (entry) => entry.type === 'function' && entry.name === 'recordBlockedAttempt',
);
assertJsonEqual(
  blockedAttempt?.inputs?.map((input) => input.type),
  ['bytes32', 'address', 'bytes4', 'uint256', 'uint256'],
  'recordBlockedAttempt inputs',
);
assertJsonEqual(
  blockedAttempt?.outputs?.map((output) => output.type),
  ['bytes32'],
  'recordBlockedAttempt outputs',
);
assertArrayEqual(
  abis.factory
    .filter((entry) => entry.type === 'error')
    .map((entry) => entry.name)
    .filter((name) =>
      ['InvalidRole', 'DuplicateRole', 'IncompatibleSuiteVersion'].includes(
        name,
      ),
    ),
  ['InvalidRole', 'DuplicateRole', 'IncompatibleSuiteVersion'],
  'factory role and version errors',
);

const deploymentSchema = readJson(manifest.protocol.deploymentSchema);
assertEqual(
  deploymentSchema.properties?.schemaVersion?.const,
  1,
  'deployment schema version',
);
assertEqual(
  deploymentSchema.additionalProperties,
  false,
  'deployment schema closed shape',
);
for (const [network, expected] of Object.entries(NETWORKS)) {
  const networkManifest = manifest.protocol.networks[network];
  const deployment = readJson(networkManifest.deploymentManifest);
  assertEqual(
    deployment.schemaVersion,
    1,
    `${network} deployment schemaVersion`,
  );
  assertEqual(deployment.network, network, `${network} deployment network`);
  assertEqual(
    deployment.chainId,
    expected.chainId,
    `${network} deployment chainId`,
  );
  assertEqual(deployment.caip2, expected.caip2, `${network} deployment CAIP-2`);
  assertEqual(
    deployment.status,
    networkManifest.deploymentStatus,
    `${network} deployment status`,
  );
  if (deployment.status === 'unconfigured') {
    assertEqual(
      Object.keys(deployment.contracts ?? {}).length,
      0,
      `${network} placeholder contracts`,
    );
    assertEqual(
      deployment.verified,
      false,
      `${network} placeholder verified flag`,
    );
  }
  if (network === 'mainnet') {
    assertEqual(
      deployment.settlementAsset.address,
      MAINNET_USDG.mainnetAddress,
      'mainnet USDG address',
    );
    assertEqual(
      deployment.settlementAsset.status,
      'verified',
      'mainnet USDG status',
    );
  } else {
    assertEqual(
      deployment.settlementAsset.address,
      null,
      'testnet USDG address',
    );
    assertEqual(
      deployment.settlementAsset.status,
      'unconfigured',
      'testnet USDG status',
    );
  }
}

const packageSubpaths = Object.keys(packageJson.exports ?? {});
assertArrayEqual(manifest.publicSubpaths, packageSubpaths, 'public subpaths');
assertArrayEqual(
  manifest.canonicalSubpaths,
  CANONICAL_SUBPATHS,
  'canonical subpaths',
);
const classifiedSubpaths = [
  ...manifest.canonicalSubpaths,
  ...manifest.legacyReadMigrationSubpaths,
  './package.json',
];
assertArrayEqual(
  classifiedSubpaths,
  packageSubpaths,
  'classified public subpaths',
);
if (new Set(classifiedSubpaths).size !== classifiedSubpaths.length) {
  fail('Canonical, legacy, and metadata subpaths must not overlap.');
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
const artifactParityMode = siblingArtifactAvailable
  ? 'checked-in artifacts and sibling protocol parity'
  : 'checked-in canonical artifacts; sibling protocol repository unavailable';
console.log(
  `SDK runtime manifest check passed (${Object.keys(CONTRACT_ROLES).length} Robinhood contracts, ${functionCount} functions, ${eventCount} events, ${artifactParityMode}, deployments fail-closed).`,
);
