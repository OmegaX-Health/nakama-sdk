import { isHex } from 'viem';

import { getRobinhoodCaip2, getRobinhoodChainId } from './chains.js';
import type { RobinhoodRead, RobinhoodReadContext } from './domain.js';
import { NakamaRobinhoodStaleStateError } from './errors.js';

export interface RobinhoodIndexerPage<T> {
  items: readonly T[];
  nextCursor: string | null;
  indexedBlock: bigint;
  indexedBlockHash: `0x${string}`;
  chainHead: bigint;
  observedAt: string;
}

export interface ReconcileRobinhoodReadOptions<T> {
  indexed: RobinhoodRead<T>;
  direct: RobinhoodRead<T>;
  equals?: (indexed: T, direct: T) => boolean;
  maximumIndexerLagBlocks?: number;
}

export interface RobinhoodOfflineCacheRecord<T> {
  schemaVersion: 1;
  key: string;
  value: T;
  context: RobinhoodReadContext;
  cachedAt: string;
  expiresAt: string;
}

export function reconcileRobinhoodRead<T>(
  options: ReconcileRobinhoodReadOptions<T>,
): RobinhoodRead<T> {
  const maximumLag = options.maximumIndexerLagBlocks ?? 20;
  if (!Number.isSafeInteger(maximumLag) || maximumLag < 0) {
    throw new NakamaRobinhoodStaleStateError(
      'maximumIndexerLagBlocks must be a non-negative integer.',
    );
  }
  if (
    options.indexed.context.chainId !== options.direct.context.chainId ||
    options.indexed.context.network !== options.direct.context.network
  ) {
    throw new NakamaRobinhoodStaleStateError(
      'Indexer and direct reads target different chains.',
    );
  }
  const lag =
    options.direct.context.chainHead > options.indexed.context.blockNumber
      ? options.direct.context.chainHead - options.indexed.context.blockNumber
      : 0n;
  if (lag > BigInt(maximumLag)) {
    return {
      value: options.direct.value,
      context: {
        ...options.direct.context,
        reconciliation: 'indexer_behind',
      },
    };
  }
  const equals = options.equals ?? structuralEqual;
  if (!equals(options.indexed.value, options.direct.value)) {
    return {
      value: options.direct.value,
      context: {
        ...options.direct.context,
        reconciliation: 'divergent',
      },
    };
  }
  return {
    value: options.direct.value,
    context: {
      ...options.direct.context,
      reconciliation: 'reconciled',
    },
  };
}

export function assertRobinhoodWriteStateSafe(
  context: RobinhoodReadContext,
): void {
  if (
    context.reconciliation !== 'reconciled' &&
    context.reconciliation !== 'direct_chain_only'
  ) {
    throw new NakamaRobinhoodStaleStateError(
      'Unsafe write disabled because indexed and canonical state are stale or divergent.',
      {
        details: {
          reconciliation: context.reconciliation,
          indexedBlock: context.blockNumber.toString(10),
          chainHead: context.chainHead.toString(10),
        },
      },
    );
  }
}

export function createRobinhoodOfflineCacheRecord<T>(params: {
  key: string;
  read: RobinhoodRead<T>;
  ttlSeconds: number;
  cachedAt?: Date;
}): RobinhoodOfflineCacheRecord<T> {
  if (
    params.key.trim() === '' ||
    !Number.isSafeInteger(params.ttlSeconds) ||
    params.ttlSeconds < 1
  ) {
    throw new NakamaRobinhoodStaleStateError(
      'Offline cache requires a key and positive integer ttlSeconds.',
    );
  }
  const cachedAt = params.cachedAt ?? new Date();
  if (!Number.isFinite(cachedAt.getTime())) {
    throw new NakamaRobinhoodStaleStateError('cachedAt is invalid.');
  }
  const expiresAtMilliseconds = cachedAt.getTime() + params.ttlSeconds * 1_000;
  const expiresAt = new Date(expiresAtMilliseconds);
  if (
    !Number.isFinite(expiresAtMilliseconds) ||
    !Number.isFinite(expiresAt.getTime())
  ) {
    throw new NakamaRobinhoodStaleStateError(
      'Offline cache expiry is outside the supported timestamp range.',
    );
  }
  return {
    schemaVersion: 1,
    key: params.key,
    value: params.read.value,
    context: {
      ...validateReadContext(params.read.context),
      reconciliation: 'offline_cache',
    },
    cachedAt: cachedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

export function readRobinhoodOfflineCache<T>(
  record: RobinhoodOfflineCacheRecord<T>,
  now: Date = new Date(),
): RobinhoodRead<T> | null {
  if (!Number.isFinite(now.getTime())) return null;
  const cachedAt = parseCanonicalTimestamp(record.cachedAt);
  const expiresAt = parseCanonicalTimestamp(record.expiresAt);
  if (
    record.schemaVersion !== 1 ||
    typeof record.key !== 'string' ||
    record.key.trim() === '' ||
    cachedAt == null ||
    expiresAt == null ||
    expiresAt <= cachedAt ||
    cachedAt > now.getTime() ||
    now.getTime() >= expiresAt
  ) {
    return null;
  }
  let context: RobinhoodReadContext;
  try {
    context = validateReadContext(record.context);
  } catch {
    return null;
  }
  return {
    value: record.value,
    context: { ...context, reconciliation: 'offline_cache' },
  };
}

function parseCanonicalTimestamp(value: unknown): number | null {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value)
  ) {
    return null;
  }
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value
    ? parsed
    : null;
}

function validateReadContext(
  context: RobinhoodReadContext,
): RobinhoodReadContext {
  if (
    context == null ||
    (context.network !== 'mainnet' && context.network !== 'testnet') ||
    context.chainId !== getRobinhoodChainId(context.network) ||
    context.caip2 !== getRobinhoodCaip2(context.network) ||
    typeof context.blockNumber !== 'bigint' ||
    context.blockNumber < 0n ||
    typeof context.chainHead !== 'bigint' ||
    context.chainHead < context.blockNumber ||
    typeof context.blockHash !== 'string' ||
    !isHex(context.blockHash) ||
    !/^0x[0-9a-f]{64}$/iu.test(context.blockHash) ||
    !Number.isSafeInteger(context.confirmations) ||
    context.confirmations < 0 ||
    parseCanonicalTimestamp(context.observedAt) == null ||
    ![
      'reconciled',
      'indexer_behind',
      'divergent',
      'direct_chain_only',
      'offline_cache',
    ].includes(context.reconciliation) ||
    (context.safeBlock != null &&
      (typeof context.safeBlock !== 'bigint' ||
        context.safeBlock > context.chainHead ||
        context.safeBlock < 0n)) ||
    (context.finalizedBlock != null &&
      (typeof context.finalizedBlock !== 'bigint' ||
        context.finalizedBlock < 0n ||
        context.safeBlock == null ||
        context.finalizedBlock > context.safeBlock))
  ) {
    throw new NakamaRobinhoodStaleStateError(
      'Offline cache read context is malformed or inconsistent.',
    );
  }
  return context;
}

function structuralEqual(left: unknown, right: unknown): boolean {
  return stringify(left) === stringify(right);
}

function stringify(value: unknown): string {
  return JSON.stringify(value, (_key, current) =>
    typeof current === 'bigint' ? current.toString(10) : current,
  );
}
