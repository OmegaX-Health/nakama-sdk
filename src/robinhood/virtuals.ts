import { isAddress, isHex, zeroAddress, type Address, type Hex } from 'viem';

import {
  ROBINHOOD_USDG_DECIMALS,
  ROBINHOOD_USDG_MAINNET_ADDRESS,
  ROBINHOOD_USDG_NAME,
  ROBINHOOD_USDG_SYMBOL,
} from './assets.js';
import {
  ROBINHOOD_MAINNET_CAIP2,
  ROBINHOOD_MAINNET_CHAIN_ID,
  normalizeRobinhoodAddress,
} from './chains.js';
import { NakamaRobinhoodConfigError } from './errors.js';

export type VirtualsLaunchClass = 'pegasus' | 'unicorn';

export interface VirtualsLaunchAsset {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
}

export interface VirtualsLaunchContractEvidence {
  role: 'virtualToken' | 'bonding' | 'bondingConfig' | 'agentFactory' | 'acp';
  address: Address;
  runtimeBytecodeHash: Hex;
  verifiedAtBlock: bigint;
}

export interface VirtualsBeneficialOwner {
  id: string;
  displayName: string;
  jurisdiction: string;
  verified: boolean;
  platformEligible: boolean;
  malaysiaNexusResolved: boolean;
}

export interface VirtualsKnownRecipient {
  id: string;
  label: string;
  kind: 'beneficial_owner' | 'verified_contract' | 'locked_treasury';
  address: Address;
  beneficialOwnerId: string | null;
  verified: boolean;
}

export interface VirtualsTokenAllocation {
  recipientId: string;
  purpose: string;
  basisPoints: number;
  locked: boolean;
  cliffSeconds: bigint;
  vestingSeconds: bigint;
}

export interface VirtualsLaunchPlan {
  schemaVersion: 1;
  network: 'mainnet';
  chainId: typeof ROBINHOOD_MAINNET_CHAIN_ID;
  caip2: typeof ROBINHOOD_MAINNET_CAIP2;
  launchClass: VirtualsLaunchClass;
  token: {
    name: string;
    symbol: string;
    totalSupply: bigint;
  };
  gates: {
    paidProductEvidencePassed: boolean;
    tokenUtilityGatePassed: boolean;
    legalReviewPassed: boolean;
    platformEligibilityResolved: boolean;
    malaysiaEligibilityResolved: boolean;
  };
  contracts: readonly VirtualsLaunchContractEvidence[];
  assets: readonly VirtualsLaunchAsset[];
  fees: {
    tradingFeeBasisPoints: number;
    creatorShareBasisPoints: number;
    acpShareBasisPoints: number;
    creatorFeeRecipientId: string;
    acpFeeRecipientId: string;
  };
  beneficialOwners: readonly VirtualsBeneficialOwner[];
  recipients: readonly VirtualsKnownRecipient[];
  allocations: readonly VirtualsTokenAllocation[];
  simulation: {
    passed: boolean;
    blockNumber: bigint;
    blockHash: Hex;
    chainId: typeof ROBINHOOD_MAINNET_CHAIN_ID;
    configCommitment: Hex;
    launchPacketCommitment: Hex;
    verifiedContractCodeHashes: readonly Hex[];
    simulatedAt: string;
  };
  finality: {
    chainHead: bigint;
    safeBlock: bigint;
    finalizedBlock: bigint;
    configReadBlock: bigint;
    state: 'finalized';
    observedAt: string;
  };
}

/**
 * Parses and structurally validates a caller-supplied offline packet.
 *
 * Passing validation does not prove Virtuals approval, legal eligibility,
 * beneficial-owner verification, or onchain truth. The function never reads a
 * chain, signs, or broadcasts.
 */
export function decodeVirtualsLaunchPlan(
  input: string | unknown,
): VirtualsLaunchPlan {
  let parsed = input;
  if (typeof input === 'string') {
    try {
      parsed = JSON.parse(input, (_key, value) => {
        if (typeof value === 'string' && /^\d+n$/.test(value)) {
          return BigInt(value.slice(0, -1));
        }
        return value;
      }) as unknown;
    } catch (error) {
      throw new NakamaRobinhoodConfigError(
        'Virtuals launch plan is not valid JSON.',
        { cause: error },
      );
    }
  }
  return validateVirtualsLaunchPacketStructure(parsed);
}

