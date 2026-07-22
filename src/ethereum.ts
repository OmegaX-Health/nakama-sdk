import {
  createPublicClient,
  custom,
  getAddress,
  http,
  isAddress,
  isHex,
  type Address,
  type Hex,
  type PublicClient,
  type TypedData,
  type TypedDataDomain,
} from 'viem';
import { mainnet } from 'viem/chains';

import {
  NakamaEthereumAddressError,
  NakamaEthereumConfigError,
  NakamaEthereumWrongChainError,
} from './errors.js';

export const ETHEREUM_MAINNET_CHAIN_ID = 1 as const;
export const ETHEREUM_MAINNET_CHAIN_ID_HEX = '0x1' as const;
export const ETHEREUM_MAINNET_CAIP2 = 'eip155:1' as const;
/** EIP-7825 transaction gas-limit ceiling enforced by Ethereum mainnet. */
export const ETHEREUM_MAINNET_TRANSACTION_GAS_LIMIT_CAP = 0x1000000n;

export type EthereumMainnetCaip2 = typeof ETHEREUM_MAINNET_CAIP2;
export type EthereumMainnetCaip10 = `eip155:1:${Address}`;

export interface Eip1193ProviderLike {
  request(args: {
    method: string;
    params?: readonly unknown[] | Record<string, unknown>;
  }): Promise<unknown>;
}

export interface EthereumPublicClientOptions {
  /** HTTPS mainnet RPC, or explicit loopback HTTP for a local node. */
  rpcUrl?: string;
  /** An injected EIP-1193 provider. Mutually exclusive with rpcUrl. */
  provider?: Eip1193ProviderLike;
}

export type EthereumPublicClient = PublicClient;

/** Low-level request sent to an EIP-1193 wallet after canonical wire validation. */
export interface Eip1193WalletTransactionRequest {
  from: Address;
  to: Address;
  chainId: typeof ETHEREUM_MAINNET_CHAIN_ID_HEX;
  data: Hex;
  value: Hex;
  gas?: Hex;
  maxFeePerGas?: Hex;
  maxPriorityFeePerGas?: Hex;
  nonce?: Hex;
}

export interface ProtocolTransactionRequestV2 {
  from: Address;
  to: Address;
  data: Hex;
  value: Hex;
  gas?: Hex;
  maxFeePerGas?: Hex;
  maxPriorityFeePerGas?: Hex;
  nonce?: Hex;
}

export interface TransactionSigningPayloadV2 {
  version: 2;
  chainId: typeof ETHEREUM_MAINNET_CAIP2;
  accountId: EthereumMainnetCaip10;
  kind: 'transaction';
  transaction: ProtocolTransactionRequestV2;
  authorizationType?: never;
  typedData?: never;
}

export interface Eip712TypedDataDefinition {
  domain: TypedDataDomain;
  types: TypedData;
  primaryType: string;
  message: Record<string, unknown>;
}

export interface TypedDataSigningPayloadV2 {
  version: 2;
  chainId: typeof ETHEREUM_MAINNET_CAIP2;
  accountId: EthereumMainnetCaip10;
  kind: 'typed_data';
  authorizationType: 'claim_recipient';
  typedData: Eip712TypedDataDefinition;
  transaction?: never;
}

export type SigningPayloadV2 =
  | TransactionSigningPayloadV2
  | TypedDataSigningPayloadV2;

export interface ReceiptSubmissionV2 {
  version: 2;
  intentId: string;
  chainId: typeof ETHEREUM_MAINNET_CAIP2;
  accountId: EthereumMainnetCaip10;
  kind: 'transaction';
  txHash: Hex;
}

export interface AuthorizationSubmissionV2 {
  version: 2;
  intentId: string;
  chainId: typeof ETHEREUM_MAINNET_CAIP2;
  accountId: EthereumMainnetCaip10;
  kind: 'typed_data';
  authorizationType: 'claim_recipient';
  signature: Hex;
}

export type AuthorizationLifecycleStatusV2 =
  | 'received'
  | 'validated'
  | 'relayer_pending'
  | 'relayer_submitted'
  | 'confirmed'
  | 'rejected'
  | 'failed'
  | 'expired';

