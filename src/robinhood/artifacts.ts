import {
  isAddress,
  isHex,
  keccak256,
  zeroAddress,
  type Abi,
  type Address,
  type Hex,
} from 'viem';

import {
  ROBINHOOD_USDG_MAINNET_ADDRESS,
  ROBINHOOD_USDG_NAME,
  ROBINHOOD_USDG_SYMBOL,
  ROBINHOOD_USDG_DECIMALS,
  verifyRobinhoodUsdg,
  type RobinhoodSettlementAsset,
  type VerifiedRobinhoodUsdg,
} from './assets.js';
import {
  getRobinhoodCaip2,
  getRobinhoodChainId,
  normalizeRobinhoodAddress,
  type RobinhoodNetwork,
  type RobinhoodPublicClient,
} from './chains.js';
import {
  NakamaRobinhoodArtifactError,
  NakamaRobinhoodWrongChainError,
} from './errors.js';
import { sealVerifiedRobinhoodRuntime } from './runtime-integrity.js';
import { getGeneratedRobinhoodArtifactSource } from './generated-artifact-store.js';

export const ROBINHOOD_CONTRACT_IDENTITIES = Object.freeze({
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
} as const);

export type RobinhoodContractRole = keyof typeof ROBINHOOD_CONTRACT_IDENTITIES;
export type RobinhoodContractName =
  (typeof ROBINHOOD_CONTRACT_IDENTITIES)[RobinhoodContractRole];

export const ROBINHOOD_CONTRACT_ROLES = Object.freeze(
  Object.keys(ROBINHOOD_CONTRACT_IDENTITIES) as RobinhoodContractRole[],
);

export interface RobinhoodContractDeployment {
  contractName: RobinhoodContractName;
  address: Address;
  abiSha256: string;
  runtimeBytecodeHash: Hex;
  verificationUrl: string;
}

export interface RobinhoodDeploymentManifest {
  schemaVersion: 1;
  status: 'unconfigured' | 'deployed';
  network: RobinhoodNetwork;
  chainId: 4663 | 46630;
  caip2: 'eip155:4663' | 'eip155:46630';
  protocolRelease: string | null;
  sourceCommit: string | null;
  artifactBundleSha256: string | null;
  deploymentTransaction: Hex | null;
  deploymentBlock: number | null;
  deploymentBlockHash: Hex | null;
  contracts: Partial<
    Record<RobinhoodContractRole, RobinhoodContractDeployment>
  >;
  settlementAsset: RobinhoodSettlementAsset;
  verified: boolean;
  auditStatus: 'unaudited' | 'audited';
  auditReportSha256: string | null;
  releaseApprovalSha256: string | null;
}

export interface RobinhoodContractArtifact {
  role: RobinhoodContractRole;
  contractName: RobinhoodContractName;
  sourceAbi: string;
  abiSha256: string;
  abi: Abi;
}

export interface RobinhoodProtocolArtifactBundle {
  schemaVersion: 2;
  status: 'unconfigured' | 'ready';
  sourceArtifact: 'nakama-protocol/shared/robinhood/protocol_contract.json';
  sourceArtifactSha256: string | null;
  sourceCommit: string | null;
  protocolSuiteMajor: 2 | null;
  economicEventSchemaVersion: 2 | null;
  deploymentCodeCommitment: Hex | null;
  generatedBy: 'scripts/sync-robinhood-artifacts.mjs';
  contracts: Partial<Record<RobinhoodContractRole, RobinhoodContractArtifact>>;
  deployments: Record<RobinhoodNetwork, RobinhoodDeploymentManifest>;
}

export interface AssertRobinhoodDeploymentReadyOptions {
  requireAudit?: boolean;
}

export interface VerifiedRobinhoodDeploymentRuntime {
  network: RobinhoodNetwork;
  chainId: number;
  chainHead: bigint;
  safeBlock: bigint;
  finalizedBlock: bigint;
  checkedAtBlock: bigint;
  checkedAtBlockHash: Hex;
  programId: Hex;
  suiteId: Hex;
  settlementAsset: VerifiedRobinhoodUsdg;
  contracts: Record<
    RobinhoodContractRole,
    RobinhoodContractDeployment & { actualRuntimeBytecodeHash: Hex }
  >;
}

const MANIFEST_FIELDS = [
  'schemaVersion',
  'status',
  'network',
  'chainId',
  'caip2',
  'protocolRelease',
  'sourceCommit',
  'artifactBundleSha256',
  'deploymentTransaction',
  'deploymentBlock',
  'deploymentBlockHash',
  'contracts',
  'settlementAsset',
  'verified',
  'auditStatus',
  'auditReportSha256',
  'releaseApprovalSha256',
] as const;

const CONTRACT_FIELDS = [
  'contractName',
  'address',
  'abiSha256',
  'runtimeBytecodeHash',
  'verificationUrl',
] as const;

const ASSET_FIELDS = [
  'network',
  'chainId',
  'caip2',
  'address',
  'name',
  'symbol',
  'decimals',
  'status',
] as const;

type RobinhoodRuntimeRead = (
  role: RobinhoodContractRole,
  functionName: string,
  args?: readonly unknown[],
) => Promise<unknown>;