/**
 * Structurally validates internally supplied launch assertions and evidence.
 * External platform, legal, identity, RPC, and finality verification remains a
 * launch prerequisite outside this pure function.
 */
export function validateVirtualsLaunchPlan(input: unknown): VirtualsLaunchPlan {
  const plan = requireRecord(input, 'Virtuals launch plan');
  requireExactFields(
    plan,
    [
      'schemaVersion',
      'network',
      'chainId',
      'caip2',
      'launchClass',
      'token',
      'gates',
      'contracts',
      'assets',
      'fees',
      'beneficialOwners',
      'recipients',
      'allocations',
      'simulation',
      'finality',
    ],
    'Virtuals launch plan',
  );
  if (
    plan.schemaVersion !== 1 ||
    plan.network !== 'mainnet' ||
    plan.chainId !== ROBINHOOD_MAINNET_CHAIN_ID ||
    plan.caip2 !== ROBINHOOD_MAINNET_CAIP2 ||
    (plan.launchClass !== 'pegasus' && plan.launchClass !== 'unicorn')
  ) {
    throw new NakamaRobinhoodConfigError(
      'Virtuals launch plan must explicitly target Robinhood mainnet and a supported launch class.',
    );
  }
  const token = requireRecord(plan.token, 'token');
  requireExactFields(token, ['name', 'symbol', 'totalSupply'], 'token');
  requireNonEmpty(token.name, 'token.name');
  requireNonEmpty(token.symbol, 'token.symbol');
  const totalSupply = requirePositiveBigInt(
    token.totalSupply,
    'token.totalSupply',
  );

  const gates = requireRecord(plan.gates, 'gates');
  requireExactFields(
    gates,
    [
      'paidProductEvidencePassed',
      'tokenUtilityGatePassed',
      'legalReviewPassed',
      'platformEligibilityResolved',
      'malaysiaEligibilityResolved',
    ],
    'gates',
  );
  for (const [gate, passed] of Object.entries(gates)) {
    if (passed !== true) {
      throw new NakamaRobinhoodConfigError(
        `Virtuals launch is blocked because ${gate} is not resolved.`,
        { details: { gate, passed } },
      );
    }
  }

  if (!Array.isArray(plan.contracts)) {
    throw new NakamaRobinhoodConfigError('contracts must be an array.');
  }
  const expectedRoles = [
    'virtualToken',
    'bonding',
    'bondingConfig',
    'agentFactory',
    'acp',
  ] as const;
  const contracts = plan.contracts.map((value, index) =>
    validateContract(value, `contracts[${index}]`),
  );
  requireUnique(
    contracts.map(({ role }) => role),
    'contract role',
  );
  requireUnique(
    contracts.map(({ address }) => address.toLowerCase()),
    'contract address',
  );
  for (const role of expectedRoles) {
    if (!contracts.some((contract) => contract.role === role)) {
      throw new NakamaRobinhoodConfigError(
        `Virtuals launch plan is missing ${role} contract evidence.`,
      );
    }
  }

  if (!Array.isArray(plan.assets) || plan.assets.length === 0) {
    throw new NakamaRobinhoodConfigError('assets must be a non-empty array.');
  }
  const assets = plan.assets.map((value, index) =>
    validateAsset(value, `assets[${index}]`),
  );
  requireUnique(
    assets.map(({ address }) => address.toLowerCase()),
    'asset address',
  );
  if (
    !assets.some(
      ({ address }) =>
        address.toLowerCase() === ROBINHOOD_USDG_MAINNET_ADDRESS.toLowerCase(),
    )
  ) {
    throw new NakamaRobinhoodConfigError(
      'Virtuals launch plan must include canonical Robinhood mainnet USDG.',
    );
  }

  if (
    !Array.isArray(plan.beneficialOwners) ||
    plan.beneficialOwners.length === 0
  ) {
    throw new NakamaRobinhoodConfigError(
      'At least one verified beneficial owner is required.',
    );
  }
  const beneficialOwners = plan.beneficialOwners.map((value, index) =>
    validateBeneficialOwner(value, `beneficialOwners[${index}]`),
  );
  requireUnique(
    beneficialOwners.map(({ id }) => id),
    'beneficial owner ID',
  );

  if (!Array.isArray(plan.recipients) || plan.recipients.length === 0) {
    throw new NakamaRobinhoodConfigError(
      'Every allocation and fee receiver must resolve through a known recipient.',
    );
  }
  const recipients = plan.recipients.map((value, index) =>
    validateRecipient(value, beneficialOwners, `recipients[${index}]`),
  );
  requireUnique(
    recipients.map(({ id }) => id),
    'recipient ID',
  );
  requireUnique(
    recipients.map(({ address }) => address.toLowerCase()),
    'recipient address',
  );

  const fees = validateFees(plan.fees, recipients);
  if (!Array.isArray(plan.allocations) || plan.allocations.length === 0) {
    throw new NakamaRobinhoodConfigError(
      'allocations must be a non-empty array.',
    );
  }
  const allocations = plan.allocations.map((value, index) =>
    validateAllocation(value, recipients, `allocations[${index}]`),
  );
  requireUnique(
    allocations.map(({ recipientId }) => recipientId),
    'allocation recipient ID; combine allocations for the same recipient',
  );
  const allocationTotal = allocations.reduce(
    (sum, allocation) => sum + allocation.basisPoints,
    0,
  );
  if (allocationTotal !== 10_000) {
    throw new NakamaRobinhoodConfigError(
      'Token allocations must total exactly 10000 basis points.',
      { details: { allocationTotal } },
    );
  }

  const simulation = validateSimulation(plan.simulation, contracts);
  const finality = validateFinality(plan.finality, simulation.blockNumber);
  for (const contract of contracts) {
    if (
      contract.verifiedAtBlock > finality.configReadBlock ||
      contract.verifiedAtBlock > finality.finalizedBlock ||
      contract.verifiedAtBlock > finality.chainHead
    ) {
      throw new NakamaRobinhoodConfigError(
        `${contract.role} contract evidence was verified after the finalized configuration snapshot.`,
        {
          details: {
            verifiedAtBlock: contract.verifiedAtBlock.toString(),
            configReadBlock: finality.configReadBlock.toString(),
            finalizedBlock: finality.finalizedBlock.toString(),
            chainHead: finality.chainHead.toString(),
          },
        },
      );
    }
  }
  if (Date.parse(finality.observedAt) < Date.parse(simulation.simulatedAt)) {
    throw new NakamaRobinhoodConfigError(
      'Finality observation cannot precede launch simulation.',
    );
  }

  return {
    schemaVersion: 1,
    network: 'mainnet',
    chainId: ROBINHOOD_MAINNET_CHAIN_ID,
    caip2: ROBINHOOD_MAINNET_CAIP2,
    launchClass: plan.launchClass,
    token: {
      name: token.name as string,
      symbol: token.symbol as string,
      totalSupply,
    },
    gates: gates as unknown as VirtualsLaunchPlan['gates'],
    contracts,
    assets,
    fees,
    beneficialOwners,
    recipients,
    allocations,
    simulation,
    finality,
  };
}

