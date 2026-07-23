import {
  encodePacked,
  hashTypedData,
  isHex,
  keccak256,
  recoverTypedDataAddress,
  zeroAddress,
  type Address,
  type Hex,
} from 'viem';

import {
  getRobinhoodChainId,
  normalizeRobinhoodAddress,
  parseRobinhoodCaip10,
  toRobinhoodCaip10,
  type RobinhoodCaip10,
  type RobinhoodNetwork,
  type RobinhoodPublicClient,
} from './chains.js';
import {
  assertBytes32,
  assertSafeUint,
  assertUint,
  type Bytes32,
} from './domain.js';
import {
  NakamaRobinhoodSignatureError,
  NakamaRobinhoodWrongChainError,
} from './errors.js';

export const NAKAMA_DECISION_DOMAIN_NAME =
  'Nakama Protection Decision' as const;
export const NAKAMA_DECISION_DOMAIN_VERSION = '1' as const;

function freezeTypeFields<
  T extends readonly Readonly<{ name: string; type: string }>[],
>(fields: T): T {
  for (const field of fields) Object.freeze(field);
  return Object.freeze(fields);
}

const NAKAMA_DECISION_EIP712_DOMAIN_FIELDS = freezeTypeFields([
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
] as const);

const NAKAMA_DECISION_FIELDS = freezeTypeFields([
  { name: 'programId', type: 'bytes32' },
  { name: 'requestId', type: 'bytes32' },
  { name: 'termsCommitment', type: 'bytes32' },
  { name: 'evidenceManifestCommitment', type: 'bytes32' },
  { name: 'evidenceVersion', type: 'uint32' },
  { name: 'reviewRound', type: 'uint8' },
  { name: 'reviewerRole', type: 'uint8' },
  { name: 'action', type: 'uint8' },
  { name: 'approvedAmount', type: 'uint256' },
  { name: 'recipientCommitment', type: 'bytes32' },
  { name: 'publicReasonCode', type: 'bytes32' },
  { name: 'nonce', type: 'uint256' },
  { name: 'validUntil', type: 'uint64' },
] as const);

export const NAKAMA_DECISION_EIP712_TYPES = Object.freeze({
  EIP712Domain: NAKAMA_DECISION_EIP712_DOMAIN_FIELDS,
  Decision: NAKAMA_DECISION_FIELDS,
});

export const NAKAMA_DECISION_REVIEW_ROUND = Object.freeze({
  initial: 1,
  appeal: 2,
} as const);

export const NAKAMA_DECISION_REVIEWER_ROLE = Object.freeze({
  initialReviewer: 1,
  appealReviewer: 2,
} as const);

export const NAKAMA_DECISION_ACTION = Object.freeze({
  requestInformation: 1,
  approve: 2,
  deny: 3,
} as const);

const ZERO_BYTES32 = `0x${'00'.repeat(32)}` as Bytes32;
const DECISION_MESSAGE_FIELDS = [
  'programId',
  'requestId',
  'termsCommitment',
  'evidenceManifestCommitment',
  'evidenceVersion',
  'reviewRound',
  'reviewerRole',
  'action',
  'approvedAmount',
  'recipientCommitment',
  'publicReasonCode',
  'nonce',
  'validUntil',
] as const;

export type DecisionReviewRoundCode = 1 | 2;
export type DecisionReviewerRoleCode = 1 | 2;
export type DecisionActionCode = 1 | 2 | 3;

export interface NakamaDecisionMessage {
  programId: Bytes32;
  requestId: Bytes32;
  termsCommitment: Bytes32;
  evidenceManifestCommitment: Bytes32;
  evidenceVersion: number;
  reviewRound: DecisionReviewRoundCode;
  reviewerRole: DecisionReviewerRoleCode;
  action: DecisionActionCode;
  approvedAmount: bigint;
  recipientCommitment: Bytes32;
  publicReasonCode: Bytes32;
  nonce: bigint;
  validUntil: bigint;
}

export interface NakamaDecisionTypedData {
  domain: {
    name: typeof NAKAMA_DECISION_DOMAIN_NAME;
    version: typeof NAKAMA_DECISION_DOMAIN_VERSION;
    chainId: number;
    verifyingContract: Address;
  };
  types: typeof NAKAMA_DECISION_EIP712_TYPES;
  primaryType: 'Decision';
  message: NakamaDecisionMessage;
}