export function loadRobinhoodDeploymentManifest(
  input: string | unknown,
  expectedNetwork?: RobinhoodNetwork,
): RobinhoodDeploymentManifest {
  let parsed = input;
  if (typeof input === 'string') {
    try {
      parsed = JSON.parse(input) as unknown;
    } catch (error) {
      throw new NakamaRobinhoodArtifactError(
        'Robinhood deployment manifest is not valid JSON.',
        { cause: error },
      );
    }
  }
  return validateRobinhoodDeploymentManifest(parsed, expectedNetwork);
}

export function validateRobinhoodDeploymentManifest(
  input: unknown,
  expectedNetwork?: RobinhoodNetwork,
): RobinhoodDeploymentManifest {
  const manifest = requireRecord(input, 'deployment manifest');
  requireExactFields(manifest, MANIFEST_FIELDS, 'deployment manifest');
  if (manifest.schemaVersion !== 1) {
    throw new NakamaRobinhoodArtifactError(
      'Robinhood deployment schemaVersion must be 1.',
    );
  }
  if (manifest.network !== 'mainnet' && manifest.network !== 'testnet') {
    throw new NakamaRobinhoodArtifactError(
      'Deployment network must be mainnet or testnet.',
    );
  }
  const network = manifest.network;
  if (expectedNetwork != null && network !== expectedNetwork) {
    throw new NakamaRobinhoodWrongChainError(
      `Expected Robinhood ${expectedNetwork} deployment manifest.`,
      { details: { actualNetwork: network, expectedNetwork } },
    );
  }
  if (
    manifest.chainId !== getRobinhoodChainId(network) ||
    manifest.caip2 !== getRobinhoodCaip2(network)
  ) {
    throw new NakamaRobinhoodWrongChainError(
      `Deployment chain identity does not match Robinhood ${network}.`,
      {
        details: {
          chainId: manifest.chainId,
          caip2: manifest.caip2,
          expectedChainId: getRobinhoodChainId(network),
          expectedCaip2: getRobinhoodCaip2(network),
        },
      },
    );
  }
  if (manifest.status !== 'unconfigured' && manifest.status !== 'deployed') {
    throw new NakamaRobinhoodArtifactError(
      'Deployment status must be unconfigured or deployed.',
    );
  }

  const contractsInput = requireRecord(manifest.contracts, 'contracts');
  for (const role of Object.keys(contractsInput)) {
    if (!ROBINHOOD_CONTRACT_ROLES.includes(role as RobinhoodContractRole)) {
      throw new NakamaRobinhoodArtifactError(
        `Unknown Robinhood contract role "${role}".`,
      );
    }
  }
  const contracts: Partial<
    Record<RobinhoodContractRole, RobinhoodContractDeployment>
  > = {};
  for (const role of ROBINHOOD_CONTRACT_ROLES) {
    const value = contractsInput[role];
    if (value == null) continue;
    contracts[role] = validateContractDeployment(value, role);
  }

  const settlementAsset = validateSettlementAsset(
    manifest.settlementAsset,
    network,
  );

  const normalizedAddresses = Object.values(contracts).map(({ address }) =>
    address.toLowerCase(),
  );
  if (new Set(normalizedAddresses).size !== normalizedAddresses.length) {
    throw new NakamaRobinhoodArtifactError(
      'Every Robinhood contract role must use a unique address.',
    );
  }

  if (manifest.status === 'unconfigured') {
    if (Object.keys(contracts).length !== 0) {
      throw new NakamaRobinhoodArtifactError(
        'Unconfigured deployment must not contain contract addresses.',
      );
    }
    for (const [field, value] of Object.entries({
      protocolRelease: manifest.protocolRelease,
      sourceCommit: manifest.sourceCommit,
      artifactBundleSha256: manifest.artifactBundleSha256,
      deploymentTransaction: manifest.deploymentTransaction,
      deploymentBlock: manifest.deploymentBlock,
      deploymentBlockHash: manifest.deploymentBlockHash,
      auditReportSha256: manifest.auditReportSha256,
      releaseApprovalSha256: manifest.releaseApprovalSha256,
    })) {
      if (value !== null) {
        throw new NakamaRobinhoodArtifactError(
          `Unconfigured deployment ${field} must be null.`,
        );
      }
    }
    if (manifest.verified !== false || manifest.auditStatus !== 'unaudited') {
      throw new NakamaRobinhoodArtifactError(
        'Unconfigured deployment must remain unverified and unaudited.',
      );
    }
  } else {
    for (const role of ROBINHOOD_CONTRACT_ROLES) {
      if (contracts[role] == null) {
        throw new NakamaRobinhoodArtifactError(
          `Deployed manifest is missing ${role}.`,
        );
      }
    }
    requireNonEmptyString(manifest.protocolRelease, 'protocolRelease');
    requireGitCommit(manifest.sourceCommit, 'sourceCommit');
    requireSha256(manifest.artifactBundleSha256, 'artifactBundleSha256');
    requireBytes32(manifest.deploymentTransaction, 'deploymentTransaction');
    requireBytes32(manifest.deploymentBlockHash, 'deploymentBlockHash');
    if (
      !Number.isSafeInteger(manifest.deploymentBlock) ||
      Number(manifest.deploymentBlock) < 1
    ) {
      throw new NakamaRobinhoodArtifactError(
        'Deployed manifest requires a positive deploymentBlock.',
      );
    }
    if (manifest.verified !== true) {
      throw new NakamaRobinhoodArtifactError(
        'Deployed manifest must be verified before SDK publication.',
      );
    }
    if (settlementAsset.status !== 'verified') {
      throw new NakamaRobinhoodArtifactError(
        'Every deployed network requires a verified settlement asset.',
      );
    }
    if (
      settlementAsset.address != null &&
      normalizedAddresses.includes(settlementAsset.address.toLowerCase())
    ) {
      throw new NakamaRobinhoodArtifactError(
        'Settlement asset address cannot duplicate a protocol contract role.',
      );
    }
  }

  if (
    manifest.auditStatus !== 'audited' &&
    manifest.auditStatus !== 'unaudited'
  ) {
    throw new NakamaRobinhoodArtifactError(
      'auditStatus must be audited or unaudited.',
    );
  }
  if (manifest.auditStatus === 'audited') {
    requireSha256(manifest.auditReportSha256, 'auditReportSha256');
  } else if (manifest.auditReportSha256 !== null) {
    throw new NakamaRobinhoodArtifactError(
      'Unaudited deployment auditReportSha256 must be null.',
    );
  }
  if (manifest.releaseApprovalSha256 != null) {
    requireSha256(manifest.releaseApprovalSha256, 'releaseApprovalSha256');
  }

  return {
    ...(manifest as unknown as RobinhoodDeploymentManifest),
    network,
    chainId: getRobinhoodChainId(network),
    caip2: getRobinhoodCaip2(network),
    contracts,
    settlementAsset,
  };
}