export interface AuthorizationStatusV2 {
  version: 2;
  authorizationId: string;
  intentId: string;
  chainId: typeof ETHEREUM_MAINNET_CAIP2;
  accountId: EthereumMainnetCaip10;
  authorizationType: 'claim_recipient';
  status: AuthorizationLifecycleStatusV2;
  relayerTxHash?: Hex;
  reasonCode?: string;
}

export function createEthereumPublicClient(
  options: EthereumPublicClientOptions = {},
): EthereumPublicClient {
  if (options.rpcUrl && options.provider) {
    throw new NakamaEthereumConfigError(
      'Configure either rpcUrl or provider, not both.',
      { details: { chainId: ETHEREUM_MAINNET_CHAIN_ID } },
    );
  }

  if (options.rpcUrl) assertSecureEthereumRpcUrl(options.rpcUrl);

  const transport = options.provider
    ? custom(options.provider as never)
    : http(options.rpcUrl);

  return createPublicClient({
    chain: mainnet,
    transport,
  }) as EthereumPublicClient;
}

export function normalizeEthereumAddress(value: string): Address {
  if (!isAddress(value, { strict: false })) {
    throw new NakamaEthereumAddressError(
      `Invalid Ethereum address "${value}".`,
      { details: { value } },
    );
  }
  return getAddress(value);
}

export function toEthereumMainnetCaip10(
  address: string,
): EthereumMainnetCaip10 {
  return `${ETHEREUM_MAINNET_CAIP2}:${normalizeEthereumAddress(address)}`;
}

export function parseEthereumMainnetCaip10(value: string): Address {
  const prefix = `${ETHEREUM_MAINNET_CAIP2}:`;
  if (!value.startsWith(prefix)) {
    throw new NakamaEthereumWrongChainError(
      `Expected an Ethereum mainnet CAIP-10 account beginning with "${prefix}".`,
      { details: { value, expectedCaip2: ETHEREUM_MAINNET_CAIP2 } },
    );
  }
  return normalizeEthereumAddress(value.slice(prefix.length));
}

export function createEip1193TransactionSigningPayload(
  transaction: ProtocolTransactionRequestV2,
): TransactionSigningPayloadV2 {
  const from = normalizeEthereumAddress(transaction.from);
  const to = normalizeEthereumAddress(transaction.to);

  for (const [field, value] of Object.entries({
    value: transaction.value,
    gas: transaction.gas,
    maxFeePerGas: transaction.maxFeePerGas,
    maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
    nonce: transaction.nonce,
  })) {
    if (value != null && !isRpcQuantity(value)) {
      throw new NakamaEthereumConfigError(
        `${field} must be a canonical 0x-prefixed JSON-RPC quantity.`,
        { details: { field, value } },
      );
    }
  }

  if (
    transaction.gas != null &&
    BigInt(transaction.gas) > ETHEREUM_MAINNET_TRANSACTION_GAS_LIMIT_CAP
  ) {
    throw new NakamaEthereumConfigError(
      'Transaction gas exceeds the EIP-7825 Ethereum mainnet limit of 0x1000000.',
      {
        details: {
          gas: transaction.gas,
          maximumGas: '0x1000000',
          eip: 7825,
        },
      },
    );
  }

  if (!isEvenLengthHex(transaction.data)) {
    throw new NakamaEthereumConfigError(
      'Transaction data must be an even-length 0x-prefixed hex value.',
      { details: { data: transaction.data } },
    );
  }

  return {
    version: 2,
    chainId: ETHEREUM_MAINNET_CAIP2,
    accountId: toEthereumMainnetCaip10(from),
    kind: 'transaction',
    transaction: {
      ...transaction,
      from,
      to,
    },
  };
}

