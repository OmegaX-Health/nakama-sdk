import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import type { Commitment } from '@solana/web3.js';

import type { PublicKeyish } from './generated/protocol_types.js';
import {
  anchorDiscriminator,
  encodeString,
  fromHex,
  sha256Hex,
  stableStringify,
} from './utils.js';
import { toPublicKey } from './protocol_seeds.js';

export const OMEGAX_PRIVATE_CLAIM_REVIEW_PROGRAM_ID =
  'FADqaRcJHERauzMo3BRzXZVY2qvrpPqg1ie2FGqACCVn';
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
  sessionId: string;
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
  reviewSession?: PublicKeyish;
  programId?: PublicKeyish;
}

export interface BuildDelegateReviewSessionTxParams {
  payer: PublicKeyish;
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
  sessionId: string;
  reviewSession?: PublicKeyish;
  programId?: PublicKeyish;
}

export interface BuildRecordPrivatePaymentRefTxParams {
  payer: PublicKeyish;
  sessionId: string;
  privatePaymentRefHashHex: string;
  reviewSession?: PublicKeyish;
  programId?: PublicKeyish;
}

export interface BuildCommitAndCloseReviewSessionTxParams {
  payer: PublicKeyish;
  sessionId: string;
  reviewSession?: PublicKeyish;
  programId?: PublicKeyish;
}

export interface BuildMarkReviewFailedTxParams {
  payer: PublicKeyish;
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

export function createMagicBlockConnections(
  config: MagicBlockConnectionConfig = {},
): MagicBlockConnections {
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

export function derivePrivateClaimReviewSessionPda(
  params: DerivePrivateClaimReviewSessionPdaParams,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(PRIVATE_CLAIM_REVIEW_SESSION_SEED, 'utf8'),
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
  const sdk = await import('@magicblock-labs/ephemeral-rollups-sdk');
  return sdk.GetCommitmentSignature(erSignature, erConnection);
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

export function buildOpenReviewSessionTx(
  params: BuildOpenReviewSessionTxParams,
): Transaction {
  const programId = privateReviewProgramId(params.programId);
  const reviewSession =
    params.reviewSession != null
      ? toPublicKey(params.reviewSession)
      : derivePrivateClaimReviewSessionPda({
          sessionId: params.sessionId,
          programId,
        });

  return tx(params.payer, [
    new TransactionInstruction({
      programId,
      keys: [
        { pubkey: toPublicKey(params.payer), isSigner: true, isWritable: true },
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
  const programId = privateReviewProgramId(params.programId);
  const reviewSession =
    params.reviewSession != null
      ? toPublicKey(params.reviewSession)
      : derivePrivateClaimReviewSessionPda({
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
      ]),
    }),
  ]);
}

export function buildRecordPrivateReviewTx(
  params: BuildRecordPrivateReviewTxParams,
): Transaction {
  const programId = privateReviewProgramId(params.programId);
  const reviewSession =
    params.reviewSession != null
      ? toPublicKey(params.reviewSession)
      : derivePrivateClaimReviewSessionPda({
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
  const programId = privateReviewProgramId(params.programId);
  const reviewSession =
    params.reviewSession != null
      ? toPublicKey(params.reviewSession)
      : derivePrivateClaimReviewSessionPda({
          sessionId: params.sessionId,
          programId,
        });

  return tx(params.payer, [
    new TransactionInstruction({
      programId,
      keys: [
        { pubkey: toPublicKey(params.payer), isSigner: true, isWritable: true },
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
  const programId = privateReviewProgramId(params.programId);
  const reviewSession =
    params.reviewSession != null
      ? toPublicKey(params.reviewSession)
      : derivePrivateClaimReviewSessionPda({
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
  const programId = privateReviewProgramId(params.programId);
  const reviewSession =
    params.reviewSession != null
      ? toPublicKey(params.reviewSession)
      : derivePrivateClaimReviewSessionPda({
          sessionId: params.sessionId,
          programId,
        });

  return tx(params.payer, [
    new TransactionInstruction({
      programId,
      keys: [
        { pubkey: toPublicKey(params.payer), isSigner: true, isWritable: true },
        { pubkey: reviewSession, isSigner: false, isWritable: true },
      ],
      data: Buffer.concat([
        ix('mark_review_failed'),
        hash(params.failureRefHashHex, 'failureRefHashHex'),
      ]),
    }),
  ]);
}

export async function buildPrivatePaymentsApiTransaction(
  params: PrivatePaymentsBuildRequest,
): Promise<unknown> {
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

function privateReviewProgramId(programId?: PublicKeyish): PublicKey {
  return toPublicKey(programId ?? OMEGAX_PRIVATE_CLAIM_REVIEW_PROGRAM_ID);
}

function ix(name: string): Buffer {
  return anchorDiscriminator('global', name);
}

function key(value: PublicKeyish): Buffer {
  return toPublicKey(value).toBuffer();
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
