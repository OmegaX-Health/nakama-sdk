import {
  getAddress,
  isAddress,
  zeroAddress,
  type Address,
  type Hex,
} from 'viem';

import {
  NakamaEthereumConfigError,
  NakamaEthereumWrongChainError,
} from './errors.js';

export const NAKAMA_CLAIM_RECIPIENT_DOMAIN_NAME =
  'Nakama Policy Registry' as const;
export const NAKAMA_CLAIM_RECIPIENT_DOMAIN_VERSION = '1' as const;

export const CLAIM_RECIPIENT_EIP712_TYPES = {
  ClaimRecipient: [
    { name: 'claimId', type: 'bytes32' },
    { name: 'recipient', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
} as const;

export interface CanonicalClaimRecipientSigningTypedData {
  domain: {
    name: typeof NAKAMA_CLAIM_RECIPIENT_DOMAIN_NAME;
    version: typeof NAKAMA_CLAIM_RECIPIENT_DOMAIN_VERSION;
    chainId: 1;
    verifyingContract: Address;
  };
  types: typeof CLAIM_RECIPIENT_EIP712_TYPES;
  primaryType: 'ClaimRecipient';
  message: {
    claimId: Hex;
    recipient: Address;
    nonce: bigint;
    deadline: bigint;
  };
}

export function validateCanonicalClaimRecipientSigningTypedData(
  input: unknown,
): CanonicalClaimRecipientSigningTypedData {
  const typedData = requireRecord(input, 'typedData');
  assertExactKeys(
    typedData,
    ['domain', 'types', 'primaryType', 'message'],
    'typedData',
  );
  if (typedData.primaryType !== 'ClaimRecipient') {
    throw new NakamaEthereumConfigError(
      'Claim-recipient typedData.primaryType must be ClaimRecipient.',
      { details: { primaryType: typedData.primaryType } },
    );
  }

  const domain = requireRecord(typedData.domain, 'typedData.domain');
  assertExactKeys(
    domain,
    ['name', 'version', 'chainId', 'verifyingContract'],
    'typedData.domain',
  );
  if (domain.chainId !== 1) {
    throw new NakamaEthereumWrongChainError(
      'Claim-recipient EIP-712 domain chainId must be 1.',
      { details: { actualChainId: domain.chainId, expectedChainId: 1 } },
    );
  }
  if (
    domain.name !== NAKAMA_CLAIM_RECIPIENT_DOMAIN_NAME ||
    domain.version !== NAKAMA_CLAIM_RECIPIENT_DOMAIN_VERSION
  ) {
    throw new NakamaEthereumConfigError(
      'Claim-recipient EIP-712 domain name and version are not canonical.',
      {
        details: {
          name: domain.name,
          version: domain.version,
        },
      },
    );
  }
  const verifyingContract = requireNonzeroAddress(
    domain.verifyingContract,
    'typedData.domain.verifyingContract',
  );

  const types = requireRecord(typedData.types, 'typedData.types');
  assertExactKeys(types, ['ClaimRecipient'], 'typedData.types');
  const claimRecipientFields = types.ClaimRecipient;
  if (
    !Array.isArray(claimRecipientFields) ||
    claimRecipientFields.length !==
      CLAIM_RECIPIENT_EIP712_TYPES.ClaimRecipient.length
  ) {
    throw new NakamaEthereumConfigError(
      'Claim-recipient typedData.types must use the canonical ClaimRecipient schema.',
    );
  }
  for (const [index, expected] of Object.entries(
    CLAIM_RECIPIENT_EIP712_TYPES.ClaimRecipient,
  )) {
    const field = requireRecord(
      claimRecipientFields[Number(index)],
      `typedData.types.ClaimRecipient[${index}]`,
    );
    assertExactKeys(
      field,
      ['name', 'type'],
      `typedData.types.ClaimRecipient[${index}]`,
    );
    if (field.name !== expected.name || field.type !== expected.type) {
      throw new NakamaEthereumConfigError(
        'Claim-recipient typedData.types must use the canonical ClaimRecipient schema.',
        { details: { fieldIndex: Number(index) } },
      );
    }
  }

  const message = requireRecord(typedData.message, 'typedData.message');
  assertExactKeys(
    message,
    ['claimId', 'recipient', 'nonce', 'deadline'],
    'typedData.message',
  );
  if (
    typeof message.claimId !== 'string' ||
    !/^0x[0-9a-f]{64}$/iu.test(message.claimId)
  ) {
    throw new NakamaEthereumConfigError(
      'Claim-recipient typedData.message.claimId must be bytes32.',
    );
  }

  return {
    domain: {
      name: NAKAMA_CLAIM_RECIPIENT_DOMAIN_NAME,
      version: NAKAMA_CLAIM_RECIPIENT_DOMAIN_VERSION,
      chainId: 1,
      verifyingContract,
    },
    types: CLAIM_RECIPIENT_EIP712_TYPES,
    primaryType: 'ClaimRecipient',
    message: {
      claimId: message.claimId as Hex,
      recipient: requireNonzeroAddress(
        message.recipient,
        'typedData.message.recipient',
      ),
      nonce: requireUint256(message.nonce, 'typedData.message.nonce'),
      deadline: requireUint256(message.deadline, 'typedData.message.deadline'),
    },
  };
}

function requireRecord(value: unknown, label: string): Record<string, unknown> {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    throw new NakamaEthereumConfigError(`${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function assertExactKeys(
  value: Record<string, unknown>,
  expectedKeys: readonly string[],
  label: string,
): void {
  const actual = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  if (
    actual.length !== expected.length ||
    actual.some((key, index) => key !== expected[index])
  ) {
    throw new NakamaEthereumConfigError(
      `${label} must contain exactly: ${expectedKeys.join(', ')}.`,
      { details: { actualKeys: actual, expectedKeys } },
    );
  }
}

function requireNonzeroAddress(value: unknown, label: string): Address {
  if (typeof value !== 'string' || !isAddress(value, { strict: false })) {
    throw new NakamaEthereumConfigError(
      `${label} must be a valid Ethereum address.`,
    );
  }
  const address = getAddress(value);
  if (address === zeroAddress) {
    throw new NakamaEthereumConfigError(`${label} cannot be the zero address.`);
  }
  return address;
}

function requireUint256(value: unknown, label: string): bigint {
  let normalized: bigint;
  if (typeof value === 'bigint') {
    normalized = value;
  } else if (
    typeof value === 'string' &&
    value.length <= 78 &&
    /^(0|[1-9][0-9]*)$/u.test(value)
  ) {
    normalized = BigInt(value);
  } else {
    throw new NakamaEthereumConfigError(
      `${label} must be a canonical decimal string or bigint.`,
    );
  }
  if (normalized < 0n || normalized >= 1n << 256n) {
    throw new NakamaEthereumConfigError(`${label} must fit uint256.`);
  }
  return normalized;
}
