import { isHex } from 'viem';

import {
  getRobinhoodCaip2,
  getRobinhoodChainId,
  type RobinhoodNetwork,
} from './chains.js';
import type {
  ReconciliationStatus,
  RobinhoodRead,
  RobinhoodReadContext,
} from './domain.js';
import { NakamaRobinhoodStaleStateError } from './errors.js';

export interface RobinhoodIndexerPage<T> {
  scope: 'public_protocol_state';
  network: RobinhoodNetwork;
  chainId: 4663 | 46630;
  caip2: 'eip155:4663' | 'eip155:46630';
  items: readonly T[];
  nextCursor: string | null;
  indexedBlock: bigint;
  indexedBlockHash: `0x${string}`;
  chainHead: bigint;
  safeBlock: bigint | null;
  finalizedBlock: bigint | null;
  confirmations: number;
  reconciliation: Exclude<
    ReconciliationStatus,
    'reconciled' | 'direct_chain_only' | 'offline_cache'
  >;
  observedAt: string;
}

/** Provider-specific public indexers implement this isolated adapter. */
export interface RobinhoodPublicIndexerAdapter<Query, Item> {
  readonly providerId: string;
  readonly network: RobinhoodNetwork;
  readonly scope: 'public_protocol_state';
  queryPage(params: {
    query: Query;
    cursor: string | null;
    limit: number;
  }): Promise<RobinhoodIndexerPage<Item>>;
  isRetryable?(error: unknown): boolean;
}