export function createEip712SigningPayload(params: {
  account: string;
  typedData: Eip712TypedDataDefinition;
  authorizationType?: 'claim_recipient';
}): TypedDataSigningPayloadV2 {
  const domainChainId = Number(params.typedData.domain.chainId);
  if (domainChainId !== ETHEREUM_MAINNET_CHAIN_ID) {
    throw new NakamaEthereumWrongChainError(
      `EIP-712 domain chainId must be ${ETHEREUM_MAINNET_CHAIN_ID}.`,
      {
        details: {
          actualChainId: params.typedData.domain.chainId,
          expectedChainId: ETHEREUM_MAINNET_CHAIN_ID,
        },
      },
    );
  }

  return {
    version: 2,
    chainId: ETHEREUM_MAINNET_CAIP2,
    accountId: toEthereumMainnetCaip10(params.account),
    kind: 'typed_data',
    authorizationType: params.authorizationType ?? 'claim_recipient',
    typedData: params.typedData,
  };
}

export async function assertEip1193Mainnet(
  provider: Eip1193ProviderLike,
): Promise<void> {
  const chainId = await provider.request({ method: 'eth_chainId' });
  if (
    typeof chainId !== 'string' ||
    !isHex(chainId) ||
    Number.parseInt(chainId, 16) !== ETHEREUM_MAINNET_CHAIN_ID
  ) {
    throw new NakamaEthereumWrongChainError(
      'The connected wallet must already be on Ethereum mainnet.',
      {
        details: {
          actualChainId: chainId,
          expectedChainId: ETHEREUM_MAINNET_CHAIN_ID_HEX,
        },
      },
    );
  }
}

export async function requestSigningPayloadV2(
  provider: Eip1193ProviderLike,
  payload: SigningPayloadV2,
): Promise<Hex> {
  const checkedPayload = validateSigningPayloadV2(payload);

  await assertEip1193Mainnet(provider);

  const result =
    checkedPayload.kind === 'transaction'
      ? await provider.request({
          method: 'eth_sendTransaction',
          params: [
            {
              ...checkedPayload.transaction,
              chainId: ETHEREUM_MAINNET_CHAIN_ID_HEX,
            } satisfies Eip1193WalletTransactionRequest,
          ],
        })
      : await provider.request({
          method: 'eth_signTypedData_v4',
          params: [
            parseEthereumMainnetCaip10(checkedPayload.accountId),
            JSON.stringify(checkedPayload.typedData, (_key, value) =>
              typeof value === 'bigint' ? value.toString(10) : value,
            ),
          ],
        });

  if (typeof result !== 'string' || !isHex(result)) {
    throw new NakamaEthereumConfigError(
      'The EIP-1193 provider returned a non-hex result.',
      { details: { kind: checkedPayload.kind, result } },
    );
  }

  if (
    checkedPayload.kind === 'transaction' &&
    !/^0x[0-9a-f]{64}$/i.test(result)
  ) {
    throw new NakamaEthereumConfigError(
      'eth_sendTransaction must return a 32-byte transaction hash.',
      { details: { result } },
    );
  }
  if (
    checkedPayload.kind === 'typed_data' &&
    !isNonEmptyEvenLengthHex(result)
  ) {
    throw new NakamaEthereumConfigError(
      'eth_signTypedData_v4 must return non-empty even-length signature bytes.',
      { details: { result } },
    );
  }
  return result;
}