/**
 * Explicit alias for callers that want the API name to communicate its limited
 * guarantee. This remains pure structural validation of caller-supplied data.
 */
export function validateVirtualsLaunchPacketStructure(
  input: unknown,
): VirtualsLaunchPlan {
  return validateVirtualsLaunchPlan(input);
}

function validateContract(
  input: unknown,
  label: string,
): VirtualsLaunchContractEvidence {
  const contract = requireRecord(input, label);
  requireExactFields(
    contract,
    ['role', 'address', 'runtimeBytecodeHash', 'verifiedAtBlock'],
    label,
  );
  if (
    ![
      'virtualToken',
      'bonding',
      'bondingConfig',
      'agentFactory',
      'acp',
    ].includes(String(contract.role))
  ) {
    throw new NakamaRobinhoodConfigError(`${label}.role is unsupported.`);
  }
  return {
    role: contract.role as VirtualsLaunchContractEvidence['role'],
    address: requireAddress(contract.address, `${label}.address`),
    runtimeBytecodeHash: requireBytes32(
      contract.runtimeBytecodeHash,
      `${label}.runtimeBytecodeHash`,
    ),
    verifiedAtBlock: requirePositiveBigInt(
      contract.verifiedAtBlock,
      `${label}.verifiedAtBlock`,
    ),
  };
}

