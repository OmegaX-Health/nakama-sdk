import { isHex, keccak256, zeroAddress, type Address, type Hex } from 'viem';

import {
  getRobinhoodCaip2,
  normalizeRobinhoodAddress,
  type RobinhoodCaip2,
  type RobinhoodNetwork,
} from './chains.js';
import { NakamaRobinhoodReceiptError } from './errors.js';
import type { RobinhoodEip1193Submission } from './wallet.js';
import {
  isTrustedRobinhoodSubmission,
  sealTrustedRobinhoodSubmission,
} from './submission-integrity.js';

export const ROBINHOOD_SOFT_CONFIRMATIONS = 1 as const;

export type RobinhoodReceiptStatus =
  | 'submitted'
  | 'soft_confirmed'
  | 'l1_posted'
  | 'finalized'
  | 'reverted'
  | 'replaced'
  | 'timed_out'
  | 'reorged';

export type RobinhoodFinalityAssurance =
  | 'single_provider_display'
  | 'dual_provider_observed'
  | 'dual_provider_economic';

export interface RobinhoodSubmittedTransaction {
  network: RobinhoodNetwork;
  chainId: 4663 | 46630;
  caip2: RobinhoodCaip2;
  hash: Hex;
  submittedAt: string;
  from: Address;
  to: Address;
  intentId: string;
  actionCommitment: Hex;
  calldataHash: Hex;
  value: bigint;
}

export interface RobinhoodObservedTransaction {
  hash: Hex;
  chainId: number;
  from: Address;
  to: Address | null;
  input: Hex;
  value: bigint;
}

export interface RobinhoodMinedReceipt {
  transactionHash: Hex;
  blockNumber: bigint;
  blockHash: Hex;
  status: 'success' | 'reverted';
  from: Address;
  to: Address | null;
  gasUsed?: bigint;
}

export interface RobinhoodL1BatchEvidence {
  l2TransactionHash: Hex;
  l2BlockNumber: bigint;
  l2BlockHash: Hex;
  l1BatchTransactionHash: Hex;
  l1BlockNumber: bigint;
  l1Finalized: boolean;
  observedAt: string;
}

export interface RobinhoodTransactionFinality {
  transaction: RobinhoodSubmittedTransaction;
  status: RobinhoodReceiptStatus;
  receipt: RobinhoodMinedReceipt | null;
  confirmations: number;
  chainHead: bigint | null;
  safeBlock: bigint | null;
  finalizedBlock: bigint | null;
  l1Posted: boolean | null;
  replacementHash: Hex | null;
  observedAt: string;
  assurance: RobinhoodFinalityAssurance;
  providerAgreement: boolean;
  economicFinal: boolean;
  l1Batch: RobinhoodL1BatchEvidence | null;
}

export interface AssessRobinhoodFinalityOptions {
  transaction: RobinhoodSubmittedTransaction;
  receipt?: RobinhoodMinedReceipt | null;
  chainHead?: bigint | null;
  safeBlock?: bigint | null;
  finalizedBlock?: bigint | null;
  canonicalBlockHash?: Hex | null;
  l1Posted?: boolean | null;
  replacementHash?: Hex | null;
  timedOut?: boolean;
  softConfirmations?: number;
  observedAt?: Date | string;
}

export interface RobinhoodReaderIdentity {
  /** Stable provider/account identifier, never an API key. */
  providerId: string;
  /** Canonical RPC or evidence-service URL origin. */
  endpointOrigin: string;
  /** Independent infrastructure operator or legal provider name. */
  operator: string;
}

export interface RobinhoodReceiptReader {
  readonly identity: RobinhoodReaderIdentity;
  getTransaction(hash: Hex): Promise<RobinhoodObservedTransaction | null>;
  getReceipt(hash: Hex): Promise<RobinhoodMinedReceipt | null>;
  getBlockNumber(): Promise<bigint>;
  getBlockHash(blockNumber: bigint): Promise<Hex | null>;
  getSafeBlockNumber(): Promise<bigint | null>;
  getFinalizedBlockNumber(): Promise<bigint | null>;
  /** Optional single-source display signal; never enough for economic finality. */
  getL1PostingStatus?(hash: Hex): Promise<boolean | null>;
}