export function validateRobinhoodArtifactBundle(
  input: unknown,
): RobinhoodProtocolArtifactBundle {
  const bundle = requireRecord(input, 'artifact bundle');
  requireExactFields(
    bundle,
    [
      'schemaVersion',
      'status',
      'sourceArtifact',
      'sourceArtifactSha256',
      'sourceCommit',
      'protocolSuiteMajor',
      'economicEventSchemaVersion',
      'deploymentCodeCommitment',
      'generatedBy',
      'contracts',
      'deployments',
    ],
    'artifact bundle',
  );
  if (
    bundle.schemaVersion !== 2 ||
    (bundle.status !== 'unconfigured' && bundle.status !== 'ready') ||
    bundle.sourceArtifact !==
      'nakama-protocol/shared/robinhood/protocol_contract.json' ||
    bundle.generatedBy !== 'scripts/sync-robinhood-artifacts.mjs'
  ) {
    throw new NakamaRobinhoodArtifactError(
      'Robinhood artifact bundle identity is invalid.',
    );
  }
  const contractsInput = requireRecord(bundle.contracts, 'artifact contracts');
  const contracts: Partial<
    Record<RobinhoodContractRole, RobinhoodContractArtifact>
  > = {};
  for (const key of Object.keys(contractsInput)) {
    if (!ROBINHOOD_CONTRACT_ROLES.includes(key as RobinhoodContractRole)) {
      throw new NakamaRobinhoodArtifactError(
        `Unknown artifact contract role "${key}".`,
      );
    }
  }
  for (const role of ROBINHOOD_CONTRACT_ROLES) {
    const artifactInput = contractsInput[role];
    if (artifactInput == null) continue;
    const artifact = requireRecord(artifactInput, `${role} artifact`);
    requireExactFields(
      artifact,
      ['role', 'contractName', 'sourceAbi', 'abiSha256', 'abi'],
      `${role} artifact`,
    );
    if (
      artifact.role !== role ||
      artifact.contractName !== ROBINHOOD_CONTRACT_IDENTITIES[role]
    ) {
      throw new NakamaRobinhoodArtifactError(
        `${role} artifact identity does not match the canonical contract.`,
      );
    }
    requireSha256(artifact.abiSha256, `${role}.abiSha256`);
    requireNonEmptyString(artifact.sourceAbi, `${role}.sourceAbi`);
    if (!Array.isArray(artifact.abi)) {
      throw new NakamaRobinhoodArtifactError(`${role}.abi must be an array.`);
    }
    contracts[role] = artifact as unknown as RobinhoodContractArtifact;
  }
  const deploymentsInput = requireRecord(bundle.deployments, 'deployments');
  requireExactFields(
    deploymentsInput,
    ['mainnet', 'testnet'],
    'artifact deployments',
  );
  const deployments = {
    mainnet: validateRobinhoodDeploymentManifest(
      deploymentsInput.mainnet,
      'mainnet',
    ),
    testnet: validateRobinhoodDeploymentManifest(
      deploymentsInput.testnet,
      'testnet',
    ),
  };

  if (bundle.status === 'unconfigured') {
    if (
      Object.keys(contracts).length !== 0 ||
      bundle.sourceArtifactSha256 !== null ||
      bundle.sourceCommit !== null ||
      bundle.protocolSuiteMajor !== null ||
      bundle.economicEventSchemaVersion !== null ||
      bundle.deploymentCodeCommitment !== null
    ) {
      throw new NakamaRobinhoodArtifactError(
        'Unconfigured artifact bundle must not claim protocol artifacts.',
      );
    }
  } else {
    if (
      bundle.protocolSuiteMajor !== 2 ||
      bundle.economicEventSchemaVersion !== 2
    ) {
      throw new NakamaRobinhoodArtifactError(
        'Ready Robinhood artifacts require protocol suite major 2 and economic event schema 2.',
      );
    }
    requireSha256(bundle.sourceArtifactSha256, 'sourceArtifactSha256');
    requireNonZeroBytes32(
      bundle.deploymentCodeCommitment,
      'deploymentCodeCommitment',
    );
    requireGitCommit(bundle.sourceCommit, 'sourceCommit');
    for (const role of ROBINHOOD_CONTRACT_ROLES) {
      if (contracts[role] == null) {
        throw new NakamaRobinhoodArtifactError(
          `Ready artifact bundle is missing ${role}.`,
        );
      }
    }
  }

  return {
    ...(bundle as unknown as RobinhoodProtocolArtifactBundle),
    contracts,
    deployments,
  };
}

