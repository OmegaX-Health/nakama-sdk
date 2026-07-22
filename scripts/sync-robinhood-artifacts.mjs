#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { format } from 'prettier';

const CONTRACTS = [
  ['assetRegistry', 'AssetRegistry'],
  ['templateRegistry', 'TemplateRegistry'],
  ['poolRegistry', 'PoolRegistry'],
  ['factory', 'NakamaFactory'],
  ['program', 'ProtectionProgram'],
  ['vault', 'PoolVault'],
  ['membershipRegistry', 'MembershipRegistry'],
  ['decisionModule', 'DecisionModule'],
  ['requestManager', 'ClaimManager'],
  ['settlementModule', 'SettlementModule'],
  ['agentAuthorizationRegistry', 'AgentAuthorizationRegistry'],
  ['safetyGuardian', 'SafetyGuardian'],
];

const LOCAL_ROOT = resolve('contracts/robinhood');
const DEFAULT_PROTOCOL_ROOT = resolve('../nakama-protocol/shared/robinhood');
const PROTOCOL_ARTIFACT_NAME = 'protocol_contract.json';
const OUTPUT = resolve('src/generated/robinhood_protocol.ts');
const DEPLOYMENTS = {
  mainnet: resolve('deployments/robinhood-mainnet.json'),
  testnet: resolve('deployments/robinhood-testnet.json'),
};

function parseFlag(name) {
  return process.argv.includes(`--${name}`);
}

