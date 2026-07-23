import {
  getAddress,
  getContractAddress,
  hexToBytes,
  isAddress,
  isHex,
  keccak256,
  zeroAddress,
  type Abi,
  type Address,
  type Hex,
} from 'viem';

import {
  NakamaEthereumContractError,
  NakamaEthereumWrongChainError,
} from './errors.js';
import {
  ETHEREUM_MAINNET_CAIP2,
  ETHEREUM_MAINNET_CHAIN_ID,
  normalizeEthereumAddress,
  type EthereumPublicClient,
} from './ethereum.js';
import {
  DEFAULT_ETHEREUM_CONFIRMATIONS,
  assertEthereumCreationBytecodeHash,
  hashEthereumRuntimeBytecodeTemplate,
  verifyEthereumReceipt,
  type EthereumImmutableReference,
} from './ethereum_contract.js';
import {
  NAKAMA_COVERAGE_PROTOCOL_ABI,
  NAKAMA_COVERAGE_PROTOCOL_ARTIFACT_METADATA,
  NAKAMA_POLICY_REGISTRY_ABI,
  NAKAMA_POLICY_REGISTRY_ARTIFACT_METADATA,
  NAKAMA_PROTOCOL_FACTORY_ABI,
  NAKAMA_PROTOCOL_FACTORY_ARTIFACT_METADATA,
  NAKAMA_RESERVE_VAULT_ARTIFACT_METADATA,
} from './generated/ethereum_protocol.js';

export const SOURCIFY_V2_ETHEREUM_MAINNET_PREFIX =
  'https://sourcify.dev/server/v2/contract/1/' as const;

export type EthereumDeploymentStatus = 'unconfigured' | 'deployed';
export type EthereumAuditStatus = 'unaudited' | 'audited';
export type EthereumLiveContractRole =
  | 'factory'
  | 'policyRegistry'
  | 'protocol';
export type EthereumContractName =
  | 'NakamaProtocolFactory'
  | 'NakamaPolicyRegistry'
  | 'NakamaCoverageProtocol'
  | 'ReserveVault';

export interface EthereumSourceVerification {
  verificationProvider: 'sourcify-v2';
  verificationUrl: string;
  sourceVerifiedAt: string;
  sourcifyMatchId: string;
  creationMatch: 'exact_match';
  runtimeMatch: 'exact_match';
}

export interface EthereumLiveContractDeployment {
  contractName:
    | 'NakamaProtocolFactory'
    | 'NakamaPolicyRegistry'
    | 'NakamaCoverageProtocol';
  address: Address | null;
  deploymentKind: 'transaction-create' | 'factory-create';
  factoryNonce: 1 | 2 | null;
  creationBytecodeHash: Hex | null;
  creationBytecodeBytes: number | null;
  runtimeBytecodeHash: Hex | null;
  runtimeBytecodeTemplateHash: Hex | null;
  runtimeBytecodeBytes: number | null;
  immutableReferences: readonly EthereumImmutableReference[];
  abiArtifact:
    | 'contracts/ethereum/NakamaProtocolFactory.abi.json'
    | 'contracts/ethereum/NakamaPolicyRegistry.abi.json'
    | 'contracts/ethereum/NakamaCoverageProtocol.abi.json';
  abiSha256: string | null;
  verification: EthereumSourceVerification | null;
}

export interface EthereumReserveVaultTemplate {
  contractName: 'ReserveVault';
  deploymentKind: 'core-create2';
  saltDerivation: 'keccak256(abi.encode(domainId,assetToken))';
  creationBytecodeHash: Hex | null;
  creationBytecodeBytes: number | null;
  runtimeBytecodeTemplateHash: Hex | null;
  runtimeBytecodeBytes: number | null;
  immutableReferences: readonly EthereumImmutableReference[];
  abiArtifact: 'contracts/ethereum/ReserveVault.abi.json';
  abiSha256: string | null;
}

