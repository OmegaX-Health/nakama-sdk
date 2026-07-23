import { isHex, type Address, type Hex } from 'viem';

import type { RobinhoodAssetAmount } from './assets.js';
import type {
  RobinhoodCaip2,
  RobinhoodChainId,
  RobinhoodNetwork,
} from './chains.js';
import { NakamaRobinhoodConfigError } from './errors.js';

export type Bytes32 = Hex;

export type ProgramState =
  | 'draft'
  | 'reviewed'
  | 'funded'
  | 'enrollment_open'
  | 'active'
  | 'runoff'
  | 'closed'
  | 'cancelled';

export type MembershipState = 'inactive' | 'active' | 'expired' | 'cancelled';

export type RequestState =
  | 'none'
  | 'pending'
  | 'information_requested'
  | 'escalated'
  | 'denied_appealable'
  | 'appealed'
  | 'approved'
  | 'final_denied'
  | 'settled';

export type DecisionAction = 'request_information' | 'approve' | 'deny';

export type ReviewerRole = 'initial_reviewer' | 'appeal_reviewer';

export type ProgramRole =
  | 'sponsor'
  | 'operator'
  | 'initial_reviewer'
  | 'appeal_reviewer'
  | 'settlement'
  | 'guardian'
  | 'eligibility_attestor';

export type PauseScope =
  | 'enrollment'
  | 'new_requests'
  | 'new_obligations'
  | 'settlement'
  | 'agent_actions';

export type ReconciliationStatus =
  | 'reconciled'
  | 'indexer_behind'
  | 'divergent'
  | 'direct_chain_only'
  | 'offline_cache';

export interface RobinhoodReadContext {
  network: RobinhoodNetwork;
  chainId: RobinhoodChainId;
  caip2: RobinhoodCaip2;
  blockNumber: bigint;
  blockHash: Hex;
  chainHead: bigint;
  safeBlock: bigint | null;
  finalizedBlock: bigint | null;
  confirmations: number;
  reconciliation: ReconciliationStatus;
  observedAt: string;
}

export interface RobinhoodRead<T> {
  value: T;
  context: RobinhoodReadContext;
}

export interface ProgramSnapshot {
  address: Address;
  programId: Bytes32;
  suiteId: Bytes32;
  sponsorCommitment: Bytes32;
  metadataCommitment: Bytes32;
  termsCommitment: Bytes32;
  privacyCommitment: Bytes32;
  operationsCommitment: Bytes32;
  activationChecklistCommitment: Bytes32;
  fundingAsset: Address;
  vault: Address;
  membershipRegistry: Address;
  requestManager: Address;
  decisionModule: Address;
  settlementModule: Address;
  enrollmentOpensAt: bigint;
  activeAt: bigint;
  runoffAt: bigint;
  closesAt: bigint;
  appealWindow: bigint;
  initialDecisionWindow: bigint;
  appealDecisionWindow: bigint;
  perMemberCap: RobinhoodAssetAmount;
  aggregateCap: RobinhoodAssetAmount;
  maxMembers: number;
  state: ProgramState;
}

export interface ProgramAccountingSnapshot {
  vault: Address;
  actualAssets: RobinhoodAssetAmount;
  maximumRemainingMemberLiability: RobinhoodAssetAmount;
  pendingRequestReservation: RobinhoodAssetAmount;
  approvedUnpaidObligations: RobinhoodAssetAmount;
  maturedRefunds: RobinhoodAssetAmount;
  encumberedAssets: RobinhoodAssetAmount;
  freeLiquidity: RobinhoodAssetAmount;
  reconciled: boolean;
}

export interface MembershipSnapshot {
  programId: Bytes32;
  memberCommitment: Bytes32;
  account: Address | null;
  activatedAt: bigint;
  expiresAt: bigint;
  /** Current onchain liability remaining; historical consumption needs indexed events. */
  remainingBenefit: RobinhoodAssetAmount;
  state: MembershipState;
}

export interface RequestSnapshot {
  programId: Bytes32;
  requestId: Bytes32;
  membershipId: Bytes32;
  evidenceManifestCommitment: Bytes32;
  recipientCommitment: Bytes32;
  evidenceVersion: number;
  reviewRound: 1 | 2;
  requestedAmount: RobinhoodAssetAmount;
  approvedAmount: RobinhoodAssetAmount;
  openedAt: bigint;
  decisionDeadline: bigint;
  appealDueAt: bigint;
  publicReasonCode: Bytes32;
  state: RequestState;
}

export interface ObligationSnapshot {
  programId: Bytes32;
  requestId: Bytes32;
  decisionDigest: Bytes32 | null;
  recipientCommitment: Bytes32;
  amount: RobinhoodAssetAmount;
  createdAt: bigint | null;
  settledAt: bigint | null;
  settlementTransaction: Hex | null;
  state: 'none' | 'approved_unpaid' | 'settled';
}

export interface RoleSnapshot {
  programId: Bytes32;
  role: ProgramRole;
  account: Address;
  active: boolean;
  validUntil: bigint | null;
}

export interface PauseSnapshot {
  programId: Bytes32;
  scope: PauseScope;
  incidentId: Bytes32;
  publicReasonCode: Bytes32;
  pausedAt: bigint;
  /** Review deadline only; a pause never auto-expires. */
  reviewRequiredAt: bigint;
  active: boolean;
}

export function assertBytes32(value: string, field: string): Bytes32 {
  if (!isHex(value) || !/^0x[0-9a-f]{64}$/i.test(value)) {
    throw new NakamaRobinhoodConfigError(
      `${field} must be a 32-byte 0x-prefixed hex value.`,
      { details: { field, value } },
    );
  }
  return value;
}

export function assertUint(value: bigint, field: string, bits = 256): bigint {
  const maximum = 1n << BigInt(bits);
  if (value < 0n || value >= maximum) {
    throw new NakamaRobinhoodConfigError(
      `${field} must fit in an unsigned ${bits}-bit integer.`,
      { details: { field, value: value.toString(10), bits } },
    );
  }
  return value;
}

export function assertSafeUint(
  value: number,
  field: string,
  bits: number,
): number {
  if (
    !Number.isSafeInteger(value) ||
    value < 0 ||
    BigInt(value) >= 1n << BigInt(bits)
  ) {
    throw new NakamaRobinhoodConfigError(
      `${field} must be a safe unsigned ${bits}-bit integer.`,
      { details: { field, value, bits } },
    );
  }
  return value;
}
