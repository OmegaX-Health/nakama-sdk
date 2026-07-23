import { hashTypedData, zeroAddress, type Address, type Hex } from 'viem';

import {
  getRobinhoodChainId,
  normalizeRobinhoodAddress,
  type RobinhoodNetwork,
} from './chains.js';
import { assertBytes32, assertUint, type Bytes32 } from './domain.js';
import { NakamaRobinhoodSignatureError } from './errors.js';

export const NAKAMA_ELIGIBILITY_DOMAIN_NAME =
  'Nakama Membership Eligibility' as const;
export const NAKAMA_ELIGIBILITY_DOMAIN_VERSION = '1' as const;

function freezeTypeFields<
  T extends readonly Readonly<{ name: string; type: string }>[],
>(fields: T): T {
  for (const field of fields) Object.freeze(field);
  return Object.freeze(fields);
}

const EIP712_DOMAIN_FIELDS = freezeTypeFields([
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
] as const);

const ELIGIBILITY_FIELDS = freezeTypeFields([
  { name: 'programId', type: 'bytes32' },
  { name: 'memberCommitment', type: 'bytes32' },
  { name: 'account', type: 'address' },
  { name: 'termsCommitment', type: 'bytes32' },
  { name: 'privacyCommitment', type: 'bytes32' },
  { name: 'nonce', type: 'uint256' },
  { name: 'validUntil', type: 'uint64' },
] as const);

const ELIGIBILITY_REVOCATION_FIELDS = freezeTypeFields([
  { name: 'programId', type: 'bytes32' },
  { name: 'authorizationDigest', type: 'bytes32' },
  { name: 'nonce', type: 'uint256' },
  { name: 'validUntil', type: 'uint64' },
] as const);

export const NAKAMA_ELIGIBILITY_EIP712_TYPES = Object.freeze({
  EIP712Domain: EIP712_DOMAIN_FIELDS,
  Eligibility: ELIGIBILITY_FIELDS,
});

export const NAKAMA_ELIGIBILITY_REVOCATION_EIP712_TYPES = Object.freeze({
  EIP712Domain: EIP712_DOMAIN_FIELDS,
  EligibilityRevocation: ELIGIBILITY_REVOCATION_FIELDS,
});

export interface EligibilityAuthorization {
  programId: Bytes32;
  memberCommitment: Bytes32;
  account: Address;
  termsCommitment: Bytes32;
  privacyCommitment: Bytes32;
  nonce: bigint;
  validUntil: bigint;
}

export interface EligibilityRevocationAuthorization {
  programId: Bytes32;
  authorizationDigest: Bytes32;
  nonce: bigint;
  validUntil: bigint;
}

export interface NakamaEligibilityTypedData {
  domain: {
    name: typeof NAKAMA_ELIGIBILITY_DOMAIN_NAME;
    version: typeof NAKAMA_ELIGIBILITY_DOMAIN_VERSION;
    chainId: number;
    verifyingContract: Address;
  };
  types: typeof NAKAMA_ELIGIBILITY_EIP712_TYPES;
  primaryType: 'Eligibility';
  message: EligibilityAuthorization;
}

export interface NakamaEligibilityRevocationTypedData {
  domain: NakamaEligibilityTypedData['domain'];
  types: typeof NAKAMA_ELIGIBILITY_REVOCATION_EIP712_TYPES;
  primaryType: 'EligibilityRevocation';
  message: EligibilityRevocationAuthorization;
}

export function createNakamaEligibilityTypedData(params: {
  network: RobinhoodNetwork;
  membershipRegistry: string;
  message: EligibilityAuthorization;
}): NakamaEligibilityTypedData {
  const domain = createEligibilityDomain(params);
  return Object.freeze({
    domain,
    types: NAKAMA_ELIGIBILITY_EIP712_TYPES,
    primaryType: 'Eligibility',
    message: Object.freeze(normalizeEligibility(params.message)),
  });
}

export function createNakamaEligibilityRevocationTypedData(params: {
  network: RobinhoodNetwork;
  membershipRegistry: string;
  message: EligibilityRevocationAuthorization;
}): NakamaEligibilityRevocationTypedData {
  const domain = createEligibilityDomain(params);
  return Object.freeze({
    domain,
    types: NAKAMA_ELIGIBILITY_REVOCATION_EIP712_TYPES,
    primaryType: 'EligibilityRevocation',
    message: Object.freeze(normalizeEligibilityRevocation(params.message)),
  });
}

export function hashNakamaEligibilityAuthorization(
  typedData: NakamaEligibilityTypedData,
): Hex {
  return hashTypedData({
    ...typedData,
    types: { Eligibility: typedData.types.Eligibility },
  });
}

export function hashNakamaEligibilityRevocation(
  typedData: NakamaEligibilityRevocationTypedData,
): Hex {
  return hashTypedData({
    ...typedData,
    types: {
      EligibilityRevocation: typedData.types.EligibilityRevocation,
    },
  });
}

function createEligibilityDomain(params: {
  network: RobinhoodNetwork;
  membershipRegistry: string;
}): NakamaEligibilityTypedData['domain'] {
  const membershipRegistry = normalizeRobinhoodAddress(
    params.membershipRegistry,
  );
  if (membershipRegistry === zeroAddress) {
    throw new NakamaRobinhoodSignatureError(
      'Eligibility EIP-712 verifying contract cannot be the zero address.',
    );
  }
  return Object.freeze({
    name: NAKAMA_ELIGIBILITY_DOMAIN_NAME,
    version: NAKAMA_ELIGIBILITY_DOMAIN_VERSION,
    chainId: getRobinhoodChainId(params.network),
    verifyingContract: membershipRegistry,
  });
}

function normalizeEligibility(
  message: EligibilityAuthorization,
): EligibilityAuthorization {
  const account = normalizeRobinhoodAddress(message.account);
  if (account === zeroAddress) {
    throw new NakamaRobinhoodSignatureError(
      'Eligibility account cannot be the zero address.',
    );
  }
  return {
    programId: requireNonZeroBytes32(message.programId, 'programId'),
    memberCommitment: requireNonZeroBytes32(
      message.memberCommitment,
      'memberCommitment',
    ),
    account,
    termsCommitment: requireNonZeroBytes32(
      message.termsCommitment,
      'termsCommitment',
    ),
    privacyCommitment: requireNonZeroBytes32(
      message.privacyCommitment,
      'privacyCommitment',
    ),
    nonce: assertUint(message.nonce, 'nonce'),
    validUntil: assertUint(message.validUntil, 'validUntil', 64),
  };
}

function normalizeEligibilityRevocation(
  message: EligibilityRevocationAuthorization,
): EligibilityRevocationAuthorization {
  return {
    programId: requireNonZeroBytes32(message.programId, 'programId'),
    authorizationDigest: requireNonZeroBytes32(
      message.authorizationDigest,
      'authorizationDigest',
    ),
    nonce: assertUint(message.nonce, 'nonce'),
    validUntil: assertUint(message.validUntil, 'validUntil', 64),
  };
}

function requireNonZeroBytes32(value: string, field: string): Bytes32 {
  const normalized = assertBytes32(value, field);
  if (normalized === `0x${'00'.repeat(32)}`) {
    throw new NakamaRobinhoodSignatureError(`${field} cannot be zero.`);
  }
  return normalized;
}