function validateAsset(input: unknown, label: string): VirtualsLaunchAsset {
  const asset = requireRecord(input, label);
  requireExactFields(asset, ['address', 'name', 'symbol', 'decimals'], label);
  const address = requireAddress(asset.address, `${label}.address`);
  const name = requireNonEmpty(asset.name, `${label}.name`);
  const symbol = requireNonEmpty(asset.symbol, `${label}.symbol`);
  if (!Number.isSafeInteger(asset.decimals) || Number(asset.decimals) < 0) {
    throw new NakamaRobinhoodConfigError(`${label}.decimals is invalid.`);
  }
  if (address.toLowerCase() === ROBINHOOD_USDG_MAINNET_ADDRESS.toLowerCase()) {
    if (
      name !== ROBINHOOD_USDG_NAME ||
      symbol !== ROBINHOOD_USDG_SYMBOL ||
      asset.decimals !== ROBINHOOD_USDG_DECIMALS
    ) {
      throw new NakamaRobinhoodConfigError(
        'The canonical Robinhood USDG address must never be labeled USDC or use different metadata.',
        { details: { address, name, symbol, decimals: asset.decimals } },
      );
    }
  }
  return { address, name, symbol, decimals: Number(asset.decimals) };
}

function validateBeneficialOwner(
  input: unknown,
  label: string,
): VirtualsBeneficialOwner {
  const owner = requireRecord(input, label);
  requireExactFields(
    owner,
    [
      'id',
      'displayName',
      'jurisdiction',
      'verified',
      'platformEligible',
      'malaysiaNexusResolved',
    ],
    label,
  );
  const result = {
    id: requireNonEmpty(owner.id, `${label}.id`),
    displayName: requireNonEmpty(owner.displayName, `${label}.displayName`),
    jurisdiction: requireNonEmpty(owner.jurisdiction, `${label}.jurisdiction`),
    verified: owner.verified === true,
    platformEligible: owner.platformEligible === true,
    malaysiaNexusResolved: owner.malaysiaNexusResolved === true,
  };
  if (
    !result.verified ||
    !result.platformEligible ||
    !result.malaysiaNexusResolved
  ) {
    throw new NakamaRobinhoodConfigError(
      `${label} is not fully verified and platform-eligible, including its Malaysia nexus.`,
    );
  }
  return result;
}

function validateRecipient(
  input: unknown,
  owners: readonly VirtualsBeneficialOwner[],
  label: string,
): VirtualsKnownRecipient {
  const recipient = requireRecord(input, label);
  requireExactFields(
    recipient,
    ['id', 'label', 'kind', 'address', 'beneficialOwnerId', 'verified'],
    label,
  );
  if (
    recipient.kind !== 'beneficial_owner' &&
    recipient.kind !== 'verified_contract' &&
    recipient.kind !== 'locked_treasury'
  ) {
    throw new NakamaRobinhoodConfigError(`${label}.kind is unsupported.`);
  }
  if (recipient.verified !== true) {
    throw new NakamaRobinhoodConfigError(`${label} is not verified.`);
  }
  const beneficialOwnerId =
    recipient.beneficialOwnerId === null
      ? null
      : requireNonEmpty(
          recipient.beneficialOwnerId,
          `${label}.beneficialOwnerId`,
        );
  if (
    (recipient.kind === 'beneficial_owner' && beneficialOwnerId == null) ||
    (beneficialOwnerId != null &&
      !owners.some((owner) => owner.id === beneficialOwnerId))
  ) {
    throw new NakamaRobinhoodConfigError(
      `${label} references an unknown beneficial owner.`,
    );
  }
  return {
    id: requireNonEmpty(recipient.id, `${label}.id`),
    label: requireNonEmpty(recipient.label, `${label}.label`),
    kind: recipient.kind,
    address: requireAddress(recipient.address, `${label}.address`),
    beneficialOwnerId,
    verified: true,
  };
}

function validateFees(
  input: unknown,
  recipients: readonly VirtualsKnownRecipient[],
): VirtualsLaunchPlan['fees'] {
  const fees = requireRecord(input, 'fees');
  requireExactFields(
    fees,
    [
      'tradingFeeBasisPoints',
      'creatorShareBasisPoints',
      'acpShareBasisPoints',
      'creatorFeeRecipientId',
      'acpFeeRecipientId',
    ],
    'fees',
  );
  const tradingFeeBasisPoints = requireBasisPoints(
    fees.tradingFeeBasisPoints,
    'fees.tradingFeeBasisPoints',
  );
  const creatorShareBasisPoints = requireBasisPoints(
    fees.creatorShareBasisPoints,
    'fees.creatorShareBasisPoints',
  );
  const acpShareBasisPoints = requireBasisPoints(
    fees.acpShareBasisPoints,
    'fees.acpShareBasisPoints',
  );
  if (creatorShareBasisPoints + acpShareBasisPoints !== 10_000) {
    throw new NakamaRobinhoodConfigError(
      'Creator and ACP fee shares must total exactly 10000 basis points.',
    );
  }
  const creatorFeeRecipientId = requireKnownRecipient(
    fees.creatorFeeRecipientId,
    recipients,
    'creatorFeeRecipientId',
  );
  const acpFeeRecipientId = requireKnownRecipient(
    fees.acpFeeRecipientId,
    recipients,
    'acpFeeRecipientId',
  );
  return {
    tradingFeeBasisPoints,
    creatorShareBasisPoints,
    acpShareBasisPoints,
    creatorFeeRecipientId,
    acpFeeRecipientId,
  };
}