let generatedBundleCache:
  | { revision: number; bundle: RobinhoodProtocolArtifactBundle }
  | undefined;

export function getGeneratedRobinhoodArtifactBundle(): RobinhoodProtocolArtifactBundle {
  const generated = getGeneratedRobinhoodArtifactSource();
  if (generatedBundleCache?.revision === generated.revision) {
    return generatedBundleCache.bundle;
  }
  const cloned = JSON.parse(JSON.stringify(generated.source)) as unknown;
  const bundle = deepFreeze(validateRobinhoodArtifactBundle(cloned));
  generatedBundleCache = { revision: generated.revision, bundle };
  return bundle;
}

function deepFreeze<T>(value: T): T {
  if (value != null && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const nested of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nested);
    }
    Object.freeze(value);
  }
  return value;
}

/** Ensures ABI-dependent operations use the exact generated release bundle. */
export function assertGeneratedRobinhoodArtifactBundle(
  bundle: RobinhoodProtocolArtifactBundle,
): void {
  const canonical = getGeneratedRobinhoodArtifactBundle();
  if (
    canonical.status !== 'ready' ||
    bundle.status !== 'ready' ||
    bundle.sourceArtifactSha256 !== canonical.sourceArtifactSha256 ||
    bundle.sourceCommit !== canonical.sourceCommit ||
    bundle.protocolSuiteMajor !== canonical.protocolSuiteMajor ||
    bundle.economicEventSchemaVersion !==
      canonical.economicEventSchemaVersion ||
    bundle.deploymentCodeCommitment !== canonical.deploymentCodeCommitment
  ) {
    throw new NakamaRobinhoodArtifactError(
      'ABI-dependent operations require the generated canonical artifact bundle.',
    );
  }
  for (const role of ROBINHOOD_CONTRACT_ROLES) {
    const actual = bundle.contracts[role];
    const expected = canonical.contracts[role];
    if (
      actual == null ||
      expected == null ||
      actual.abiSha256 !== expected.abiSha256 ||
      JSON.stringify(actual.abi) !== JSON.stringify(expected.abi)
    ) {
      throw new NakamaRobinhoodArtifactError(
        `${role} ABI does not match the generated canonical bundle.`,
      );
    }
  }
  for (const network of ['mainnet', 'testnet'] as const) {
    if (
      JSON.stringify(bundle.deployments[network]) !==
      JSON.stringify(canonical.deployments[network])
    ) {
      throw new NakamaRobinhoodArtifactError(
        `${network} deployment manifest does not match the generated canonical bundle.`,
      );
    }
  }
}

export function assertRobinhoodDeploymentReady(
  manifest: RobinhoodDeploymentManifest,
  bundle: RobinhoodProtocolArtifactBundle,
  options: AssertRobinhoodDeploymentReadyOptions = {},
): asserts manifest is RobinhoodDeploymentManifest & { status: 'deployed' } {
  const validatedManifest = validateRobinhoodDeploymentManifest(
    manifest,
    manifest.network,
  );
  if (manifest.status !== 'deployed' || bundle.status !== 'ready') {
    throw new NakamaRobinhoodArtifactError(
      'Robinhood protocol artifacts or deployment are unconfigured; contract operations are disabled.',
      {
        details: {
          deploymentStatus: manifest.status,
          artifactStatus: bundle.status,
          network: manifest.network,
        },
      },
    );
  }
  assertGeneratedRobinhoodArtifactBundle(bundle);
  if (
    JSON.stringify(validatedManifest) !==
    JSON.stringify(bundle.deployments[validatedManifest.network])
  ) {
    throw new NakamaRobinhoodArtifactError(
      'Contract operations require the exact generated deployment manifest.',
      { details: { network: validatedManifest.network } },
    );
  }
  if (manifest.artifactBundleSha256 !== bundle.sourceArtifactSha256) {
    throw new NakamaRobinhoodArtifactError(
      'Deployment artifact checksum does not match the generated SDK bundle.',
      {
        details: {
          deploymentSha256: manifest.artifactBundleSha256,
          bundleSha256: bundle.sourceArtifactSha256,
        },
      },
    );
  }
  for (const role of ROBINHOOD_CONTRACT_ROLES) {
    const deployed = manifest.contracts[role];
    const artifact = bundle.contracts[role];
    if (deployed == null || artifact == null) {
      throw new NakamaRobinhoodArtifactError(
        `Ready deployment is missing ${role} contract evidence.`,
      );
    }
    if (deployed.abiSha256 !== artifact.abiSha256) {
      throw new NakamaRobinhoodArtifactError(
        `${role} ABI checksum does not match the deployment manifest.`,
      );
    }
  }
  if (options.requireAudit ?? manifest.network === 'mainnet') {
    if (
      manifest.auditStatus !== 'audited' ||
      manifest.auditReportSha256 == null ||
      manifest.releaseApprovalSha256 == null
    ) {
      throw new NakamaRobinhoodArtifactError(
        'Audited deployment and release approval evidence are required.',
        { details: { network: manifest.network } },
      );
    }
  }
}

