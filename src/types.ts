import type { Commitment } from '@solana/web3.js';

export * from './generated/protocol_contract.js';
export * from './generated/protocol_types.js';

export type ClaimFailureCode =
  | 'invalid_claimant_wallet'
  | 'wallet_mismatch'
  | 'pool_not_found'
  | 'pool_not_active'
  | 'membership_not_active'
  | 'claim_window_not_set'
  | 'claim_window_not_open'
  | 'claim_window_closed'
  | 'no_passing_outcomes'
  | 'seeker_rule_misconfigured'
  | 'seeker_commitment_disabled'
  | 'intent_expired'
  | 'intent_message_mismatch'
  | 'required_signer_mismatch'
  | 'simulation_failed_insufficient_funds'
  | 'simulation_failed_pool_paused'
  | 'simulation_failed_membership_invalid'
  | 'simulation_failed_unknown'
  | 'rpc_rejected'
  | 'already_claimed'
  | 'protocol_paused'
  | 'claim_intake_paused'
  | 'not_eligible'
  | 'funding_exhausted'
  | 'allocation_frozen'
  | 'queue_only'
  | 'invalid_claim_state'
  | 'rpc_timeout'
  | 'network_error'
  | 'unknown';

export interface ClaimFailureDetail {
  code: ClaimFailureCode;
  message: string;
  reason: string;
  logs: string[];
  retryable: boolean;
}

export type ClaimIntent = {
  intentId: string;
  unsignedTxBase64: string;
  requiredSigner: string;
  expiresAtIso: string;
  attestationRefs: string[];
};

export type RewardSummary = {
  wallet: {
    connected: boolean;
    address: string | null;
    provider: string | null;
  };
  cycle: {
    id: string;
    status: 'active' | 'completed' | 'abandoned' | 'paused';
    primaryGoalId: string | null;
    outcomesPassed: number;
    outcomesTotal: number;
    startIso: string;
    endIso: string;
  };
  rewards: {
    asset: string;
    claimableRaw: string;
    claimableUi: string;
    status: 'eligible' | 'not_eligible' | 'pending' | 'claimed' | 'failed';
    errorCode?: string | null;
    errorMessage?: string | null;
  };
};

export type OutcomeAttestation = {
  id: string;
  userId: string;
  cycleId: string;
  outcomeId: string;
  asOfIso: string;
  issuedAtIso: string;
  payload: Record<string, unknown>;
  verifier: {
    keyId: string;
    publicKeyBase58: string;
    algorithm: 'ed25519';
  };
  signatureBase64: string;
  digestHex: string;
};

export type OracleSigner = {
  keyId: string;
  publicKeyBase58: string;
  sign: (message: Uint8Array) => Promise<Uint8Array>;
};

export type OracleKmsSignerAdapter = {
  keyId: string;
  publicKeyBase58: string;
  signWithKms: (message: Uint8Array) => Promise<Uint8Array>;
};

export type ValidateSignedClaimTxReason =
  | 'invalid_transaction_base64'
  | 'missing_fee_payer'
  | 'required_signer_mismatch'
  | 'missing_required_signature'
  | 'invalid_required_signature'
  | 'intent_message_mismatch';

export interface ValidateSignedClaimTxParams {
  signedTxBase64: string;
  requiredSigner: string;
  expectedUnsignedTxBase64?: string;
}

export interface ValidateSignedClaimTxResult {
  valid: boolean;
  txSignature: string | null;
  reason: ValidateSignedClaimTxReason | null;
  signer: string | null;
}

export type SignatureLifecycleStatus = GetSignatureStatusResult['status'];

export type ProtocolCycleQuoteFields = {
  poolAddress: string;
  member: string;
  seriesRefHashHex: string;
  paymentMint: string;
  premiumAmountRaw: bigint;
  canonicalPremiumAmount: bigint;
  periodIndex: bigint;
  commitmentEnabled: boolean;
  bondAmountRaw: bigint;
  shieldFeeRaw: bigint;
  protocolFeeRaw: bigint;
  oracleFeeRaw: bigint;
  netPoolPremiumRaw: bigint;
  totalAmountRaw: bigint;
  includedShieldCount: number;
  thresholdBps: number;
  outcomeThresholdScore: number;
  cohortHashHex: string;
  expiresAtTs: bigint;
  nonceHashHex: string;
  quoteMetaHashHex: string;
};

export interface ProtocolMemberCycleAccount {
  address?: string;
  commitmentEnabled: boolean;
  outcomeThresholdScore: number;
  cohortHashHex: string;
  settledHealthAlphaScore: bigint | number;
}

export interface ProtocolCohortSettlementRootAccount {
  address?: string;
  finalized: boolean;
  redistributableFailedBondsTotal: bigint;
  successfulHealthAlphaScoreSum: bigint;
  successfulMemberCount: bigint | number;
  successfulClaimCount: bigint | number;
  redistributionClaimedAmount: bigint;
}

export interface BroadcastSignedTxParams {
  signedTxBase64: string;
  skipPreflight?: boolean;
  maxRetries?: number;
  commitment?: Commitment;
}

export interface BroadcastSignedTxResult {
  signature: string;
  status: 'submitted' | 'confirmed' | 'failed';
  slot: number | null;
}

export interface SimulateSignedTxParams {
  signedTxBase64: string;
  commitment?: Commitment;
  replaceRecentBlockhash?: boolean;
  sigVerify?: boolean;
  allowSigVerifyFallback?: boolean;
}

export interface SimulateSignedTxResult {
  ok: boolean;
  logs: string[];
  unitsConsumed: number | null;
  err: unknown | null;
  failure: ClaimFailureDetail | null;
  sigVerifyRequested: boolean;
  sigVerifyUsed: boolean;
  signatureVerified: boolean;
  verificationDowngraded: boolean;
}

export interface GetSignatureStatusParams {
  signature: string;
  searchTransactionHistory?: boolean;
}

export interface GetSignatureStatusResult {
  signature: string;
  status: 'processed' | 'confirmed' | 'finalized' | 'failed' | 'unknown';
  confirmations: number | null;
  slot: number | null;
  err: unknown | null;
}

export interface RpcClient {
  getRecentBlockhash(): Promise<string>;
  broadcastSignedTx(
    params: BroadcastSignedTxParams,
  ): Promise<BroadcastSignedTxResult>;
  simulateSignedTx(
    params: SimulateSignedTxParams,
  ): Promise<SimulateSignedTxResult>;
  getSignatureStatus(
    params: GetSignatureStatusParams,
  ): Promise<GetSignatureStatusResult>;
}
