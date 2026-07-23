import {
  decodeErrorResult,
  decodeEventLog,
  decodeFunctionData,
  encodeFunctionData,
  bytesToHex,
  hexToBytes,
  isHex,
  keccak256,
  parseAbi,
  zeroAddress,
  type Abi,
  type Address,
  type Hex,
  type TransactionReceipt,
} from 'viem';

import {
  NakamaEthereumContractError,
  NakamaEthereumReceiptError,
  NakamaEthereumWrongChainError,
} from './errors.js';
import {
  ETHEREUM_MAINNET_CHAIN_ID,
  normalizeEthereumAddress,
  validateReceiptSubmissionV2,
  validateSigningPayloadV2,
  type EthereumPublicClient,
  type ReceiptSubmissionV2,
  type SigningPayloadV2,
  type TransactionSigningPayloadV2,
} from './ethereum.js';

export * from './ethereum_deployment.js';
export * from './generated/ethereum_protocol.js';

export const DEFAULT_ETHEREUM_CONFIRMATIONS = 12;

export const ERC20_ABI = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
]);

export interface EthereumEventLog {
  data: Hex;
  topics: readonly Hex[];
  address?: Address;
  blockHash?: Hex | null;
  blockNumber?: bigint | null;
  transactionHash?: Hex | null;
  logIndex?: number | null;
}

export interface DecodedEthereumEvent {
  eventName: string;
  args: unknown;
  log: EthereumEventLog;
}

export interface DecodedEthereumRevert {
  errorName: string;
  args: unknown;
}

export interface EthereumImmutableReference {
  start: number;
  length: number;
}

export interface InspectErc20Options {
  token: string;
  owner?: string;
  spender?: string;
  expectedDecimals?: number;
  expectedSymbol?: string;
  minimumBalance?: bigint;
  minimumAllowance?: bigint;
}

export interface Erc20Inspection {
  token: Address;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
  owner: Address | null;
  balance: bigint | null;
  spender: Address | null;
  allowance: bigint | null;
}

export interface VerifyEthereumReceiptOptions {
  hash: Hex;
  minimumConfirmations?: number;
  requireSafeBlock?: boolean;
  abi?: Abi;
  revertData?: Hex;
}

export interface VerifiedEthereumReceipt {
  receipt: TransactionReceipt;
  confirmations: number;
  safe: boolean;
}

export interface VerifyEthereumTransactionIntentOptions extends Omit<
  VerifyEthereumReceiptOptions,
  'hash'
> {
  submission: ReceiptSubmissionV2;
  /** Trusted intent identifier selected before accepting the wallet response. */
  expectedIntentId: string;
  signingPayload: SigningPayloadV2;
}

export interface VerifiedEthereumTransactionIntent extends VerifiedEthereumReceipt {
  submission: ReceiptSubmissionV2;
  signingPayload: TransactionSigningPayloadV2;
  transaction: {
    hash: Hex;
    from: Address;
    to: Address;
    input: Hex;
    value: bigint;
  };
}

export function encodeEthereumCalldata(params: {
  abi: Abi;
  functionName: string;
  args?: readonly unknown[];
}): Hex {
  try {
    return encodeFunctionData({
      abi: params.abi,
      functionName: params.functionName,
      args: params.args ?? [],
    } as never);
  } catch (error) {
    throw new NakamaEthereumContractError(
      `Unable to encode calldata for ${params.functionName}.`,
      {
        cause: error,
        details: { functionName: params.functionName },
      },
    );
  }
}

export function decodeEthereumCalldata(params: { abi: Abi; data: Hex }): {
  functionName: string;
  args?: readonly unknown[];
} {
  try {
    return decodeFunctionData({
      abi: params.abi,
      data: params.data,
    }) as { functionName: string; args?: readonly unknown[] };
  } catch (error) {
    throw new NakamaEthereumContractError(
      'Unable to decode Ethereum calldata with the supplied ABI.',
      { cause: error, details: { data: params.data } },
    );
  }
}

