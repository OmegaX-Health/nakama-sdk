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
  NakamaEthereumAttestationError,
  NakamaEthereumReplayError,
  NakamaEthereumWrongChainError,
} from './errors.js';
import {
  CLAIM_RECIPIENT_EIP712_TYPES,
  NAKAMA_CLAIM_RECIPIENT_DOMAIN_NAME,
  NAKAMA_CLAIM_RECIPIENT_DOMAIN_VERSION,
} from './ethereum_claim_recipient_schema.js';
import {
  ETHEREUM_MAINNET_CHAIN_ID,
  createEip712SigningPayload,
  normalizeEthereumAddress,
  type EthereumPublicClient,
  type TypedDataSigningPayloadV2,
} from './ethereum.js';

export {
  CLAIM_RECIPIENT_EIP712_TYPES,
  NAKAMA_CLAIM_RECIPIENT_DOMAIN_NAME,
  NAKAMA_CLAIM_RECIPIENT_DOMAIN_VERSION,
};

export interface ClaimRecipientAuthorizationMessage {
  claimId: Hex;
  recipient: Address;
  nonce: bigint;
  deadline: bigint;
}

export interface ClaimRecipientAuthorizationTypedData {
  domain: {
    name: typeof NAKAMA_CLAIM_RECIPIENT_DOMAIN_NAME;
    version: typeof NAKAMA_CLAIM_RECIPIENT_DOMAIN_VERSION;
    chainId: typeof ETHEREUM_MAINNET_CHAIN_ID;
    verifyingContract: Address;
  };
  types: typeof CLAIM_RECIPIENT_EIP712_TYPES;
  primaryType: 'ClaimRecipient';
  message: ClaimRecipientAuthorizationMessage;
}

export interface ClaimRecipientAuthorizationSigningPayloadV2 extends Omit<
  TypedDataSigningPayloadV2,
  'typedData'
> {
  typedData: ClaimRecipientAuthorizationTypedData;
}

export interface VerifyClaimRecipientAuthorizationOptions {
  typedData: ClaimRecipientAuthorizationTypedData;
  signature: Hex;
  expectedClaimant: string;
  expectedVerifyingContract: string;
  expectedNonce: bigint;
  now?: Date | number | bigint;
  /**
   * Enables ERC-1271 verification through viem. Without a client, verification
   * accepts canonical EOA signatures only.
   */
  client?: EthereumPublicClient;
}

export interface VerifiedClaimRecipientAuthorization {
  digest: Hex;
  nonceReplayKey: Hex;
  claimant: Address;
  typedData: ClaimRecipientAuthorizationTypedData;
}

/**
 * A replay guard must atomically consume every key or consume none. Production
 * services should back this with their durable database, not process memory.
 */
export interface ClaimRecipientReplayGuard {
  consume(keys: readonly Hex[]): Promise<boolean> | boolean;
}

export class InMemoryClaimRecipientReplayGuard implements ClaimRecipientReplayGuard {
  readonly #consumed = new Set<Hex>();