export interface NakamaDecisionSigningPayload {
  version: 1;
  network: RobinhoodNetwork;
  chainId: number;
  accountId: RobinhoodCaip10;
  kind: 'typed_data';
  authorizationType: 'program_decision';
  typedData: NakamaDecisionTypedData;
}

export interface NakamaDecisionPreview {
  title: 'Program decision';
  network: RobinhoodNetwork;
  reviewer: Address;
  decisionModule: Address;
  programId: Bytes32;
  requestId: Bytes32;
  termsCommitment: Bytes32;
  evidenceManifestCommitment: Bytes32;
  evidenceVersion: number;
  reviewRound: DecisionReviewRoundCode;
  reviewerRole: DecisionReviewerRoleCode;
  action: DecisionActionCode;
  approvedAmountBaseUnits: string;
  recipientCommitment: Bytes32;
  publicReasonCode: Bytes32;
  nonce: string;
  validUntilUnixSeconds: string;
}

export interface VerifiedNakamaDecision {
  digest: Hex;
  replayKey: Hex;
  signer: Address;
  typedData: NakamaDecisionTypedData;
}

export interface VerifyNakamaDecisionOptions {
  network: RobinhoodNetwork;
  typedData: NakamaDecisionTypedData;
  signature: Hex;
  expectedSigner: string;
  expectedDecisionModule: string;
  expectedNonce: bigint;
  now?: Date | number | bigint;
  /** Required for EIP-1271 contract signers. */
  client?: RobinhoodPublicClient;
}

export function createNakamaDecisionTypedData(params: {
  network: RobinhoodNetwork;
  decisionModule: string;
  message: NakamaDecisionMessage;
}): NakamaDecisionTypedData {
  const decisionModule = normalizeRobinhoodAddress(params.decisionModule);
  if (decisionModule === zeroAddress) {
    throw new NakamaRobinhoodSignatureError(
      'Decision EIP-712 verifying contract cannot be the zero address.',
    );
  }
  const message = Object.freeze(normalizeDecisionMessage(params.message));
  return Object.freeze({
    domain: Object.freeze({
      name: NAKAMA_DECISION_DOMAIN_NAME,
      version: NAKAMA_DECISION_DOMAIN_VERSION,
      chainId: getRobinhoodChainId(params.network),
      verifyingContract: decisionModule,
    }),
    types: NAKAMA_DECISION_EIP712_TYPES,
    primaryType: 'Decision',
    message,
  });
}

export function createNakamaDecisionSigningPayload(params: {
  network: RobinhoodNetwork;
  reviewer: string;
  decisionModule: string;
  message: NakamaDecisionMessage;
}): NakamaDecisionSigningPayload {
  const reviewer = normalizeRobinhoodAddress(params.reviewer);
  if (reviewer === zeroAddress) {
    throw new NakamaRobinhoodSignatureError(
      'Decision reviewer cannot be the zero address.',
    );
  }
  return Object.freeze({
    version: 1,
    network: params.network,
    chainId: getRobinhoodChainId(params.network),
    accountId: toRobinhoodCaip10(params.network, reviewer),
    kind: 'typed_data',
    authorizationType: 'program_decision',
    typedData: createNakamaDecisionTypedData(params),
  });
}

export function createNakamaDecisionPreview(
  payload: NakamaDecisionSigningPayload,
): NakamaDecisionPreview {
  const canonical = validateNakamaDecisionSigningPayload(payload);
  const message = canonical.typedData.message;
  return Object.freeze({
    title: 'Program decision',
    network: canonical.network,
    reviewer: parseRobinhoodCaip10({
      network: canonical.network,
      accountId: canonical.accountId,
    }),
    decisionModule: canonical.typedData.domain.verifyingContract,
    programId: message.programId,
    requestId: message.requestId,
    termsCommitment: message.termsCommitment,
    evidenceManifestCommitment: message.evidenceManifestCommitment,
    evidenceVersion: message.evidenceVersion,
    reviewRound: message.reviewRound,
    reviewerRole: message.reviewerRole,
    action: message.action,
    approvedAmountBaseUnits: message.approvedAmount.toString(10),
    recipientCommitment: message.recipientCommitment,
    publicReasonCode: message.publicReasonCode,
    nonce: message.nonce.toString(10),
    validUntilUnixSeconds: message.validUntil.toString(10),
  });
}