export interface RobinhoodL1BatchReader {
  readonly identity: RobinhoodReaderIdentity;
  getBatchEvidence(hash: Hex): Promise<RobinhoodL1BatchEvidence | null>;
}

export interface WaitForRobinhoodFinalityOptions {
  reader: RobinhoodReceiptReader;
  /** Required with l1BatchReader for l1_posted/finalized targets. */
  secondaryReader?: RobinhoodReceiptReader;
  /** Two independent L1 sources are required for economic-finality targets. */
  primaryL1BatchReader?: RobinhoodL1BatchReader;
  secondaryL1BatchReader?: RobinhoodL1BatchReader;
  transaction: RobinhoodSubmittedTransaction;
  target?: 'soft_confirmed' | 'l1_posted' | 'finalized';
  timeoutMs?: number;
  pollingIntervalMs?: number;
  softConfirmations?: number;
  signal?: AbortSignal;
}

export function createRobinhoodSubmittedTransaction(params: {
  network: RobinhoodNetwork;
  hash: Hex;
  submittedAt?: Date | string;
  from: Address;
  to: Address;
  intentId: string;
  actionCommitment: Hex;
  calldataHash: Hex;
  value: bigint;
}): RobinhoodSubmittedTransaction {
  if (params.network !== 'mainnet' && params.network !== 'testnet') {
    throw new NakamaRobinhoodReceiptError(
      'Submitted transaction network must be mainnet or testnet.',
    );
  }
  requireTransactionHash(params.hash, 'transaction hash');
  if (typeof params.intentId !== 'string' || params.intentId.trim() === '') {
    throw new NakamaRobinhoodReceiptError('intentId cannot be empty.');
  }
  const from = requireNonZeroAddress(params.from, 'from');
  const to = requireNonZeroAddress(params.to, 'to');
  requireTransactionHash(params.actionCommitment, 'actionCommitment');
  requireTransactionHash(params.calldataHash, 'calldataHash');
  if (typeof params.value !== 'bigint' || params.value < 0n) {
    throw new NakamaRobinhoodReceiptError(
      'Submitted transaction value must be a non-negative bigint.',
    );
  }
  return {
    network: params.network,
    chainId: params.network === 'mainnet' ? 4663 : 46630,
    caip2: getRobinhoodCaip2(params.network),
    hash: params.hash,
    submittedAt: normalizeObservedAt(params.submittedAt ?? new Date()),
    from,
    to,
    intentId: params.intentId,
    actionCommitment: params.actionCommitment,
    calldataHash: params.calldataHash,
    value: params.value,
  };
}

export function createRobinhoodSubmittedTransactionFromSubmission(
  submission: RobinhoodEip1193Submission,
): RobinhoodSubmittedTransaction {
  if (!isTrustedRobinhoodSubmission(submission)) {
    throw new NakamaRobinhoodReceiptError(
      'Economic-finality tracking requires the exact sealed wallet submission.',
    );
  }
  const transaction = createRobinhoodSubmittedTransaction({
    network: submission.network,
    hash: submission.txHash,
    submittedAt: submission.submittedAt,
    from: submission.from,
    to: submission.to,
    intentId: submission.intentId,
    actionCommitment: submission.actionCommitment,
    calldataHash: submission.calldataHash,
    value: submission.value,
  });
  if (
    transaction.chainId !== submission.chainId ||
    transaction.caip2 !== submission.caip2
  ) {
    throw new NakamaRobinhoodReceiptError(
      'Wallet submission chain identity is inconsistent.',
    );
  }
  return sealTrustedRobinhoodSubmission(transaction);
}

/**
 * Pure single-provider classifier for UI state. Even `finalized` here is not an
 * economic authorization; use readRobinhoodEconomicFinality for that.
 */