function validateAllocation(
  input: unknown,
  recipients: readonly VirtualsKnownRecipient[],
  label: string,
): VirtualsTokenAllocation {
  const allocation = requireRecord(input, label);
  requireExactFields(
    allocation,
    [
      'recipientId',
      'purpose',
      'basisPoints',
      'locked',
      'cliffSeconds',
      'vestingSeconds',
    ],
    label,
  );
  return {
    recipientId: requireKnownRecipient(
      allocation.recipientId,
      recipients,
      `${label}.recipientId`,
    ),
    purpose: requireNonEmpty(allocation.purpose, `${label}.purpose`),
    basisPoints: requireBasisPoints(
      allocation.basisPoints,
      `${label}.basisPoints`,
    ),
    locked: allocation.locked === true,
    cliffSeconds: requireNonNegativeBigInt(
      allocation.cliffSeconds,
      `${label}.cliffSeconds`,
    ),
    vestingSeconds: requireNonNegativeBigInt(
      allocation.vestingSeconds,
      `${label}.vestingSeconds`,
    ),
  };
}

function validateSimulation(
  input: unknown,
  contracts: readonly VirtualsLaunchContractEvidence[],
): VirtualsLaunchPlan['simulation'] {
  const simulation = requireRecord(input, 'simulation');
  requireExactFields(
    simulation,
    [
      'passed',
      'blockNumber',
      'blockHash',
      'chainId',
      'configCommitment',
      'launchPacketCommitment',
      'verifiedContractCodeHashes',
      'simulatedAt',
    ],
    'simulation',
  );
  if (
    simulation.passed !== true ||
    simulation.chainId !== ROBINHOOD_MAINNET_CHAIN_ID
  ) {
    throw new NakamaRobinhoodConfigError(
      'Launch simulation must pass on Robinhood mainnet.',
    );
  }
  if (!Array.isArray(simulation.verifiedContractCodeHashes)) {
    throw new NakamaRobinhoodConfigError(
      'simulation.verifiedContractCodeHashes must be an array.',
    );
  }
  const hashes = simulation.verifiedContractCodeHashes.map((hash, index) =>
    requireBytes32(hash, `simulation.verifiedContractCodeHashes[${index}]`),
  );
  const expected = new Set(
    contracts.map(({ runtimeBytecodeHash }) =>
      runtimeBytecodeHash.toLowerCase(),
    ),
  );
  if (
    hashes.length !== expected.size ||
    hashes.some((hash) => !expected.has(hash.toLowerCase()))
  ) {
    throw new NakamaRobinhoodConfigError(
      'Simulation code hashes do not exactly match the verified launch contracts.',
    );
  }
  return {
    passed: true,
    blockNumber: requirePositiveBigInt(
      simulation.blockNumber,
      'simulation.blockNumber',
    ),
    blockHash: requireBytes32(simulation.blockHash, 'simulation.blockHash'),
    chainId: ROBINHOOD_MAINNET_CHAIN_ID,
    configCommitment: requireBytes32(
      simulation.configCommitment,
      'simulation.configCommitment',
    ),
    launchPacketCommitment: requireBytes32(
      simulation.launchPacketCommitment,
      'simulation.launchPacketCommitment',
    ),
    verifiedContractCodeHashes: hashes,
    simulatedAt: requireIsoDate(
      simulation.simulatedAt,
      'simulation.simulatedAt',
    ),
  };
}