export interface EthereumDeploymentManifest {
  schemaVersion: 3;
  status: EthereumDeploymentStatus;
  chainId: typeof ETHEREUM_MAINNET_CHAIN_ID;
  caip2: typeof ETHEREUM_MAINNET_CAIP2;
  entryContract: 'NakamaProtocolFactory';
  deployer: Address | null;
  deploymentTransaction: Hex | null;
  deploymentBlock: number | null;
  deploymentBlockHash: Hex | null;
  confirmations: number | null;
  sourceCommit: string | null;
  protocolArtifactSha256: string | null;
  liveContracts: {
    factory: EthereumLiveContractDeployment & {
      contractName: 'NakamaProtocolFactory';
      deploymentKind: 'transaction-create';
      factoryNonce: null;
    };
    policyRegistry: EthereumLiveContractDeployment & {
      contractName: 'NakamaPolicyRegistry';
      deploymentKind: 'factory-create';
      factoryNonce: 1;
    };
    protocol: EthereumLiveContractDeployment & {
      contractName: 'NakamaCoverageProtocol';
      deploymentKind: 'factory-create';
      factoryNonce: 2;
    };
  };
  contractTemplates: {
    reserveVault: EthereumReserveVaultTemplate;
  };
  verified: boolean;
  auditStatus: EthereumAuditStatus;
  auditReportSha256: string | null;
  releaseApprovalSha256: string | null;
  verificationEvidenceSha256: string | null;
}

export interface ValidateEthereumDeploymentManifestOptions {
  requireDeployed?: boolean;
}

const LIVE_ROLES = [
  'factory',
  'policyRegistry',
  'protocol',
] as const satisfies readonly EthereumLiveContractRole[];

const LIVE_CONTRACT_IDENTITIES = {
  factory: {
    contractName: 'NakamaProtocolFactory',
    deploymentKind: 'transaction-create',
    factoryNonce: null,
    abiArtifact: 'contracts/ethereum/NakamaProtocolFactory.abi.json',
    abi: NAKAMA_PROTOCOL_FACTORY_ABI,
    metadata: NAKAMA_PROTOCOL_FACTORY_ARTIFACT_METADATA,
  },
  policyRegistry: {
    contractName: 'NakamaPolicyRegistry',
    deploymentKind: 'factory-create',
    factoryNonce: 1,
    abiArtifact: 'contracts/ethereum/NakamaPolicyRegistry.abi.json',
    abi: NAKAMA_POLICY_REGISTRY_ABI,
    metadata: NAKAMA_POLICY_REGISTRY_ARTIFACT_METADATA,
  },
  protocol: {
    contractName: 'NakamaCoverageProtocol',
    deploymentKind: 'factory-create',
    factoryNonce: 2,
    abiArtifact: 'contracts/ethereum/NakamaCoverageProtocol.abi.json',
    abi: NAKAMA_COVERAGE_PROTOCOL_ABI,
    metadata: NAKAMA_COVERAGE_PROTOCOL_ARTIFACT_METADATA,
  },
} as const;

const MANIFEST_FIELDS = [
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
] as const;

const LIVE_CONTRACT_FIELDS = [
  'contractName',
  'address',
  'deploymentKind',
  'factoryNonce',
  'creationBytecodeHash',
  'creationBytecodeBytes',
  'runtimeBytecodeHash',
  'runtimeBytecodeTemplateHash',
  'runtimeBytecodeBytes',
  'immutableReferences',
  'abiArtifact',
  'abiSha256',
  'verification',
] as const;

const TEMPLATE_FIELDS = [
  'contractName',
  'deploymentKind',
  'saltDerivation',
  'creationBytecodeHash',
  'creationBytecodeBytes',
  'runtimeBytecodeTemplateHash',
  'runtimeBytecodeBytes',
  'immutableReferences',
  'abiArtifact',
  'abiSha256',
] as const;

const VERIFICATION_FIELDS = [
  'verificationProvider',
  'verificationUrl',
  'sourceVerifiedAt',
  'sourcifyMatchId',
  'creationMatch',
  'runtimeMatch',
] as const;

