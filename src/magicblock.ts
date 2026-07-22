import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import type { AccountInfo, Commitment } from '@solana/web3.js';

import type { PublicKeyish } from './generated/protocol_types.js';
import { NakamaLegacyWriteDisabledError } from './errors.js';
import {
  anchorDiscriminator,
  encodeString,
  fromHex,
  readI64Le,
  readString,
  readU32Le,
  sha256Hex,
  stableStringify,
  toHex,
} from './utils.js';
import { toPublicKey } from './protocol_seeds.js';

export const OMEGAX_PRIVATE_CLAIM_REVIEW_PROGRAM_ID =
  'FADqaRcJHERauzMo3BRzXZVY2qvrpPqg1ie2FGqACCVn';
export const PRIVATE_REVIEW_REGISTRY_SEED = 'private_review_registry';
export const PRIVATE_REVIEW_OPERATOR_SEED = 'private_review_operator';
export const PRIVATE_CLAIM_REVIEW_SESSION_SEED = 'private_claim_review';

export const MAGICBLOCK_DELEGATION_PROGRAM_ID =
  'DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh';
export const MAGICBLOCK_MAGIC_PROGRAM_ID =
  'Magic11111111111111111111111111111111111111';
export const MAGICBLOCK_MAGIC_CONTEXT_ID =
  'MagicContext1111111111111111111111111111111';

export const MAGICBLOCK_DEVNET_ER_RPC_URL = 'https://devnet.magicblock.app/';
export const MAGICBLOCK_DEVNET_ER_WS_URL = 'wss://devnet.magicblock.app/';
export const MAGICBLOCK_DEVNET_TEE_RPC_URL =
  'https://devnet-tee.magicblock.app/';
export const MAGICBLOCK_RUNTIME_STATUS = 'disabled_ethereum_mainnet' as const;

export const PRIVATE_REVIEW_STATUS_OPENED = 0;
export const PRIVATE_REVIEW_STATUS_DELEGATED = 1;
export const PRIVATE_REVIEW_STATUS_REVIEWED = 2;
export const PRIVATE_REVIEW_STATUS_APPROVED = 3;
export const PRIVATE_REVIEW_STATUS_NEEDS_MORE_INFO = 4;
export const PRIVATE_REVIEW_STATUS_ESCALATED = 5;
export const PRIVATE_REVIEW_STATUS_FAILED = 6;

export type PrivateReviewStatus =
  | typeof PRIVATE_REVIEW_STATUS_REVIEWED
  | typeof PRIVATE_REVIEW_STATUS_APPROVED
  | typeof PRIVATE_REVIEW_STATUS_NEEDS_MORE_INFO
  | typeof PRIVATE_REVIEW_STATUS_ESCALATED
  | typeof PRIVATE_REVIEW_STATUS_FAILED;

export interface MagicBlockConnectionConfig {
  baseRpcUrl?: string;
  erRpcUrl?: string;
  erWsUrl?: string;
  teeRpcUrl?: string;
  commitment?: Commitment;
}

export interface MagicBlockConnections {
  baseConnection: Connection;
  erConnection: Connection;
  teeConnection: Connection;
}

export interface DerivePrivateClaimReviewSessionPdaParams {
  sessionAuthority: PublicKeyish;
  claimCase: PublicKeyish;
  sessionId: string;
  programId?: PublicKeyish;
}

export interface DerivePrivateReviewOperatorPdaParams {
  reviewerAuthority: PublicKeyish;
  programId?: PublicKeyish;
}

export interface InitializeReviewRegistryArgs {
  sessionAuthority: PublicKeyish;
  paymentAttestor: PublicKeyish;
  active?: boolean;
}

export interface BuildInitializeReviewRegistryTxParams extends InitializeReviewRegistryArgs {
  authority: PublicKeyish;
  registry?: PublicKeyish;
  programId?: PublicKeyish;
}

export interface BuildSetReviewRegistryAuthorityTxParams {
  authority: PublicKeyish;
  newAuthority: PublicKeyish;
  registry?: PublicKeyish;
  programId?: PublicKeyish;
}

export interface UpsertReviewOperatorArgs {
  reviewerAuthority: PublicKeyish;
  reviewBinaryHashHex: string;
  active?: boolean;
}

export interface BuildUpsertReviewOperatorTxParams extends UpsertReviewOperatorArgs {
  authority: PublicKeyish;
  registry?: PublicKeyish;
  operator?: PublicKeyish;
  programId?: PublicKeyish;
}

export interface BuildSetReviewOperatorActiveTxParams {
  authority: PublicKeyish;
  reviewerAuthority: PublicKeyish;
  active: boolean;
  registry?: PublicKeyish;
  operator?: PublicKeyish;
  programId?: PublicKeyish;
}