export function hashNakamaDecision(typedData: NakamaDecisionTypedData): Hex {
  return hashTypedData(toViemDecisionTypedData(typedData));
}

export function nakamaDecisionReplayKey(
  typedData: NakamaDecisionTypedData,
): Hex {
  return keccak256(
    encodePacked(
      [
        'string',
        'uint256',
        'address',
        'bytes32',
        'bytes32',
        'uint8',
        'uint8',
        'uint256',
      ],
      [
        'nakama:program-decision:v1',
        BigInt(typedData.domain.chainId),
        typedData.domain.verifyingContract,
        typedData.message.programId,
        typedData.message.requestId,
        typedData.message.reviewRound,
        typedData.message.reviewerRole,
        typedData.message.nonce,
      ],
    ),
  );
}

/** Rebuilds and validates the complete payload before display or signing. */
export function validateNakamaDecisionSigningPayload(
  payload: NakamaDecisionSigningPayload,
): NakamaDecisionSigningPayload {
  assertExactObjectFields(
    payload as unknown as Record<string, unknown>,
    [
      'version',
      'network',
      'chainId',
      'accountId',
      'kind',
      'authorizationType',
      'typedData',
    ],
    'Decision signing payload',
  );
  if (
    payload.version !== 1 ||
    (payload.network !== 'mainnet' && payload.network !== 'testnet') ||
    payload.chainId !== getRobinhoodChainId(payload.network) ||
    payload.kind !== 'typed_data' ||
    payload.authorizationType !== 'program_decision'
  ) {
    throw new NakamaRobinhoodSignatureError(
      'Decision signing payload envelope is not canonical.',
    );
  }
  const reviewer = parseRobinhoodCaip10({
    network: payload.network,
    accountId: payload.accountId,
  });
  if (reviewer === zeroAddress) {
    throw new NakamaRobinhoodSignatureError(
      'Decision reviewer cannot be the zero address.',
    );
  }
  const typedData = createNakamaDecisionTypedData({
    network: payload.network,
    decisionModule: payload.typedData.domain.verifyingContract,
    message: payload.typedData.message,
  });
  assertCanonicalDecisionTypedData(payload.typedData, typedData);
  return Object.freeze({
    version: 1,
    network: payload.network,
    chainId: getRobinhoodChainId(payload.network),
    accountId: toRobinhoodCaip10(payload.network, reviewer),
    kind: 'typed_data',
    authorizationType: 'program_decision',
    typedData,
  });
}

export async function verifyNakamaDecision(
  options: VerifyNakamaDecisionOptions,
): Promise<VerifiedNakamaDecision> {
  const expectedModule = normalizeRobinhoodAddress(
    options.expectedDecisionModule,
  );
  const canonical = createNakamaDecisionTypedData({
    network: options.network,
    decisionModule: expectedModule,
    message: options.typedData.message,
  });
  assertCanonicalDecisionTypedData(options.typedData, canonical);
  assertUint(options.expectedNonce, 'expectedNonce');
  if (canonical.message.nonce !== options.expectedNonce) {
    throw new NakamaRobinhoodSignatureError(
      'Decision nonce does not match the trusted onchain nonce.',
      {
        details: {
          actualNonce: canonical.message.nonce.toString(10),
          expectedNonce: options.expectedNonce.toString(10),
        },
      },
    );
  }
  const now = toUnixSeconds(options.now);
  if (now > canonical.message.validUntil) {
    throw new NakamaRobinhoodSignatureError('Decision signature has expired.', {
      details: {
        now: now.toString(10),
        validUntil: canonical.message.validUntil.toString(10),
      },
    });
  }
  if (!isHex(options.signature) || options.signature === '0x') {
    throw new NakamaRobinhoodSignatureError(
      'Decision signature must be non-empty hex.',
    );
  }

  const signer = normalizeRobinhoodAddress(options.expectedSigner);
  if (signer === zeroAddress) {
    throw new NakamaRobinhoodSignatureError(
      'Expected decision signer cannot be the zero address.',
    );
  }

  if (options.client) {
    const actualChainId = await options.client.getChainId();
    const expectedChainId = getRobinhoodChainId(options.network);
    if (actualChainId !== expectedChainId) {
      throw new NakamaRobinhoodWrongChainError(
        `Signature verification RPC returned chainId ${actualChainId}; expected ${expectedChainId}.`,
        { details: { actualChainId, expectedChainId } },
      );
    }
    const valid = await options.client.verifyTypedData({
      address: signer,
      ...toViemDecisionTypedData(canonical),
      signature: options.signature,
    } as never);
    if (!valid) {
      throw new NakamaRobinhoodSignatureError(
        'Decision signature is not valid for the expected reviewer.',
        { details: { expectedSigner: signer } },
      );
    }
  } else {
    if (!isEoaSignature(options.signature)) {
      throw new NakamaRobinhoodSignatureError(
        'EIP-1271 signatures require a Robinhood public client.',
      );
    }
    const recovered = await recoverTypedDataAddress({
      ...toViemDecisionTypedData(canonical),
      signature: options.signature,
    });
    if (recovered !== signer) {
      throw new NakamaRobinhoodSignatureError(
        'Decision signature is not signed by the expected reviewer.',
        { details: { recoveredSigner: recovered, expectedSigner: signer } },
      );
    }
  }

  return {
    digest: hashNakamaDecision(canonical),
    replayKey: nakamaDecisionReplayKey(canonical),
    signer,
    typedData: canonical,
  };
}