export function getRobinhoodContractArtifact(
  bundle: RobinhoodProtocolArtifactBundle,
  role: RobinhoodContractRole,
): RobinhoodContractArtifact {
  const artifact = bundle.contracts[role];
  if (artifact == null) {
    throw new NakamaRobinhoodArtifactError(
      `${role} ABI is not present in the generated artifact bundle.`,
    );
  }
  return artifact;
}

export function getRobinhoodContractDeployment(
  manifest: RobinhoodDeploymentManifest,
  role: RobinhoodContractRole,
): RobinhoodContractDeployment {
  const deployed = manifest.contracts[role];
  if (deployed == null) {
    throw new NakamaRobinhoodArtifactError(
      `${role} address is not present in the ${manifest.network} deployment manifest.`,
    );
  }
  return deployed;
}

export async function verifyRobinhoodDeploymentRuntime(params: {
  client: RobinhoodPublicClient;
  manifest: RobinhoodDeploymentManifest;
  bundle: RobinhoodProtocolArtifactBundle;
  requireAudit?: boolean;
}): Promise<VerifiedRobinhoodDeploymentRuntime> {
  assertRobinhoodDeploymentReady(params.manifest, params.bundle, {
    requireAudit: params.requireAudit,
  });
  const actualChainId = await params.client.getChainId();
  if (actualChainId !== params.manifest.chainId) {
    throw new NakamaRobinhoodWrongChainError(
      'RPC chain does not match the deployment manifest.',
      {
        details: {
          actualChainId,
          expectedChainId: params.manifest.chainId,
        },
      },
    );
  }
  const chainHead = await params.client.getBlockNumber();
  const [safeBlockResult, finalizedBlockResult] = await Promise.all([
    params.client.getBlock({ blockTag: 'safe' }),
    params.client.getBlock({ blockTag: 'finalized' }),
  ]);
  if (
    safeBlockResult.number == null ||
    finalizedBlockResult.number == null ||
    finalizedBlockResult.hash == null ||
    finalizedBlockResult.number > safeBlockResult.number ||
    safeBlockResult.number > chainHead
  ) {
    throw new NakamaRobinhoodArtifactError(
      'RPC did not provide a conservative Robinhood safe/finalized ordering.',
    );
  }
  const safeBlock = safeBlockResult.number;
  const finalizedBlock = finalizedBlockResult.number;
  const checkedAtBlock = finalizedBlock;
  const checkedAtBlockHash = finalizedBlockResult.hash;
  if (
    params.manifest.deploymentBlock == null ||
    params.manifest.deploymentBlockHash == null ||
    BigInt(params.manifest.deploymentBlock) > finalizedBlock
  ) {
    throw new NakamaRobinhoodArtifactError(
      'Deployment block is not finalized on the selected RPC.',
    );
  }
  const deploymentBlock = await params.client.getBlock({
    blockNumber: BigInt(params.manifest.deploymentBlock),
  });
  if (
    deploymentBlock.hash == null ||
    deploymentBlock.hash.toLowerCase() !==
      params.manifest.deploymentBlockHash.toLowerCase()
  ) {
    throw new NakamaRobinhoodArtifactError(
      'Deployment block hash is not canonical on the selected RPC.',
    );
  }
  const contracts = {} as VerifiedRobinhoodDeploymentRuntime['contracts'];
  for (const role of ROBINHOOD_CONTRACT_ROLES) {
    const deployed = getRobinhoodContractDeployment(params.manifest, role);
    const bytecode = await params.client.getBytecode({
      address: deployed.address,
      blockNumber: checkedAtBlock,
    });
    if (bytecode == null || bytecode === '0x') {
      throw new NakamaRobinhoodArtifactError(
        `No runtime bytecode exists for ${role} at the configured address.`,
        { details: { role, address: deployed.address, checkedAtBlock } },
      );
    }
    const actualRuntimeBytecodeHash = keccak256(bytecode);
    if (
      actualRuntimeBytecodeHash.toLowerCase() !==
      deployed.runtimeBytecodeHash.toLowerCase()
    ) {
      throw new NakamaRobinhoodArtifactError(
        `${role} runtime bytecode does not match the release manifest.`,
        {
          details: {
            role,
            address: deployed.address,
            expectedRuntimeBytecodeHash: deployed.runtimeBytecodeHash,
            actualRuntimeBytecodeHash,
          },
        },
      );
    }
    contracts[role] = { ...deployed, actualRuntimeBytecodeHash };
  }
  const settlementAsset = await verifyRobinhoodUsdg({
    client: params.client,
    network: params.manifest.network,
    configuredAsset: params.manifest.settlementAsset,
    blockNumber: checkedAtBlock,
  });

  const read = async (
    role: RobinhoodContractRole,
    functionName: string,
    args: readonly unknown[] = [],
  ): Promise<unknown> => {
    const deployed = getRobinhoodContractDeployment(params.manifest, role);
    const artifact = getRobinhoodContractArtifact(params.bundle, role);
    return await params.client.readContract({
      address: deployed.address,
      abi: artifact.abi,
      functionName,
      args,
      blockNumber: checkedAtBlock,
    } as never);
  };
  const address = (role: RobinhoodContractRole) =>
    getRobinhoodContractDeployment(params.manifest, role).address;
  const programId = requireNonZeroBytes32(
    await read('program', 'programId'),
    'program.programId',
  );
  const suiteId = requireNonZeroBytes32(
    await read('program', 'suiteId'),
    'program.suiteId',
  );

  await Promise.all([
    assertRuntimeAddress(
      read,
      'factory',
      'assetRegistry',
      address('assetRegistry'),
    ),
    assertRuntimeAddress(
      read,
      'factory',
      'templateRegistry',
      address('templateRegistry'),
    ),
    assertRuntimeAddress(
      read,
      'factory',
      'poolRegistry',
      address('poolRegistry'),
    ),
    assertRuntimeAddress(
      read,
      'factory',
      'expectedFundingAsset',
      settlementAsset.address,
    ),
    assertRuntimeAddress(read, 'poolRegistry', 'factory', address('factory')),
    assertRuntimeAddress(
      read,
      'program',
      'deploymentFactory',
      address('factory'),
    ),
    assertRuntimeAddress(
      read,
      'program',
      'fundingAsset',
      settlementAsset.address,
    ),
    assertRuntimeAddress(read, 'program', 'vault', address('vault')),
    assertRuntimeAddress(
      read,
      'program',
      'membershipRegistry',
      address('membershipRegistry'),
    ),
    assertRuntimeAddress(
      read,
      'program',
      'claimManager',
      address('requestManager'),
    ),
    assertRuntimeAddress(
      read,
      'program',
      'decisionModule',
      address('decisionModule'),
    ),
    assertRuntimeAddress(
      read,
      'program',
      'settlementModule',
      address('settlementModule'),
    ),
    assertRuntimeAddress(
      read,
      'program',
      'agentAuthorizationRegistry',
      address('agentAuthorizationRegistry'),
    ),
    assertRuntimeAddress(
      read,
      'program',
      'safetyGuardian',
      address('safetyGuardian'),
    ),
    assertModuleGraph(read, 'vault', programId, address('program'), {
      deploymentFactory: address('factory'),
      asset: settlementAsset.address,
      membershipRegistry: address('membershipRegistry'),
      claimManager: address('requestManager'),
      settlementModule: address('settlementModule'),
    }),
    assertModuleGraph(
      read,
      'membershipRegistry',
      programId,
      address('program'),
      {
        deploymentFactory: address('factory'),
        vault: address('vault'),
        claimManager: address('requestManager'),
      },
    ),
    assertModuleGraph(read, 'decisionModule', programId, address('program'), {
      deploymentFactory: address('factory'),
      claimManager: address('requestManager'),
    }),
    assertModuleGraph(read, 'requestManager', programId, address('program'), {
      deploymentFactory: address('factory'),
      vault: address('vault'),
      membershipRegistry: address('membershipRegistry'),
      decisionModule: address('decisionModule'),
      settlementModule: address('settlementModule'),
    }),
    assertModuleGraph(read, 'settlementModule', programId, address('program'), {
      vault: address('vault'),
      claimManager: address('requestManager'),
    }),
    assertModuleGraph(
      read,
      'agentAuthorizationRegistry',
      programId,
      address('program'),
      {
        deploymentFactory: address('factory'),
        vault: address('vault'),
        decisionModule: address('decisionModule'),
        settlementModule: address('settlementModule'),
        safetyGuardian: address('safetyGuardian'),
      },
    ),
    assertModuleGraph(read, 'safetyGuardian', programId, address('program'), {
      agentAuthorizationRegistry: address('agentAuthorizationRegistry'),
    }),
    read('assetRegistry', 'requireActiveAsset', [settlementAsset.address]),
  ]);

  const [
    registeredSuiteId,
    registeredDeployment,
    deploymentCodeCommitment,
    suiteRecord,
  ] = await Promise.all([
    read('poolRegistry', 'suiteOf', [programId]),
    read('poolRegistry', 'getDeployment', [programId]),
    read('factory', 'deploymentCodeCommitment'),
    read('templateRegistry', 'requireActiveSuite', [
      suiteId,
      address('factory'),
    ]),
  ]);
  const actualDeploymentCodeCommitment = requireNonZeroBytes32(
    deploymentCodeCommitment,
    'factory.deploymentCodeCommitment',
  );
  if (
    params.bundle.deploymentCodeCommitment == null ||
    actualDeploymentCodeCommitment.toLowerCase() !==
      params.bundle.deploymentCodeCommitment.toLowerCase()
  ) {
    throw new NakamaRobinhoodArtifactError(
      'Factory deployment code commitment does not match the canonical artifact.',
    );
  }
  assertActiveSuiteRecord(
    suiteRecord,
    address('factory'),
    actualDeploymentCodeCommitment,
    params.bundle.protocolSuiteMajor,
  );
  if (
    requireNonZeroBytes32(
      registeredSuiteId,
      'poolRegistry.suiteOf',
    ).toLowerCase() !== suiteId.toLowerCase()
  ) {
    throw new NakamaRobinhoodArtifactError(
      'Pool registry suite does not match the deployed program.',
    );
  }
  assertRegisteredDeployment(registeredDeployment, programId, {
    program: address('program'),
    vault: address('vault'),
    membershipRegistry: address('membershipRegistry'),
    decisionModule: address('decisionModule'),
    claimManager: address('requestManager'),
    settlementModule: address('settlementModule'),
    agentAuthorizationRegistry: address('agentAuthorizationRegistry'),
    safetyGuardian: address('safetyGuardian'),
  });
  return sealVerifiedRobinhoodRuntime({
    network: params.manifest.network,
    chainId: actualChainId,
    chainHead,
    safeBlock,
    finalizedBlock,
    checkedAtBlock,
    checkedAtBlockHash,
    programId,
    suiteId,
    settlementAsset,
    contracts,
  });
}