export function validateEthereumDeploymentManifest(
  input: unknown,
  options: ValidateEthereumDeploymentManifestOptions = {},
): EthereumDeploymentManifest {
  const manifest = requireRecord(input, 'Ethereum deployment manifest');
  requireExactFields(manifest, MANIFEST_FIELDS, 'Ethereum deployment manifest');
  if (manifest.schemaVersion !== 3) {
    throw new NakamaEthereumContractError(
      'Ethereum deployment manifest schemaVersion must be 3.',
      { details: { schemaVersion: manifest.schemaVersion } },
    );
  }
  if (
    manifest.chainId !== ETHEREUM_MAINNET_CHAIN_ID ||
    manifest.caip2 !== ETHEREUM_MAINNET_CAIP2
  ) {
    throw new NakamaEthereumWrongChainError(
      `Deployment manifest must target ${ETHEREUM_MAINNET_CAIP2}.`,
      {
        details: { chainId: manifest.chainId, caip2: manifest.caip2 },
      },
    );
  }
  if (manifest.entryContract !== 'NakamaProtocolFactory') {
    throw new NakamaEthereumContractError(
      'Deployment entryContract must be NakamaProtocolFactory.',
    );
  }
  if (manifest.status !== 'unconfigured' && manifest.status !== 'deployed') {
    throw new NakamaEthereumContractError(
      'Deployment status must be unconfigured or deployed.',
    );
  }

  const liveContractsInput = requireRecord(
    manifest.liveContracts,
    'liveContracts',
  );
  requireExactFields(liveContractsInput, LIVE_ROLES, 'liveContracts');
  const contractTemplatesInput = requireRecord(
    manifest.contractTemplates,
    'contractTemplates',
  );
  requireExactFields(
    contractTemplatesInput,
    ['reserveVault'],
    'contractTemplates',
  );
  const liveContracts = Object.fromEntries(
    LIVE_ROLES.map((role) => [
      role,
      validateLiveContract(
        liveContractsInput[role],
        role,
        manifest.status as EthereumDeploymentStatus,
      ),
    ]),
  ) as unknown as EthereumDeploymentManifest['liveContracts'];
  const reserveVault = validateReserveVaultTemplate(
    contractTemplatesInput.reserveVault,
    manifest.status as EthereumDeploymentStatus,
  );

  if (manifest.status === 'unconfigured') {
    for (const [field, value] of Object.entries({
      deployer: manifest.deployer,
      deploymentTransaction: manifest.deploymentTransaction,
      deploymentBlock: manifest.deploymentBlock,
      deploymentBlockHash: manifest.deploymentBlockHash,
      confirmations: manifest.confirmations,
      sourceCommit: manifest.sourceCommit,
      protocolArtifactSha256: manifest.protocolArtifactSha256,
      auditReportSha256: manifest.auditReportSha256,
      releaseApprovalSha256: manifest.releaseApprovalSha256,
      verificationEvidenceSha256: manifest.verificationEvidenceSha256,
    })) {
      if (value !== null) {
        throw new NakamaEthereumContractError(
          `Unconfigured deployment ${field} must be null.`,
        );
      }
    }
    if (manifest.verified !== false || manifest.auditStatus !== 'unaudited') {
      throw new NakamaEthereumContractError(
        'An unconfigured deployment must remain unverified and unaudited.',
      );
    }
    if (options.requireDeployed) {
      throw new NakamaEthereumContractError(
        'Ethereum mainnet deployment is not configured; contract writes are disabled.',
        { details: { status: manifest.status } },
      );
    }
    return {
      ...(manifest as unknown as EthereumDeploymentManifest),
      liveContracts,
      contractTemplates: { reserveVault },
    };
  }

  const deployer = requireAddress(manifest.deployer, 'deployer');
  const deploymentTransaction = requireBytes32(
    manifest.deploymentTransaction,
    'deploymentTransaction',
  );
  const deploymentBlockHash = requireBytes32(
    manifest.deploymentBlockHash,
    'deploymentBlockHash',
  );
  if (
    !Number.isSafeInteger(manifest.deploymentBlock) ||
    Number(manifest.deploymentBlock) < 1
  ) {
    throw new NakamaEthereumContractError(
      'Deployed manifest requires a positive deploymentBlock.',
    );
  }
  if (
    !Number.isSafeInteger(manifest.confirmations) ||
    Number(manifest.confirmations) < DEFAULT_ETHEREUM_CONFIRMATIONS
  ) {
    throw new NakamaEthereumContractError(
      `Deployed manifest requires at least ${DEFAULT_ETHEREUM_CONFIRMATIONS} confirmations.`,
    );
  }
  if (
    typeof manifest.sourceCommit !== 'string' ||
    !/^[0-9a-f]{40}$/.test(manifest.sourceCommit)
  ) {
    throw new NakamaEthereumContractError(
      'Deployed manifest sourceCommit must be a full lowercase git commit.',
    );
  }
  const protocolArtifactSha256 = requireSha256(
    manifest.protocolArtifactSha256,
    'protocolArtifactSha256',
  );
  if (
    protocolArtifactSha256 !==
    NAKAMA_PROTOCOL_FACTORY_ARTIFACT_METADATA.sourceArtifactSha256
  ) {
    throw new NakamaEthereumContractError(
      'Deployment protocol artifact hash does not match the generated four-contract artifact.',
    );
  }
  if (manifest.verified !== true || manifest.auditStatus !== 'audited') {
    throw new NakamaEthereumContractError(
      'Mainnet deployment must be source-verified and independently audited.',
    );
  }

  return {
    ...(manifest as unknown as EthereumDeploymentManifest),
    status: 'deployed',
    deployer,
    deploymentTransaction,
    deploymentBlock: manifest.deploymentBlock as number,
    deploymentBlockHash,
    confirmations: manifest.confirmations as number,
    sourceCommit: manifest.sourceCommit,
    protocolArtifactSha256,
    liveContracts,
    contractTemplates: { reserveVault },
    verified: true,
    auditStatus: 'audited',
    auditReportSha256: requireSha256(
      manifest.auditReportSha256,
      'auditReportSha256',
    ),
    releaseApprovalSha256: requireSha256(
      manifest.releaseApprovalSha256,
      'releaseApprovalSha256',
    ),
    verificationEvidenceSha256: requireSha256(
      manifest.verificationEvidenceSha256,
      'verificationEvidenceSha256',
    ),
  };
}