export function decodeEthereumEventLogs(params: {
  abi: Abi;
  logs: readonly EthereumEventLog[];
  eventName?: string;
  strict?: boolean;
}): DecodedEthereumEvent[] {
  const decoded: DecodedEthereumEvent[] = [];
  for (const log of params.logs) {
    try {
      const event = decodeEventLog({
        abi: params.abi,
        data: log.data,
        topics: log.topics as never,
        eventName: params.eventName,
        strict: params.strict ?? true,
      } as never) as { eventName: string; args: unknown };
      decoded.push({ ...event, log });
    } catch (error) {
      if (params.strict ?? true) {
        throw new NakamaEthereumContractError(
          'Unable to decode an Ethereum event log with the supplied ABI.',
          { cause: error, details: { transactionHash: log.transactionHash } },
        );
      }
    }
  }
  return decoded;
}

export function decodeEthereumRevert(
  data: Hex,
  abi: Abi = [],
): DecodedEthereumRevert | null {
  if (data === '0x') return null;
  try {
    const decoded = decodeErrorResult({ abi, data });
    return {
      errorName: decoded.errorName,
      args: decoded.args,
    };
  } catch {
    return null;
  }
}

export function normalizeEthereumRuntimeBytecode(params: {
  bytecode: Hex;
  immutableReferences: readonly EthereumImmutableReference[];
}): Hex {
  if (!/^0x(?:[0-9a-f]{2})*$/i.test(params.bytecode)) {
    throw new NakamaEthereumContractError(
      'Runtime bytecode must be even-length 0x-prefixed hex.',
    );
  }
  const bytes = hexToBytes(params.bytecode);
  const references = [...params.immutableReferences].sort(
    (left, right) => left.start - right.start || left.length - right.length,
  );
  let priorEnd = 0;
  for (const reference of references) {
    const end = reference.start + reference.length;
    if (
      !Number.isSafeInteger(reference.start) ||
      !Number.isSafeInteger(reference.length) ||
      !Number.isSafeInteger(end) ||
      reference.start < 0 ||
      reference.length <= 0 ||
      end > bytes.length ||
      reference.start < priorEnd
    ) {
      throw new NakamaEthereumContractError(
        'Immutable bytecode references must be sorted, non-overlapping in-bounds byte ranges.',
        { details: { reference, priorEnd, bytecodeBytes: bytes.length } },
      );
    }
    bytes.fill(0, reference.start, end);
    priorEnd = end;
  }
  return bytesToHex(bytes);
}

export function hashEthereumRuntimeBytecodeTemplate(params: {
  bytecode: Hex;
  immutableReferences: readonly EthereumImmutableReference[];
}): Hex {
  return keccak256(normalizeEthereumRuntimeBytecode(params));
}

/**
 * Low-level creation-bytecode integrity primitive. Deployment trust gates must
 * pass the generated artifact hash as `expectedCreationBytecodeHash`.
 */
export function assertEthereumCreationBytecodeHash(params: {
  creationBytecode: Hex;
  expectedCreationBytecodeHash: Hex;
}): Hex {
  if (!/^0x(?:[0-9a-f]{2})+$/i.test(params.creationBytecode)) {
    throw new NakamaEthereumContractError(
      'Creation bytecode must be non-empty even-length 0x-prefixed hex.',
    );
  }
  const expected = requireBytes32(
    params.expectedCreationBytecodeHash,
    'expectedCreationBytecodeHash',
  );
  const actual = keccak256(params.creationBytecode);
  if (actual.toLowerCase() !== expected.toLowerCase()) {
    throw new NakamaEthereumContractError(
      'Creation bytecode does not match the approved hash.',
      {
        details: {
          actualCreationBytecodeHash: actual,
          expectedCreationBytecodeHash: expected,
        },
      },
    );
  }
  return actual;
}

