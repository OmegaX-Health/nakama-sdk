import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

import {
  NAKAMA_COVERAGE_PROTOCOL_ABI,
  NAKAMA_COVERAGE_PROTOCOL_ABI_SHA256,
  NAKAMA_COVERAGE_PROTOCOL_ARTIFACT_METADATA,
  NAKAMA_ETHEREUM_MAINNET_DEPLOYMENT,
  NAKAMA_POLICY_REGISTRY_ABI,
  NAKAMA_POLICY_REGISTRY_ABI_SHA256,
  NAKAMA_POLICY_REGISTRY_ARTIFACT_METADATA,
  NAKAMA_PROTOCOL_FACTORY_ABI,
  NAKAMA_PROTOCOL_FACTORY_ABI_SHA256,
  NAKAMA_PROTOCOL_FACTORY_ARTIFACT_METADATA,
  NAKAMA_RESERVE_VAULT_ABI,
  NAKAMA_RESERVE_VAULT_ABI_SHA256,
  NAKAMA_RESERVE_VAULT_ARTIFACT_METADATA,
} from '../src/index.js';

const CONTRACTS = [
  {
    name: 'NakamaProtocolFactory',
    abi: NAKAMA_PROTOCOL_FACTORY_ABI,
    abiSha256: NAKAMA_PROTOCOL_FACTORY_ABI_SHA256,
    metadata: NAKAMA_PROTOCOL_FACTORY_ARTIFACT_METADATA,
    constructorInputs: 0,
    requiredFunctions: ['policyRegistry', 'protocol'],
  },
  {
    name: 'NakamaCoverageProtocol',
    abi: NAKAMA_COVERAGE_PROTOCOL_ABI,
    abiSha256: NAKAMA_COVERAGE_PROTOCOL_ABI_SHA256,
    metadata: NAKAMA_COVERAGE_PROTOCOL_ARTIFACT_METADATA,
    constructorInputs: 1,
    requiredFunctions: [
      'createReserveDomain',
      'deploymentFactory',
      'policyRegistry',
    ],
  },
  {
    name: 'NakamaPolicyRegistry',
    abi: NAKAMA_POLICY_REGISTRY_ABI,
    abiSha256: NAKAMA_POLICY_REGISTRY_ABI_SHA256,
    metadata: NAKAMA_POLICY_REGISTRY_ARTIFACT_METADATA,
    constructorInputs: 1,
    requiredFunctions: [
      'authorizeClaimRecipient',
      'claimRecipientDigest',
      'core',
      'deriveClaimId',
      'eip712Domain',
    ],
  },
  {
    name: 'ReserveVault',
    abi: NAKAMA_RESERVE_VAULT_ABI,
    abiSha256: NAKAMA_RESERVE_VAULT_ABI_SHA256,
    metadata: NAKAMA_RESERVE_VAULT_ARTIFACT_METADATA,
    constructorInputs: 3,
    requiredFunctions: ['assetToken', 'domainId', 'protocol'],
  },
] as const;

test('generated schema-v3 bindings and metadata match all checked-in sources', async () => {
  for (const contract of CONTRACTS) {
    const abiRaw = await readFile(
      `contracts/ethereum/${contract.name}.abi.json`,
      'utf8',
    );
    const metadataSource = JSON.parse(
      await readFile(
        `contracts/ethereum/${contract.name}.metadata.json`,
        'utf8',
      ),
    );
    assert.deepEqual(contract.abi, JSON.parse(abiRaw));
    assert.equal(
      contract.abiSha256,
      createHash('sha256').update(abiRaw).digest('hex'),
    );
    assert.deepEqual(contract.metadata, metadataSource);
    assert.equal(contract.metadata.schemaVersion, 3);
    assert.equal(contract.metadata.contractName, contract.name);
  }

  assert.deepEqual(
    NAKAMA_ETHEREUM_MAINNET_DEPLOYMENT,
    JSON.parse(await readFile('deployments/ethereum-mainnet.json', 'utf8')),
  );
  assert.equal(NAKAMA_ETHEREUM_MAINNET_DEPLOYMENT.schemaVersion, 3);
  assert.equal(
    NAKAMA_ETHEREUM_MAINNET_DEPLOYMENT.entryContract,
    'NakamaProtocolFactory',
  );
});