function validateFinality(
  input: unknown,
  simulationBlock: bigint,
): VirtualsLaunchPlan['finality'] {
  const finality = requireRecord(input, 'finality');
  requireExactFields(
    finality,
    [
      'chainHead',
      'safeBlock',
      'finalizedBlock',
      'configReadBlock',
      'state',
      'observedAt',
    ],
    'finality',
  );
  const chainHead = requirePositiveBigInt(
    finality.chainHead,
    'finality.chainHead',
  );
  const safeBlock = requirePositiveBigInt(
    finality.safeBlock,
    'finality.safeBlock',
  );
  const finalizedBlock = requirePositiveBigInt(
    finality.finalizedBlock,
    'finality.finalizedBlock',
  );
  const configReadBlock = requirePositiveBigInt(
    finality.configReadBlock,
    'finality.configReadBlock',
  );
  if (
    finality.state !== 'finalized' ||
    finalizedBlock < configReadBlock ||
    finalizedBlock < simulationBlock ||
    safeBlock < finalizedBlock ||
    chainHead < safeBlock
  ) {
    throw new NakamaRobinhoodConfigError(
      'Launch configuration and simulation must be observed at finalized Robinhood blocks.',
    );
  }
  return {
    chainHead,
    safeBlock,
    finalizedBlock,
    configReadBlock,
    state: 'finalized',
    observedAt: requireIsoDate(finality.observedAt, 'finality.observedAt'),
  };
}

function requireRecord(value: unknown, label: string): Record<string, unknown> {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    throw new NakamaRobinhoodConfigError(`${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function requireExactFields(
  value: Record<string, unknown>,
  fields: readonly string[],
  label: string,
): void {
  const expected = new Set(fields);
  const missing = fields.filter((field) => !(field in value));
  const extra = Object.keys(value).filter((field) => !expected.has(field));
  if (missing.length > 0 || extra.length > 0) {
    throw new NakamaRobinhoodConfigError(
      `${label} fields do not match schema.`,
      { details: { missing, extra } },
    );
  }
}

function requireAddress(value: unknown, field: string): Address {
  if (typeof value !== 'string' || !isAddress(value, { strict: false })) {
    throw new NakamaRobinhoodConfigError(`${field} must be an EVM address.`);
  }
  const address = normalizeRobinhoodAddress(value);
  if (address === zeroAddress) {
    throw new NakamaRobinhoodConfigError(
      `${field} cannot be the zero address.`,
    );
  }
  return address;
}

function requireBytes32(value: unknown, field: string): Hex {
  if (
    typeof value !== 'string' ||
    !isHex(value) ||
    !/^0x[0-9a-f]{64}$/i.test(value)
  ) {
    throw new NakamaRobinhoodConfigError(`${field} must be bytes32.`);
  }
  return value;
}

function requireNonEmpty(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new NakamaRobinhoodConfigError(`${field} cannot be empty.`);
  }
  return value;
}

function requirePositiveBigInt(value: unknown, field: string): bigint {
  if (typeof value !== 'bigint' || value <= 0n) {
    throw new NakamaRobinhoodConfigError(`${field} must be a positive bigint.`);
  }
  return value;
}

function requireNonNegativeBigInt(value: unknown, field: string): bigint {
  if (typeof value !== 'bigint' || value < 0n) {
    throw new NakamaRobinhoodConfigError(
      `${field} must be a non-negative bigint.`,
    );
  }
  return value;
}

function requireBasisPoints(value: unknown, field: string): number {
  if (
    !Number.isSafeInteger(value) ||
    Number(value) < 0 ||
    Number(value) > 10_000
  ) {
    throw new NakamaRobinhoodConfigError(
      `${field} must be an integer from 0 through 10000.`,
    );
  }
  return Number(value);
}

function requireKnownRecipient(
  value: unknown,
  recipients: readonly VirtualsKnownRecipient[],
  field: string,
): string {
  const id = requireNonEmpty(value, field);
  if (!recipients.some((recipient) => recipient.id === id)) {
    throw new NakamaRobinhoodConfigError(
      `${field} references an unknown recipient.`,
      { details: { recipientId: id } },
    );
  }
  return id;
}

function requireIsoDate(value: unknown, field: string): string {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value) ||
    !Number.isFinite(Date.parse(value)) ||
    new Date(value).toISOString() !== value
  ) {
    throw new NakamaRobinhoodConfigError(`${field} must be an ISO timestamp.`);
  }
  return value;
}

function requireUnique(values: readonly string[], label: string): void {
  if (new Set(values).size !== values.length) {
    throw new NakamaRobinhoodConfigError(`${label} values must be unique.`);
  }
}