export async function inspectErc20(
  client: EthereumPublicClient,
  options: InspectErc20Options,
): Promise<Erc20Inspection> {
  if (
    options.expectedDecimals != null &&
    (!Number.isInteger(options.expectedDecimals) ||
      options.expectedDecimals < 0 ||
      options.expectedDecimals > 255)
  ) {
    throw new NakamaEthereumContractError(
      'expectedDecimals must be an integer from 0 through 255.',
      { details: { expectedDecimals: options.expectedDecimals } },
    );
  }
  if (options.minimumBalance != null && options.minimumBalance < 0n) {
    throw new NakamaEthereumContractError('minimumBalance cannot be negative.');
  }
  if (options.minimumAllowance != null && options.minimumAllowance < 0n) {
    throw new NakamaEthereumContractError(
      'minimumAllowance cannot be negative.',
    );
  }

  const chainId = await client.getChainId();
  if (chainId !== ETHEREUM_MAINNET_CHAIN_ID) {
    throw new NakamaEthereumWrongChainError(
      `ERC-20 checks require chainId ${ETHEREUM_MAINNET_CHAIN_ID}.`,
      { details: { chainId } },
    );
  }

  const token = normalizeEthereumAddress(options.token);
  if (token === zeroAddress) {
    throw new NakamaEthereumContractError(
      'The zero address is not an ERC-20 token contract.',
    );
  }
  const bytecode = await client.getBytecode({ address: token });
  if (!bytecode || bytecode === '0x') {
    throw new NakamaEthereumContractError(
      'No runtime bytecode exists at the ERC-20 address.',
      { details: { token } },
    );
  }

  const [name, symbol, decimals, totalSupply] = await Promise.all([
    client.readContract({
      address: token,
      abi: ERC20_ABI,
      functionName: 'name',
    }),
    client.readContract({
      address: token,
      abi: ERC20_ABI,
      functionName: 'symbol',
    }),
    client.readContract({
      address: token,
      abi: ERC20_ABI,
      functionName: 'decimals',
    }),
    client.readContract({
      address: token,
      abi: ERC20_ABI,
      functionName: 'totalSupply',
    }),
  ]);

  if (
    options.expectedDecimals != null &&
    decimals !== options.expectedDecimals
  ) {
    throw new NakamaEthereumContractError(
      'ERC-20 decimals do not match the configured asset.',
      {
        details: {
          token,
          actualDecimals: decimals,
          expectedDecimals: options.expectedDecimals,
        },
      },
    );
  }
  if (options.expectedSymbol != null && symbol !== options.expectedSymbol) {
    throw new NakamaEthereumContractError(
      'ERC-20 symbol does not match the configured asset.',
      {
        details: {
          token,
          actualSymbol: symbol,
          expectedSymbol: options.expectedSymbol,
        },
      },
    );
  }

  const owner = options.owner ? normalizeEthereumAddress(options.owner) : null;
  const spender = options.spender
    ? normalizeEthereumAddress(options.spender)
    : null;
  if (spender && !owner) {
    throw new NakamaEthereumContractError(
      'ERC-20 allowance checks require both owner and spender.',
    );
  }
  if (options.minimumBalance != null && !owner) {
    throw new NakamaEthereumContractError(
      'minimumBalance requires an owner address.',
    );
  }
  if (options.minimumAllowance != null && (!owner || !spender)) {
    throw new NakamaEthereumContractError(
      'minimumAllowance requires owner and spender addresses.',
    );
  }

  const balance = owner
    ? await client.readContract({
        address: token,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [owner],
      })
    : null;
  const allowance =
    owner && spender
      ? await client.readContract({
          address: token,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [owner, spender],
        })
      : null;

  if (
    options.minimumBalance != null &&
    (balance == null || balance < options.minimumBalance)
  ) {
    throw new NakamaEthereumContractError(
      'ERC-20 balance is below the required minimum.',
      {
        details: {
          token,
          owner,
          balance: balance?.toString(),
          minimumBalance: options.minimumBalance.toString(),
        },
      },
    );
  }
  if (
    options.minimumAllowance != null &&
    (allowance == null || allowance < options.minimumAllowance)
  ) {
    throw new NakamaEthereumContractError(
      'ERC-20 allowance is below the required minimum.',
      {
        details: {
          token,
          owner,
          spender,
          allowance: allowance?.toString(),
          minimumAllowance: options.minimumAllowance.toString(),
        },
      },
    );
  }

  return {
    token,
    name,
    symbol,
    decimals,
    totalSupply,
    owner,
    balance,
    spender,
    allowance,
  };
}