export async function validateEthereumContractDeployment(params: {
  client: EthereumPublicClient;
  manifest: unknown;
  fetchImpl?: typeof fetch;
}): Promise<EthereumDeploymentManifest> {
  const manifest = validateEthereumDeploymentManifest(params.manifest, {
    requireDeployed: true,
  });
  if (
    manifest.status !== 'deployed' ||
    manifest.deployer == null ||
    manifest.deploymentTransaction == null ||
    manifest.deploymentBlock == null ||
    manifest.deploymentBlockHash == null ||
    manifest.confirmations == null
  ) {
    throw new NakamaEthereumContractError(
      'Validated deployment manifest is missing deployment evidence.',
    );
  }

  const chainId = await params.client.getChainId();
  if (chainId !== ETHEREUM_MAINNET_CHAIN_ID) {
    throw new NakamaEthereumWrongChainError(
      `RPC returned chainId ${chainId}; expected Ethereum mainnet.`,
      { details: { chainId, expectedChainId: ETHEREUM_MAINNET_CHAIN_ID } },
    );
  }

  const verifiedDeployment = await verifyEthereumReceipt(params.client, {
    hash: manifest.deploymentTransaction,
    minimumConfirmations: manifest.confirmations,
    requireSafeBlock: true,
  });
  const finalizedBlock = await params.client.getBlock({
    blockTag: 'finalized',
  });
  if (
    finalizedBlock.number == null ||
    finalizedBlock.number < BigInt(manifest.deploymentBlock)
  ) {
    throw new NakamaEthereumContractError(
      'Factory deployment has not reached Ethereum finalized head.',
    );
  }
  const receipt = verifiedDeployment.receipt;
  const factoryAddress = manifest.liveContracts.factory.address;
  if (
    factoryAddress == null ||
    receipt.status !== 'success' ||
    receipt.contractAddress == null ||
    getAddress(receipt.contractAddress) !== factoryAddress ||
    receipt.blockNumber !== BigInt(manifest.deploymentBlock) ||
    receipt.blockHash.toLowerCase() !==
      manifest.deploymentBlockHash.toLowerCase()
  ) {
    throw new NakamaEthereumContractError(
      'Factory deployment receipt does not match the published address and block.',
    );
  }

  const transaction = await params.client.getTransaction({
    hash: manifest.deploymentTransaction,
  });
  if (
    transaction.to != null ||
    getAddress(transaction.from) !== manifest.deployer ||
    transaction.hash.toLowerCase() !==
      manifest.deploymentTransaction.toLowerCase() ||
    transaction.blockNumber !== BigInt(manifest.deploymentBlock) ||
    transaction.blockHash?.toLowerCase() !==
      manifest.deploymentBlockHash.toLowerCase()
  ) {
    throw new NakamaEthereumContractError(
      'Deployment transaction is not the published factory creation transaction.',
    );
  }
  const derivedFactory = getContractAddress({
    from: manifest.deployer,
    nonce: BigInt(transaction.nonce),
  });
  if (derivedFactory !== factoryAddress) {
    throw new NakamaEthereumContractError(
      'Factory address does not match the deployer CREATE nonce.',
    );
  }
  assertEthereumCreationBytecodeHash({
    creationBytecode: transaction.input,
    expectedCreationBytecodeHash: manifest.liveContracts.factory
      .creationBytecodeHash as Hex,
  });

  const registryAddress = requireLiveAddress(
    manifest.liveContracts.policyRegistry,
    'policyRegistry',
  );
  const protocolAddress = requireLiveAddress(
    manifest.liveContracts.protocol,
    'protocol',
  );
  if (
    getContractAddress({ from: factoryAddress, nonce: 1n }) !==
      registryAddress ||
    getContractAddress({ from: factoryAddress, nonce: 2n }) !== protocolAddress
  ) {
    throw new NakamaEthereumContractError(
      'Factory children do not match CREATE nonce one registry and nonce two protocol.',
    );
  }

  const [
    factoryRegistry,
    factoryProtocol,
    registryCore,
    protocolRegistry,
    protocolFactory,
  ] = await Promise.all([
    readContractAddress(
      params.client,
      factoryAddress,
      NAKAMA_PROTOCOL_FACTORY_ABI,
      'policyRegistry',
    ),
    readContractAddress(
      params.client,
      factoryAddress,
      NAKAMA_PROTOCOL_FACTORY_ABI,
      'protocol',
    ),
    readContractAddress(
      params.client,
      registryAddress,
      NAKAMA_POLICY_REGISTRY_ABI,
      'core',
    ),
    readContractAddress(
      params.client,
      protocolAddress,
      NAKAMA_COVERAGE_PROTOCOL_ABI,
      'policyRegistry',
    ),
    readContractAddress(
      params.client,
      protocolAddress,
      NAKAMA_COVERAGE_PROTOCOL_ABI,
      'deploymentFactory',
    ),
  ]);
  if (
    factoryRegistry !== registryAddress ||
    factoryProtocol !== protocolAddress ||
    registryCore !== protocolAddress ||
    protocolRegistry !== registryAddress ||
    protocolFactory !== factoryAddress
  ) {
    throw new NakamaEthereumContractError(
      'Factory, policy registry, and protocol deploymentFactory/cross-getters are not mutually bound.',
    );
  }

  await Promise.all(
    LIVE_ROLES.map((role) =>
      verifyLiveContractCode(
        params.client,
        manifest.liveContracts[role],
        role,
        manifest.deploymentBlock as number,
      ),
    ),
  );

  await verifyAllSourcifyEvidence(manifest, params.fetchImpl ?? fetch);
  return manifest;
}