test('generated ABIs preserve the decentralized factory, registry, core, and vault surfaces', () => {
  for (const contract of CONTRACTS) {
    const constructors = contract.abi.filter(
      (entry) => entry.type === 'constructor',
    );
    assert.equal(constructors.length, 1);
    assert.equal(constructors[0]?.inputs.length, contract.constructorInputs);
    const functionNames = new Set(
      contract.abi
        .filter((entry) => entry.type === 'function')
        .map((entry) => entry.name),
    );
    for (const required of contract.requiredFunctions) {
      assert.equal(
        functionNames.has(required),
        true,
        `${contract.name} missing ${required}`,
      );
    }
    for (const forbidden of [
      'createObligation',
      'owner',
      'paused',
      'recordPremiumPayment',
      'upgradeToAndCall',
    ]) {
      assert.equal(
        functionNames.has(forbidden),
        false,
        `${contract.name} unexpectedly exposes ${forbidden}`,
      );
    }
  }

  const deriveClaimId = NAKAMA_POLICY_REGISTRY_ABI.find(
    (entry) => entry.type === 'function' && entry.name === 'deriveClaimId',
  );
  assert.deepEqual(
    deriveClaimId?.inputs.map((input) => input.name),
    ['positionId', 'claimant', 'nullifier'],
  );

  const premiumCollected = NAKAMA_COVERAGE_PROTOCOL_ABI.find(
    (entry) =>
      entry.type === 'event' && entry.name === 'PolicyPremiumCollected',
  );
  assert.deepEqual(
    premiumCollected?.inputs.map((input) => input.name),
    ['positionId', 'premiumLineId', 'coverageLineId', 'payer', 'amount'],
  );
});

test('published schema-v3 deployment schema matches the protocol promotion handoff', async () => {
  const localSchema = JSON.parse(
    await readFile('deployments/ethereum-mainnet.final.schema.json', 'utf8'),
  );
  assert.deepEqual(localSchema.required, [
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
  ]);
  assert.equal(localSchema.additionalProperties, false);
  assert.equal(localSchema.properties.schemaVersion.const, 3);
  assert.equal(
    localSchema.properties.entryContract.const,
    'NakamaProtocolFactory',
  );
  assert.equal(
    localSchema.$defs.reserveVaultTemplate.properties.saltDerivation.const,
    'keccak256(abi.encode(domainId,assetToken))',
  );

  const siblingPath =
    '../nakama-protocol/deployments/ethereum-mainnet.final.schema.json';
  if (existsSync(siblingPath)) {
    assert.deepEqual(
      localSchema,
      JSON.parse(await readFile(siblingPath, 'utf8')),
    );
  }
});

test('artifact import rejects a stale deployed manifest before writing new inputs', async (t) => {
  const artifactPath = resolve(
    '../nakama-protocol/shared/ethereum/protocol_contract.json',
  );
  if (!existsSync(artifactPath)) {
    t.skip('sibling nakama-protocol artifact is unavailable');
    return;
  }

  const tempRoot = await mkdtemp(join(tmpdir(), 'nakama-sdk-abi-import-'));
  try {
    await mkdir(join(tempRoot, 'deployments'), { recursive: true });
    await writeFile(
      join(tempRoot, 'deployments/ethereum-mainnet.json'),
      `${JSON.stringify({
        schemaVersion: 3,
        status: 'deployed',
        chainId: 1,
        caip2: 'eip155:1',
        entryContract: 'NakamaProtocolFactory',
        protocolArtifactSha256: '0'.repeat(64),
      })}\n`,
      'utf8',
    );

    const result = spawnSync(
      process.execPath,
      [
        resolve('scripts/sync-ethereum-abi.mjs'),
        `--import-artifact=${artifactPath}`,
      ],
      { cwd: tempRoot, encoding: 'utf8' },
    );

    assert.notEqual(result.status, 0);
    assert.match(
      `${result.stdout}${result.stderr}`,
      /protocolArtifactSha256 does not match the imported protocol artifact/,
    );
    assert.equal(
      existsSync(join(tempRoot, 'contracts')),
      false,
      'stale deployment rejection must happen before artifact writes',
    );
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