export interface OpenReviewSessionArgs {
  sessionId: string;
  claimCase: PublicKeyish;
  healthPlan: PublicKeyish;
  policySeries: PublicKeyish;
  evidenceRefHashHex: string;
  decisionSupportHashHex: string;
  schemaKeyHashHex: string;
  schemaHashHex: string;
}

export interface BuildOpenReviewSessionTxParams extends OpenReviewSessionArgs {
  payer: PublicKeyish;
  reviewerAuthority: PublicKeyish;
  registry?: PublicKeyish;
  operator?: PublicKeyish;
  reviewSession?: PublicKeyish;
  programId?: PublicKeyish;
}

export interface BuildDelegateReviewSessionTxParams {
  payer: PublicKeyish;
  claimCase: PublicKeyish;
  sessionId: string;
  reviewSession?: PublicKeyish;
  programId?: PublicKeyish;
}

export interface RecordPrivateReviewArgs {
  status: PrivateReviewStatus;
  reviewResultHashHex: string;
  reviewArtifactHashHex: string;
  reviewBinaryHashHex: string;
  teeAttestationDigestHex: string;
}

export interface BuildRecordPrivateReviewTxParams extends RecordPrivateReviewArgs {
  reviewer: PublicKeyish;
  sessionAuthority: PublicKeyish;
  claimCase: PublicKeyish;
  sessionId: string;
  registry?: PublicKeyish;
  operator?: PublicKeyish;
  reviewSession?: PublicKeyish;
  programId?: PublicKeyish;
}

export interface BuildRecordPrivatePaymentRefTxParams {
  paymentAttestor: PublicKeyish;
  sessionAuthority: PublicKeyish;
  claimCase: PublicKeyish;
  sessionId: string;
  privatePaymentRefHashHex: string;
  registry?: PublicKeyish;
  reviewSession?: PublicKeyish;
  programId?: PublicKeyish;
}

export interface BuildCommitAndCloseReviewSessionTxParams {
  payer: PublicKeyish;
  claimCase: PublicKeyish;
  sessionId: string;
  reviewSession?: PublicKeyish;
  programId?: PublicKeyish;
}

export interface BuildMarkReviewFailedTxParams {
  actor: PublicKeyish;
  sessionAuthority: PublicKeyish;
  claimCase: PublicKeyish;
  sessionId: string;
  failureRefHashHex: string;
  reviewSession?: PublicKeyish;
  programId?: PublicKeyish;
}

export interface MagicBlockExplorerLinkParams {
  signature: string;
  cluster?: 'devnet' | 'mainnet-beta' | 'custom';
  er?: boolean;
}

export interface PrivatePaymentsBuildRequest {
  endpoint:
    | '/v1/spl/deposit'
    | '/v1/spl/transfer'
    | '/v1/spl/withdraw'
    | '/v1/spl/initialize-mint';
  body: Record<string, unknown>;
  apiUrl?: string;
}

export interface PrivateReviewRegistryAccount {
  address: PublicKey;
  authority: PublicKey;
  sessionAuthority: PublicKey;
  paymentAttestor: PublicKey;
  active: boolean;
  operatorCount: number;
  createdAt: bigint;
  updatedAt: bigint;
  bump: number;
}

export interface PrivateReviewOperatorAccount {
  address: PublicKey;
  registry: PublicKey;
  reviewerAuthority: PublicKey;
  reviewBinaryHashHex: string;
  active: boolean;
  createdAt: bigint;
  updatedAt: bigint;
  bump: number;
}

export interface PrivateClaimReviewSessionAccount {
  address: PublicKey;
  sessionId: string;
  sessionAuthority: PublicKey;
  claimCase: PublicKey;
  healthPlan: PublicKey;
  policySeries: PublicKey;
  evidenceRefHashHex: string;
  decisionSupportHashHex: string;
  schemaKeyHashHex: string;
  schemaHashHex: string;
  reviewOperator: PublicKey;
  reviewerAuthority: PublicKey;
  paymentAttestor: PublicKey;
  reviewResultHashHex: string;
  reviewArtifactHashHex: string;
  reviewBinaryHashHex: string;
  teeAttestationDigestHex: string;
  operator: PublicKey;
  privatePaymentRefHashHex: string;
  status: number;
  openedAt: bigint;
  delegatedAt: bigint;
  reviewedAt: bigint;
  paymentRecordedAt: bigint;
  committedAt: bigint;
  failedAt: bigint;
  bump: number;
}

export function createMagicBlockConnections(
  config: MagicBlockConnectionConfig = {},
): MagicBlockConnections {
  magicBlockWriteDisabled('createMagicBlockConnections');
  return {
    baseConnection: new Connection(
      config.baseRpcUrl ?? 'https://api.devnet.solana.com',
      config.commitment,
    ),
    erConnection: new Connection(
      config.erRpcUrl ?? MAGICBLOCK_DEVNET_ER_RPC_URL,
      {
        commitment: config.commitment,
        wsEndpoint: config.erWsUrl ?? MAGICBLOCK_DEVNET_ER_WS_URL,
      },
    ),
    teeConnection: new Connection(
      config.teeRpcUrl ?? MAGICBLOCK_DEVNET_TEE_RPC_URL,
      config.commitment,
    ),
  };
}