/** Revalidates all three canonical Sourcify v2 exact-match records. */
export async function verifyEthereumSourcifyDeployment(
  manifestInput: unknown,
  fetchImpl: typeof fetch = fetch,
): Promise<EthereumDeploymentManifest> {
  const manifest = validateEthereumDeploymentManifest(manifestInput, {
    requireDeployed: true,
  });
  await verifyAllSourcifyEvidence(manifest, fetchImpl);
  return manifest;
}

function validateLiveContract(
  input: unknown,
  role: EthereumLiveContractRole,
  status: EthereumDeploymentStatus,
): EthereumLiveContractDeployment {
  const value = requireRecord(input, `${role} deployment`);
  requireExactFields(value, LIVE_CONTRACT_FIELDS, `${role} deployment`);
  const identity = LIVE_CONTRACT_IDENTITIES[role];
  if (
    value.contractName !== identity.contractName ||
    value.deploymentKind !== identity.deploymentKind ||
    value.factoryNonce !== identity.factoryNonce ||
    value.abiArtifact !== identity.abiArtifact
  ) {
    throw new NakamaEthereumContractError(
      `${role} deployment identity or ABI artifact is not canonical.`,
    );
  }

  if (status === 'unconfigured') {
    if (
      value.address !== null ||
      value.creationBytecodeHash !== null ||
      value.creationBytecodeBytes !== null ||
      value.runtimeBytecodeHash !== null ||
      value.runtimeBytecodeTemplateHash !== null ||
      value.runtimeBytecodeBytes !== null ||
      value.abiSha256 !== null ||
      value.verification !== null ||
      !Array.isArray(value.immutableReferences) ||
      value.immutableReferences.length !== 0
    ) {
      throw new NakamaEthereumContractError(
        `Unconfigured ${role} deployment must not contain live evidence.`,
      );
    }
    return value as unknown as EthereumLiveContractDeployment;
  }

  const address = requireAddress(value.address, `${role}.address`);
  const runtimeBytecodeHash = requireBytes32(
    value.runtimeBytecodeHash,
    `${role}.runtimeBytecodeHash`,
  );
  requireArtifactMetadata(value, identity.metadata, role);
  const verification = validateSourceVerification(
    value.verification,
    address,
    role,
  );
  return {
    ...(value as unknown as EthereumLiveContractDeployment),
    address,
    runtimeBytecodeHash,
    immutableReferences: identity.metadata.immutableReferences,
    verification,
  };
}