export function assessRobinhoodFinality(
  options: AssessRobinhoodFinalityOptions,
): RobinhoodTransactionFinality {
  const transaction = validateSubmittedTransaction(options.transaction);
  const receipt =
    options.receipt == null
      ? null
      : validateReceipt(options.receipt, transaction);
  const chainHead = requireOptionalBlock(options.chainHead, 'chainHead');
  const safeBlock = requireOptionalBlock(options.safeBlock, 'safeBlock');
  const finalizedBlock = requireOptionalBlock(
    options.finalizedBlock,
    'finalizedBlock',
  );
  const canonicalBlockHash = requireOptionalHash(
    options.canonicalBlockHash,
    'canonicalBlockHash',
  );
  const l1Posted = options.l1Posted ?? null;
  if (l1Posted !== null && typeof l1Posted !== 'boolean') {
    throw new NakamaRobinhoodReceiptError('l1Posted must be boolean or null.');
  }
  const replacementHash = options.replacementHash ?? null;
  const minimumConfirmations =
    options.softConfirmations ?? ROBINHOOD_SOFT_CONFIRMATIONS;
  if (!Number.isSafeInteger(minimumConfirmations) || minimumConfirmations < 1) {
    throw new NakamaRobinhoodReceiptError(
      'softConfirmations must be a positive integer.',
    );
  }
  if (
    (safeBlock != null && chainHead == null) ||
    (finalizedBlock != null && (safeBlock == null || chainHead == null)) ||
    (safeBlock != null && chainHead != null && safeBlock > chainHead) ||
    (finalizedBlock != null && safeBlock != null && finalizedBlock > safeBlock)
  ) {
    throw new NakamaRobinhoodReceiptError(
      'Receipt head, safe, and finalized block ordering is invalid.',
    );
  }
  if (receipt != null && chainHead != null && receipt.blockNumber > chainHead) {
    throw new NakamaRobinhoodReceiptError(
      'Receipt block cannot be ahead of chain head.',
    );
  }
  if (replacementHash != null) {
    requireTransactionHash(replacementHash, 'replacementHash');
    if (replacementHash.toLowerCase() === transaction.hash.toLowerCase()) {
      throw new NakamaRobinhoodReceiptError(
        'Replacement hash must differ from the submitted transaction.',
      );
    }
  }

  const confirmations =
    receipt && chainHead != null && chainHead >= receipt.blockNumber
      ? toSafeNumber(chainHead - receipt.blockNumber + 1n)
      : 0;
  const canonical =
    receipt != null &&
    canonicalBlockHash != null &&
    canonicalBlockHash.toLowerCase() === receipt.blockHash.toLowerCase();

  let status: RobinhoodReceiptStatus = 'submitted';
  if (replacementHash != null) {
    status = 'replaced';
  } else if (options.timedOut) {
    status = 'timed_out';
  } else if (receipt != null && canonicalBlockHash != null && !canonical) {
    status = 'reorged';
  } else if (canonical && receipt?.status === 'reverted') {
    status = 'reverted';
  } else if (
    canonical &&
    receipt != null &&
    finalizedBlock != null &&
    finalizedBlock >= receipt.blockNumber
  ) {
    status = 'finalized';
  } else if (canonical && receipt != null && l1Posted === true) {
    status = 'l1_posted';
  } else if (
    canonical &&
    receipt != null &&
    confirmations >= minimumConfirmations
  ) {
    status = 'soft_confirmed';
  }

  return {
    transaction,
    status,
    receipt,
    confirmations,
    chainHead,
    safeBlock,
    finalizedBlock,
    l1Posted,
    replacementHash,
    observedAt: normalizeObservedAt(options.observedAt ?? new Date()),
    assurance: 'single_provider_display',
    providerAgreement: false,
    economicFinal: false,
    l1Batch: null,
  };
}