export async function verifyEthereumTransactionIntent(
  client: EthereumPublicClient,
  options: VerifyEthereumTransactionIntentOptions,
): Promise<VerifiedEthereumTransactionIntent> {
  const submission = validateReceiptSubmissionV2(options.submission);
  const expectedIntentId = requireNonEmptyString(
    options.expectedIntentId,
    'expectedIntentId',
  );
  if (submission.intentId !== expectedIntentId) {
    throw new NakamaEthereumContractError(
      'Receipt submission intentId does not match the trusted transaction intent.',
      {
        details: {
          submissionIntentId: submission.intentId,
          expectedIntentId,
        },
      },
    );
  }
  const signingPayload = validateSigningPayloadV2(options.signingPayload);
  if (signingPayload.kind !== 'transaction') {
    throw new NakamaEthereumContractError(
      'Receipt submission can only verify a transaction signing payload.',
    );
  }
  if (submission.accountId !== signingPayload.accountId) {
    throw new NakamaEthereumContractError(
      'Receipt submission accountId does not match the server-owned transaction intent.',
      {
        details: {
          submissionAccountId: submission.accountId,
          intentAccountId: signingPayload.accountId,
        },
      },
    );
  }

  const chainId = await client.getChainId();
  if (chainId !== ETHEREUM_MAINNET_CHAIN_ID) {
    throw new NakamaEthereumWrongChainError(
      `Transaction intent verification requires chainId ${ETHEREUM_MAINNET_CHAIN_ID}.`,
      { details: { chainId } },
    );
  }
  const transaction = await client.getTransaction({ hash: submission.txHash });
  const expected = signingPayload.transaction;
  const actualFrom = normalizeEthereumAddress(transaction.from);
  const actualTo = transaction.to
    ? normalizeEthereumAddress(transaction.to)
    : null;
  const expectedFrom = normalizeEthereumAddress(expected.from);
  const expectedTo = normalizeEthereumAddress(expected.to);
  const actualHash = transaction.hash as Hex;

  if (
    actualHash.toLowerCase() !== submission.txHash.toLowerCase() ||
    actualFrom !== expectedFrom ||
    actualTo !== expectedTo ||
    transaction.input.toLowerCase() !== expected.data.toLowerCase() ||
    transaction.value !== BigInt(expected.value)
  ) {
    throw new NakamaEthereumContractError(
      'Mined transaction does not match the server-owned transaction intent.',
      {
        details: {
          expectedHash: submission.txHash,
          actualHash,
          expectedFrom,
          actualFrom,
          expectedTo,
          actualTo,
          expectedData: expected.data,
          actualData: transaction.input,
          expectedValue: expected.value,
          actualValue: transaction.value.toString(),
        },
      },
    );
  }

  const verifiedReceipt = await verifyEthereumReceipt(client, {
    hash: submission.txHash,
    minimumConfirmations: options.minimumConfirmations,
    requireSafeBlock: options.requireSafeBlock,
    abi: options.abi,
    revertData: options.revertData,
  });
  return {
    ...verifiedReceipt,
    submission,
    signingPayload,
    transaction: {
      hash: actualHash,
      from: actualFrom,
      to: actualTo,
      input: transaction.input,
      value: transaction.value,
    },
  };
}

export async function waitForEthereumReceipt(
  client: EthereumPublicClient,
  options: VerifyEthereumReceiptOptions & { timeoutMs?: number },
): Promise<VerifiedEthereumReceipt> {
  const minimumConfirmations = normalizeConfirmations(
    options.minimumConfirmations,
  );
  await client.waitForTransactionReceipt({
    hash: options.hash,
    confirmations: minimumConfirmations,
    timeout: options.timeoutMs,
  });
  return verifyEthereumReceipt(client, {
    ...options,
    minimumConfirmations,
  });
}