export function validateSigningPayloadV2(input: unknown): SigningPayloadV2 {
  if (!isRecord(input) || input.version !== 2) {
    throw new NakamaEthereumConfigError('SigningPayloadV2 version must be 2.');
  }
  if (input.chainId !== ETHEREUM_MAINNET_CAIP2) {
    throw new NakamaEthereumWrongChainError(
      `SigningPayloadV2 chainId must be ${ETHEREUM_MAINNET_CAIP2}.`,
      { details: { chainId: input.chainId } },
    );
  }
  if (typeof input.accountId !== 'string') {
    throw new NakamaEthereumConfigError(
      'SigningPayloadV2 accountId must be a CAIP-10 string.',
    );
  }
  const account = parseEthereumMainnetCaip10(input.accountId);

  if (input.kind === 'transaction') {
    if (
      !isRecord(input.transaction) ||
      'typedData' in input ||
      'authorizationType' in input
    ) {
      throw new NakamaEthereumConfigError(
        'Transaction signing payload must contain only the transaction branch.',
      );
    }
    const transaction = input.transaction;
    if (
      typeof transaction.from !== 'string' ||
      typeof transaction.to !== 'string' ||
      typeof transaction.data !== 'string' ||
      typeof transaction.value !== 'string'
    ) {
      throw new NakamaEthereumConfigError(
        'Transaction signing payload requires from, to, data, and value.',
      );
    }
    const checked = createEip1193TransactionSigningPayload({
      from: transaction.from as Address,
      to: transaction.to as Address,
      data: transaction.data as Hex,
      value: transaction.value as Hex,
      ...(transaction.gas == null ? {} : { gas: transaction.gas as Hex }),
      ...(transaction.maxFeePerGas == null
        ? {}
        : { maxFeePerGas: transaction.maxFeePerGas as Hex }),
      ...(transaction.maxPriorityFeePerGas == null
        ? {}
        : {
            maxPriorityFeePerGas: transaction.maxPriorityFeePerGas as Hex,
          }),
      ...(transaction.nonce == null ? {} : { nonce: transaction.nonce as Hex }),
    });
    if (checked.transaction.from !== account) {
      throw new NakamaEthereumConfigError(
        'Transaction from must match the address in SigningPayloadV2.accountId.',
        {
          details: {
            accountId: input.accountId,
            transactionFrom: checked.transaction.from,
          },
        },
      );
    }
    return { ...checked, accountId: toEthereumMainnetCaip10(account) };
  }

  if (input.kind === 'typed_data') {
    if (
      input.authorizationType !== 'claim_recipient' ||
      !isRecord(input.typedData) ||
      'transaction' in input
    ) {
      throw new NakamaEthereumConfigError(
        'Typed-data signing payload requires claim_recipient typedData and no transaction branch.',
      );
    }
    return createEip712SigningPayload({
      account,
      authorizationType: 'claim_recipient',
      typedData: input.typedData as unknown as Eip712TypedDataDefinition,
    });
  }

  throw new NakamaEthereumConfigError('Unsupported SigningPayloadV2 kind.', {
    details: { kind: input.kind },
  });
}

export function createReceiptSubmissionV2(params: {
  intentId: string;
  payload: SigningPayloadV2;
  txHash: Hex;
}): ReceiptSubmissionV2 {
  const payload = validateSigningPayloadV2(params.payload);
  if (payload.kind !== 'transaction') {
    throw new NakamaEthereumConfigError(
      'ReceiptSubmissionV2 requires a transaction signing payload.',
    );
  }
  if (!/^0x[0-9a-f]{64}$/i.test(params.txHash)) {
    throw new NakamaEthereumConfigError(
      'ReceiptSubmissionV2 txHash must be a 32-byte transaction hash.',
    );
  }
  return validateReceiptSubmissionV2({
    version: 2,
    intentId: requireIntentId(params.intentId),
    chainId: ETHEREUM_MAINNET_CAIP2,
    accountId: payload.accountId,
    kind: 'transaction',
    txHash: params.txHash,
  });
}

export function createAuthorizationSubmissionV2(params: {
  intentId: string;
  payload: SigningPayloadV2;
  signature: Hex;
}): AuthorizationSubmissionV2 {
  const payload = validateSigningPayloadV2(params.payload);
  if (payload.kind !== 'typed_data') {
    throw new NakamaEthereumConfigError(
      'AuthorizationSubmissionV2 requires a typed_data signing payload.',
    );
  }
  if (!isNonEmptyEvenLengthHex(params.signature)) {
    throw new NakamaEthereumConfigError(
      'AuthorizationSubmissionV2 requires non-empty even-length signature bytes.',
    );
  }
  return validateAuthorizationSubmissionV2({
    version: 2,
    intentId: requireIntentId(params.intentId),
    chainId: ETHEREUM_MAINNET_CAIP2,
    accountId: payload.accountId,
    kind: 'typed_data',
    authorizationType: payload.authorizationType,
    signature: params.signature,
  });
}