export async function readRobinhoodFinality(params: {
  reader: RobinhoodReceiptReader;
  transaction: RobinhoodSubmittedTransaction;
  softConfirmations?: number;
}): Promise<RobinhoodTransactionFinality> {
  return await readSingleProviderFinality(
    params.reader,
    validateSubmittedTransaction(params.transaction),
    params.softConfirmations,
  );
}

export async function readRobinhoodEconomicFinality(params: {
  primaryReader: RobinhoodReceiptReader;
  secondaryReader: RobinhoodReceiptReader;
  primaryL1BatchReader: RobinhoodL1BatchReader;
  secondaryL1BatchReader: RobinhoodL1BatchReader;
  transaction: RobinhoodSubmittedTransaction;
  softConfirmations?: number;
}): Promise<RobinhoodTransactionFinality> {
  if (!isTrustedRobinhoodSubmission(params.transaction)) {
    throw new NakamaRobinhoodReceiptError(
      'Economic finality requires a sealed transaction returned by the wallet submission path.',
    );
  }
  if (
    params.primaryReader === params.secondaryReader ||
    params.primaryL1BatchReader === params.secondaryL1BatchReader
  ) {
    throw new NakamaRobinhoodReceiptError(
      'Economic finality requires independent L2 and L1 reader instances.',
    );
  }
  assertIndependentReaderIdentities(
    params.primaryReader.identity,
    params.secondaryReader.identity,
    'L2',
  );
  assertIndependentReaderIdentities(
    params.primaryL1BatchReader.identity,
    params.secondaryL1BatchReader.identity,
    'L1',
  );
  const transaction = validateSubmittedTransaction(params.transaction);
  const [primary, secondary, primaryBatchInput, secondaryBatchInput] =
    await Promise.all([
      readSingleProviderFinality(
        params.primaryReader,
        transaction,
        params.softConfirmations,
      ),
      readSingleProviderFinality(
        params.secondaryReader,
        transaction,
        params.softConfirmations,
      ),
      params.primaryL1BatchReader.getBatchEvidence(transaction.hash),
      params.secondaryL1BatchReader.getBatchEvidence(transaction.hash),
    ]);
  assertProviderAgreement(primary, secondary);
  const primaryBatch =
    primaryBatchInput == null
      ? null
      : validateL1BatchEvidence(primaryBatchInput, transaction);
  const secondaryBatch =
    secondaryBatchInput == null
      ? null
      : validateL1BatchEvidence(secondaryBatchInput, transaction);
  assertL1BatchAgreement(primaryBatch, secondaryBatch);
  const batch = primaryBatch;
  if (batch != null && primary.receipt == null) {
    throw new NakamaRobinhoodReceiptError(
      'L1 batch evidence cannot precede an agreed canonical L2 receipt.',
    );
  }
  if (
    batch != null &&
    primary.receipt != null &&
    (batch.l2BlockNumber !== primary.receipt.blockNumber ||
      batch.l2BlockHash.toLowerCase() !==
        primary.receipt.blockHash.toLowerCase())
  ) {
    throw new NakamaRobinhoodReceiptError(
      'L1 batch evidence conflicts with the agreed L2 receipt.',
    );
  }
  const economicFinal =
    primary.status === 'finalized' &&
    secondary.status === 'finalized' &&
    batch?.l1Finalized === true;
  return {
    ...primary,
    l1Posted: batch != null,
    assurance: economicFinal
      ? 'dual_provider_economic'
      : 'dual_provider_observed',
    providerAgreement: true,
    economicFinal,
    l1Batch: batch,
  };
}