function validateReserveVaultTemplate(
  input: unknown,
  status: EthereumDeploymentStatus,
): EthereumReserveVaultTemplate {
  const value = requireRecord(input, 'reserveVault template');
  requireExactFields(value, TEMPLATE_FIELDS, 'reserveVault template');
  if (
    value.contractName !== 'ReserveVault' ||
    value.deploymentKind !== 'core-create2' ||
    value.saltDerivation !== 'keccak256(abi.encode(domainId,assetToken))' ||
    value.abiArtifact !== 'contracts/ethereum/ReserveVault.abi.json'
  ) {
    throw new NakamaEthereumContractError(
      'ReserveVault template identity, salt derivation, or ABI artifact is not canonical.',
    );
  }
  if (status === 'unconfigured') {
    if (
      value.creationBytecodeHash !== null ||
      value.creationBytecodeBytes !== null ||
      value.runtimeBytecodeTemplateHash !== null ||
      value.runtimeBytecodeBytes !== null ||
      value.abiSha256 !== null ||
      !Array.isArray(value.immutableReferences) ||
      value.immutableReferences.length !== 0
    ) {
      throw new NakamaEthereumContractError(
        'Unconfigured ReserveVault template must not contain release evidence.',
      );
    }
    return value as unknown as EthereumReserveVaultTemplate;
  }
  requireArtifactMetadata(
    value,
    NAKAMA_RESERVE_VAULT_ARTIFACT_METADATA,
    'reserveVault',
  );
  return {
    ...(value as unknown as EthereumReserveVaultTemplate),
    immutableReferences:
      NAKAMA_RESERVE_VAULT_ARTIFACT_METADATA.immutableReferences,
  };
}

function requireArtifactMetadata(
  value: Record<string, unknown>,
  metadata:
    | typeof NAKAMA_PROTOCOL_FACTORY_ARTIFACT_METADATA
    | typeof NAKAMA_POLICY_REGISTRY_ARTIFACT_METADATA
    | typeof NAKAMA_COVERAGE_PROTOCOL_ARTIFACT_METADATA
    | typeof NAKAMA_RESERVE_VAULT_ARTIFACT_METADATA,
  label: string,
): void {
  const creationBytecodeHash = requireBytes32(
    value.creationBytecodeHash,
    `${label}.creationBytecodeHash`,
  );
  const runtimeTemplateHash = requireBytes32(
    value.runtimeBytecodeTemplateHash,
    `${label}.runtimeBytecodeTemplateHash`,
  );
  const abiSha256 = requireSha256(value.abiSha256, `${label}.abiSha256`);
  const references = requireImmutableReferences(
    value.immutableReferences,
    metadata.runtimeBytecodeBytes,
    `${label}.immutableReferences`,
  );
  if (
    creationBytecodeHash.toLowerCase() !==
      metadata.creationBytecodeHash.toLowerCase() ||
    value.creationBytecodeBytes !== metadata.creationBytecodeBytes ||
    runtimeTemplateHash.toLowerCase() !==
      metadata.runtimeBytecodeTemplateHash.toLowerCase() ||
    value.runtimeBytecodeBytes !== metadata.runtimeBytecodeBytes ||
    abiSha256 !== metadata.abiSha256 ||
    JSON.stringify(references) !== JSON.stringify(metadata.immutableReferences)
  ) {
    throw new NakamaEthereumContractError(
      `${label} deployment metadata does not match the generated protocol artifact.`,
    );
  }
}