function validateContractDeployment(
  input: unknown,
  role: RobinhoodContractRole,
): RobinhoodContractDeployment {
  const deployment = requireRecord(input, `${role} deployment`);
  requireExactFields(deployment, CONTRACT_FIELDS, `${role} deployment`);
  if (deployment.contractName !== ROBINHOOD_CONTRACT_IDENTITIES[role]) {
    throw new NakamaRobinhoodArtifactError(
      `${role} contractName must be ${ROBINHOOD_CONTRACT_IDENTITIES[role]}.`,
    );
  }
  if (
    typeof deployment.address !== 'string' ||
    !isAddress(deployment.address)
  ) {
    throw new NakamaRobinhoodArtifactError(
      `${role}.address must be an EVM address.`,
    );
  }
  const address = normalizeRobinhoodAddress(deployment.address);
  if (address === zeroAddress) {
    throw new NakamaRobinhoodArtifactError(
      `${role}.address cannot be the zero address.`,
    );
  }
  const abiSha256 = requireSha256(deployment.abiSha256, `${role}.abiSha256`);
  const runtimeBytecodeHash = requireBytes32(
    deployment.runtimeBytecodeHash,
    `${role}.runtimeBytecodeHash`,
  );
  if (runtimeBytecodeHash.toLowerCase() === `0x${'00'.repeat(32)}`) {
    throw new NakamaRobinhoodArtifactError(
      `${role}.runtimeBytecodeHash cannot be zero.`,
    );
  }
  if (
    typeof deployment.verificationUrl !== 'string' ||
    !deployment.verificationUrl.startsWith('https://')
  ) {
    throw new NakamaRobinhoodArtifactError(
      `${role}.verificationUrl must use HTTPS.`,
    );
  }
  return {
    contractName: ROBINHOOD_CONTRACT_IDENTITIES[role],
    address,
    abiSha256,
    runtimeBytecodeHash,
    verificationUrl: deployment.verificationUrl,
  };
}

