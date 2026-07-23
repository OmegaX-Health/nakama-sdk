#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { format } from 'prettier';

const CONTRACTS = [
  {
    name: 'NakamaProtocolFactory',
    exportPrefix: 'NAKAMA_PROTOCOL_FACTORY',
    constructorInputs: 0,
    requiredFunctions: ['policyRegistry', 'protocol'],
  },
  {
    name: 'NakamaCoverageProtocol',
    exportPrefix: 'NAKAMA_COVERAGE_PROTOCOL',
    constructorInputs: 1,
    requiredFunctions: [
      'attestClaim',
      'authorizeClaimRecipient',
      'createReserveDomain',
      'deploymentFactory',
      'isReserveVault',
      'policyRegistry',
      'reserveVaults',
    ],
  },
  {
    name: 'NakamaPolicyRegistry',
    exportPrefix: 'NAKAMA_POLICY_REGISTRY',
    constructorInputs: 1,
    requiredFunctions: [
      'authorizeClaimRecipient',
      'claimRecipientDigest',
      'core',
      'deriveClaimId',
      'eip712Domain',
      'getClaim',
      'nullifierUsed',
    ],
  },
  {
    name: 'ReserveVault',
    exportPrefix: 'NAKAMA_RESERVE_VAULT',
    constructorInputs: 3,
    requiredFunctions: [
      'assetToken',
      'depositFrom',
      'domainId',
      'protocol',
      'withdrawTo',
    ],
  },
];