export function derivePrivateReviewRegistryPda(
  programId?: PublicKeyish,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(PRIVATE_REVIEW_REGISTRY_SEED, 'utf8')],
    privateReviewProgramId(programId),
  )[0];
}

export function derivePrivateReviewOperatorPda(
  params: DerivePrivateReviewOperatorPdaParams,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(PRIVATE_REVIEW_OPERATOR_SEED, 'utf8'),
      toPublicKey(params.reviewerAuthority).toBuffer(),
    ],
    privateReviewProgramId(params.programId),
  )[0];
}

export function derivePrivateClaimReviewSessionPda(
  params: DerivePrivateClaimReviewSessionPdaParams,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(PRIVATE_CLAIM_REVIEW_SESSION_SEED, 'utf8'),
      toPublicKey(params.sessionAuthority).toBuffer(),
      toPublicKey(params.claimCase).toBuffer(),
      Buffer.from(params.sessionId, 'utf8'),
    ],
    privateReviewProgramId(params.programId),
  )[0];
}

export function isDelegatedAccountOwner(owner: PublicKeyish): boolean {
  return toPublicKey(owner).equals(
    new PublicKey(MAGICBLOCK_DELEGATION_PROGRAM_ID),
  );
}

export async function waitForMagicBlockCommitmentSignature(
  erSignature: string,
  erConnection: Connection,
): Promise<string> {
  magicBlockWriteDisabled('waitForMagicBlockCommitmentSignature');
  const scheduledTx = await erConnection.getTransaction(erSignature, {
    maxSupportedTransactionVersion: 0,
  });
  if (!scheduledTx?.meta) {
    throw new Error(
      'MagicBlock ER transaction was not found or has no metadata',
    );
  }
  const scheduledCommitSignature = parseMagicBlockLogSignature(
    scheduledTx.meta.logMessages ?? [],
    'ScheduledCommitSent signature: ',
  );
  if (!scheduledCommitSignature) {
    throw new Error('MagicBlock scheduled commit signature was not found');
  }

  const latestBlockhash = await erConnection.getLatestBlockhash();
  await erConnection.confirmTransaction({
    signature: scheduledCommitSignature,
    ...latestBlockhash,
  });
  const committedTx = await erConnection.getTransaction(
    scheduledCommitSignature,
    { maxSupportedTransactionVersion: 0 },
  );
  if (!committedTx?.meta) {
    throw new Error('MagicBlock scheduled commit transaction was not found');
  }
  const commitmentSignature = parseMagicBlockLogSignature(
    committedTx.meta.logMessages ?? [],
    'ScheduledCommitSent signature[0]: ',
  );
  if (!commitmentSignature) {
    throw new Error('MagicBlock base commitment signature was not found');
  }
  return commitmentSignature;
}

export function buildMagicBlockExplorerLink(
  params: MagicBlockExplorerLinkParams,
): string {
  const cluster = params.cluster ?? 'devnet';
  const base = params.er
    ? 'https://explorer.magicblock.gg/tx'
    : 'https://explorer.solana.com/tx';
  const clusterQuery = cluster === 'mainnet-beta' ? '' : `?cluster=${cluster}`;
  return `${base}/${encodeURIComponent(params.signature)}${clusterQuery}`;
}