export async function waitForRobinhoodFinality(
  options: WaitForRobinhoodFinalityOptions,
): Promise<RobinhoodTransactionFinality> {
  const target = options.target ?? 'finalized';
  const economicTarget = target === 'l1_posted' || target === 'finalized';
  if (
    economicTarget &&
    (options.secondaryReader == null ||
      options.primaryL1BatchReader == null ||
      options.secondaryL1BatchReader == null)
  ) {
    throw new NakamaRobinhoodReceiptError(
      'L1-posted/finalized waits require two independent L2 readers and two independent L1 batch readers.',
    );
  }
  const timeoutMs = options.timeoutMs ?? 120_000;
  const pollingIntervalMs = options.pollingIntervalMs ?? 1_000;
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1) {
    throw new NakamaRobinhoodReceiptError('timeoutMs must be positive.');
  }
  if (!Number.isSafeInteger(pollingIntervalMs) || pollingIntervalMs < 10) {
    throw new NakamaRobinhoodReceiptError(
      'pollingIntervalMs must be at least 10 milliseconds.',
    );
  }
  const transaction = validateSubmittedTransaction(options.transaction);
  const startedAt = Date.now();
  while (true) {
    if (options.signal?.aborted) {
      throw new NakamaRobinhoodReceiptError(
        'Receipt wait was aborted by the caller.',
      );
    }
    const state = economicTarget
      ? await readRobinhoodEconomicFinality({
          primaryReader: options.reader,
          secondaryReader: options.secondaryReader!,
          primaryL1BatchReader: options.primaryL1BatchReader!,
          secondaryL1BatchReader: options.secondaryL1BatchReader!,
          transaction,
          softConfirmations: options.softConfirmations,
        })
      : await readRobinhoodFinality({
          reader: options.reader,
          transaction,
          softConfirmations: options.softConfirmations,
        });
    if (isTargetReached(state, target)) return state;
    if (
      state.status === 'reverted' ||
      state.status === 'reorged' ||
      state.status === 'replaced'
    ) {
      return state;
    }
    if (Date.now() - startedAt >= timeoutMs) {
      return {
        ...state,
        status: 'timed_out',
        economicFinal: false,
      };
    }
    await delay(pollingIntervalMs, options.signal);
  }
}

async function readSingleProviderFinality(
  reader: RobinhoodReceiptReader,
  transaction: RobinhoodSubmittedTransaction,
  softConfirmations?: number,
): Promise<RobinhoodTransactionFinality> {
  validateReaderIdentity(reader.identity, 'receipt reader');
  const [observedTransaction, receipt] = await Promise.all([
    reader.getTransaction(transaction.hash),
    reader.getReceipt(transaction.hash),
  ]);
  if (observedTransaction != null) {
    validateObservedTransaction(observedTransaction, transaction);
  } else if (receipt != null) {
    throw new NakamaRobinhoodReceiptError(
      'Mined receipt is missing exact transaction-input readback.',
    );
  }
  const [chainHead, safeBlock, finalizedBlock, l1Posted] = await Promise.all([
    reader.getBlockNumber(),
    reader.getSafeBlockNumber(),
    reader.getFinalizedBlockNumber(),
    reader.getL1PostingStatus?.(transaction.hash) ?? Promise.resolve(null),
  ]);
  const canonicalBlockHash = receipt
    ? await reader.getBlockHash(receipt.blockNumber)
    : null;
  return assessRobinhoodFinality({
    transaction,
    receipt,
    chainHead,
    safeBlock,
    finalizedBlock,
    canonicalBlockHash,
    l1Posted,
    softConfirmations,
  });
}

function assertIndependentReaderIdentities(
  primary: RobinhoodReaderIdentity,
  secondary: RobinhoodReaderIdentity,
  layer: 'L1' | 'L2',
): void {
  const first = validateReaderIdentity(primary, `${layer} primary reader`);
  const second = validateReaderIdentity(secondary, `${layer} secondary reader`);
  if (
    first.providerId === second.providerId ||
    first.endpointOrigin === second.endpointOrigin ||
    first.operator === second.operator
  ) {
    throw new NakamaRobinhoodReceiptError(
      `${layer} economic-finality readers must have independent provider, endpoint, and operator identities.`,
    );
  }
}