export async function verifyEthereumReceipt(
  client: EthereumPublicClient,
  options: VerifyEthereumReceiptOptions,
): Promise<VerifiedEthereumReceipt> {
  const chainId = await client.getChainId();
  if (chainId !== ETHEREUM_MAINNET_CHAIN_ID) {
    throw new NakamaEthereumWrongChainError(
      `Receipt verification requires chainId ${ETHEREUM_MAINNET_CHAIN_ID}.`,
      { details: { chainId } },
    );
  }

  const receipt = await client.getTransactionReceipt({ hash: options.hash });
  if (receipt.status !== 'success') {
    const decoded = options.revertData
      ? decodeEthereumRevert(options.revertData, options.abi)
      : null;
    throw new NakamaEthereumReceiptError(
      decoded
        ? `Ethereum transaction reverted with ${decoded.errorName}.`
        : 'Ethereum transaction reverted.',
      {
        details: {
          hash: options.hash,
          blockNumber: receipt.blockNumber.toString(),
          revert: decoded,
        },
      },
    );
  }

  const canonicalBlock = await client.getBlock({
    blockNumber: receipt.blockNumber,
  });
  if (
    canonicalBlock.hash == null ||
    canonicalBlock.hash.toLowerCase() !== receipt.blockHash.toLowerCase()
  ) {
    throw new NakamaEthereumReceiptError(
      'Transaction receipt is no longer in the canonical chain.',
      {
        details: {
          hash: options.hash,
          receiptBlockHash: receipt.blockHash,
          canonicalBlockHash: canonicalBlock.hash,
        },
      },
    );
  }

  const head = await client.getBlockNumber();
  const confirmationCount =
    head >= receipt.blockNumber ? Number(head - receipt.blockNumber + 1n) : 0;
  const minimumConfirmations = normalizeConfirmations(
    options.minimumConfirmations,
  );
  if (confirmationCount < minimumConfirmations) {
    throw new NakamaEthereumReceiptError(
      `Transaction has ${confirmationCount} confirmations; ${minimumConfirmations} required.`,
      {
        details: {
          hash: options.hash,
          confirmations: confirmationCount,
          minimumConfirmations,
        },
      },
    );
  }

  let safe = false;
  if (options.requireSafeBlock ?? true) {
    const safeBlock = await client.getBlock({ blockTag: 'safe' });
    safe = safeBlock.number != null && safeBlock.number >= receipt.blockNumber;
    if (!safe) {
      throw new NakamaEthereumReceiptError(
        'Transaction is confirmed but has not reached Ethereum safe head.',
        {
          details: {
            hash: options.hash,
            receiptBlockNumber: receipt.blockNumber.toString(),
            safeBlockNumber: safeBlock.number?.toString(),
          },
        },
      );
    }
  }

  const stableReceipt = await client.getTransactionReceipt({
    hash: options.hash,
  });
  if (
    stableReceipt.blockHash.toLowerCase() !== receipt.blockHash.toLowerCase() ||
    stableReceipt.blockNumber !== receipt.blockNumber
  ) {
    throw new NakamaEthereumReceiptError(
      'Transaction receipt changed during finality verification.',
      { details: { hash: options.hash } },
    );
  }

  return { receipt: stableReceipt, confirmations: confirmationCount, safe };
}

function normalizeConfirmations(value: number | undefined): number {
  const confirmations = value ?? DEFAULT_ETHEREUM_CONFIRMATIONS;
  if (!Number.isSafeInteger(confirmations) || confirmations < 1) {
    throw new NakamaEthereumReceiptError(
      'minimumConfirmations must be a positive integer.',
      { details: { minimumConfirmations: value } },
    );
  }
  return confirmations;
}

function requireBytes32(value: unknown, field: string): Hex {
  if (
    typeof value !== 'string' ||
    !isHex(value) ||
    !/^0x[0-9a-f]{64}$/i.test(value)
  ) {
    throw new NakamaEthereumContractError(
      `${field} must be a 32-byte 0x-prefixed hex value.`,
      { details: { field, value } },
    );
  }
  return value as Hex;
}

function requireNonEmptyString(value: unknown, field: string): string {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.trim() !== value
  ) {
    throw new NakamaEthereumContractError(
      `${field} must be a non-empty string without surrounding whitespace.`,
      { details: { field, value } },
    );
  }
  return value;
}