export function buildInitializeReviewRegistryTx(
  params: BuildInitializeReviewRegistryTxParams,
): Transaction {
  magicBlockWriteDisabled('buildInitializeReviewRegistryTx');
  const programId = privateReviewProgramId(params.programId);
  const registry =
    params.registry != null
      ? toPublicKey(params.registry)
      : derivePrivateReviewRegistryPda(programId);

  return tx(params.authority, [
    new TransactionInstruction({
      programId,
      keys: [
        {
          pubkey: toPublicKey(params.authority),
          isSigner: true,
          isWritable: true,
        },
        { pubkey: registry, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.concat([
        ix('initialize_review_registry'),
        key(params.sessionAuthority),
        key(params.paymentAttestor),
        bool(params.active ?? true),
      ]),
    }),
  ]);
}

export function buildSetReviewRegistryAuthorityTx(
  params: BuildSetReviewRegistryAuthorityTxParams,
): Transaction {
  magicBlockWriteDisabled('buildSetReviewRegistryAuthorityTx');
  const programId = privateReviewProgramId(params.programId);
  const registry =
    params.registry != null
      ? toPublicKey(params.registry)
      : derivePrivateReviewRegistryPda(programId);

  return tx(params.authority, [
    new TransactionInstruction({
      programId,
      keys: [
        {
          pubkey: toPublicKey(params.authority),
          isSigner: true,
          isWritable: true,
        },
        { pubkey: registry, isSigner: false, isWritable: true },
      ],
      data: Buffer.concat([
        ix('set_review_registry_authority'),
        key(params.newAuthority),
      ]),
    }),
  ]);
}

export function buildUpsertReviewOperatorTx(
  params: BuildUpsertReviewOperatorTxParams,
): Transaction {
  magicBlockWriteDisabled('buildUpsertReviewOperatorTx');
  const programId = privateReviewProgramId(params.programId);
  const registry =
    params.registry != null
      ? toPublicKey(params.registry)
      : derivePrivateReviewRegistryPda(programId);
  const operator =
    params.operator != null
      ? toPublicKey(params.operator)
      : derivePrivateReviewOperatorPda({
          reviewerAuthority: params.reviewerAuthority,
          programId,
        });

  return tx(params.authority, [
    new TransactionInstruction({
      programId,
      keys: [
        {
          pubkey: toPublicKey(params.authority),
          isSigner: true,
          isWritable: true,
        },
        { pubkey: registry, isSigner: false, isWritable: true },
        { pubkey: operator, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.concat([
        ix('upsert_review_operator'),
        key(params.reviewerAuthority),
        hash(params.reviewBinaryHashHex, 'reviewBinaryHashHex'),
        bool(params.active ?? true),
      ]),
    }),
  ]);
}

export function buildSetReviewOperatorActiveTx(
  params: BuildSetReviewOperatorActiveTxParams,
): Transaction {
  magicBlockWriteDisabled('buildSetReviewOperatorActiveTx');
  const programId = privateReviewProgramId(params.programId);
  const registry =
    params.registry != null
      ? toPublicKey(params.registry)
      : derivePrivateReviewRegistryPda(programId);
  const operator =
    params.operator != null
      ? toPublicKey(params.operator)
      : derivePrivateReviewOperatorPda({
          reviewerAuthority: params.reviewerAuthority,
          programId,
        });

  return tx(params.authority, [
    new TransactionInstruction({
      programId,
      keys: [
        {
          pubkey: toPublicKey(params.authority),
          isSigner: true,
          isWritable: true,
        },
        { pubkey: registry, isSigner: false, isWritable: true },
        { pubkey: operator, isSigner: false, isWritable: true },
      ],
      data: Buffer.concat([
        ix('set_review_operator_active'),
        bool(params.active),
      ]),
    }),
  ]);
}

export function buildOpenReviewSessionTx(
  params: BuildOpenReviewSessionTxParams,
): Transaction {
  magicBlockWriteDisabled('buildOpenReviewSessionTx');
  const programId = privateReviewProgramId(params.programId);
  const registry =
    params.registry != null
      ? toPublicKey(params.registry)
      : derivePrivateReviewRegistryPda(programId);
  const operator =
    params.operator != null
      ? toPublicKey(params.operator)
      : derivePrivateReviewOperatorPda({
          reviewerAuthority: params.reviewerAuthority,
          programId,
        });
  const reviewSession =
    params.reviewSession != null
      ? toPublicKey(params.reviewSession)
      : derivePrivateClaimReviewSessionPda({
          sessionAuthority: params.payer,
          claimCase: params.claimCase,
          sessionId: params.sessionId,
          programId,
        });

  return tx(params.payer, [
    new TransactionInstruction({
      programId,
      keys: [
        { pubkey: toPublicKey(params.payer), isSigner: true, isWritable: true },
        { pubkey: registry, isSigner: false, isWritable: false },
        { pubkey: operator, isSigner: false, isWritable: false },
        { pubkey: reviewSession, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.concat([
        ix('open_review_session'),
        encodeString(params.sessionId),
        key(params.claimCase),
        key(params.healthPlan),
        key(params.policySeries),
        hash(params.evidenceRefHashHex, 'evidenceRefHashHex'),
        hash(params.decisionSupportHashHex, 'decisionSupportHashHex'),
        hash(params.schemaKeyHashHex, 'schemaKeyHashHex'),
        hash(params.schemaHashHex, 'schemaHashHex'),
      ]),
    }),
  ]);
}

export function buildDelegateReviewSessionTx(
  params: BuildDelegateReviewSessionTxParams,
): Transaction {
  magicBlockWriteDisabled('buildDelegateReviewSessionTx');
  const programId = privateReviewProgramId(params.programId);
  const reviewSession =
    params.reviewSession != null
      ? toPublicKey(params.reviewSession)
      : derivePrivateClaimReviewSessionPda({
          sessionAuthority: params.payer,
          claimCase: params.claimCase,
          sessionId: params.sessionId,
          programId,
        });
  const delegateAccounts = deriveMagicBlockDelegateAccounts({
    delegatedAccount: reviewSession,
    ownerProgram: programId,
  });

  return tx(params.payer, [
    new TransactionInstruction({
      programId,
      keys: [
        { pubkey: toPublicKey(params.payer), isSigner: true, isWritable: true },
        { pubkey: reviewSession, isSigner: false, isWritable: true },
        {
          pubkey: programId,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: delegateAccounts.delegateBuffer,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: delegateAccounts.delegationRecord,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: delegateAccounts.delegationMetadata,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: new PublicKey(MAGICBLOCK_DELEGATION_PROGRAM_ID),
          isSigner: false,
          isWritable: false,
        },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.concat([
        ix('delegate_review_session'),
        encodeString(params.sessionId),
        key(params.claimCase),
      ]),
    }),
  ]);
}

export function buildRecordPrivateReviewTx(
  params: BuildRecordPrivateReviewTxParams,
): Transaction {
  magicBlockWriteDisabled('buildRecordPrivateReviewTx');
  const programId = privateReviewProgramId(params.programId);
  const registry =
    params.registry != null
      ? toPublicKey(params.registry)
      : derivePrivateReviewRegistryPda(programId);
  const operator =
    params.operator != null
      ? toPublicKey(params.operator)
      : derivePrivateReviewOperatorPda({
          reviewerAuthority: params.reviewer,
          programId,
        });
  const reviewSession =
    params.reviewSession != null
      ? toPublicKey(params.reviewSession)
      : derivePrivateClaimReviewSessionPda({
          sessionAuthority: params.sessionAuthority,
          claimCase: params.claimCase,
          sessionId: params.sessionId,
          programId,
        });

  return tx(params.reviewer, [
    new TransactionInstruction({
      programId,
      keys: [
        {
          pubkey: toPublicKey(params.reviewer),
          isSigner: true,
          isWritable: true,
        },
        { pubkey: registry, isSigner: false, isWritable: false },
        { pubkey: operator, isSigner: false, isWritable: false },
        { pubkey: reviewSession, isSigner: false, isWritable: true },
      ],
      data: Buffer.concat([
        ix('record_private_review'),
        Buffer.from([params.status]),
        hash(params.reviewResultHashHex, 'reviewResultHashHex'),
        hash(params.reviewArtifactHashHex, 'reviewArtifactHashHex'),
        hash(params.reviewBinaryHashHex, 'reviewBinaryHashHex'),
        hash(params.teeAttestationDigestHex, 'teeAttestationDigestHex'),
      ]),
    }),
  ]);
}

export function buildRecordPrivatePaymentRefTx(
  params: BuildRecordPrivatePaymentRefTxParams,
): Transaction {
  magicBlockWriteDisabled('buildRecordPrivatePaymentRefTx');
  const programId = privateReviewProgramId(params.programId);
  const registry =
    params.registry != null
      ? toPublicKey(params.registry)
      : derivePrivateReviewRegistryPda(programId);
  const reviewSession =
    params.reviewSession != null
      ? toPublicKey(params.reviewSession)
      : derivePrivateClaimReviewSessionPda({
          sessionAuthority: params.sessionAuthority,
          claimCase: params.claimCase,
          sessionId: params.sessionId,
          programId,
        });

  return tx(params.paymentAttestor, [
    new TransactionInstruction({
      programId,
      keys: [
        {
          pubkey: toPublicKey(params.paymentAttestor),
          isSigner: true,
          isWritable: true,
        },
        { pubkey: registry, isSigner: false, isWritable: false },
        { pubkey: reviewSession, isSigner: false, isWritable: true },
      ],
      data: Buffer.concat([
        ix('record_private_payment_ref'),
        hash(params.privatePaymentRefHashHex, 'privatePaymentRefHashHex'),
      ]),
    }),
  ]);
}

export function buildCommitAndCloseReviewSessionTx(
  params: BuildCommitAndCloseReviewSessionTxParams,
): Transaction {
  magicBlockWriteDisabled('buildCommitAndCloseReviewSessionTx');
  const programId = privateReviewProgramId(params.programId);
  const reviewSession =
    params.reviewSession != null
      ? toPublicKey(params.reviewSession)
      : derivePrivateClaimReviewSessionPda({
          sessionAuthority: params.payer,
          claimCase: params.claimCase,
          sessionId: params.sessionId,
          programId,
        });

  return tx(params.payer, [
    new TransactionInstruction({
      programId,
      keys: [
        { pubkey: toPublicKey(params.payer), isSigner: true, isWritable: true },
        { pubkey: reviewSession, isSigner: false, isWritable: true },
        {
          pubkey: new PublicKey(MAGICBLOCK_MAGIC_CONTEXT_ID),
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: new PublicKey(MAGICBLOCK_MAGIC_PROGRAM_ID),
          isSigner: false,
          isWritable: false,
        },
      ],
      data: ix('commit_and_close_review_session'),
    }),
  ]);
}

export function buildMarkReviewFailedTx(
  params: BuildMarkReviewFailedTxParams,
): Transaction {
  magicBlockWriteDisabled('buildMarkReviewFailedTx');
  const programId = privateReviewProgramId(params.programId);
  const reviewSession =
    params.reviewSession != null
      ? toPublicKey(params.reviewSession)
      : derivePrivateClaimReviewSessionPda({
          sessionAuthority: params.sessionAuthority,
          claimCase: params.claimCase,
          sessionId: params.sessionId,
          programId,
        });

  return tx(params.actor, [
    new TransactionInstruction({
      programId,
      keys: [
        {
          pubkey: toPublicKey(params.actor),
          isSigner: true,
          isWritable: false,
        },
        { pubkey: reviewSession, isSigner: false, isWritable: true },
      ],
      data: Buffer.concat([
        ix('mark_review_failed'),
        hash(params.failureRefHashHex, 'failureRefHashHex'),
      ]),
    }),
  ]);
}

export async function fetchPrivateReviewOperator(
  connection: Pick<Connection, 'getAccountInfo'>,
  params: DerivePrivateReviewOperatorPdaParams,
): Promise<PrivateReviewOperatorAccount | null> {
  const address = derivePrivateReviewOperatorPda(params);
  const info = await connection.getAccountInfo(address);
  if (!info) return null;
  assertOwnedByProgram(info, params.programId);
  return decodePrivateReviewOperatorAccount(address, info.data);
}

export async function fetchPrivateClaimReviewSession(
  connection: Pick<Connection, 'getAccountInfo'>,
  params: DerivePrivateClaimReviewSessionPdaParams,
): Promise<PrivateClaimReviewSessionAccount | null> {
  const address = derivePrivateClaimReviewSessionPda(params);
  const info = await connection.getAccountInfo(address);
  if (!info) return null;
  assertOwnedByProgram(info, params.programId);
  return decodePrivateClaimReviewSessionAccount(address, info.data);
}

export async function verifyActivePrivateReviewOperator(
  connection: Pick<Connection, 'getAccountInfo'>,
  params: DerivePrivateReviewOperatorPdaParams & {
    expectedReviewBinaryHashHex?: string;
  },
): Promise<PrivateReviewOperatorAccount> {
  const operator = await fetchPrivateReviewOperator(connection, params);
  if (!operator) {
    throw new Error('MagicBlock private review operator account was not found');
  }
  if (!operator.active) {
    throw new Error('MagicBlock private review operator is inactive');
  }
  if (
    params.expectedReviewBinaryHashHex &&
    normalizeHash(params.expectedReviewBinaryHashHex) !==
      operator.reviewBinaryHashHex
  ) {
    throw new Error('MagicBlock private review operator binary hash mismatch');
  }
  return operator;
}

export async function verifyCommittedApprovedReviewSession(
  connection: Pick<Connection, 'getAccountInfo'>,
  params: DerivePrivateClaimReviewSessionPdaParams & {
    expectedReviewResultHashHex: string;
    expectedReviewBinaryHashHex: string;
    expectedPrivatePaymentRefHashHex?: string;
  },
): Promise<PrivateClaimReviewSessionAccount> {
  const session = await fetchPrivateClaimReviewSession(connection, params);
  if (!session) {
    throw new Error('MagicBlock private claim review session was not found');
  }
  if (session.status !== PRIVATE_REVIEW_STATUS_APPROVED) {
    throw new Error('MagicBlock review session is not approved');
  }
  if (session.committedAt === 0n) {
    throw new Error('MagicBlock review session is not committed');
  }
  assertHashMatches(
    session.reviewResultHashHex,
    params.expectedReviewResultHashHex,
    'review result hash',
  );
  assertHashMatches(
    session.reviewBinaryHashHex,
    params.expectedReviewBinaryHashHex,
    'review binary hash',
  );
  if (isZeroHashHex(session.privatePaymentRefHashHex)) {
    throw new Error('MagicBlock approved review is missing payment reference');
  }
  if (params.expectedPrivatePaymentRefHashHex) {
    assertHashMatches(
      session.privatePaymentRefHashHex,
      params.expectedPrivatePaymentRefHashHex,
      'private payment reference hash',
    );
  }
  return session;
}

export async function buildPrivatePaymentsApiTransaction(
  params: PrivatePaymentsBuildRequest,
): Promise<unknown> {
  magicBlockWriteDisabled('buildPrivatePaymentsApiTransaction');
  const url = `${params.apiUrl ?? 'https://payments.magicblock.app'}${params.endpoint}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(params.body),
  });
  const payload = (await response.json()) as unknown;
  if (!response.ok) {
    throw new Error(
      `MagicBlock Private Payments API error: ${JSON.stringify(payload)}`,
    );
  }
  return payload;
}

export function privatePaymentReferenceHash(payload: unknown): string {
  return sha256Hex(stableStringify(payload));
}

export function deriveMagicBlockDelegateAccounts(params: {
  delegatedAccount: PublicKeyish;
  ownerProgram?: PublicKeyish;
}): {
  delegateBuffer: PublicKey;
  delegationRecord: PublicKey;
  delegationMetadata: PublicKey;
} {
  const delegatedAccount = toPublicKey(params.delegatedAccount);
  const ownerProgram = privateReviewProgramId(params.ownerProgram);
  const delegationProgram = new PublicKey(MAGICBLOCK_DELEGATION_PROGRAM_ID);
  return {
    delegateBuffer: PublicKey.findProgramAddressSync(
      [Buffer.from('buffer', 'utf8'), delegatedAccount.toBuffer()],
      ownerProgram,
    )[0],
    delegationRecord: PublicKey.findProgramAddressSync(
      [Buffer.from('delegation', 'utf8'), delegatedAccount.toBuffer()],
      delegationProgram,
    )[0],
    delegationMetadata: PublicKey.findProgramAddressSync(
      [Buffer.from('delegation-metadata', 'utf8'), delegatedAccount.toBuffer()],
      delegationProgram,
    )[0],
  };
}

export function decodePrivateReviewRegistryAccount(
  address: PublicKeyish,
  data: Buffer | Uint8Array,
): PrivateReviewRegistryAccount {
  const buffer = accountDataBuffer(data, 'PrivateReviewRegistry');
  let offset = 8;
  const authority = readPublicKey(buffer, offset);
  offset += 32;
  const sessionAuthority = readPublicKey(buffer, offset);
  offset += 32;
  const paymentAttestor = readPublicKey(buffer, offset);
  offset += 32;
  const active = readBool(buffer, offset);
  offset += 1;
  const operatorCount = readU32Le(buffer, offset);
  offset += 4;
  const createdAt = readI64Le(buffer, offset);
  offset += 8;
  const updatedAt = readI64Le(buffer, offset);
  offset += 8;
  const bump = buffer.readUInt8(offset);
  return {
    address: toPublicKey(address),
    authority,
    sessionAuthority,
    paymentAttestor,
    active,
    operatorCount,
    createdAt,
    updatedAt,
    bump,
  };
}

export function decodePrivateReviewOperatorAccount(
  address: PublicKeyish,
  data: Buffer | Uint8Array,
): PrivateReviewOperatorAccount {
  const buffer = accountDataBuffer(data, 'PrivateReviewOperator');
  let offset = 8;
  const registry = readPublicKey(buffer, offset);
  offset += 32;
  const reviewerAuthority = readPublicKey(buffer, offset);
  offset += 32;
  const reviewBinaryHashHex = readHashHex(buffer, offset);
  offset += 32;
  const active = readBool(buffer, offset);
  offset += 1;
  const createdAt = readI64Le(buffer, offset);
  offset += 8;
  const updatedAt = readI64Le(buffer, offset);
  offset += 8;
  const bump = buffer.readUInt8(offset);
  return {
    address: toPublicKey(address),
    registry,
    reviewerAuthority,
    reviewBinaryHashHex,
    active,
    createdAt,
    updatedAt,
    bump,
  };
}

export function decodePrivateClaimReviewSessionAccount(
  address: PublicKeyish,
  data: Buffer | Uint8Array,
): PrivateClaimReviewSessionAccount {
  const buffer = accountDataBuffer(data, 'PrivateClaimReviewSession');
  let offset = 8;
  const readSessionId = readString(buffer, offset);
  const sessionId = readSessionId.value;
  offset = readSessionId.offset;
  const sessionAuthority = readPublicKey(buffer, offset);
  offset += 32;
  const claimCase = readPublicKey(buffer, offset);
  offset += 32;
  const healthPlan = readPublicKey(buffer, offset);
  offset += 32;
  const policySeries = readPublicKey(buffer, offset);
  offset += 32;
  const evidenceRefHashHex = readHashHex(buffer, offset);
  offset += 32;
  const decisionSupportHashHex = readHashHex(buffer, offset);
  offset += 32;
  const schemaKeyHashHex = readHashHex(buffer, offset);
  offset += 32;
  const schemaHashHex = readHashHex(buffer, offset);
  offset += 32;
  const reviewOperator = readPublicKey(buffer, offset);
  offset += 32;
  const reviewerAuthority = readPublicKey(buffer, offset);
  offset += 32;
  const paymentAttestor = readPublicKey(buffer, offset);
  offset += 32;
  const reviewResultHashHex = readHashHex(buffer, offset);
  offset += 32;
  const reviewArtifactHashHex = readHashHex(buffer, offset);
  offset += 32;
  const reviewBinaryHashHex = readHashHex(buffer, offset);
  offset += 32;
  const teeAttestationDigestHex = readHashHex(buffer, offset);
  offset += 32;
  const operator = readPublicKey(buffer, offset);
  offset += 32;
  const privatePaymentRefHashHex = readHashHex(buffer, offset);
  offset += 32;
  const status = buffer.readUInt8(offset);
  offset += 1;
  const openedAt = readI64Le(buffer, offset);
  offset += 8;
  const delegatedAt = readI64Le(buffer, offset);
  offset += 8;
  const reviewedAt = readI64Le(buffer, offset);
  offset += 8;
  const paymentRecordedAt = readI64Le(buffer, offset);
  offset += 8;
  const committedAt = readI64Le(buffer, offset);
  offset += 8;
  const failedAt = readI64Le(buffer, offset);
  offset += 8;
  const bump = buffer.readUInt8(offset);
  return {
    address: toPublicKey(address),
    sessionId,
    sessionAuthority,
    claimCase,
    healthPlan,
    policySeries,
    evidenceRefHashHex,
    decisionSupportHashHex,
    schemaKeyHashHex,
    schemaHashHex,
    reviewOperator,
    reviewerAuthority,
    paymentAttestor,
    reviewResultHashHex,
    reviewArtifactHashHex,
    reviewBinaryHashHex,
    teeAttestationDigestHex,
    operator,
    privatePaymentRefHashHex,
    status,
    openedAt,
    delegatedAt,
    reviewedAt,
    paymentRecordedAt,
    committedAt,
    failedAt,
    bump,
  };
}

function privateReviewProgramId(programId?: PublicKeyish): PublicKey {
  return toPublicKey(programId ?? OMEGAX_PRIVATE_CLAIM_REVIEW_PROGRAM_ID);
}

function ix(name: string): Buffer {
  return anchorDiscriminator('global', name);
}

function parseMagicBlockLogSignature(
  logMessages: string[],
  prefix: string,
): string | null {
  for (const message of logMessages) {
    if (message.includes(prefix)) {
      return message.split(prefix)[1]?.trim() || null;
    }
  }
  return null;
}

function key(value: PublicKeyish): Buffer {
  return toPublicKey(value).toBuffer();
}

function bool(value: boolean): Buffer {
  return Buffer.from([value ? 1 : 0]);
}

function hash(value: string, label: string): Buffer {
  try {
    return Buffer.from(fromHex(value, 32));
  } catch (cause) {
    throw new Error(`${label} must be a 32-byte hex string`, { cause });
  }
}

function tx(
  feePayer: PublicKeyish,
  instructions: TransactionInstruction[],
): Transaction {
  const transaction = new Transaction();
  transaction.feePayer = toPublicKey(feePayer);
  transaction.add(...instructions);
  return transaction;
}

function assertOwnedByProgram(
  info: AccountInfo<Buffer>,
  programId?: PublicKeyish,
): void {
  const expected = privateReviewProgramId(programId);
  if (!info.owner.equals(expected)) {
    throw new Error(
      `MagicBlock account owner mismatch: expected ${expected.toBase58()}, got ${info.owner.toBase58()}`,
    );
  }
}

function accountDataBuffer(
  data: Buffer | Uint8Array,
  accountName: string,
): Buffer {
  const buffer = Buffer.from(data);
  const expected = anchorDiscriminator('account', accountName);
  if (
    buffer.length < expected.length ||
    !buffer.subarray(0, 8).equals(expected)
  ) {
    throw new Error(`invalid ${accountName} account discriminator`);
  }
  return buffer;
}

function readPublicKey(buffer: Buffer, offset: number): PublicKey {
  return new PublicKey(buffer.subarray(offset, offset + 32));
}

function readHashHex(buffer: Buffer, offset: number): string {
  return toHex(buffer.subarray(offset, offset + 32));
}

function readBool(buffer: Buffer, offset: number): boolean {
  const value = buffer.readUInt8(offset);
  if (value !== 0 && value !== 1) {
    throw new Error(`invalid bool byte ${value}`);
  }
  return value === 1;
}

function normalizeHash(value: string): string {
  return toHex(fromHex(value, 32));
}

function isZeroHashHex(value: string): boolean {
  return /^0+$/.test(normalizeHash(value));
}

function assertHashMatches(
  actual: string,
  expected: string,
  label: string,
): void {
  if (normalizeHash(actual) !== normalizeHash(expected)) {
    throw new Error(`MagicBlock ${label} mismatch`);
  }
}

function magicBlockWriteDisabled(operation: string): void {
  throw new NakamaLegacyWriteDisabledError(
    'MagicBlock is a legacy Solana integration and is disabled in the Ethereum mainnet SDK.',
    {
      details: {
        operation,
        status: MAGICBLOCK_RUNTIME_STATUS,
      },
    },
  );
}