/** Viem derives EIP712Domain itself; wallet JSON retains the explicit schema. */
export function toViemDecisionTypedData(typedData: NakamaDecisionTypedData) {
  return {
    ...typedData,
    types: { Decision: typedData.types.Decision },
  };
}

function normalizeDecisionMessage(
  message: NakamaDecisionMessage,
): NakamaDecisionMessage {
  assertExactObjectFields(
    message as unknown as Record<string, unknown>,
    DECISION_MESSAGE_FIELDS,
    'Decision message',
  );
  assertSafeUint(message.evidenceVersion, 'evidenceVersion', 32);
  assertSafeUint(message.reviewRound, 'reviewRound', 8);
  assertSafeUint(message.reviewerRole, 'reviewerRole', 8);
  assertSafeUint(message.action, 'action', 8);
  if (message.reviewRound !== 1 && message.reviewRound !== 2) {
    throw new NakamaRobinhoodSignatureError(
      'reviewRound must be Initial (1) or Appeal (2).',
      { details: { reviewRound: message.reviewRound } },
    );
  }
  if (message.reviewerRole !== 1 && message.reviewerRole !== 2) {
    throw new NakamaRobinhoodSignatureError(
      'reviewerRole must be InitialReviewer (1) or AppealReviewer (2).',
      { details: { reviewerRole: message.reviewerRole } },
    );
  }
  if (message.action < 1 || message.action > 3) {
    throw new NakamaRobinhoodSignatureError(
      'action must be RequestInformation (1), Approve (2), or Deny (3).',
      { details: { action: message.action } },
    );
  }
  assertUint(message.approvedAmount, 'approvedAmount');
  assertUint(message.nonce, 'nonce');
  assertUint(message.validUntil, 'validUntil', 64);
  if (message.evidenceVersion === 0) {
    throw new NakamaRobinhoodSignatureError(
      'evidenceVersion must be greater than zero.',
    );
  }
  if (message.reviewRound !== message.reviewerRole) {
    throw new NakamaRobinhoodSignatureError(
      'reviewRound must match its canonical reviewerRole.',
      {
        details: {
          reviewRound: message.reviewRound,
          reviewerRole: message.reviewerRole,
        },
      },
    );
  }
  if (message.validUntil === 0n) {
    throw new NakamaRobinhoodSignatureError(
      'validUntil must be greater than zero.',
    );
  }
  const programId = assertNonZeroBytes32(message.programId, 'programId');
  const requestId = assertNonZeroBytes32(message.requestId, 'requestId');
  const termsCommitment = assertNonZeroBytes32(
    message.termsCommitment,
    'termsCommitment',
  );
  const evidenceManifestCommitment = assertNonZeroBytes32(
    message.evidenceManifestCommitment,
    'evidenceManifestCommitment',
  );
  const recipientCommitment = assertBytes32(
    message.recipientCommitment,
    'recipientCommitment',
  );
  const publicReasonCode = assertNonZeroBytes32(
    message.publicReasonCode,
    'publicReasonCode',
  );
  if (message.action === NAKAMA_DECISION_ACTION.approve) {
    if (
      message.approvedAmount === 0n ||
      recipientCommitment.toLowerCase() === ZERO_BYTES32
    ) {
      throw new NakamaRobinhoodSignatureError(
        'Approve decisions require a positive amount and nonzero recipient commitment.',
      );
    }
  } else if (
    message.approvedAmount !== 0n ||
    recipientCommitment.toLowerCase() !== ZERO_BYTES32
  ) {
    throw new NakamaRobinhoodSignatureError(
      'Non-approve decisions require zero amount and zero recipient commitment.',
    );
  }
  return {
    programId,
    requestId,
    termsCommitment,
    evidenceManifestCommitment,
    evidenceVersion: message.evidenceVersion,
    reviewRound: message.reviewRound,
    reviewerRole: message.reviewerRole,
    action: message.action,
    approvedAmount: message.approvedAmount,
    recipientCommitment,
    publicReasonCode,
    nonce: message.nonce,
    validUntil: message.validUntil,
  };
}