function validateReaderIdentity(
  identity: RobinhoodReaderIdentity,
  label: string,
): { providerId: string; endpointOrigin: string; operator: string } {
  if (identity == null || typeof identity !== 'object') {
    throw new NakamaRobinhoodReceiptError(`${label} identity is required.`);
  }
  const providerId = requireIdentityText(identity.providerId, 'providerId');
  const operator = requireIdentityText(identity.operator, 'operator');
  let endpoint: URL;
  try {
    endpoint = new URL(identity.endpointOrigin);
  } catch (error) {
    throw new NakamaRobinhoodReceiptError(
      `${label} endpointOrigin must be an absolute URL origin.`,
      { cause: error },
    );
  }
  const loopback =
    endpoint.hostname === 'localhost' ||
    endpoint.hostname === '127.0.0.1' ||
    endpoint.hostname === '[::1]';
  if (
    endpoint.origin !== identity.endpointOrigin ||
    (endpoint.protocol !== 'https:' && !loopback)
  ) {
    throw new NakamaRobinhoodReceiptError(
      `${label} endpointOrigin must be a canonical HTTPS origin or loopback origin.`,
    );
  }
  return {
    providerId: providerId.toLowerCase(),
    endpointOrigin: endpoint.origin.toLowerCase(),
    operator: operator.toLowerCase(),
  };
}

function requireIdentityText(value: unknown, field: string): string {
  if (
    typeof value !== 'string' ||
    value.trim() !== value ||
    value.length < 2 ||
    value.length > 128
  ) {
    throw new NakamaRobinhoodReceiptError(
      `Reader identity ${field} must be a bounded non-empty string.`,
    );
  }
  return value;
}

function assertL1BatchAgreement(
  primary: RobinhoodL1BatchEvidence | null,
  secondary: RobinhoodL1BatchEvidence | null,
): void {
  if ((primary == null) !== (secondary == null)) {
    throw new NakamaRobinhoodReceiptError(
      'Independent L1 providers disagree on batch evidence existence.',
    );
  }
  if (primary == null || secondary == null) return;
  if (
    primary.l2TransactionHash.toLowerCase() !==
      secondary.l2TransactionHash.toLowerCase() ||
    primary.l2BlockNumber !== secondary.l2BlockNumber ||
    primary.l2BlockHash.toLowerCase() !== secondary.l2BlockHash.toLowerCase() ||
    primary.l1BatchTransactionHash.toLowerCase() !==
      secondary.l1BatchTransactionHash.toLowerCase() ||
    primary.l1BlockNumber !== secondary.l1BlockNumber ||
    primary.l1Finalized !== secondary.l1Finalized
  ) {
    throw new NakamaRobinhoodReceiptError(
      'Independent L1 providers returned divergent batch evidence.',
    );
  }
}

function assertProviderAgreement(
  primary: RobinhoodTransactionFinality,
  secondary: RobinhoodTransactionFinality,
): void {
  const primaryReceipt = primary.receipt;
  const secondaryReceipt = secondary.receipt;
  if ((primaryReceipt == null) !== (secondaryReceipt == null)) {
    throw new NakamaRobinhoodReceiptError(
      'Independent Robinhood providers disagree on receipt existence.',
    );
  }
  if (primaryReceipt != null && secondaryReceipt != null) {
    const matches =
      primaryReceipt.transactionHash.toLowerCase() ===
        secondaryReceipt.transactionHash.toLowerCase() &&
      primaryReceipt.blockNumber === secondaryReceipt.blockNumber &&
      primaryReceipt.blockHash.toLowerCase() ===
        secondaryReceipt.blockHash.toLowerCase() &&
      primaryReceipt.status === secondaryReceipt.status &&
      primaryReceipt.from.toLowerCase() ===
        secondaryReceipt.from.toLowerCase() &&
      primaryReceipt.to?.toLowerCase() === secondaryReceipt.to?.toLowerCase();
    if (!matches) {
      throw new NakamaRobinhoodReceiptError(
        'Independent Robinhood providers returned divergent receipts.',
      );
    }
  }
  if (
    primary.status !== secondary.status ||
    primary.status === 'reorged' ||
    secondary.status === 'reorged'
  ) {
    throw new NakamaRobinhoodReceiptError(
      'Independent Robinhood providers disagree on canonical finality.',
    );
  }
}