function validateSourceVerification(
  input: unknown,
  address: Address,
  role: string,
): EthereumSourceVerification {
  const value = requireRecord(input, `${role} verification`);
  requireExactFields(value, VERIFICATION_FIELDS, `${role} verification`);
  if (
    value.verificationProvider !== 'sourcify-v2' ||
    value.creationMatch !== 'exact_match' ||
    value.runtimeMatch !== 'exact_match'
  ) {
    throw new NakamaEthereumContractError(
      `${role} Sourcify creation and runtime verification must both be exact_match.`,
    );
  }
  const verificationUrl = requireCanonicalSourcifyUrl(
    value.verificationUrl,
    address,
    role,
  );
  return {
    verificationProvider: 'sourcify-v2',
    verificationUrl,
    sourceVerifiedAt: requireDateTime(
      value.sourceVerifiedAt,
      `${role}.sourceVerifiedAt`,
    ),
    sourcifyMatchId: requireNonEmptyString(
      value.sourcifyMatchId,
      `${role}.sourcifyMatchId`,
    ),
    creationMatch: 'exact_match',
    runtimeMatch: 'exact_match',
  };
}

async function verifyLiveContractCode(
  client: EthereumPublicClient,
  contract: EthereumLiveContractDeployment,
  role: EthereumLiveContractRole,
  deploymentBlock: number,
): Promise<void> {
  const address = requireLiveAddress(contract, role);
  const [deploymentCode, latestCode] = await Promise.all([
    client.getBytecode({ address, blockNumber: BigInt(deploymentBlock) }),
    client.getBytecode({ address }),
  ]);
  if (!deploymentCode || deploymentCode === '0x') {
    throw new NakamaEthereumContractError(
      `No runtime bytecode exists at the canonical ${role} address.`,
    );
  }
  if (
    !latestCode ||
    latestCode.toLowerCase() !== deploymentCode.toLowerCase()
  ) {
    throw new NakamaEthereumContractError(
      `${role} runtime bytecode changed after deployment.`,
    );
  }
  const runtimeHash = keccak256(latestCode);
  if (
    runtimeHash.toLowerCase() !== contract.runtimeBytecodeHash?.toLowerCase()
  ) {
    throw new NakamaEthereumContractError(
      `${role} runtime bytecode hash does not match the manifest.`,
    );
  }
  if (hexToBytes(latestCode).length !== contract.runtimeBytecodeBytes) {
    throw new NakamaEthereumContractError(
      `${role} runtime bytecode length does not match the approved artifact.`,
    );
  }
  const templateHash = hashEthereumRuntimeBytecodeTemplate({
    bytecode: latestCode,
    immutableReferences: contract.immutableReferences,
  });
  if (
    templateHash.toLowerCase() !==
    contract.runtimeBytecodeTemplateHash?.toLowerCase()
  ) {
    throw new NakamaEthereumContractError(
      `${role} normalized runtime bytecode does not match the approved template.`,
    );
  }
}

async function readContractAddress(
  client: EthereumPublicClient,
  address: Address,
  abi: Abi,
  functionName: string,
): Promise<Address> {
  const value = await client.readContract({
    address,
    abi,
    functionName,
  } as never);
  return requireAddress(value, `${functionName}()`);
}

async function verifyAllSourcifyEvidence(
  manifest: EthereumDeploymentManifest,
  fetchImpl: typeof fetch,
): Promise<void> {
  await Promise.all(
    LIVE_ROLES.map(async (role) => {
      const contract = manifest.liveContracts[role];
      const address = requireLiveAddress(contract, role);
      const verification = contract.verification;
      if (verification == null) {
        throw new NakamaEthereumContractError(
          `${role} is missing Sourcify verification evidence.`,
        );
      }
      const response = await fetchImpl(verification.verificationUrl, {
        method: 'GET',
        headers: { accept: 'application/json' },
      });
      if (!response.ok) {
        throw new NakamaEthereumContractError(
          `${role} Sourcify v2 lookup failed with HTTP ${response.status}.`,
        );
      }
      const result: unknown = await response.json();
      const resultAddress =
        isRecord(result) && typeof result.address === 'string'
          ? normalizeEthereumAddress(result.address)
          : null;
      if (
        !isRecord(result) ||
        String(result.chainId) !== '1' ||
        resultAddress !== address ||
        result.creationMatch !== 'exact_match' ||
        result.runtimeMatch !== 'exact_match' ||
        result.verifiedAt !== verification.sourceVerifiedAt ||
        result.matchId !== verification.sourcifyMatchId
      ) {
        throw new NakamaEthereumContractError(
          `${role} Sourcify response does not exactly match the published evidence.`,
        );
      }
    }),
  );
}