function assertCanonicalDecisionTypedData(
  actual: NakamaDecisionTypedData,
  canonical: NakamaDecisionTypedData,
): void {
  assertExactObjectFields(
    actual as unknown as Record<string, unknown>,
    ['domain', 'types', 'primaryType', 'message'],
    'Decision typed data',
  );
  assertExactObjectFields(
    actual.domain as unknown as Record<string, unknown>,
    ['name', 'version', 'chainId', 'verifyingContract'],
    'Decision domain',
  );
  if (
    actual.primaryType !== canonical.primaryType ||
    actual.domain.name !== canonical.domain.name ||
    actual.domain.version !== canonical.domain.version ||
    actual.domain.chainId !== canonical.domain.chainId ||
    normalizeRobinhoodAddress(actual.domain.verifyingContract) !==
      canonical.domain.verifyingContract ||
    JSON.stringify(actual.types) !== JSON.stringify(canonical.types) ||
    !decisionMessagesEqual(actual.message, canonical.message)
  ) {
    throw new NakamaRobinhoodSignatureError(
      'Decision EIP-712 domain or type schema is not canonical.',
      {
        details: {
          chainId: actual.domain.chainId,
          verifyingContract: actual.domain.verifyingContract,
        },
      },
    );
  }
}

function assertNonZeroBytes32(value: string, field: string): Bytes32 {
  const normalized = assertBytes32(value, field);
  if (normalized.toLowerCase() === ZERO_BYTES32) {
    throw new NakamaRobinhoodSignatureError(`${field} cannot be zero.`);
  }
  return normalized;
}

function decisionMessagesEqual(
  actual: NakamaDecisionMessage,
  canonical: NakamaDecisionMessage,
): boolean {
  return DECISION_MESSAGE_FIELDS.every(
    (field) => actual[field] === canonical[field],
  );
}

function assertExactObjectFields(
  value: Record<string, unknown>,
  fields: readonly string[],
  label: string,
): void {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    throw new NakamaRobinhoodSignatureError(`${label} must be an object.`);
  }
  const expected = new Set(fields);
  const missing = fields.filter((field) => !(field in value));
  const extra = Object.keys(value).filter((field) => !expected.has(field));
  if (missing.length > 0 || extra.length > 0) {
    throw new NakamaRobinhoodSignatureError(
      `${label} fields do not match the canonical schema.`,
      { details: { missing, extra } },
    );
  }
}

function toUnixSeconds(value: Date | number | bigint | undefined): bigint {
  if (value == null) return BigInt(Math.floor(Date.now() / 1_000));
  if (typeof value === 'bigint') return value;
  if (value instanceof Date) {
    const milliseconds = value.getTime();
    if (!Number.isFinite(milliseconds)) {
      throw new NakamaRobinhoodSignatureError('Invalid verification date.');
    }
    return BigInt(Math.floor(milliseconds / 1_000));
  }
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new NakamaRobinhoodSignatureError(
      'now must be a Unix-second integer, bigint, or Date.',
    );
  }
  return BigInt(value);
}

function isEoaSignature(value: Hex): boolean {
  return /^0x[0-9a-f]{128}$/i.test(value) || /^0x[0-9a-f]{130}$/i.test(value);
}