function validateSubmittedTransaction(
  transaction: RobinhoodSubmittedTransaction,
): RobinhoodSubmittedTransaction {
  const trusted = isTrustedRobinhoodSubmission(transaction);
  const validated = createRobinhoodSubmittedTransaction({
    network: transaction.network,
    hash: transaction.hash,
    submittedAt: transaction.submittedAt,
    from: transaction.from,
    to: transaction.to,
    intentId: transaction.intentId,
    actionCommitment: transaction.actionCommitment,
    calldataHash: transaction.calldataHash,
    value: transaction.value,
  });
  if (
    validated.chainId !== transaction.chainId ||
    validated.caip2 !== transaction.caip2
  ) {
    throw new NakamaRobinhoodReceiptError(
      'Submitted transaction chain identity is inconsistent.',
    );
  }
  return trusted ? sealTrustedRobinhoodSubmission(validated) : validated;
}

function validateObservedTransaction(
  observed: RobinhoodObservedTransaction,
  transaction: RobinhoodSubmittedTransaction,
): void {
  requireTransactionHash(observed.hash, 'observed transaction hash');
  if (
    observed.hash.toLowerCase() !== transaction.hash.toLowerCase() ||
    observed.chainId !== transaction.chainId ||
    requireNonZeroAddress(
      observed.from,
      'observed transaction from',
    ).toLowerCase() !== transaction.from.toLowerCase() ||
    observed.to == null ||
    requireNonZeroAddress(
      observed.to,
      'observed transaction to',
    ).toLowerCase() !== transaction.to.toLowerCase() ||
    typeof observed.input !== 'string' ||
    !isHex(observed.input) ||
    keccak256(observed.input).toLowerCase() !==
      transaction.calldataHash.toLowerCase() ||
    observed.value !== transaction.value
  ) {
    throw new NakamaRobinhoodReceiptError(
      'Onchain transaction input, value, or identity does not match the sealed action submission.',
    );
  }
}

function validateReceipt(
  receipt: RobinhoodMinedReceipt,
  transaction: RobinhoodSubmittedTransaction,
): RobinhoodMinedReceipt {
  requireTransactionHash(receipt.transactionHash, 'receipt.transactionHash');
  requireTransactionHash(receipt.blockHash, 'receipt.blockHash');
  if (
    receipt.transactionHash.toLowerCase() !== transaction.hash.toLowerCase()
  ) {
    throw new NakamaRobinhoodReceiptError(
      'Receipt transaction hash does not match the submitted transaction.',
    );
  }
  if (typeof receipt.blockNumber !== 'bigint' || receipt.blockNumber <= 0n) {
    throw new NakamaRobinhoodReceiptError(
      'Receipt blockNumber must be a positive bigint.',
    );
  }
  if (receipt.status !== 'success' && receipt.status !== 'reverted') {
    throw new NakamaRobinhoodReceiptError('Receipt status is invalid.');
  }
  const from = requireNonZeroAddress(receipt.from, 'receipt.from');
  if (from.toLowerCase() !== transaction.from.toLowerCase()) {
    throw new NakamaRobinhoodReceiptError(
      'Receipt sender does not match the submitted transaction.',
    );
  }
  if (receipt.to == null) {
    throw new NakamaRobinhoodReceiptError(
      'Receipt destination cannot be null for a contract action.',
    );
  }
  const to = requireNonZeroAddress(receipt.to, 'receipt.to');
  if (to.toLowerCase() !== transaction.to.toLowerCase()) {
    throw new NakamaRobinhoodReceiptError(
      'Receipt destination does not match the submitted transaction.',
    );
  }
  if (
    receipt.gasUsed != null &&
    (typeof receipt.gasUsed !== 'bigint' || receipt.gasUsed < 0n)
  ) {
    throw new NakamaRobinhoodReceiptError(
      'Receipt gasUsed must be a non-negative bigint.',
    );
  }
  return { ...receipt, from, to };
}