export function validateReceiptSubmissionV2(
  input: unknown,
): ReceiptSubmissionV2 {
  if (
    !isRecord(input) ||
    input.version !== 2 ||
    input.chainId !== ETHEREUM_MAINNET_CAIP2 ||
    input.kind !== 'transaction' ||
    typeof input.accountId !== 'string' ||
    typeof input.intentId !== 'string' ||
    typeof input.txHash !== 'string' ||
    'signature' in input ||
    !/^0x[0-9a-f]{64}$/i.test(input.txHash)
  ) {
    throw new NakamaEthereumConfigError(
      'ReceiptSubmissionV2 must contain the canonical transaction receipt fields and no signature.',
    );
  }
  return {
    version: 2,
    intentId: requireIntentId(input.intentId),
    chainId: ETHEREUM_MAINNET_CAIP2,
    accountId: toEthereumMainnetCaip10(
      parseEthereumMainnetCaip10(input.accountId),
    ),
    kind: 'transaction',
    txHash: input.txHash as Hex,
  };
}

export function validateAuthorizationSubmissionV2(
  input: unknown,
): AuthorizationSubmissionV2 {
  if (
    !isRecord(input) ||
    input.version !== 2 ||
    input.chainId !== ETHEREUM_MAINNET_CAIP2 ||
    input.kind !== 'typed_data' ||
    input.authorizationType !== 'claim_recipient' ||
    typeof input.accountId !== 'string' ||
    typeof input.intentId !== 'string' ||
    typeof input.signature !== 'string' ||
    'txHash' in input ||
    !isNonEmptyEvenLengthHex(input.signature)
  ) {
    throw new NakamaEthereumConfigError(
      'AuthorizationSubmissionV2 must contain canonical typed-data signature fields and no transaction hash.',
    );
  }
  return {
    version: 2,
    intentId: requireIntentId(input.intentId),
    chainId: ETHEREUM_MAINNET_CAIP2,
    accountId: toEthereumMainnetCaip10(
      parseEthereumMainnetCaip10(input.accountId),
    ),
    kind: 'typed_data',
    authorizationType: 'claim_recipient',
    signature: input.signature as Hex,
  };
}

export async function requestSigningSubmissionV2(
  provider: Eip1193ProviderLike,
  payload: SigningPayloadV2,
  intentId: string,
): Promise<ReceiptSubmissionV2 | AuthorizationSubmissionV2> {
  const checked = validateSigningPayloadV2(payload);
  const result = await requestSigningPayloadV2(provider, checked);
  return checked.kind === 'transaction'
    ? createReceiptSubmissionV2({ intentId, payload: checked, txHash: result })
    : createAuthorizationSubmissionV2({
        intentId,
        payload: checked,
        signature: result,
      });
}

function isRpcQuantity(value: string): value is Hex {
  return /^0x(?:0|[1-9a-f][0-9a-f]*)$/i.test(value);
}

function isEvenLengthHex(value: string): value is Hex {
  return /^0x(?:[0-9a-f]{2})*$/i.test(value);
}

function isNonEmptyEvenLengthHex(value: string): value is Hex {
  return /^0x(?:[0-9a-f]{2})+$/i.test(value);
}

function requireIntentId(value: string): string {
  if (value.length === 0 || value.trim() !== value) {
    throw new NakamaEthereumConfigError(
      'Submission intentId must be a non-empty string without surrounding whitespace.',
    );
  }
  return value;
}

function assertSecureEthereumRpcUrl(value: string): void {
  let url: URL;
  try {
    url = new URL(value);
  } catch (error) {
    throw new NakamaEthereumConfigError(
      'Ethereum RPC URL must be an absolute URL.',
      { cause: error, details: { rpcUrl: value } },
    );
  }
  if (url.username !== '' || url.password !== '') {
    throw new NakamaEthereumConfigError(
      'Ethereum RPC URL must not contain username or password credentials.',
      { details: { rpcUrl: value } },
    );
  }
  const loopback = new Set(['localhost', '127.0.0.1', '[::1]']);
  if (
    url.protocol !== 'https:' &&
    !(url.protocol === 'http:' && loopback.has(url.hostname.toLowerCase()))
  ) {
    throw new NakamaEthereumConfigError(
      'Ethereum mainnet RPC must use HTTPS; HTTP is allowed only for an explicit loopback node.',
      { details: { rpcUrl: value } },
    );
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}