const CONTRACT_NAMES = CONTRACTS.map(({ name }) => name);
const DEPLOYMENT_SOURCE = resolve('deployments/ethereum-mainnet.json');
const DEPLOYMENT_SCHEMA_SOURCE = resolve(
  'deployments/ethereum-mainnet.final.schema.json',
);
const OUTPUT = resolve('src/generated/ethereum_protocol.ts');
const DEFAULT_PROTOCOL_ARTIFACT = resolve(
  '../nakama-protocol/shared/ethereum/protocol_contract.json',
);
const CANONICAL_DEPLOYMENT_PLAN = {
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

function abiPath(name) {
  return resolve(`contracts/ethereum/${name}.abi.json`);
}

function metadataPath(name) {
  return resolve(`contracts/ethereum/${name}.metadata.json`);
}

function parseFlag(name) {
  return process.argv.includes(`--${name}`);
}

function parseValueFlag(name) {
  const prefix = `--${name}=`;
  const argument = process.argv.find((value) => value.startsWith(prefix));
  return argument ? argument.slice(prefix.length) : null;
}

function sha256Digest(value) {
  return createHash('sha256').update(value).digest('hex');
}

function equalJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function assertExactKeys(value, expected, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (!equalJson(actual, wanted)) {
    throw new Error(`${label} fields must be exactly ${wanted.join(', ')}.`);
  }
}

function assertAbi(value, contract) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${contract.name} ABI must be a non-empty JSON array.`);
  }

  const signatures = new Set();
  for (const [index, entry] of value.entries()) {
    if (!entry || typeof entry !== 'object' || typeof entry.type !== 'string') {
      throw new Error(`Invalid ${contract.name} ABI item at index ${index}.`);
    }
    if (
      ['function', 'event', 'error'].includes(entry.type) &&
      typeof entry.name !== 'string'
    ) {
      throw new Error(
        `${contract.name} ABI ${entry.type} at index ${index} has no name.`,
      );
    }
    const signature = `${entry.type}:${entry.name ?? ''}:${JSON.stringify(
      entry.inputs ?? [],
    )}`;
    if (signatures.has(signature)) {
      throw new Error(
        `Duplicate ${contract.name} ABI item ${entry.type} ${entry.name ?? ''}.`,
      );
    }
    signatures.add(signature);
  }

  const constructors = value.filter((entry) => entry.type === 'constructor');
  if (
    constructors.length !== 1 ||
    !Array.isArray(constructors[0].inputs) ||
    constructors[0].inputs.length !== contract.constructorInputs
  ) {
    throw new Error(
      `${contract.name} must retain exactly one constructor with ${contract.constructorInputs} inputs.`,
    );
  }

  const functionNames = new Set(
    value
      .filter((entry) => entry.type === 'function')
      .map((entry) => entry.name),
  );
  for (const required of contract.requiredFunctions) {
    if (!functionNames.has(required)) {
      throw new Error(`${contract.name} ABI is missing ${required}.`);
    }
  }
  for (const forbidden of [
    'createObligation',
    'owner',
    'paused',
    'recordPremiumPayment',
    'upgradeToAndCall',
  ]) {
    if (functionNames.has(forbidden)) {
      throw new Error(
        `${contract.name} ABI unexpectedly exposes ${forbidden}.`,
      );
    }
  }
}

function assertImmutableReferences(value, byteLength, contractName) {
  if (!Array.isArray(value)) {
    throw new Error(`${contractName} immutableReferences must be an array.`);
  }
  let previousEnd = 0;
  for (const [index, reference] of value.entries()) {
    const end = reference?.start + reference?.length;
    if (
      !reference ||
      Object.keys(reference).sort().join(',') !== 'length,start' ||
      !Number.isSafeInteger(reference.start) ||
      !Number.isSafeInteger(reference.length) ||
      !Number.isSafeInteger(end) ||
      reference.start < previousEnd ||
      reference.start < 0 ||
      reference.length < 1 ||
      end > byteLength
    ) {
      throw new Error(
        `${contractName} immutable reference ${index} is invalid, unsorted, overlapping, or out of bounds.`,
      );
    }
    previousEnd = end;
  }
  return value;
}

function assertContractArtifact(contract, companionAbi, companionAbiRaw, name) {
  assertExactKeys(
    contract,
    [
      'abi',
      'abiSha256',
      'creationBytecodeHash',
      'creationBytecodeBytes',
      'runtimeBytecodeTemplateHash',
      'runtimeBytecodeBytes',
      'immutableReferences',
    ],
    `${name} protocol artifact`,
  );
  if (!equalJson(contract.abi, companionAbi)) {
    throw new Error(
      `${name} standalone ABI does not structurally match the protocol artifact.`,
    );
  }
  if (
    contract.abiSha256 !== sha256Digest(companionAbiRaw) ||
    !/^[0-9a-f]{64}$/.test(contract.abiSha256) ||
    !/^0x[0-9a-f]{64}$/i.test(contract.creationBytecodeHash) ||
    !/^0x[0-9a-f]{64}$/i.test(contract.runtimeBytecodeTemplateHash) ||
    !Number.isSafeInteger(contract.creationBytecodeBytes) ||
    contract.creationBytecodeBytes < 1 ||
    contract.creationBytecodeBytes > 49_152 ||
    !Number.isSafeInteger(contract.runtimeBytecodeBytes) ||
    contract.runtimeBytecodeBytes < 1 ||
    contract.runtimeBytecodeBytes > 24_576
  ) {
    throw new Error(`${name} protocol artifact bytecode metadata is invalid.`);
  }
  assertImmutableReferences(
    contract.immutableReferences,
    contract.runtimeBytecodeBytes,
    name,
  );
}

function assertDeploymentSchema(value) {
  const required = [
    'schemaVersion',
    'status',
    'chainId',
    'caip2',
    'entryContract',
    'deployer',
    'deploymentTransaction',
    'deploymentBlock',
    'deploymentBlockHash',
    'confirmations',
    'sourceCommit',
    'protocolArtifactSha256',
    'liveContracts',
    'contractTemplates',
    'verified',
    'auditStatus',
    'auditReportSha256',
    'releaseApprovalSha256',
    'verificationEvidenceSha256',
  ];
  if (
    value?.properties?.status?.const !== 'deployed' ||
    value.properties.schemaVersion?.const !== 3 ||
    value.properties.chainId?.const !== 1 ||
    value.properties.caip2?.const !== 'eip155:1' ||
    value.properties.entryContract?.const !== 'NakamaProtocolFactory' ||
    value.additionalProperties !== false ||
    !equalJson(value.required, required) ||
    value.properties.liveContracts?.properties?.factory?.allOf?.[1]?.properties
      ?.contractName?.const !== 'NakamaProtocolFactory' ||
    value.properties.liveContracts?.properties?.policyRegistry?.allOf?.[1]
      ?.properties?.factoryNonce?.const !== 1 ||
    value.properties.liveContracts?.properties?.protocol?.allOf?.[1]?.properties
      ?.factoryNonce?.const !== 2 ||
    value.properties.contractTemplates?.properties?.reserveVault?.$ref !==
      '#/$defs/reserveVaultTemplate'
  ) {
    throw new Error(
      'Final Ethereum deployment schema does not match the canonical schema-v3 factory handoff.',
    );
  }
}

function contractMetadata(artifact, artifactRaw, contract, companionAbiRaw) {
  return {
    schemaVersion: 3,
    sourceArtifact: 'nakama-protocol/shared/ethereum/protocol_contract.json',
    sourceArtifactSha256: sha256Digest(artifactRaw),
    sourceAbi: `nakama-protocol/shared/ethereum/${contract.name}.abi.json`,
    chainFamily: artifact.chainFamily,
    canonicalChain: artifact.canonicalChain,
    compiler: artifact.compiler,
    deploymentPlan: artifact.deploymentPlan,
    contractName: contract.name,
    abiSha256: sha256Digest(companionAbiRaw),
    creationBytecodeHash:
      artifact.contracts[contract.name].creationBytecodeHash,
    creationBytecodeBytes:
      artifact.contracts[contract.name].creationBytecodeBytes,
    runtimeBytecodeTemplateHash:
      artifact.contracts[contract.name].runtimeBytecodeTemplateHash,
    runtimeBytecodeBytes:
      artifact.contracts[contract.name].runtimeBytecodeBytes,
    immutableReferences: artifact.contracts[contract.name].immutableReferences,
  };
}

function unconfiguredLiveContract(contractName, deploymentKind, factoryNonce) {
  return {
    contractName,
    address: null,
    deploymentKind,
    factoryNonce,
    creationBytecodeHash: null,
    creationBytecodeBytes: null,
    runtimeBytecodeHash: null,
    runtimeBytecodeTemplateHash: null,
    runtimeBytecodeBytes: null,
    immutableReferences: [],
    abiArtifact: `contracts/ethereum/${contractName}.abi.json`,
    abiSha256: null,
    verification: null,
  };
}

function createUnconfiguredDeployment() {
  return {
    schemaVersion: 3,
    status: 'unconfigured',
    chainId: 1,
    caip2: 'eip155:1',
    entryContract: 'NakamaProtocolFactory',
    deployer: null,
    deploymentTransaction: null,
    deploymentBlock: null,
    deploymentBlockHash: null,
    confirmations: null,
    sourceCommit: null,
    protocolArtifactSha256: null,
    liveContracts: {
      factory: unconfiguredLiveContract(
        'NakamaProtocolFactory',
        'transaction-create',
        null,
      ),
      policyRegistry: unconfiguredLiveContract(
        'NakamaPolicyRegistry',
        'factory-create',
        1,
      ),
      protocol: unconfiguredLiveContract(
        'NakamaCoverageProtocol',
        'factory-create',
        2,
      ),
    },
    contractTemplates: {
      reserveVault: {
        contractName: 'ReserveVault',
        deploymentKind: 'core-create2',
        saltDerivation: 'keccak256(abi.encode(domainId,assetToken))',
        creationBytecodeHash: null,
        creationBytecodeBytes: null,
        runtimeBytecodeTemplateHash: null,
        runtimeBytecodeBytes: null,
        immutableReferences: [],
        abiArtifact: 'contracts/ethereum/ReserveVault.abi.json',
        abiSha256: null,
      },
    },
    verified: false,
    auditStatus: 'unaudited',
    auditReportSha256: null,
    releaseApprovalSha256: null,
    verificationEvidenceSha256: null,
  };
}

function assertDeployment(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Ethereum deployment manifest must be an object.');
  }
  if (value.status === 'unconfigured') {
    if (!equalJson(value, createUnconfiguredDeployment())) {
      throw new Error(
        'Unconfigured deployment manifest does not match the canonical schema-v3 fail-closed form.',
      );
    }
    return;
  }
  if (
    value.schemaVersion !== 3 ||
    value.status !== 'deployed' ||
    value.chainId !== 1 ||
    value.caip2 !== 'eip155:1' ||
    value.entryContract !== 'NakamaProtocolFactory'
  ) {
    throw new Error('Published deployment manifest must use schema v3.');
  }
}

function assertDeploymentArtifactBinding(value, metadata) {
  if (value.status !== 'deployed') return;

  const protocolArtifactSha256 =
    metadata.NakamaProtocolFactory.sourceArtifactSha256;
  if (value.protocolArtifactSha256 !== protocolArtifactSha256) {
    throw new Error(
      'Deployed manifest protocolArtifactSha256 does not match the imported protocol artifact.',
    );
  }

  const liveBindings = [
    ['factory', 'NakamaProtocolFactory'],
    ['policyRegistry', 'NakamaPolicyRegistry'],
    ['protocol', 'NakamaCoverageProtocol'],
  ];
  for (const [role, contractName] of liveBindings) {
    const deploymentContract = value.liveContracts?.[role];
    const contract = metadata[contractName];
    const expected = {
      creationBytecodeHash: contract.creationBytecodeHash,
      creationBytecodeBytes: contract.creationBytecodeBytes,
      runtimeBytecodeTemplateHash: contract.runtimeBytecodeTemplateHash,
      runtimeBytecodeBytes: contract.runtimeBytecodeBytes,
      immutableReferences: contract.immutableReferences,
      abiArtifact: `contracts/ethereum/${contractName}.abi.json`,
      abiSha256: contract.abiSha256,
    };
    for (const [field, expectedValue] of Object.entries(expected)) {
      if (!equalJson(deploymentContract?.[field], expectedValue)) {
        throw new Error(
          `Deployed manifest ${role}.${field} does not match the imported ${contractName} artifact.`,
        );
      }
    }
  }

  const reserveVault = value.contractTemplates?.reserveVault;
  const reserveVaultMetadata = metadata.ReserveVault;
  const expectedReserveVault = {
    creationBytecodeHash: reserveVaultMetadata.creationBytecodeHash,
    creationBytecodeBytes: reserveVaultMetadata.creationBytecodeBytes,
    runtimeBytecodeTemplateHash:
      reserveVaultMetadata.runtimeBytecodeTemplateHash,
    runtimeBytecodeBytes: reserveVaultMetadata.runtimeBytecodeBytes,
    immutableReferences: reserveVaultMetadata.immutableReferences,
    abiArtifact: 'contracts/ethereum/ReserveVault.abi.json',
    abiSha256: reserveVaultMetadata.abiSha256,
  };
  for (const [field, expectedValue] of Object.entries(expectedReserveVault)) {
    if (!equalJson(reserveVault?.[field], expectedValue)) {
      throw new Error(
        `Deployed manifest reserveVault.${field} does not match the imported ReserveVault artifact.`,
      );
    }
  }
}

async function loadCanonical(artifactPath) {
  const artifactRaw = await readFile(artifactPath, 'utf8');
  const artifact = JSON.parse(artifactRaw);
  if (
    artifact.schemaVersion !== 3 ||
    artifact.chainFamily !== 'eip155' ||
    artifact.canonicalChain !== 'eip155:1' ||
    !equalJson(artifact.deploymentPlan, CANONICAL_DEPLOYMENT_PLAN)
  ) {
    throw new Error(
      'Protocol artifact must be the canonical schema-v3 eip155:1 factory deployment.',
    );
  }
  assertExactKeys(artifact.contracts, CONTRACT_NAMES, 'Protocol contracts');

  const directory = dirname(artifactPath);
  const abiRawByName = {};
  const abiByName = {};
  for (const contract of CONTRACTS) {
    const companionPath = resolve(directory, `${contract.name}.abi.json`);
    if (!existsSync(companionPath)) {
      throw new Error(`Canonical ${contract.name} standalone ABI is missing.`);
    }
    const companionAbiRaw = await readFile(companionPath, 'utf8');
    const companionAbi = JSON.parse(companionAbiRaw);
    assertAbi(companionAbi, contract);
    assertContractArtifact(
      artifact.contracts[contract.name],
      companionAbi,
      companionAbiRaw,
      contract.name,
    );
    abiRawByName[contract.name] = companionAbiRaw;
    abiByName[contract.name] = companionAbi;
  }

  const schemaPath = resolve(
    directory,
    '..',
    '..',
    'deployments',
    'ethereum-mainnet.final.schema.json',
  );
  if (!existsSync(schemaPath)) {
    throw new Error('Canonical final deployment schema is missing.');
  }
  const schemaRaw = await readFile(schemaPath, 'utf8');
  const schema = JSON.parse(schemaRaw);
  assertDeploymentSchema(schema);

  return {
    artifact,
    artifactRaw,
    abiByName,
    abiRawByName,
    schema,
    schemaRaw,
  };
}

function render(abis, metadata, deployment) {
  const blocks = CONTRACTS.map(
    (contract) => `export const ${contract.exportPrefix}_ABI = ${JSON.stringify(
      abis[contract.name],
      null,
      2,
    )} as const satisfies Abi;

export const ${contract.exportPrefix}_ABI_SHA256 = ${JSON.stringify(
      metadata[contract.name].abiSha256,
    )} as const;

export const ${contract.exportPrefix}_ARTIFACT_METADATA = ${JSON.stringify(
      metadata[contract.name],
      null,
      2,
    )} as const;`,
  );

  const metadataMap = CONTRACTS.map(
    (contract) =>
      `  ${contract.name}: ${contract.exportPrefix}_ARTIFACT_METADATA,`,
  ).join('\n');

  return `// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
// Sources: canonical schema-v3 ABIs + metadata + Ethereum mainnet deployment manifest/schema

import type { Abi } from 'viem';

${blocks.join('\n\n')}

export const NAKAMA_ETHEREUM_CONTRACT_ARTIFACT_METADATA = {
${metadataMap}
} as const;

export const NAKAMA_ETHEREUM_MAINNET_DEPLOYMENT = ${JSON.stringify(
    deployment,
    null,
    2,
  )} as const;
`;
}

async function main() {
  const artifactArgument = parseValueFlag('import-artifact');
  const importing = artifactArgument != null || parseFlag('import-artifact');
  const artifactPath = artifactArgument
    ? resolve(artifactArgument)
    : DEFAULT_PROTOCOL_ARTIFACT;

  if (importing) {
    if (parseFlag('check')) {
      throw new Error('--import-artifact and --check cannot be combined.');
    }
    if (!existsSync(artifactPath)) {
      throw new Error(`Protocol artifact not found at ${artifactPath}.`);
    }
    const canonical = await loadCanonical(artifactPath);
    const metadata = Object.fromEntries(
      CONTRACTS.map((contract) => [
        contract.name,
        contractMetadata(
          canonical.artifact,
          canonical.artifactRaw,
          contract,
          canonical.abiRawByName[contract.name],
        ),
      ]),
    );

    const currentDeployment = existsSync(DEPLOYMENT_SOURCE)
      ? JSON.parse(await readFile(DEPLOYMENT_SOURCE, 'utf8'))
      : null;
    if (currentDeployment?.status === 'deployed') {
      assertDeployment(currentDeployment);
      assertDeploymentArtifactBinding(currentDeployment, metadata);
    }

    await mkdir(resolve('contracts/ethereum'), { recursive: true });
    await Promise.all([
      ...CONTRACTS.flatMap((contract) => [
        writeFile(
          abiPath(contract.name),
          canonical.abiRawByName[contract.name],
          'utf8',
        ),
        writeFile(
          metadataPath(contract.name),
          `${JSON.stringify(metadata[contract.name], null, 2)}\n`,
          'utf8',
        ),
      ]),
      writeFile(DEPLOYMENT_SCHEMA_SOURCE, canonical.schemaRaw, 'utf8'),
    ]);
    if (currentDeployment?.status !== 'deployed') {
      await writeFile(
        DEPLOYMENT_SOURCE,
        `${JSON.stringify(createUnconfiguredDeployment(), null, 2)}\n`,
        'utf8',
      );
    }
    console.log(`Imported four ABIs and metadata from ${artifactPath}.`);
  }

  for (const contract of CONTRACTS) {
    if (!existsSync(abiPath(contract.name))) {
      throw new Error(`${contract.name} ABI source is missing.`);
    }
    if (!existsSync(metadataPath(contract.name))) {
      throw new Error(
        `${contract.name} metadata is missing. Run npm run import:ethereum-contract.`,
      );
    }
  }
  if (!existsSync(DEPLOYMENT_SOURCE) || !existsSync(DEPLOYMENT_SCHEMA_SOURCE)) {
    throw new Error(
      'Ethereum deployment manifest/schema is missing. Run npm run import:ethereum-contract.',
    );
  }

  const abis = {};
  const abiRaw = {};
  const metadata = {};
  for (const contract of CONTRACTS) {
    abiRaw[contract.name] = await readFile(abiPath(contract.name), 'utf8');
    abis[contract.name] = JSON.parse(abiRaw[contract.name]);
    metadata[contract.name] = JSON.parse(
      await readFile(metadataPath(contract.name), 'utf8'),
    );
    assertAbi(abis[contract.name], contract);
  }
  const deployment = JSON.parse(await readFile(DEPLOYMENT_SOURCE, 'utf8'));
  const deploymentSchema = JSON.parse(
    await readFile(DEPLOYMENT_SCHEMA_SOURCE, 'utf8'),
  );
  assertDeployment(deployment);
  assertDeploymentSchema(deploymentSchema);

  for (const contract of CONTRACTS) {
    const candidate = metadata[contract.name];
    if (
      candidate.schemaVersion !== 3 ||
      candidate.sourceArtifact !==
        'nakama-protocol/shared/ethereum/protocol_contract.json' ||
      candidate.sourceAbi !==
        `nakama-protocol/shared/ethereum/${contract.name}.abi.json` ||
      candidate.chainFamily !== 'eip155' ||
      candidate.canonicalChain !== 'eip155:1' ||
      candidate.contractName !== contract.name ||
      candidate.abiSha256 !== sha256Digest(abiRaw[contract.name]) ||
      !/^[0-9a-f]{64}$/.test(candidate.sourceArtifactSha256) ||
      !equalJson(candidate.deploymentPlan, CANONICAL_DEPLOYMENT_PLAN) ||
      !/^0x[0-9a-f]{64}$/.test(candidate.creationBytecodeHash) ||
      !Number.isSafeInteger(candidate.creationBytecodeBytes) ||
      candidate.creationBytecodeBytes < 1 ||
      candidate.creationBytecodeBytes > 49_152 ||
      !/^0x[0-9a-f]{64}$/.test(candidate.runtimeBytecodeTemplateHash) ||
      !Number.isSafeInteger(candidate.runtimeBytecodeBytes) ||
      candidate.runtimeBytecodeBytes < 1 ||
      candidate.runtimeBytecodeBytes > 24_576 ||
      typeof candidate.compiler?.version !== 'string' ||
      typeof candidate.compiler?.evmVersion !== 'string' ||
      !Number.isSafeInteger(candidate.compiler?.optimizerRuns) ||
      typeof candidate.compiler?.viaIR !== 'boolean'
    ) {
      throw new Error(
        `${contract.name} metadata is invalid or stale. Run npm run import:ethereum-contract.`,
      );
    }
    assertImmutableReferences(
      candidate.immutableReferences,
      candidate.runtimeBytecodeBytes,
      contract.name,
    );
  }

  if (
    new Set(
      CONTRACTS.map((contract) => metadata[contract.name].sourceArtifactSha256),
    ).size !== 1
  ) {
    throw new Error(
      'Contract metadata records do not share one protocol artifact digest. Run npm run import:ethereum-contract.',
    );
  }
  assertDeploymentArtifactBinding(deployment, metadata);

  if (existsSync(DEFAULT_PROTOCOL_ARTIFACT)) {
    const canonical = await loadCanonical(DEFAULT_PROTOCOL_ARTIFACT);
    for (const contract of CONTRACTS) {
      const expectedMetadata = contractMetadata(
        canonical.artifact,
        canonical.artifactRaw,
        contract,
        canonical.abiRawByName[contract.name],
      );
      if (
        abiRaw[contract.name] !== canonical.abiRawByName[contract.name] ||
        !equalJson(metadata[contract.name], expectedMetadata)
      ) {
        throw new Error(
          `${contract.name} ABI or metadata does not match the sibling protocol artifact. Run npm run import:ethereum-contract.`,
        );
      }
    }
    if (!equalJson(deploymentSchema, canonical.schema)) {
      throw new Error(
        'Deployment schema does not match the sibling protocol schema. Run npm run import:ethereum-contract.',
      );
    }
  }

  const output = await format(render(abis, metadata, deployment), {
    parser: 'typescript',
    singleQuote: true,
    trailingComma: 'all',
  });

  if (parseFlag('check')) {
    if (!existsSync(OUTPUT)) {
      throw new Error('Generated Ethereum contract module is missing.');
    }
    const current = await readFile(OUTPUT, 'utf8');
    if (current !== output) {
      throw new Error(
        'Generated Ethereum contract module is stale. Run npm run generate:protocol-bindings.',
      );
    }
    console.log(
      'Generated schema-v3 Ethereum contract bindings and metadata are current.',
    );
    return;
  }

  await mkdir(dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, output, 'utf8');
  console.log(`Generated ${OUTPUT}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