function parseValueFlag(name) {
  const prefix = `--${name}=`;
  return (
    process.argv
      .find((argument) => argument.startsWith(prefix))
      ?.slice(prefix.length) ?? null
  );
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

async function readJson(path, label) {
  let raw;
  try {
    raw = await readFile(path, 'utf8');
  } catch (error) {
    throw new Error(`Unable to read ${label} at ${path}.`, { cause: error });
  }
  try {
    return { raw, value: JSON.parse(raw) };
  } catch (error) {
    throw new Error(`${label} is not valid JSON.`, { cause: error });
  }
}

function requireObject(value, label) {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value;
}

function assertAbi(abi, contractName) {
  if (!Array.isArray(abi) || abi.length === 0) {
    throw new Error(`${contractName} ABI must be a non-empty array.`);
  }
  for (const [index, item] of abi.entries()) {
    if (
      item == null ||
      typeof item !== 'object' ||
      typeof item.type !== 'string'
    ) {
      throw new Error(`${contractName} ABI item ${index} is invalid.`);
    }
  }
}

async function importArtifacts(sourceRoot) {
  const sourceArtifact = resolve(sourceRoot, PROTOCOL_ARTIFACT_NAME);
  if (!existsSync(sourceArtifact)) {
    throw new Error(
      `Canonical Robinhood artifact is missing at ${sourceArtifact}.`,
    );
  }
  await mkdir(LOCAL_ROOT, { recursive: true });
  await copyFile(sourceArtifact, resolve(LOCAL_ROOT, PROTOCOL_ARTIFACT_NAME));
  for (const [, contractName] of CONTRACTS) {
    const sourceAbi = resolve(sourceRoot, `${contractName}.abi.json`);
    if (!existsSync(sourceAbi)) {
      throw new Error(`Canonical ABI is missing at ${sourceAbi}.`);
    }
    await copyFile(sourceAbi, resolve(LOCAL_ROOT, `${contractName}.abi.json`));
  }
}

async function buildBundle() {
  const deployments = Object.fromEntries(
    await Promise.all(
      Object.entries(DEPLOYMENTS).map(async ([network, path]) => [
        network,
        (await readJson(path, `${network} deployment manifest`)).value,
      ]),
    ),
  );
  const localArtifactPath = resolve(LOCAL_ROOT, PROTOCOL_ARTIFACT_NAME);
  if (!existsSync(localArtifactPath)) {
    return {
      schemaVersion: 1,
      status: 'unconfigured',
      sourceArtifact: 'nakama-protocol/shared/robinhood/protocol_contract.json',
      sourceArtifactSha256: null,
      sourceCommit: null,
      deploymentCodeCommitment: null,
      generatedBy: 'scripts/sync-robinhood-artifacts.mjs',
      contracts: {},
      deployments,
    };
  }

  const protocolArtifact = await readJson(
    localArtifactPath,
    'Robinhood protocol artifact',
  );
  const artifact = requireObject(protocolArtifact.value, 'protocol artifact');
  const artifactContracts = requireObject(
    artifact.contracts,
    'protocol artifact contracts',
  );
  const deploymentPlan = requireObject(
    artifact.deploymentPlan,
    'protocol artifact deploymentPlan',
  );
  if (
    typeof deploymentPlan.deploymentCodeCommitment !== 'string' ||
    !/^0x[0-9a-f]{64}$/i.test(deploymentPlan.deploymentCodeCommitment)
  ) {
    throw new Error(
      'protocol artifact deploymentCodeCommitment must be bytes32.',
    );
  }
  if (
    typeof artifact.sourceCommit !== 'string' ||
    !/^[0-9a-f]{40}$/.test(artifact.sourceCommit) ||
    /^0{40}$/.test(artifact.sourceCommit)
  ) {
    throw new Error(
      'protocol artifact sourceCommit must be a nonzero full lowercase Git SHA.',
    );
  }

  const contracts = {};
  for (const [role, contractName] of CONTRACTS) {
    const companion = await readJson(
      resolve(LOCAL_ROOT, `${contractName}.abi.json`),
      `${contractName} ABI`,
    );
    assertAbi(companion.value, contractName);
    const embedded = requireObject(
      artifactContracts[contractName],
      `${contractName} protocol artifact`,
    );
    if (JSON.stringify(embedded.abi) !== JSON.stringify(companion.value)) {
      throw new Error(
        `${contractName} standalone ABI does not match the protocol artifact.`,
      );
    }
    const abiSha256 = sha256(companion.raw);
    if (embedded.abiSha256 !== abiSha256) {
      throw new Error(`${contractName} ABI SHA-256 does not match its bytes.`);
    }
    contracts[role] = {
      role,
      contractName,
      sourceAbi: `contracts/robinhood/${contractName}.abi.json`,
      abiSha256,
      abi: companion.value,
    };
  }

  return {
    schemaVersion: 1,
    status: 'ready',
    sourceArtifact: 'nakama-protocol/shared/robinhood/protocol_contract.json',
    sourceArtifactSha256: sha256(protocolArtifact.raw),
    sourceCommit: artifact.sourceCommit,
    deploymentCodeCommitment: deploymentPlan.deploymentCodeCommitment,
    generatedBy: 'scripts/sync-robinhood-artifacts.mjs',
    contracts,
    deployments,
  };
}

async function render() {
  const bundle = await buildBundle();
  return await format(
    `// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.\n` +
      `// Source: canonical Robinhood protocol artifact, ABIs, and deployment manifests.\n\n` +
      `export const ROBINHOOD_PROTOCOL_ARTIFACT_BUNDLE_RAW = ${JSON.stringify(
        bundle,
        null,
        2,
      )} as const;\n`,
    { parser: 'typescript', singleQuote: true, trailingComma: 'all' },
  );
}

async function main() {
  const sourceRoot = resolve(
    parseValueFlag('artifact-root') ?? DEFAULT_PROTOCOL_ROOT,
  );
  if (parseFlag('import-artifact')) await importArtifacts(sourceRoot);
  const output = await render();

  if (parseFlag('check')) {
    if (!existsSync(OUTPUT) || (await readFile(OUTPUT, 'utf8')) !== output) {
      throw new Error(
        'Generated Robinhood SDK artifacts are stale. Run npm run sync:robinhood-artifacts.',
      );
    }
    console.log('Robinhood generated artifact check passed.');
    return;
  }

  await mkdir(dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, output, 'utf8');
  console.log(`Wrote ${OUTPUT}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