function requireLiveAddress(
  contract: EthereumLiveContractDeployment,
  role: string,
): Address {
  return requireAddress(contract.address, `${role}.address`);
}

function requireAddress(value: unknown, field: string): Address {
  if (typeof value !== 'string' || !isAddress(value)) {
    throw new NakamaEthereumContractError(`${field} must be an address.`);
  }
  const address = getAddress(value);
  if (address === zeroAddress) {
    throw new NakamaEthereumContractError(`${field} cannot be zero.`);
  }
  return address;
}

function requireBytes32(value: unknown, field: string): Hex {
  if (
    typeof value !== 'string' ||
    !isHex(value) ||
    !/^0x[0-9a-f]{64}$/i.test(value)
  ) {
    throw new NakamaEthereumContractError(
      `${field} must be a 32-byte 0x-prefixed hex value.`,
    );
  }
  return value as Hex;
}

function requireSha256(value: unknown, field: string): string {
  if (typeof value !== 'string' || !/^[0-9a-f]{64}$/.test(value)) {
    throw new NakamaEthereumContractError(
      `${field} must be a lowercase 64-character SHA-256 digest without 0x.`,
    );
  }
  return value;
}

function requireNonEmptyString(value: unknown, field: string): string {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.trim() !== value
  ) {
    throw new NakamaEthereumContractError(
      `${field} must be a non-empty string without surrounding whitespace.`,
    );
  }
  return value;
}

function requireDateTime(value: unknown, field: string): string {
  const dateTime = requireNonEmptyString(value, field);
  if (!Number.isFinite(Date.parse(dateTime))) {
    throw new NakamaEthereumContractError(
      `${field} must be an ISO-compatible date-time.`,
    );
  }
  return dateTime;
}

function requireCanonicalSourcifyUrl(
  value: unknown,
  address: Address,
  role: string,
): string {
  const url = requireNonEmptyString(value, `${role}.verificationUrl`);
  const expected = `${SOURCIFY_V2_ETHEREUM_MAINNET_PREFIX}${address}`;
  if (url !== expected) {
    throw new NakamaEthereumContractError(
      `${role} verificationUrl must be the canonical Sourcify v2 Ethereum mainnet lookup.`,
    );
  }
  return url;
}

function requireImmutableReferences(
  value: unknown,
  byteLength: number,
  field: string,
): readonly EthereumImmutableReference[] {
  if (!Array.isArray(value)) {
    throw new NakamaEthereumContractError(`${field} must be an array.`);
  }
  const references: EthereumImmutableReference[] = [];
  let previousEnd = 0;
  for (const [index, candidate] of value.entries()) {
    if (
      !isRecord(candidate) ||
      Object.keys(candidate).sort().join(',') !== 'length,start' ||
      !Number.isSafeInteger(candidate.start) ||
      !Number.isSafeInteger(candidate.length)
    ) {
      throw new NakamaEthereumContractError(
        `${field}[${index}] must contain only safe-integer start and length.`,
      );
    }
    const start = candidate.start as number;
    const length = candidate.length as number;
    const end = start + length;
    if (
      start < 0 ||
      length < 1 ||
      !Number.isSafeInteger(end) ||
      start < previousEnd ||
      end > byteLength
    ) {
      throw new NakamaEthereumContractError(
        `${field} must contain sorted, non-overlapping in-bounds ranges.`,
      );
    }
    references.push({ start, length });
    previousEnd = end;
  }
  return references;
}

function requireRecord(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new NakamaEthereumContractError(`${label} must be an object.`);
  }
  return value;
}

function requireExactFields(
  value: Record<string, unknown>,
  expectedFields: readonly string[],
  label: string,
): void {
  const actual = Object.keys(value).sort();
  const expected = [...expectedFields].sort();
  if (
    actual.length !== expected.length ||
    actual.some((field, index) => field !== expected[index])
  ) {
    throw new NakamaEthereumContractError(
      `${label} fields do not match the canonical schema.`,
      { details: { actualFields: actual, expectedFields: expected } },
    );
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}