  consume(keys: readonly Hex[]): boolean {
    if (keys.some((key) => this.#consumed.has(key))) return false;
    for (const key of keys) this.#consumed.add(key);
    return true;
  }
}

export function createClaimRecipientAuthorizationTypedData(params: {
  verifyingContract: string;
  message: ClaimRecipientAuthorizationMessage;
}): ClaimRecipientAuthorizationTypedData {
  const verifyingContract = normalizeEthereumAddress(params.verifyingContract);
  if (verifyingContract === zeroAddress) {
    throw new NakamaEthereumAttestationError(
      'Claim-recipient authorization cannot target the zero address.',
    );
  }

  return {
    domain: {
      name: NAKAMA_CLAIM_RECIPIENT_DOMAIN_NAME,
      version: NAKAMA_CLAIM_RECIPIENT_DOMAIN_VERSION,
      chainId: ETHEREUM_MAINNET_CHAIN_ID,
      verifyingContract,
    },
    types: CLAIM_RECIPIENT_EIP712_TYPES,
    primaryType: 'ClaimRecipient',
    message: normalizeClaimRecipientMessage(params.message),
  };
}

export function createClaimRecipientAuthorizationSigningPayload(params: {
  account: string;
  verifyingContract: string;
  message: ClaimRecipientAuthorizationMessage;
}): ClaimRecipientAuthorizationSigningPayloadV2 {
  const typedData = createClaimRecipientAuthorizationTypedData(params);
  const payload = createEip712SigningPayload({
    account: params.account,
    typedData: typedData as never,
  });
  return { ...payload, typedData };
}

export function hashClaimRecipientAuthorization(
  typedData: ClaimRecipientAuthorizationTypedData,
): Hex {
  return hashTypedData(typedData);
}

export async function verifyClaimRecipientAuthorization(
  options: VerifyClaimRecipientAuthorizationOptions,
): Promise<VerifiedClaimRecipientAuthorization> {
  const expectedVerifyingContract = normalizeEthereumAddress(
    options.expectedVerifyingContract,
  );
  const canonical = createClaimRecipientAuthorizationTypedData({
    verifyingContract: expectedVerifyingContract,
    message: options.typedData.message,
  });
  assertCanonicalTypedData(options.typedData, canonical);

  assertUint256(options.expectedNonce, 'expectedNonce');
  if (canonical.message.nonce !== options.expectedNonce) {
    throw new NakamaEthereumAttestationError(
      'Claim-recipient nonce does not match the trusted onchain nonce.',
      {
        details: {
          actualNonce: canonical.message.nonce.toString(),
          expectedNonce: options.expectedNonce.toString(),
        },
      },
    );
  }

  const now = toUnixSeconds(options.now);
  if (now > canonical.message.deadline) {
    throw new NakamaEthereumAttestationError(
      'Claim-recipient authorization has expired.',
      {
        details: {
          deadline: canonical.message.deadline.toString(),
          now: now.toString(),
        },
      },
    );
  }
  if (!isNonEmptyHex(options.signature)) {
    throw new NakamaEthereumAttestationError(
      'Claim-recipient authorization signature must be non-empty hex.',
    );
  }

  const claimant = normalizeEthereumAddress(options.expectedClaimant);
  if (claimant === zeroAddress) {
    throw new NakamaEthereumAttestationError(
      'Expected claimant cannot be the zero address.',
    );
  }

  if (options.client) {
    const chainId = await options.client.getChainId();
    if (chainId !== ETHEREUM_MAINNET_CHAIN_ID) {
      throw new NakamaEthereumWrongChainError(
        `Signature verification RPC returned chainId ${chainId}; expected Ethereum mainnet.`,
        { details: { chainId, expectedChainId: ETHEREUM_MAINNET_CHAIN_ID } },
      );
    }
    const valid = await options.client.verifyTypedData({
      address: claimant,
      ...canonical,
      signature: options.signature,
    } as never);
    if (!valid) {
      throw new NakamaEthereumAttestationError(
        'Claim-recipient authorization is not valid for the expected claimant.',
        { details: { expectedClaimant: claimant } },
      );
    }
  } else {
    if (!isEoaSignatureHex(options.signature)) {
      throw new NakamaEthereumAttestationError(
        'ERC-1271 signatures require an Ethereum public client.',
      );
    }
    const recovered = await recoverTypedDataAddress({
      ...canonical,
      signature: options.signature,
    });
    if (recovered !== claimant) {
      throw new NakamaEthereumAttestationError(
        'Claim-recipient authorization is not signed by the expected claimant.',
        {
          details: {
            recoveredClaimant: recovered,
            expectedClaimant: claimant,
          },
        },
      );
    }
  }

  const digest = hashClaimRecipientAuthorization(canonical);
  return {
    digest,
    nonceReplayKey: claimRecipientNonceReplayKey(canonical),
    claimant,
    typedData: canonical,
  };
}

export async function verifyAndConsumeClaimRecipientAuthorization(
  options: VerifyClaimRecipientAuthorizationOptions & {
    replayGuard: ClaimRecipientReplayGuard;
  },
): Promise<VerifiedClaimRecipientAuthorization> {
  const verified = await verifyClaimRecipientAuthorization(options);
  const consumed = await options.replayGuard.consume([
    verified.digest,
    verified.nonceReplayKey,
  ]);
  if (!consumed) {
    throw new NakamaEthereumReplayError(
      'Claim-recipient digest or claim nonce has already been consumed.',
      {
        details: {
          digest: verified.digest,
          nonceReplayKey: verified.nonceReplayKey,
        },
      },
    );
  }
  return verified;
}

export function claimRecipientNonceReplayKey(
  typedData: ClaimRecipientAuthorizationTypedData,
): Hex {
  return keccak256(
    encodePacked(
      ['string', 'address', 'bytes32', 'uint256'],
      [
        'nakama:claim-recipient-nonce:v1',
        typedData.domain.verifyingContract,
        typedData.message.claimId,
        typedData.message.nonce,
      ],
    ),
  );
}

function normalizeClaimRecipientMessage(
  message: ClaimRecipientAuthorizationMessage,
): ClaimRecipientAuthorizationMessage {
  const recipient = normalizeEthereumAddress(message.recipient);
  if (recipient === zeroAddress) {
    throw new NakamaEthereumAttestationError(
      'Claim recipient cannot be the zero address.',
    );
  }
  assertUint256(message.nonce, 'nonce');
  assertUint256(message.deadline, 'deadline');

  return {
    claimId: requireBytes32(message.claimId, 'claimId'),
    recipient,
    nonce: message.nonce,
    deadline: message.deadline,
  };
}

function assertCanonicalTypedData(
  actual: ClaimRecipientAuthorizationTypedData,
  canonical: ClaimRecipientAuthorizationTypedData,
): void {
  const actualDomain = actual.domain;
  if (
    actual.primaryType !== canonical.primaryType ||
    actualDomain.name !== canonical.domain.name ||
    actualDomain.version !== canonical.domain.version ||
    actualDomain.chainId !== ETHEREUM_MAINNET_CHAIN_ID ||
    normalizeEthereumAddress(actualDomain.verifyingContract) !==
      canonical.domain.verifyingContract ||
    JSON.stringify(actual.types) !== JSON.stringify(canonical.types)
  ) {
    throw new NakamaEthereumAttestationError(
      'Claim-recipient EIP-712 domain or type schema is not canonical.',
      {
        details: {
          chainId: actualDomain.chainId,
          verifyingContract: actualDomain.verifyingContract,
        },
      },
    );
  }
}

function toUnixSeconds(value: Date | number | bigint | undefined): bigint {
  if (value == null) return BigInt(Math.floor(Date.now() / 1_000));
  if (typeof value === 'bigint') return value;
  if (value instanceof Date) {
    const milliseconds = value.getTime();
    if (!Number.isFinite(milliseconds)) {
      throw new NakamaEthereumAttestationError('Invalid verification date.');
    }
    return BigInt(Math.floor(milliseconds / 1_000));
  }
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new NakamaEthereumAttestationError(
      'now must be a Unix-second integer, bigint, or Date.',
    );
  }
  return BigInt(value);
}

function assertUint256(value: unknown, field: string): asserts value is bigint {
  const uint256Max = (1n << 256n) - 1n;
  if (typeof value !== 'bigint' || value < 0n || value > uint256Max) {
    throw new NakamaEthereumAttestationError(
      `${field} must be a uint256 bigint.`,
      { details: { field, value: String(value) } },
    );
  }
}

function requireBytes32(value: unknown, field: string): Hex {
  if (
    typeof value !== 'string' ||
    !isHex(value) ||
    !/^0x[0-9a-f]{64}$/i.test(value)
  ) {
    throw new NakamaEthereumAttestationError(
      `${field} must be a 32-byte 0x-prefixed hex value.`,
      { details: { field, value } },
    );
  }
  return value as Hex;
}

function isNonEmptyHex(value: unknown): value is Hex {
  return typeof value === 'string' && isHex(value) && value !== '0x';
}

function isEoaSignatureHex(value: Hex): boolean {
  return /^0x[0-9a-f]{128}$/i.test(value) || /^0x[0-9a-f]{130}$/i.test(value);
}