function validateSettlementAsset(
  input: unknown,
  network: RobinhoodNetwork,
): RobinhoodSettlementAsset {
  const asset = requireRecord(input, 'settlementAsset');
  requireExactFields(asset, ASSET_FIELDS, 'settlementAsset');
  if (
    asset.network !== network ||
    asset.chainId !== getRobinhoodChainId(network) ||
    asset.caip2 !== getRobinhoodCaip2(network) ||
    asset.name !== ROBINHOOD_USDG_NAME ||
    asset.symbol !== ROBINHOOD_USDG_SYMBOL ||
    asset.decimals !== ROBINHOOD_USDG_DECIMALS ||
    (asset.status !== 'verified' && asset.status !== 'unconfigured')
  ) {
    throw new NakamaRobinhoodArtifactError(
      'Settlement asset must be chain-bound Global Dollar (USDG) with six decimals.',
      { details: { network } },
    );
  }
  if (asset.status === 'unconfigured') {
    if (asset.address !== null) {
      throw new NakamaRobinhoodArtifactError(
        'Unconfigured settlement asset address must be null.',
      );
    }
  } else if (typeof asset.address !== 'string' || !isAddress(asset.address)) {
    throw new NakamaRobinhoodArtifactError(
      'Verified settlement asset requires an EVM address.',
    );
  }
  if (
    typeof asset.address === 'string' &&
    normalizeRobinhoodAddress(asset.address) === zeroAddress
  ) {
    throw new NakamaRobinhoodArtifactError(
      'Verified settlement asset cannot use the zero address.',
    );
  }
  if (
    network === 'mainnet' &&
    typeof asset.address === 'string' &&
    asset.address.toLowerCase() !== ROBINHOOD_USDG_MAINNET_ADDRESS.toLowerCase()
  ) {
    throw new NakamaRobinhoodArtifactError(
      'Mainnet USDG address does not match the canonical Robinhood asset.',
      { details: { address: asset.address } },
    );
  }
  return {
    network,
    chainId: getRobinhoodChainId(network),
    caip2: getRobinhoodCaip2(network),
    address:
      typeof asset.address === 'string'
        ? normalizeRobinhoodAddress(asset.address)
        : null,
    name: ROBINHOOD_USDG_NAME,
    symbol: ROBINHOOD_USDG_SYMBOL,
    decimals: ROBINHOOD_USDG_DECIMALS,
    status: asset.status,
  };
}