export interface RobinhoodIndexerCollection<T> {
  providerId: string;
  pages: readonly RobinhoodIndexerPage<T>[];
  items: readonly T[];
  retries: number;
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

export async function collectRobinhoodIndexerPages<Query, Item>(params: {
  adapter: RobinhoodPublicIndexerAdapter<Query, Item>;
  query: Query;
  pageSize?: number;
  maximumPages?: number;
  maximumRetriesPerPage?: number;
  waitBeforeRetry?: (attempt: number) => Promise<void>;
}): Promise<RobinhoodIndexerCollection<Item>> {
  const providerId = params.adapter.providerId.trim();
  const pageSize = params.pageSize ?? 50;
  const maximumPages = params.maximumPages ?? 100;
  const maximumRetriesPerPage = params.maximumRetriesPerPage ?? 2;
  if (
    providerId === '' ||
    providerId.length > 128 ||
    !/^[a-z0-9][a-z0-9._-]*$/i.test(providerId) ||
    params.adapter.scope !== 'public_protocol_state' ||
    !Number.isSafeInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 100 ||
    !Number.isSafeInteger(maximumPages) ||
    maximumPages < 1 ||
    maximumPages > 1_000 ||
    !Number.isSafeInteger(maximumRetriesPerPage) ||
    maximumRetriesPerPage < 0 ||
    maximumRetriesPerPage > 5
  ) {
    throw new NakamaRobinhoodStaleStateError(
      'Public indexer adapter identity, pagination, or retry bounds are invalid.',
    );
  }
  const pages: RobinhoodIndexerPage<Item>[] = [];
  const items: Item[] = [];
  const seenCursors = new Set<string>();
  let cursor: string | null = null;
  let retries = 0;
  let snapshot: { blockNumber: bigint; blockHash: string } | null = null;

  for (let pageIndex = 0; pageIndex < maximumPages; pageIndex += 1) {
    let page: RobinhoodIndexerPage<Item> | undefined;
    for (let attempt = 0; attempt <= maximumRetriesPerPage; attempt += 1) {
      try {
        page = validateRobinhoodIndexerPage(
          await params.adapter.queryPage({
            query: params.query,
            cursor,
            limit: pageSize,
          }),
          params.adapter.network,
        );
        break;
      } catch (error) {
        if (
          attempt >= maximumRetriesPerPage ||
          params.adapter.isRetryable?.(error) !== true
        ) {
          throw error;
        }
        retries += 1;
        await params.waitBeforeRetry?.(attempt + 1);
      }
    }
    if (page == null) {
      throw new NakamaRobinhoodStaleStateError(
        'Public indexer page was not returned.',
      );
    }
    if (page.items.length > pageSize) {
      throw new NakamaRobinhoodStaleStateError(
        'Public indexer returned more items than requested page size.',
      );
    }
    if (
      snapshot != null &&
      (page.indexedBlock !== snapshot.blockNumber ||
        page.indexedBlockHash.toLowerCase() !== snapshot.blockHash)
    ) {
      throw new NakamaRobinhoodStaleStateError(
        'Indexer snapshot changed during pagination; cached results are invalid.',
      );
    }
    snapshot ??= {
      blockNumber: page.indexedBlock,
      blockHash: page.indexedBlockHash.toLowerCase(),
    };
    pages.push(page);
    items.push(...page.items);
    if (page.nextCursor == null) {
      return {
        providerId,
        pages: Object.freeze(pages),
        items: Object.freeze(items),
        retries,
      };
    }
    if (seenCursors.has(page.nextCursor)) {
      throw new NakamaRobinhoodStaleStateError(
        'Indexer pagination cursor repeated; query aborted.',
      );
    }
    seenCursors.add(page.nextCursor);
    cursor = page.nextCursor;
  }
  throw new NakamaRobinhoodStaleStateError(
    'Indexer pagination exceeded maximumPages without completing.',
  );
}

export function validateRobinhoodIndexerPage<T>(
  page: RobinhoodIndexerPage<T>,
  expectedNetwork: RobinhoodNetwork,
): RobinhoodIndexerPage<T> {
  if (
    page == null ||
    page.scope !== 'public_protocol_state' ||
    page.network !== expectedNetwork ||
    !Array.isArray(page.items) ||
    (page.nextCursor !== null &&
      (typeof page.nextCursor !== 'string' ||
        page.nextCursor.trim() === '' ||
        page.nextCursor.length > 512)) ||
    (page.reconciliation !== 'indexer_behind' &&
      page.reconciliation !== 'divergent')
  ) {
    throw new NakamaRobinhoodStaleStateError(
      'Public indexer page shape or reconciliation state is invalid.',
    );
  }
  validateReadContext({
    network: page.network,
    chainId: page.chainId,
    caip2: page.caip2,
    blockNumber: page.indexedBlock,
    blockHash: page.indexedBlockHash,
    chainHead: page.chainHead,
    safeBlock: page.safeBlock,
    finalizedBlock: page.finalizedBlock,
    confirmations: page.confirmations,
    reconciliation: page.reconciliation,
    observedAt: page.observedAt,
  });
  return Object.freeze({
    ...page,
    items: Object.freeze([...page.items]),
  });
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

export function invalidateRobinhoodOfflineCacheAfterReorg<T>(
  record: RobinhoodOfflineCacheRecord<T>,
  params: {
    reorgedBlock: bigint;
    canonicalBlockHash?: `0x${string}`;
  },
): RobinhoodOfflineCacheRecord<T> | null {
  if (typeof params.reorgedBlock !== 'bigint' || params.reorgedBlock < 0n) {
    throw new NakamaRobinhoodStaleStateError(
      'reorgedBlock must be a non-negative bigint.',
    );
  }
  const context = validateReadContext(record.context);
  const cachedAt = parseCanonicalTimestamp(record.cachedAt);
  const expiresAt = parseCanonicalTimestamp(record.expiresAt);
  if (
    record.schemaVersion !== 1 ||
    typeof record.key !== 'string' ||
    record.key.trim() === '' ||
    cachedAt == null ||
    expiresAt == null ||
    expiresAt <= cachedAt
  ) {
    throw new NakamaRobinhoodStaleStateError(
      'Offline cache record is malformed and cannot be reorg-checked.',
    );
  }
  if (
    params.canonicalBlockHash != null &&
    (!isHex(params.canonicalBlockHash) ||
      !/^0x[0-9a-f]{64}$/iu.test(params.canonicalBlockHash))
  ) {
    throw new NakamaRobinhoodStaleStateError(
      'canonicalBlockHash must be a 32-byte block hash.',
    );
  }
  if (context.blockNumber < params.reorgedBlock) return record;
  if (
    context.blockNumber === params.reorgedBlock &&
    params.canonicalBlockHash?.toLowerCase() === context.blockHash.toLowerCase()
  ) {
    return record;
  }
  return null;
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