function validateL1BatchEvidence(
  evidence: RobinhoodL1BatchEvidence,
  transaction: RobinhoodSubmittedTransaction,
): RobinhoodL1BatchEvidence {
  requireTransactionHash(evidence.l2TransactionHash, 'l2TransactionHash');
  requireTransactionHash(evidence.l2BlockHash, 'l2BlockHash');
  requireTransactionHash(
    evidence.l1BatchTransactionHash,
    'l1BatchTransactionHash',
  );
  if (
    evidence.l2TransactionHash.toLowerCase() !==
      transaction.hash.toLowerCase() ||
    typeof evidence.l2BlockNumber !== 'bigint' ||
    evidence.l2BlockNumber <= 0n ||
    typeof evidence.l1BlockNumber !== 'bigint' ||
    evidence.l1BlockNumber <= 0n ||
    typeof evidence.l1Finalized !== 'boolean'
  ) {
    throw new NakamaRobinhoodReceiptError('L1 batch evidence is invalid.');
  }
  return {
    ...evidence,
    observedAt: normalizeObservedAt(evidence.observedAt),
  };
}

function isTargetReached(
  state: RobinhoodTransactionFinality,
  target: 'soft_confirmed' | 'l1_posted' | 'finalized',
): boolean {
  if (target === 'soft_confirmed') {
    return (
      state.status === 'soft_confirmed' ||
      state.status === 'l1_posted' ||
      state.status === 'finalized'
    );
  }
  if (target === 'l1_posted') {
    return state.providerAgreement && state.l1Batch != null;
  }
  return state.economicFinal;
}

function requireTransactionHash(
  value: unknown,
  field: string,
): asserts value is Hex {
  if (
    typeof value !== 'string' ||
    !isHex(value) ||
    !/^0x[0-9a-f]{64}$/i.test(value)
  ) {
    throw new NakamaRobinhoodReceiptError(
      `${field} must be a 32-byte transaction hash.`,
    );
  }
}

function requireOptionalHash(value: unknown, field: string): Hex | null {
  if (value == null) return null;
  requireTransactionHash(value, field);
  return value;
}

function requireOptionalBlock(value: unknown, field: string): bigint | null {
  if (value == null) return null;
  if (typeof value !== 'bigint' || value < 0n) {
    throw new NakamaRobinhoodReceiptError(
      `${field} must be a non-negative bigint or null.`,
    );
  }
  return value;
}

function requireNonZeroAddress(value: unknown, field: string): Address {
  if (typeof value !== 'string') {
    throw new NakamaRobinhoodReceiptError(`${field} must be an EVM address.`);
  }
  let address: Address;
  try {
    address = normalizeRobinhoodAddress(value);
  } catch (error) {
    throw new NakamaRobinhoodReceiptError(`${field} must be an EVM address.`, {
      cause: error,
    });
  }
  if (address === zeroAddress) {
    throw new NakamaRobinhoodReceiptError(`${field} cannot be zero address.`);
  }
  return address;
}

function normalizeObservedAt(value: Date | string): string {
  if (value instanceof Date) {
    if (!Number.isFinite(value.getTime())) {
      throw new NakamaRobinhoodReceiptError('Timestamp is invalid.');
    }
    return value.toISOString();
  }
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value) ||
    !Number.isFinite(Date.parse(value)) ||
    new Date(value).toISOString() !== value
  ) {
    throw new NakamaRobinhoodReceiptError(
      'Timestamp must be a canonical UTC ISO string.',
    );
  }
  return value;
}

function toSafeNumber(value: bigint): number {
  return value > BigInt(Number.MAX_SAFE_INTEGER)
    ? Number.MAX_SAFE_INTEGER
    : Number(value);
}

async function delay(
  milliseconds: number,
  signal?: AbortSignal,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(resolve, milliseconds);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timeout);
        reject(
          new NakamaRobinhoodReceiptError(
            'Receipt wait was aborted by the caller.',
          ),
        );
      },
      { once: true },
    );
  });
}