function requireRecord(value: unknown, label: string): Record<string, unknown> {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    throw new NakamaRobinhoodArtifactError(`${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function requireExactFields(
  value: Record<string, unknown>,
  fields: readonly string[],
  label: string,
): void {
  const expected = new Set(fields);
  const actual = Object.keys(value);
  const missing = fields.filter((field) => !(field in value));
  const extra = actual.filter((field) => !expected.has(field));
  if (missing.length > 0 || extra.length > 0) {
    throw new NakamaRobinhoodArtifactError(
      `${label} fields do not match schema.`,
      { details: { missing, extra } },
    );
  }
}

function requireNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new NakamaRobinhoodArtifactError(
      `${field} must be a non-empty string.`,
    );
  }
  return value;
}

function requireSha256(value: unknown, field: string): string {
  if (typeof value !== 'string' || !/^[0-9a-f]{64}$/.test(value)) {
    throw new NakamaRobinhoodArtifactError(
      `${field} must be a lowercase SHA-256 digest without 0x.`,
    );
  }
  return value;
}

function requireGitCommit(value: unknown, field: string): string {
  if (
    typeof value !== 'string' ||
    !/^[0-9a-f]{40}$/.test(value) ||
    /^0{40}$/.test(value)
  ) {
    throw new NakamaRobinhoodArtifactError(
      `${field} must be a nonzero full lowercase Git commit SHA.`,
    );
  }
  return value;
}

function requireBytes32(value: unknown, field: string): Hex {
  if (
    typeof value !== 'string' ||
    !isHex(value) ||
    !/^0x[0-9a-f]{64}$/i.test(value)
  ) {
    throw new NakamaRobinhoodArtifactError(
      `${field} must be a 32-byte 0x-prefixed hex value.`,
    );
  }
  return value;
}

function requireNonZeroBytes32(value: unknown, field: string): Hex {
  const bytes = requireBytes32(value, field);
  if (bytes.toLowerCase() === `0x${'00'.repeat(32)}`) {
    throw new NakamaRobinhoodArtifactError(`${field} cannot be zero.`);
  }
  return bytes;
}

function requireRuntimeAddress(value: unknown, field: string): Address {
  if (typeof value !== 'string' || !isAddress(value)) {
    throw new NakamaRobinhoodArtifactError(
      `${field} did not return an EVM address.`,
    );
  }
  const address = normalizeRobinhoodAddress(value);
  if (address === zeroAddress) {
    throw new NakamaRobinhoodArtifactError(`${field} returned zero address.`);
  }
  return address;
}

async function assertRuntimeAddress(
  read: RobinhoodRuntimeRead,
  role: RobinhoodContractRole,
  functionName: string,
  expected: Address,
): Promise<void> {
  const actual = requireRuntimeAddress(
    await read(role, functionName),
    `${role}.${functionName}`,
  );
  if (actual.toLowerCase() !== expected.toLowerCase()) {
    throw new NakamaRobinhoodArtifactError(
      `${role}.${functionName} does not match the deployment graph.`,
      { details: { actual, expected } },
    );
  }
}

async function assertModuleGraph(
  read: RobinhoodRuntimeRead,
  role: RobinhoodContractRole,
  programId: Hex,
  program: Address,
  addressFields: Readonly<Record<string, Address>>,
): Promise<void> {
  const actualProgramId = requireNonZeroBytes32(
    await read(role, 'programId'),
    `${role}.programId`,
  );
  if (actualProgramId.toLowerCase() !== programId.toLowerCase()) {
    throw new NakamaRobinhoodArtifactError(
      `${role}.programId does not match the program graph.`,
    );
  }
  await assertRuntimeAddress(read, role, 'program', program);
  await Promise.all(
    Object.entries(addressFields).map(async ([functionName, expected]) => {
      await assertRuntimeAddress(read, role, functionName, expected);
    }),
  );
}

function assertRegisteredDeployment(
  input: unknown,
  programId: Hex,
  expected: Readonly<Record<string, Address>>,
): void {
  const names = [
    'programId',
    'program',
    'vault',
    'membershipRegistry',
    'decisionModule',
    'claimManager',
    'settlementModule',
    'agentAuthorizationRegistry',
    'safetyGuardian',
  ] as const;
  if (input == null || typeof input !== 'object') {
    throw new NakamaRobinhoodArtifactError(
      'Pool registry deployment tuple is invalid.',
    );
  }
  const deployment = input as Record<string, unknown> & readonly unknown[];
  const value = (name: (typeof names)[number], index: number) =>
    deployment[name] ?? deployment[index];
  const actualProgramId = requireNonZeroBytes32(
    value('programId', 0),
    'poolRegistry.getDeployment.programId',
  );
  if (actualProgramId.toLowerCase() !== programId.toLowerCase()) {
    throw new NakamaRobinhoodArtifactError(
      'Pool registry deployment programId does not match.',
    );
  }
  for (const [index, name] of names.slice(1).entries()) {
    const actual = requireRuntimeAddress(
      value(name, index + 1),
      `poolRegistry.getDeployment.${name}`,
    );
    if (actual.toLowerCase() !== expected[name]!.toLowerCase()) {
      throw new NakamaRobinhoodArtifactError(
        `Pool registry deployment ${name} does not match the manifest.`,
      );
    }
  }
}

function assertActiveSuiteRecord(
  input: unknown,
  factory: Address,
  deploymentCodeCommitment: Hex,
  expectedMajor: 2 | null,
): void {
  if (input == null || typeof input !== 'object') {
    throw new NakamaRobinhoodArtifactError(
      'Template registry active suite record is invalid.',
    );
  }
  const record = input as Record<string, unknown> & readonly unknown[];
  const value = (name: string, index: number) => record[name] ?? record[index];
  const actualFactory = requireRuntimeAddress(
    value('factory', 0),
    'templateRegistry.requireActiveSuite.factory',
  );
  const actualCommitment = requireNonZeroBytes32(
    value('deploymentCodeCommitment', 1),
    'templateRegistry.requireActiveSuite.deploymentCodeCommitment',
  );
  const major = value('major', 5);
  const status = value('status', 8);
  if (
    expectedMajor == null ||
    actualFactory.toLowerCase() !== factory.toLowerCase() ||
    actualCommitment.toLowerCase() !== deploymentCodeCommitment.toLowerCase() ||
    (major !== expectedMajor && major !== BigInt(expectedMajor)) ||
    status !== 1
  ) {
    throw new NakamaRobinhoodArtifactError(
      'Template registry suite is not the active canonical factory release.',
    );
  }
}
