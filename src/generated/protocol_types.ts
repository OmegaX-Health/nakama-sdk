// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
// source: omegax_protocol idl + protocol contract

import type {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';

import type { ProtocolInstructionName } from './protocol_contract.js';

export type PublicKeyish = PublicKey | string;
export type BigNumberish = bigint | number | string;

export type ProtocolAccountName =
  | 'AllocationLedger'
  | 'AllocationPosition'
  | 'CapitalClass'
  | 'ClaimAttestation'
  | 'ClaimCase'
  | 'DomainAssetLedger'
  | 'DomainAssetVault'
  | 'FundingLine'
  | 'FundingLineLedger'
  | 'HealthPlan'
  | 'LPPosition'
  | 'LiquidityPool'
  | 'MemberPosition'
  | 'MembershipAnchorSeat'
  | 'Obligation'
  | 'OracleProfile'
  | 'OutcomeSchema'
  | 'PlanReserveLedger'
  | 'PolicySeries'
  | 'PoolClassLedger'
  | 'PoolOracleApproval'
  | 'PoolOracleFeeVault'
  | 'PoolOraclePermissionSet'
  | 'PoolOraclePolicy'
  | 'PoolTreasuryVault'
  | 'ProtocolFeeVault'
  | 'ProtocolGovernance'
  | 'ReserveDomain'
  | 'SchemaDependencyLedger'
  | 'SeriesReserveLedger';

export type GenericInstructionAccounts = Record<
  string,
  PublicKeyish | undefined
>;

export interface BuildInstructionParams<Args, Accounts> {
  args: Args;
  accounts: Accounts;
  programId?: PublicKeyish;
}

export interface BuildTransactionParams<
  Args,
  Accounts,
> extends BuildInstructionParams<Args, Accounts> {
  recentBlockhash: string;
  feePayer?: PublicKeyish;
  prependInstructions?: TransactionInstruction[];
  appendInstructions?: TransactionInstruction[];
}

export interface AdjudicateClaimCaseArgs {
  review_state: number;
  approved_amount: BigNumberish;
  denied_amount: BigNumberish;
  reserve_amount: BigNumberish;
  decision_support_hash: Uint8Array | number[];
}

export interface AllocateCapitalArgs {
  amount: BigNumberish;
}

export interface AllocationLedger {
  allocation_position: string;
  asset_mint: string;
  sheet: ReserveBalanceSheet;
  realized_pnl: BigNumberish;
  bump: number;
}

export interface AllocationPosition {
  reserve_domain: string;
  liquidity_pool: string;
  capital_class: string;
  health_plan: string;
  policy_series: string;
  funding_line: string;
  cap_amount: BigNumberish;
  weight_bps: number;
  allocation_mode: number;
  allocated_amount: BigNumberish;
  utilized_amount: BigNumberish;
  reserved_capacity: BigNumberish;
  realized_pnl: BigNumberish;
  impaired_amount: BigNumberish;
  deallocation_only: boolean;
  active: boolean;
  bump: number;
}

export interface AllocationUpdatedEvent {
  allocation_position: string;
  capital_class: string;
  funding_line: string;
  allocated_amount: BigNumberish;
  reserved_capacity: BigNumberish;
}

export interface AttachClaimEvidenceRefArgs {
  evidence_ref_hash: Uint8Array | number[];
  decision_support_hash: Uint8Array | number[];
}

export interface AttestClaimCaseArgs {
  decision: number;
  attestation_hash: Uint8Array | number[];
  attestation_ref_hash: Uint8Array | number[];
  schema_key_hash: Uint8Array | number[];
}

export interface AuthorizeClaimRecipientArgs {
  delegate_recipient: PublicKeyish;
}

export interface BackfillSchemaDependencyLedgerArgs {
  schema_key_hash: Uint8Array | number[];
  pool_rule_addresses: Array<PublicKeyish>;
}

export interface CapitalClass {
  reserve_domain: string;
  liquidity_pool: string;
  share_mint: string;
  class_id: string;
  display_name: string;
  priority: number;
  impairment_rank: number;
  restriction_mode: number;
  redemption_terms_mode: number;
  wrapper_metadata_hash: Uint8Array | number[];
  permissioning_hash: Uint8Array | number[];
  fee_bps: number;
  min_lockup_seconds: BigNumberish;
  pause_flags: number;
  queue_only_redemptions: boolean;
  total_shares: BigNumberish;
  nav_assets: BigNumberish;
  allocated_assets: BigNumberish;
  reserved_assets: BigNumberish;
  impaired_assets: BigNumberish;
  pending_redemptions: BigNumberish;
  active: boolean;
  bump: number;
}

export interface CapitalClassDepositEvent {
  capital_class: string;
  owner: string;
  asset_amount: BigNumberish;
  shares: BigNumberish;
}

export interface ClaimAttestation {
  oracle: string;
  oracle_profile: string;
  claim_case: string;
  health_plan: string;
  policy_series: string;
  decision: number;
  attestation_hash: Uint8Array | number[];
  attestation_ref_hash: Uint8Array | number[];
  schema_key_hash: Uint8Array | number[];
  created_at_ts: BigNumberish;
  updated_at_ts: BigNumberish;
  bump: number;
}

export interface ClaimCase {
  reserve_domain: string;
  health_plan: string;
  policy_series: string;
  member_position: string;
  funding_line: string;
  asset_mint: string;
  claim_id: string;
  claimant: string;
  adjudicator: string;
  delegate_recipient: string;
  evidence_ref_hash: Uint8Array | number[];
  decision_support_hash: Uint8Array | number[];
  intake_status: number;
  review_state: number;
  approved_amount: BigNumberish;
  denied_amount: BigNumberish;
  paid_amount: BigNumberish;
  reserved_amount: BigNumberish;
  recovered_amount: BigNumberish;
  appeal_count: number;
  linked_obligation: string;
  opened_at: BigNumberish;
  updated_at: BigNumberish;
  closed_at: BigNumberish;
  bump: number;
}

export interface ClaimCaseAttestedEvent {
  claim_attestation: string;
  claim_case: string;
  oracle_profile: string;
  oracle: string;
  decision: number;
  attestation_hash: Uint8Array | number[];
}

export interface ClaimCaseStateChangedEvent {
  claim_case: string;
  intake_status: number;
  approved_amount: BigNumberish;
}

export interface CreateAllocationPositionArgs {
  policy_series: PublicKeyish;
  cap_amount: BigNumberish;
  weight_bps: number;
  allocation_mode: number;
  deallocation_only: boolean;
}

export interface CreateCapitalClassArgs {
  class_id: string;
  display_name: string;
  share_mint: PublicKeyish;
  priority: number;
  impairment_rank: number;
  restriction_mode: number;
  redemption_terms_mode: number;
  wrapper_metadata_hash: Uint8Array | number[];
  permissioning_hash: Uint8Array | number[];
  fee_bps: number;
  min_lockup_seconds: BigNumberish;
  pause_flags: number;
}

export interface CreateDomainAssetVaultArgs {
  asset_mint: PublicKeyish;
}

export interface CreateHealthPlanArgs {
  plan_id: string;
  display_name: string;
  organization_ref: string;
  metadata_uri: string;
  sponsor: PublicKeyish;
  sponsor_operator: PublicKeyish;
  claims_operator: PublicKeyish;
  oracle_authority: PublicKeyish;
  membership_mode: number;
  membership_gate_kind: number;
  membership_gate_mint: PublicKeyish;
  membership_gate_min_amount: BigNumberish;
  membership_invite_authority: PublicKeyish;
  allowed_rail_mask: number;
  default_funding_priority: number;
  oracle_policy_hash: Uint8Array | number[];
  schema_binding_hash: Uint8Array | number[];
  compliance_baseline_hash: Uint8Array | number[];
  pause_flags: number;
}

export interface CreateLiquidityPoolArgs {
  pool_id: string;
  display_name: string;
  curator: PublicKeyish;
  allocator: PublicKeyish;
  sentinel: PublicKeyish;
  deposit_asset_mint: PublicKeyish;
  strategy_hash: Uint8Array | number[];
  allowed_exposure_hash: Uint8Array | number[];
  external_yield_adapter_hash: Uint8Array | number[];
  fee_bps: number;
  redemption_policy: number;
  pause_flags: number;
}

export interface CreateObligationArgs {
  obligation_id: string;
  asset_mint: PublicKeyish;
  policy_series: PublicKeyish;
  member_wallet: PublicKeyish;
  beneficiary: PublicKeyish;
  claim_case: PublicKeyish;
  liquidity_pool: PublicKeyish;
  capital_class: PublicKeyish;
  allocation_position: PublicKeyish;
  delivery_mode: number;
  amount: BigNumberish;
  creation_reason_hash: Uint8Array | number[];
}

export interface CreatePolicySeriesArgs {
  series_id: string;
  display_name: string;
  metadata_uri: string;
  asset_mint: PublicKeyish;
  mode: number;
  status: number;
  adjudication_mode: number;
  terms_hash: Uint8Array | number[];
  pricing_hash: Uint8Array | number[];
  payout_hash: Uint8Array | number[];
  reserve_model_hash: Uint8Array | number[];
  evidence_requirements_hash: Uint8Array | number[];
  comparability_hash: Uint8Array | number[];
  policy_overrides_hash: Uint8Array | number[];
  cycle_seconds: BigNumberish;
  terms_version: number;
}

export interface CreateReserveDomainArgs {
  domain_id: string;
  display_name: string;
  domain_admin: PublicKeyish;
  settlement_mode: number;
  legal_structure_hash: Uint8Array | number[];
  compliance_baseline_hash: Uint8Array | number[];
  allowed_rail_mask: number;
  pause_flags: number;
}

export interface DeallocateCapitalArgs {
  amount: BigNumberish;
}

export interface DepositIntoCapitalClassArgs {
  amount: BigNumberish;
  shares: BigNumberish;
}

export interface DomainAssetLedger {
  reserve_domain: string;
  asset_mint: string;
  sheet: ReserveBalanceSheet;
  bump: number;
}

export interface DomainAssetVault {
  reserve_domain: string;
  asset_mint: string;
  vault_token_account: string;
  total_assets: BigNumberish;
  bump: number;
}

export interface FeeAccruedEvent {
  vault: string;
  asset_mint: string;
  amount: BigNumberish;
  accrued_total: BigNumberish;
}

export interface FeeVaultInitializedEvent {
  vault: string;
  scope: string;
  asset_mint: string;
  fee_recipient: string;
  rail: number;
}

export interface FeeWithdrawnEvent {
  vault: string;
  asset_mint: string;
  amount: BigNumberish;
  configured_recipient: string;
  recipient: string;
  withdrawn_total: BigNumberish;
}

export interface FundSponsorBudgetArgs {
  amount: BigNumberish;
}

export interface FundingFlowRecordedEvent {
  funding_line: string;
  amount: BigNumberish;
  flow_kind: number;
}

export interface FundingLine {
  reserve_domain: string;
  health_plan: string;
  policy_series: string;
  asset_mint: string;
  line_id: string;
  line_type: number;
  funding_priority: number;
  committed_amount: BigNumberish;
  funded_amount: BigNumberish;
  reserved_amount: BigNumberish;
  spent_amount: BigNumberish;
  released_amount: BigNumberish;
  returned_amount: BigNumberish;
  status: number;
  caps_hash: Uint8Array | number[];
  bump: number;
}

export interface FundingLineLedger {
  funding_line: string;
  asset_mint: string;
  sheet: ReserveBalanceSheet;
  bump: number;
}

export interface FundingLineOpenedEvent {
  health_plan: string;
  funding_line: string;
  asset_mint: string;
  line_type: number;
}

export interface HealthPlan {
  reserve_domain: string;
  sponsor: string;
  plan_admin: string;
  sponsor_operator: string;
  claims_operator: string;
  oracle_authority: string;
  health_plan_id: string;
  display_name: string;
  organization_ref: string;
  metadata_uri: string;
  membership_mode: number;
  membership_gate_kind: number;
  membership_gate_mint: string;
  membership_gate_min_amount: BigNumberish;
  membership_invite_authority: string;
  allowed_rail_mask: number;
  default_funding_priority: number;
  oracle_policy_hash: Uint8Array | number[];
  schema_binding_hash: Uint8Array | number[];
  compliance_baseline_hash: Uint8Array | number[];
  pause_flags: number;
  active: boolean;
  audit_nonce: BigNumberish;
  bump: number;
}

export interface HealthPlanCreatedEvent {
  reserve_domain: string;
  health_plan: string;
  sponsor: string;
}

export interface ImpairmentRecordedEvent {
  funding_line: string;
  obligation: string;
  amount: BigNumberish;
  reason_hash: Uint8Array | number[];
}

export interface InitPoolOracleFeeVaultArgs {
  oracle: PublicKeyish;
  asset_mint: PublicKeyish;
  fee_recipient: PublicKeyish;
}

export interface InitPoolTreasuryVaultArgs {
  asset_mint: PublicKeyish;
  fee_recipient: PublicKeyish;
}

export interface InitProtocolFeeVaultArgs {
  asset_mint: PublicKeyish;
  fee_recipient: PublicKeyish;
}

export interface InitializeProtocolGovernanceArgs {
  protocol_fee_bps: number;
  emergency_pause: boolean;
}

export interface LPPosition {
  capital_class: string;
  owner: string;
  shares: BigNumberish;
  subscription_basis: BigNumberish;
  pending_redemption_shares: BigNumberish;
  pending_redemption_assets: BigNumberish;
  realized_distributions: BigNumberish;
  impaired_principal: BigNumberish;
  lockup_ends_at: BigNumberish;
  credentialed: boolean;
  queue_status: number;
  bump: number;
}

export interface LPPositionCredentialingUpdatedEvent {
  capital_class: string;
  owner: string;
  authority: string;
  credentialed: boolean;
  reason_hash: Uint8Array | number[];
}

export interface LedgerInitializedEvent {
  scope_kind: number;
  scope: string;
  asset_mint: string;
}

export interface LiquidityPool {
  reserve_domain: string;
  curator: string;
  allocator: string;
  sentinel: string;
  pool_id: string;
  display_name: string;
  deposit_asset_mint: string;
  strategy_hash: Uint8Array | number[];
  allowed_exposure_hash: Uint8Array | number[];
  external_yield_adapter_hash: Uint8Array | number[];
  fee_bps: number;
  redemption_policy: number;
  pause_flags: number;
  total_value_locked: BigNumberish;
  total_allocated: BigNumberish;
  total_reserved: BigNumberish;
  total_impaired: BigNumberish;
  total_pending_redemptions: BigNumberish;
  active: boolean;
  audit_nonce: BigNumberish;
  bump: number;
}

export interface LiquidityPoolCreatedEvent {
  reserve_domain: string;
  liquidity_pool: string;
  asset_mint: string;
}

export interface MarkImpairmentArgs {
  amount: BigNumberish;
  reason_hash: Uint8Array | number[];
}

export interface MemberPosition {
  health_plan: string;
  policy_series: string;
  wallet: string;
  subject_commitment: Uint8Array | number[];
  eligibility_status: number;
  delegated_rights: number;
  enrollment_proof_mode: number;
  membership_gate_kind: number;
  membership_anchor_ref: string;
  gate_amount_snapshot: BigNumberish;
  invite_id_hash: Uint8Array | number[];
  active: boolean;
  opened_at: BigNumberish;
  updated_at: BigNumberish;
  bump: number;
}

export interface MembershipAnchorSeat {
  health_plan: string;
  anchor_ref: string;
  gate_kind: number;
  holder_wallet: string;
  member_position: string;
  active: boolean;
  opened_at: BigNumberish;
  updated_at: BigNumberish;
  bump: number;
}

export interface Obligation {
  reserve_domain: string;
  asset_mint: string;
  health_plan: string;
  policy_series: string;
  member_wallet: string;
  beneficiary: string;
  funding_line: string;
  claim_case: string;
  liquidity_pool: string;
  capital_class: string;
  allocation_position: string;
  obligation_id: string;
  creation_reason_hash: Uint8Array | number[];
  settlement_reason_hash: Uint8Array | number[];
  status: number;
  delivery_mode: number;
  principal_amount: BigNumberish;
  outstanding_amount: BigNumberish;
  reserved_amount: BigNumberish;
  claimable_amount: BigNumberish;
  payable_amount: BigNumberish;
  settled_amount: BigNumberish;
  impaired_amount: BigNumberish;
  recovered_amount: BigNumberish;
  created_at: BigNumberish;
  updated_at: BigNumberish;
  bump: number;
}

export interface ObligationStatusChangedEvent {
  obligation: string;
  funding_line: string;
  status: number;
  amount: BigNumberish;
}

export interface OpenClaimCaseArgs {
  claim_id: string;
  policy_series: PublicKeyish;
  claimant: PublicKeyish;
  evidence_ref_hash: Uint8Array | number[];
}

export interface OpenFundingLineArgs {
  line_id: string;
  policy_series: PublicKeyish;
  asset_mint: PublicKeyish;
  line_type: number;
  funding_priority: number;
  committed_amount: BigNumberish;
  caps_hash: Uint8Array | number[];
}

export interface OpenMemberPositionArgs {
  series_scope: PublicKeyish;
  subject_commitment: Uint8Array | number[];
  eligibility_status: number;
  delegated_rights: number;
  proof_mode: number;
  token_gate_amount_snapshot: BigNumberish;
  invite_id_hash: Uint8Array | number[];
  invite_expires_at: BigNumberish;
  anchor_ref: PublicKeyish;
}

export interface OracleProfile {
  oracle: string;
  admin: string;
  oracle_type: number;
  display_name: string;
  legal_name: string;
  website_url: string;
  app_url: string;
  logo_uri: string;
  webhook_url: string;
  supported_schema_count: number;
  supported_schema_key_hashes: ReadonlyArray<Uint8Array | number[]>;
  active: boolean;
  claimed: boolean;
  created_at_ts: BigNumberish;
  updated_at_ts: BigNumberish;
  bump: number;
}

export interface OracleProfileClaimedEvent {
  oracle_profile: string;
  oracle: string;
  admin: string;
}

export interface OracleProfileRegisteredEvent {
  oracle_profile: string;
  oracle: string;
  admin: string;
  oracle_type: number;
  claimed: boolean;
}

export interface OracleProfileUpdatedEvent {
  oracle_profile: string;
  oracle: string;
  authority: string;
  oracle_type: number;
}

export interface OutcomeSchema {
  publisher: string;
  schema_key_hash: Uint8Array | number[];
  schema_key: string;
  version: number;
  schema_hash: Uint8Array | number[];
  schema_family: number;
  visibility: number;
  metadata_uri: string;
  verified: boolean;
  created_at_ts: BigNumberish;
  updated_at_ts: BigNumberish;
  bump: number;
}

export interface OutcomeSchemaClosedEvent {
  outcome_schema: string;
  governance_authority: string;
  schema_key_hash: Uint8Array | number[];
  recipient: string;
}

export interface OutcomeSchemaRegisteredEvent {
  outcome_schema: string;
  publisher: string;
  schema_key_hash: Uint8Array | number[];
  version: number;
}

export interface OutcomeSchemaStateChangedEvent {
  outcome_schema: string;
  governance_authority: string;
  schema_key_hash: Uint8Array | number[];
  verified: boolean;
}

export interface PlanReserveLedger {
  health_plan: string;
  asset_mint: string;
  sheet: ReserveBalanceSheet;
  bump: number;
}

export interface PolicySeries {
  reserve_domain: string;
  health_plan: string;
  asset_mint: string;
  series_id: string;
  display_name: string;
  metadata_uri: string;
  mode: number;
  status: number;
  adjudication_mode: number;
  terms_hash: Uint8Array | number[];
  pricing_hash: Uint8Array | number[];
  payout_hash: Uint8Array | number[];
  reserve_model_hash: Uint8Array | number[];
  evidence_requirements_hash: Uint8Array | number[];
  comparability_hash: Uint8Array | number[];
  policy_overrides_hash: Uint8Array | number[];
  cycle_seconds: BigNumberish;
  terms_version: number;
  prior_series: string;
  successor_series: string;
  live_since_ts: BigNumberish;
  material_locked: boolean;
  bump: number;
}

export interface PolicySeriesCreatedEvent {
  health_plan: string;
  policy_series: string;
  asset_mint: string;
  mode: number;
  terms_version: number;
}

export interface PolicySeriesVersionedEvent {
  prior_series: string;
  next_series: string;
  new_terms_version: number;
}

export interface PoolClassLedger {
  capital_class: string;
  asset_mint: string;
  sheet: ReserveBalanceSheet;
  total_shares: BigNumberish;
  realized_yield_amount: BigNumberish;
  realized_loss_amount: BigNumberish;
  bump: number;
}

export interface PoolOracleApproval {
  liquidity_pool: string;
  oracle: string;
  active: boolean;
  updated_at_ts: BigNumberish;
  bump: number;
}

export interface PoolOracleApprovalChangedEvent {
  liquidity_pool: string;
  oracle: string;
  authority: string;
  active: boolean;
}

export interface PoolOracleFeeVault {
  liquidity_pool: string;
  oracle: string;
  asset_mint: string;
  fee_recipient: string;
  accrued_fees: BigNumberish;
  withdrawn_fees: BigNumberish;
  bump: number;
}

export interface PoolOraclePermissionSet {
  liquidity_pool: string;
  oracle: string;
  permissions: number;
  updated_at_ts: BigNumberish;
  bump: number;
}

export interface PoolOraclePermissionsChangedEvent {
  liquidity_pool: string;
  oracle: string;
  authority: string;
  permissions: number;
}

export interface PoolOraclePolicy {
  liquidity_pool: string;
  quorum_m: number;
  quorum_n: number;
  require_verified_schema: boolean;
  oracle_fee_bps: number;
  allow_delegate_claim: boolean;
  challenge_window_secs: number;
  updated_at_ts: BigNumberish;
  bump: number;
}

export interface PoolOraclePolicyChangedEvent {
  liquidity_pool: string;
  authority: string;
  quorum_m: number;
  quorum_n: number;
  oracle_fee_bps: number;
}

export interface PoolTreasuryVault {
  liquidity_pool: string;
  asset_mint: string;
  fee_recipient: string;
  accrued_fees: BigNumberish;
  withdrawn_fees: BigNumberish;
  bump: number;
}

export interface ProcessRedemptionQueueArgs {
  shares: BigNumberish;
}

export interface ProtocolFeeVault {
  reserve_domain: string;
  asset_mint: string;
  fee_recipient: string;
  accrued_fees: BigNumberish;
  withdrawn_fees: BigNumberish;
  bump: number;
}

export interface ProtocolGovernance {
  governance_authority: string;
  protocol_fee_bps: number;
  emergency_pause: boolean;
  audit_nonce: BigNumberish;
  bump: number;
}

export interface ProtocolGovernanceAuthorityRotatedEvent {
  previous_governance_authority: string;
  new_governance_authority: string;
  authority: string;
  audit_nonce: BigNumberish;
}

export interface ProtocolGovernanceInitializedEvent {
  governance_authority: string;
  protocol_fee_bps: number;
  emergency_pause: boolean;
}

export interface RecordPremiumPaymentArgs {
  amount: BigNumberish;
}

export interface RedemptionRequestedEvent {
  capital_class: string;
  owner: string;
  shares: BigNumberish;
  asset_amount: BigNumberish;
}

export interface RegisterOracleArgs {
  oracle: PublicKeyish;
  oracle_type: number;
  display_name: string;
  legal_name: string;
  website_url: string;
  app_url: string;
  logo_uri: string;
  webhook_url: string;
  supported_schema_key_hashes: Array<Uint8Array | number[]>;
}

export interface RegisterOutcomeSchemaArgs {
  schema_key_hash: Uint8Array | number[];
  schema_key: string;
  version: number;
  schema_hash: Uint8Array | number[];
  schema_family: number;
  visibility: number;
  metadata_uri: string;
}

export interface ReleaseReserveArgs {
  amount: BigNumberish;
}

export interface RequestRedemptionArgs {
  shares: BigNumberish;
}

export interface ReserveBalanceSheet {
  funded: BigNumberish;
  allocated: BigNumberish;
  reserved: BigNumberish;
  owed: BigNumberish;
  claimable: BigNumberish;
  payable: BigNumberish;
  settled: BigNumberish;
  impaired: BigNumberish;
  pending_redemption: BigNumberish;
  restricted: BigNumberish;
  free: BigNumberish;
  redeemable: BigNumberish;
}

export interface ReserveDomain {
  protocol_governance: string;
  domain_admin: string;
  domain_id: string;
  display_name: string;
  settlement_mode: number;
  legal_structure_hash: Uint8Array | number[];
  compliance_baseline_hash: Uint8Array | number[];
  allowed_rail_mask: number;
  pause_flags: number;
  active: boolean;
  audit_nonce: BigNumberish;
  bump: number;
}

export interface ReserveDomainCreatedEvent {
  reserve_domain: string;
  domain_admin: string;
  settlement_mode: number;
}

export interface ReserveObligationArgs {
  amount: BigNumberish;
}

export interface RotateProtocolGovernanceAuthorityArgs {
  new_governance_authority: PublicKeyish;
}

export interface SchemaDependencyLedger {
  schema_key_hash: Uint8Array | number[];
  pool_rule_addresses: Array<string>;
  updated_at_ts: BigNumberish;
  bump: number;
}

export interface SchemaDependencyLedgerUpdatedEvent {
  schema_dependency_ledger: string;
  governance_authority: string;
  schema_key_hash: Uint8Array | number[];
  dependency_count: number;
}

export interface ScopedControlChangedEvent {
  scope_kind: number;
  scope: string;
  authority: string;
  pause_flags: number;
  reason_hash: Uint8Array | number[];
  audit_nonce: BigNumberish;
}

export interface SeriesReserveLedger {
  policy_series: string;
  asset_mint: string;
  sheet: ReserveBalanceSheet;
  bump: number;
}

export interface SetPoolOracleArgs {
  active: boolean;
}

export interface SetPoolOraclePermissionsArgs {
  permissions: number;
}

export interface SetPoolOraclePolicyArgs {
  quorum_m: number;
  quorum_n: number;
  require_verified_schema: boolean;
  oracle_fee_bps: number;
  allow_delegate_claim: boolean;
  challenge_window_secs: number;
}

export interface SetProtocolEmergencyPauseArgs {
  emergency_pause: boolean;
  reason_hash: Uint8Array | number[];
}

export interface SettleClaimCaseArgs {
  amount: BigNumberish;
}

export interface SettleObligationArgs {
  next_status: number;
  amount: BigNumberish;
  settlement_reason_hash: Uint8Array | number[];
}

export interface UpdateAllocationCapsArgs {
  cap_amount: BigNumberish;
  weight_bps: number;
  deallocation_only: boolean;
  active: boolean;
  reason_hash: Uint8Array | number[];
}

export interface UpdateCapitalClassControlsArgs {
  pause_flags: number;
  queue_only_redemptions: boolean;
  active: boolean;
  reason_hash: Uint8Array | number[];
}

export interface UpdateHealthPlanControlsArgs {
  sponsor_operator: PublicKeyish;
  claims_operator: PublicKeyish;
  oracle_authority: PublicKeyish;
  membership_mode: number;
  membership_gate_kind: number;
  membership_gate_mint: PublicKeyish;
  membership_gate_min_amount: BigNumberish;
  membership_invite_authority: PublicKeyish;
  allowed_rail_mask: number;
  default_funding_priority: number;
  oracle_policy_hash: Uint8Array | number[];
  schema_binding_hash: Uint8Array | number[];
  compliance_baseline_hash: Uint8Array | number[];
  pause_flags: number;
  active: boolean;
  reason_hash: Uint8Array | number[];
}

export interface UpdateLpPositionCredentialingArgs {
  owner: PublicKeyish;
  credentialed: boolean;
  reason_hash: Uint8Array | number[];
}

export interface UpdateMemberEligibilityArgs {
  eligibility_status: number;
  delegated_rights: number;
  active: boolean;
}

export interface UpdateOracleProfileArgs {
  oracle_type: number;
  display_name: string;
  legal_name: string;
  website_url: string;
  app_url: string;
  logo_uri: string;
  webhook_url: string;
  supported_schema_key_hashes: Array<Uint8Array | number[]>;
}

export interface UpdateReserveDomainControlsArgs {
  allowed_rail_mask: number;
  pause_flags: number;
  active: boolean;
  reason_hash: Uint8Array | number[];
}

export interface VerifyOutcomeSchemaArgs {
  verified: boolean;
}

export interface VersionPolicySeriesArgs {
  series_id: string;
  display_name: string;
  metadata_uri: string;
  status: number;
  adjudication_mode: number;
  terms_hash: Uint8Array | number[];
  pricing_hash: Uint8Array | number[];
  payout_hash: Uint8Array | number[];
  reserve_model_hash: Uint8Array | number[];
  evidence_requirements_hash: Uint8Array | number[];
  comparability_hash: Uint8Array | number[];
  policy_overrides_hash: Uint8Array | number[];
  cycle_seconds: BigNumberish;
}

export interface WithdrawArgs {
  amount: BigNumberish;
}

export interface AdjudicateClaimCaseAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  health_plan: PublicKeyish;
  claim_case: PublicKeyish;
  obligation?: PublicKeyish;
}

export interface AllocateCapitalAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  liquidity_pool: PublicKeyish;
  capital_class: PublicKeyish;
  pool_class_ledger: PublicKeyish;
  funding_line: PublicKeyish;
  allocation_position: PublicKeyish;
  allocation_ledger: PublicKeyish;
}

export interface AttachClaimEvidenceRefAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  health_plan: PublicKeyish;
  claim_case: PublicKeyish;
}

export interface AttestClaimCaseAccounts {
  oracle: PublicKeyish;
  oracle_profile: PublicKeyish;
  claim_case: PublicKeyish;
  outcome_schema: PublicKeyish;
  claim_attestation: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface AuthorizeClaimRecipientAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  member_position: PublicKeyish;
  claim_case: PublicKeyish;
}

export interface BackfillSchemaDependencyLedgerAccounts {
  governance_authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  outcome_schema: PublicKeyish;
  schema_dependency_ledger: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface ClaimOracleAccounts {
  oracle: PublicKeyish;
  oracle_profile: PublicKeyish;
}

export interface CloseOutcomeSchemaAccounts {
  governance_authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  outcome_schema: PublicKeyish;
  schema_dependency_ledger: PublicKeyish;
  recipient_system_account: PublicKeyish;
}

export interface CreateAllocationPositionAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  liquidity_pool: PublicKeyish;
  capital_class: PublicKeyish;
  health_plan: PublicKeyish;
  funding_line: PublicKeyish;
  allocation_position: PublicKeyish;
  allocation_ledger: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface CreateCapitalClassAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  liquidity_pool: PublicKeyish;
  capital_class: PublicKeyish;
  pool_class_ledger: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface CreateDomainAssetVaultAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  reserve_domain: PublicKeyish;
  domain_asset_vault: PublicKeyish;
  domain_asset_ledger: PublicKeyish;
  asset_mint: PublicKeyish;
  vault_token_account: PublicKeyish;
  token_program: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface CreateHealthPlanAccounts {
  plan_admin: PublicKeyish;
  protocol_governance: PublicKeyish;
  reserve_domain: PublicKeyish;
  health_plan: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface CreateLiquidityPoolAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  reserve_domain: PublicKeyish;
  domain_asset_vault: PublicKeyish;
  liquidity_pool: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface CreateObligationAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  health_plan: PublicKeyish;
  domain_asset_ledger: PublicKeyish;
  funding_line: PublicKeyish;
  funding_line_ledger: PublicKeyish;
  plan_reserve_ledger: PublicKeyish;
  series_reserve_ledger?: PublicKeyish;
  pool_class_ledger?: PublicKeyish;
  allocation_ledger?: PublicKeyish;
  obligation: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface CreatePolicySeriesAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  health_plan: PublicKeyish;
  policy_series: PublicKeyish;
  series_reserve_ledger: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface CreateReserveDomainAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  reserve_domain: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface DeallocateCapitalAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  liquidity_pool: PublicKeyish;
  capital_class: PublicKeyish;
  pool_class_ledger: PublicKeyish;
  funding_line: PublicKeyish;
  allocation_position: PublicKeyish;
  allocation_ledger: PublicKeyish;
}

export interface DepositIntoCapitalClassAccounts {
  owner: PublicKeyish;
  protocol_governance: PublicKeyish;
  domain_asset_vault: PublicKeyish;
  domain_asset_ledger: PublicKeyish;
  liquidity_pool: PublicKeyish;
  capital_class: PublicKeyish;
  pool_class_ledger: PublicKeyish;
  lp_position: PublicKeyish;
  pool_treasury_vault: PublicKeyish;
  source_token_account: PublicKeyish;
  asset_mint: PublicKeyish;
  vault_token_account: PublicKeyish;
  token_program: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface FundSponsorBudgetAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  health_plan: PublicKeyish;
  domain_asset_vault: PublicKeyish;
  domain_asset_ledger: PublicKeyish;
  funding_line: PublicKeyish;
  funding_line_ledger: PublicKeyish;
  plan_reserve_ledger: PublicKeyish;
  series_reserve_ledger?: PublicKeyish;
  source_token_account: PublicKeyish;
  asset_mint: PublicKeyish;
  vault_token_account: PublicKeyish;
  token_program: PublicKeyish;
}

export interface InitPoolOracleFeeVaultAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  liquidity_pool: PublicKeyish;
  oracle_profile: PublicKeyish;
  pool_oracle_approval: PublicKeyish;
  domain_asset_vault?: PublicKeyish;
  pool_oracle_fee_vault: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface InitPoolTreasuryVaultAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  liquidity_pool: PublicKeyish;
  domain_asset_vault?: PublicKeyish;
  pool_treasury_vault: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface InitProtocolFeeVaultAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  reserve_domain: PublicKeyish;
  domain_asset_vault?: PublicKeyish;
  protocol_fee_vault: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface InitializeProtocolGovernanceAccounts {
  governance_authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface MarkImpairmentAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  health_plan: PublicKeyish;
  domain_asset_ledger: PublicKeyish;
  funding_line: PublicKeyish;
  funding_line_ledger: PublicKeyish;
  plan_reserve_ledger: PublicKeyish;
  series_reserve_ledger?: PublicKeyish;
  pool_class_ledger?: PublicKeyish;
  allocation_position?: PublicKeyish;
  allocation_ledger?: PublicKeyish;
  obligation?: PublicKeyish;
}

export interface OpenClaimCaseAccounts {
  authority: PublicKeyish;
  health_plan: PublicKeyish;
  member_position: PublicKeyish;
  funding_line: PublicKeyish;
  claim_case: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface OpenFundingLineAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  health_plan: PublicKeyish;
  domain_asset_vault: PublicKeyish;
  domain_asset_ledger: PublicKeyish;
  funding_line: PublicKeyish;
  funding_line_ledger: PublicKeyish;
  plan_reserve_ledger: PublicKeyish;
  series_reserve_ledger?: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface OpenMemberPositionAccounts {
  wallet: PublicKeyish;
  protocol_governance: PublicKeyish;
  health_plan: PublicKeyish;
  member_position: PublicKeyish;
  membership_anchor_seat?: PublicKeyish;
  token_gate_account?: PublicKeyish;
  invite_authority?: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface ProcessRedemptionQueueAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  domain_asset_vault: PublicKeyish;
  domain_asset_ledger: PublicKeyish;
  liquidity_pool: PublicKeyish;
  capital_class: PublicKeyish;
  pool_class_ledger: PublicKeyish;
  lp_position: PublicKeyish;
  pool_treasury_vault: PublicKeyish;
  asset_mint: PublicKeyish;
  vault_token_account: PublicKeyish;
  recipient_token_account: PublicKeyish;
  token_program: PublicKeyish;
}

export interface RecordPremiumPaymentAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  health_plan: PublicKeyish;
  domain_asset_vault: PublicKeyish;
  domain_asset_ledger: PublicKeyish;
  funding_line: PublicKeyish;
  funding_line_ledger: PublicKeyish;
  plan_reserve_ledger: PublicKeyish;
  series_reserve_ledger?: PublicKeyish;
  protocol_fee_vault: PublicKeyish;
  source_token_account: PublicKeyish;
  asset_mint: PublicKeyish;
  vault_token_account: PublicKeyish;
  token_program: PublicKeyish;
}

export interface RegisterOracleAccounts {
  admin: PublicKeyish;
  oracle_profile: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface RegisterOutcomeSchemaAccounts {
  publisher: PublicKeyish;
  outcome_schema: PublicKeyish;
  schema_dependency_ledger: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface ReleaseReserveAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  health_plan: PublicKeyish;
  domain_asset_ledger: PublicKeyish;
  funding_line: PublicKeyish;
  funding_line_ledger: PublicKeyish;
  plan_reserve_ledger: PublicKeyish;
  series_reserve_ledger?: PublicKeyish;
  pool_class_ledger?: PublicKeyish;
  allocation_position?: PublicKeyish;
  allocation_ledger?: PublicKeyish;
  obligation: PublicKeyish;
  claim_case?: PublicKeyish;
}

export interface RequestRedemptionAccounts {
  owner: PublicKeyish;
  protocol_governance: PublicKeyish;
  liquidity_pool: PublicKeyish;
  capital_class: PublicKeyish;
  pool_class_ledger: PublicKeyish;
  domain_asset_ledger: PublicKeyish;
  lp_position: PublicKeyish;
}

export interface ReserveObligationAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  health_plan: PublicKeyish;
  domain_asset_ledger: PublicKeyish;
  funding_line: PublicKeyish;
  funding_line_ledger: PublicKeyish;
  plan_reserve_ledger: PublicKeyish;
  series_reserve_ledger?: PublicKeyish;
  pool_class_ledger?: PublicKeyish;
  allocation_position?: PublicKeyish;
  allocation_ledger?: PublicKeyish;
  obligation: PublicKeyish;
  claim_case?: PublicKeyish;
}

export interface RotateProtocolGovernanceAuthorityAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
}

export interface SetPoolOracleAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  liquidity_pool: PublicKeyish;
  oracle_profile: PublicKeyish;
  pool_oracle_approval: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface SetPoolOraclePermissionsAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  liquidity_pool: PublicKeyish;
  oracle_profile: PublicKeyish;
  pool_oracle_approval: PublicKeyish;
  pool_oracle_permission_set: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface SetPoolOraclePolicyAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  liquidity_pool: PublicKeyish;
  pool_oracle_policy: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface SetProtocolEmergencyPauseAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
}

export interface SettleClaimCaseAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  health_plan: PublicKeyish;
  domain_asset_vault: PublicKeyish;
  domain_asset_ledger: PublicKeyish;
  funding_line: PublicKeyish;
  funding_line_ledger: PublicKeyish;
  plan_reserve_ledger: PublicKeyish;
  series_reserve_ledger?: PublicKeyish;
  pool_class_ledger?: PublicKeyish;
  allocation_position?: PublicKeyish;
  allocation_ledger?: PublicKeyish;
  claim_case: PublicKeyish;
  obligation?: PublicKeyish;
  protocol_fee_vault: PublicKeyish;
  pool_oracle_fee_vault?: PublicKeyish;
  pool_oracle_policy?: PublicKeyish;
  member_position: PublicKeyish;
  asset_mint: PublicKeyish;
  vault_token_account: PublicKeyish;
  recipient_token_account: PublicKeyish;
  token_program: PublicKeyish;
}

export interface SettleObligationAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  health_plan: PublicKeyish;
  domain_asset_vault: PublicKeyish;
  domain_asset_ledger: PublicKeyish;
  funding_line: PublicKeyish;
  funding_line_ledger: PublicKeyish;
  plan_reserve_ledger: PublicKeyish;
  series_reserve_ledger?: PublicKeyish;
  pool_class_ledger?: PublicKeyish;
  allocation_position?: PublicKeyish;
  allocation_ledger?: PublicKeyish;
  obligation: PublicKeyish;
  claim_case?: PublicKeyish;
  member_position?: PublicKeyish;
  asset_mint?: PublicKeyish;
  vault_token_account?: PublicKeyish;
  recipient_token_account?: PublicKeyish;
  token_program?: PublicKeyish;
}

export interface UpdateAllocationCapsAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  liquidity_pool: PublicKeyish;
  allocation_position: PublicKeyish;
}

export interface UpdateCapitalClassControlsAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  liquidity_pool: PublicKeyish;
  capital_class: PublicKeyish;
}

export interface UpdateHealthPlanControlsAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  health_plan: PublicKeyish;
}

export interface UpdateLpPositionCredentialingAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  liquidity_pool: PublicKeyish;
  capital_class: PublicKeyish;
  lp_position: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface UpdateMemberEligibilityAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  health_plan: PublicKeyish;
  member_position: PublicKeyish;
  membership_anchor_seat?: PublicKeyish;
}

export interface UpdateOracleProfileAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  oracle_profile: PublicKeyish;
}

export interface UpdateReserveDomainControlsAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  reserve_domain: PublicKeyish;
}

export interface VerifyOutcomeSchemaAccounts {
  governance_authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  outcome_schema: PublicKeyish;
}

export interface VersionPolicySeriesAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  health_plan: PublicKeyish;
  current_policy_series: PublicKeyish;
  next_policy_series: PublicKeyish;
  next_series_reserve_ledger: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface WithdrawPoolOracleFeeSolAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  liquidity_pool: PublicKeyish;
  oracle_profile: PublicKeyish;
  pool_oracle_fee_vault: PublicKeyish;
  recipient: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface WithdrawPoolOracleFeeSplAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  liquidity_pool: PublicKeyish;
  oracle_profile: PublicKeyish;
  pool_oracle_fee_vault: PublicKeyish;
  domain_asset_vault: PublicKeyish;
  domain_asset_ledger: PublicKeyish;
  asset_mint: PublicKeyish;
  vault_token_account: PublicKeyish;
  recipient_token_account: PublicKeyish;
  token_program: PublicKeyish;
}

export interface WithdrawPoolTreasurySolAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  liquidity_pool: PublicKeyish;
  pool_treasury_vault: PublicKeyish;
  recipient: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface WithdrawPoolTreasurySplAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  liquidity_pool: PublicKeyish;
  pool_treasury_vault: PublicKeyish;
  domain_asset_vault: PublicKeyish;
  domain_asset_ledger: PublicKeyish;
  asset_mint: PublicKeyish;
  vault_token_account: PublicKeyish;
  recipient_token_account: PublicKeyish;
  token_program: PublicKeyish;
}

export interface WithdrawProtocolFeeSolAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  reserve_domain: PublicKeyish;
  protocol_fee_vault: PublicKeyish;
  recipient: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface WithdrawProtocolFeeSplAccounts {
  authority: PublicKeyish;
  protocol_governance: PublicKeyish;
  reserve_domain: PublicKeyish;
  protocol_fee_vault: PublicKeyish;
  domain_asset_vault: PublicKeyish;
  domain_asset_ledger: PublicKeyish;
  asset_mint: PublicKeyish;
  vault_token_account: PublicKeyish;
  recipient_token_account: PublicKeyish;
  token_program: PublicKeyish;
}

export interface ProtocolClient {
  readonly connection: Connection;
  readonly programId: PublicKey;
  getProgramId(): PublicKey;
  buildInstruction(
    params: BuildInstructionParams<
      Record<string, unknown>,
      GenericInstructionAccounts
    > & {
      instructionName: ProtocolInstructionName;
    },
  ): TransactionInstruction;
  buildTransaction(
    params: BuildTransactionParams<
      Record<string, unknown>,
      GenericInstructionAccounts
    > & {
      instructionName: ProtocolInstructionName;
    },
  ): Transaction;
  decodeAccount<T = Record<string, unknown>>(
    accountName: ProtocolAccountName,
    data: Buffer | Uint8Array,
  ): T;
  fetchAccount<T = Record<string, unknown>>(
    accountName: ProtocolAccountName,
    address: PublicKeyish,
  ): Promise<T | null>;
  buildAdjudicateClaimCaseInstruction(
    params: BuildInstructionParams<
      AdjudicateClaimCaseArgs,
      AdjudicateClaimCaseAccounts
    >,
  ): TransactionInstruction;
  buildAdjudicateClaimCaseTx(
    params: BuildTransactionParams<
      AdjudicateClaimCaseArgs,
      AdjudicateClaimCaseAccounts
    >,
  ): Transaction;
  buildAllocateCapitalInstruction(
    params: BuildInstructionParams<
      AllocateCapitalArgs,
      AllocateCapitalAccounts
    >,
  ): TransactionInstruction;
  buildAllocateCapitalTx(
    params: BuildTransactionParams<
      AllocateCapitalArgs,
      AllocateCapitalAccounts
    >,
  ): Transaction;
  buildAttachClaimEvidenceRefInstruction(
    params: BuildInstructionParams<
      AttachClaimEvidenceRefArgs,
      AttachClaimEvidenceRefAccounts
    >,
  ): TransactionInstruction;
  buildAttachClaimEvidenceRefTx(
    params: BuildTransactionParams<
      AttachClaimEvidenceRefArgs,
      AttachClaimEvidenceRefAccounts
    >,
  ): Transaction;
  buildAttestClaimCaseInstruction(
    params: BuildInstructionParams<
      AttestClaimCaseArgs,
      AttestClaimCaseAccounts
    >,
  ): TransactionInstruction;
  buildAttestClaimCaseTx(
    params: BuildTransactionParams<
      AttestClaimCaseArgs,
      AttestClaimCaseAccounts
    >,
  ): Transaction;
  buildAuthorizeClaimRecipientInstruction(
    params: BuildInstructionParams<
      AuthorizeClaimRecipientArgs,
      AuthorizeClaimRecipientAccounts
    >,
  ): TransactionInstruction;
  buildAuthorizeClaimRecipientTx(
    params: BuildTransactionParams<
      AuthorizeClaimRecipientArgs,
      AuthorizeClaimRecipientAccounts
    >,
  ): Transaction;
  buildBackfillSchemaDependencyLedgerInstruction(
    params: BuildInstructionParams<
      BackfillSchemaDependencyLedgerArgs,
      BackfillSchemaDependencyLedgerAccounts
    >,
  ): TransactionInstruction;
  buildBackfillSchemaDependencyLedgerTx(
    params: BuildTransactionParams<
      BackfillSchemaDependencyLedgerArgs,
      BackfillSchemaDependencyLedgerAccounts
    >,
  ): Transaction;
  buildClaimOracleInstruction(
    params: BuildInstructionParams<
      Record<string, unknown>,
      ClaimOracleAccounts
    >,
  ): TransactionInstruction;
  buildClaimOracleTx(
    params: BuildTransactionParams<
      Record<string, unknown>,
      ClaimOracleAccounts
    >,
  ): Transaction;
  buildCloseOutcomeSchemaInstruction(
    params: BuildInstructionParams<
      Record<string, unknown>,
      CloseOutcomeSchemaAccounts
    >,
  ): TransactionInstruction;
  buildCloseOutcomeSchemaTx(
    params: BuildTransactionParams<
      Record<string, unknown>,
      CloseOutcomeSchemaAccounts
    >,
  ): Transaction;
  buildCreateAllocationPositionInstruction(
    params: BuildInstructionParams<
      CreateAllocationPositionArgs,
      CreateAllocationPositionAccounts
    >,
  ): TransactionInstruction;
  buildCreateAllocationPositionTx(
    params: BuildTransactionParams<
      CreateAllocationPositionArgs,
      CreateAllocationPositionAccounts
    >,
  ): Transaction;
  buildCreateCapitalClassInstruction(
    params: BuildInstructionParams<
      CreateCapitalClassArgs,
      CreateCapitalClassAccounts
    >,
  ): TransactionInstruction;
  buildCreateCapitalClassTx(
    params: BuildTransactionParams<
      CreateCapitalClassArgs,
      CreateCapitalClassAccounts
    >,
  ): Transaction;
  buildCreateDomainAssetVaultInstruction(
    params: BuildInstructionParams<
      CreateDomainAssetVaultArgs,
      CreateDomainAssetVaultAccounts
    >,
  ): TransactionInstruction;
  buildCreateDomainAssetVaultTx(
    params: BuildTransactionParams<
      CreateDomainAssetVaultArgs,
      CreateDomainAssetVaultAccounts
    >,
  ): Transaction;
  buildCreateHealthPlanInstruction(
    params: BuildInstructionParams<
      CreateHealthPlanArgs,
      CreateHealthPlanAccounts
    >,
  ): TransactionInstruction;
  buildCreateHealthPlanTx(
    params: BuildTransactionParams<
      CreateHealthPlanArgs,
      CreateHealthPlanAccounts
    >,
  ): Transaction;
  buildCreateLiquidityPoolInstruction(
    params: BuildInstructionParams<
      CreateLiquidityPoolArgs,
      CreateLiquidityPoolAccounts
    >,
  ): TransactionInstruction;
  buildCreateLiquidityPoolTx(
    params: BuildTransactionParams<
      CreateLiquidityPoolArgs,
      CreateLiquidityPoolAccounts
    >,
  ): Transaction;
  buildCreateObligationInstruction(
    params: BuildInstructionParams<
      CreateObligationArgs,
      CreateObligationAccounts
    >,
  ): TransactionInstruction;
  buildCreateObligationTx(
    params: BuildTransactionParams<
      CreateObligationArgs,
      CreateObligationAccounts
    >,
  ): Transaction;
  buildCreatePolicySeriesInstruction(
    params: BuildInstructionParams<
      CreatePolicySeriesArgs,
      CreatePolicySeriesAccounts
    >,
  ): TransactionInstruction;
  buildCreatePolicySeriesTx(
    params: BuildTransactionParams<
      CreatePolicySeriesArgs,
      CreatePolicySeriesAccounts
    >,
  ): Transaction;
  buildCreateReserveDomainInstruction(
    params: BuildInstructionParams<
      CreateReserveDomainArgs,
      CreateReserveDomainAccounts
    >,
  ): TransactionInstruction;
  buildCreateReserveDomainTx(
    params: BuildTransactionParams<
      CreateReserveDomainArgs,
      CreateReserveDomainAccounts
    >,
  ): Transaction;
  buildDeallocateCapitalInstruction(
    params: BuildInstructionParams<
      DeallocateCapitalArgs,
      DeallocateCapitalAccounts
    >,
  ): TransactionInstruction;
  buildDeallocateCapitalTx(
    params: BuildTransactionParams<
      DeallocateCapitalArgs,
      DeallocateCapitalAccounts
    >,
  ): Transaction;
  buildDepositIntoCapitalClassInstruction(
    params: BuildInstructionParams<
      DepositIntoCapitalClassArgs,
      DepositIntoCapitalClassAccounts
    >,
  ): TransactionInstruction;
  buildDepositIntoCapitalClassTx(
    params: BuildTransactionParams<
      DepositIntoCapitalClassArgs,
      DepositIntoCapitalClassAccounts
    >,
  ): Transaction;
  buildFundSponsorBudgetInstruction(
    params: BuildInstructionParams<
      FundSponsorBudgetArgs,
      FundSponsorBudgetAccounts
    >,
  ): TransactionInstruction;
  buildFundSponsorBudgetTx(
    params: BuildTransactionParams<
      FundSponsorBudgetArgs,
      FundSponsorBudgetAccounts
    >,
  ): Transaction;
  buildInitPoolOracleFeeVaultInstruction(
    params: BuildInstructionParams<
      InitPoolOracleFeeVaultArgs,
      InitPoolOracleFeeVaultAccounts
    >,
  ): TransactionInstruction;
  buildInitPoolOracleFeeVaultTx(
    params: BuildTransactionParams<
      InitPoolOracleFeeVaultArgs,
      InitPoolOracleFeeVaultAccounts
    >,
  ): Transaction;
  buildInitPoolTreasuryVaultInstruction(
    params: BuildInstructionParams<
      InitPoolTreasuryVaultArgs,
      InitPoolTreasuryVaultAccounts
    >,
  ): TransactionInstruction;
  buildInitPoolTreasuryVaultTx(
    params: BuildTransactionParams<
      InitPoolTreasuryVaultArgs,
      InitPoolTreasuryVaultAccounts
    >,
  ): Transaction;
  buildInitProtocolFeeVaultInstruction(
    params: BuildInstructionParams<
      InitProtocolFeeVaultArgs,
      InitProtocolFeeVaultAccounts
    >,
  ): TransactionInstruction;
  buildInitProtocolFeeVaultTx(
    params: BuildTransactionParams<
      InitProtocolFeeVaultArgs,
      InitProtocolFeeVaultAccounts
    >,
  ): Transaction;
  buildInitializeProtocolGovernanceInstruction(
    params: BuildInstructionParams<
      InitializeProtocolGovernanceArgs,
      InitializeProtocolGovernanceAccounts
    >,
  ): TransactionInstruction;
  buildInitializeProtocolGovernanceTx(
    params: BuildTransactionParams<
      InitializeProtocolGovernanceArgs,
      InitializeProtocolGovernanceAccounts
    >,
  ): Transaction;
  buildMarkImpairmentInstruction(
    params: BuildInstructionParams<MarkImpairmentArgs, MarkImpairmentAccounts>,
  ): TransactionInstruction;
  buildMarkImpairmentTx(
    params: BuildTransactionParams<MarkImpairmentArgs, MarkImpairmentAccounts>,
  ): Transaction;
  buildOpenClaimCaseInstruction(
    params: BuildInstructionParams<OpenClaimCaseArgs, OpenClaimCaseAccounts>,
  ): TransactionInstruction;
  buildOpenClaimCaseTx(
    params: BuildTransactionParams<OpenClaimCaseArgs, OpenClaimCaseAccounts>,
  ): Transaction;
  buildOpenFundingLineInstruction(
    params: BuildInstructionParams<
      OpenFundingLineArgs,
      OpenFundingLineAccounts
    >,
  ): TransactionInstruction;
  buildOpenFundingLineTx(
    params: BuildTransactionParams<
      OpenFundingLineArgs,
      OpenFundingLineAccounts
    >,
  ): Transaction;
  buildOpenMemberPositionInstruction(
    params: BuildInstructionParams<
      OpenMemberPositionArgs,
      OpenMemberPositionAccounts
    >,
  ): TransactionInstruction;
  buildOpenMemberPositionTx(
    params: BuildTransactionParams<
      OpenMemberPositionArgs,
      OpenMemberPositionAccounts
    >,
  ): Transaction;
  buildProcessRedemptionQueueInstruction(
    params: BuildInstructionParams<
      ProcessRedemptionQueueArgs,
      ProcessRedemptionQueueAccounts
    >,
  ): TransactionInstruction;
  buildProcessRedemptionQueueTx(
    params: BuildTransactionParams<
      ProcessRedemptionQueueArgs,
      ProcessRedemptionQueueAccounts
    >,
  ): Transaction;
  buildRecordPremiumPaymentInstruction(
    params: BuildInstructionParams<
      RecordPremiumPaymentArgs,
      RecordPremiumPaymentAccounts
    >,
  ): TransactionInstruction;
  buildRecordPremiumPaymentTx(
    params: BuildTransactionParams<
      RecordPremiumPaymentArgs,
      RecordPremiumPaymentAccounts
    >,
  ): Transaction;
  buildRegisterOracleInstruction(
    params: BuildInstructionParams<RegisterOracleArgs, RegisterOracleAccounts>,
  ): TransactionInstruction;
  buildRegisterOracleTx(
    params: BuildTransactionParams<RegisterOracleArgs, RegisterOracleAccounts>,
  ): Transaction;
  buildRegisterOutcomeSchemaInstruction(
    params: BuildInstructionParams<
      RegisterOutcomeSchemaArgs,
      RegisterOutcomeSchemaAccounts
    >,
  ): TransactionInstruction;
  buildRegisterOutcomeSchemaTx(
    params: BuildTransactionParams<
      RegisterOutcomeSchemaArgs,
      RegisterOutcomeSchemaAccounts
    >,
  ): Transaction;
  buildReleaseReserveInstruction(
    params: BuildInstructionParams<ReleaseReserveArgs, ReleaseReserveAccounts>,
  ): TransactionInstruction;
  buildReleaseReserveTx(
    params: BuildTransactionParams<ReleaseReserveArgs, ReleaseReserveAccounts>,
  ): Transaction;
  buildRequestRedemptionInstruction(
    params: BuildInstructionParams<
      RequestRedemptionArgs,
      RequestRedemptionAccounts
    >,
  ): TransactionInstruction;
  buildRequestRedemptionTx(
    params: BuildTransactionParams<
      RequestRedemptionArgs,
      RequestRedemptionAccounts
    >,
  ): Transaction;
  buildReserveObligationInstruction(
    params: BuildInstructionParams<
      ReserveObligationArgs,
      ReserveObligationAccounts
    >,
  ): TransactionInstruction;
  buildReserveObligationTx(
    params: BuildTransactionParams<
      ReserveObligationArgs,
      ReserveObligationAccounts
    >,
  ): Transaction;
  buildRotateProtocolGovernanceAuthorityInstruction(
    params: BuildInstructionParams<
      RotateProtocolGovernanceAuthorityArgs,
      RotateProtocolGovernanceAuthorityAccounts
    >,
  ): TransactionInstruction;
  buildRotateProtocolGovernanceAuthorityTx(
    params: BuildTransactionParams<
      RotateProtocolGovernanceAuthorityArgs,
      RotateProtocolGovernanceAuthorityAccounts
    >,
  ): Transaction;
  buildSetPoolOracleInstruction(
    params: BuildInstructionParams<SetPoolOracleArgs, SetPoolOracleAccounts>,
  ): TransactionInstruction;
  buildSetPoolOracleTx(
    params: BuildTransactionParams<SetPoolOracleArgs, SetPoolOracleAccounts>,
  ): Transaction;
  buildSetPoolOraclePermissionsInstruction(
    params: BuildInstructionParams<
      SetPoolOraclePermissionsArgs,
      SetPoolOraclePermissionsAccounts
    >,
  ): TransactionInstruction;
  buildSetPoolOraclePermissionsTx(
    params: BuildTransactionParams<
      SetPoolOraclePermissionsArgs,
      SetPoolOraclePermissionsAccounts
    >,
  ): Transaction;
  buildSetPoolOraclePolicyInstruction(
    params: BuildInstructionParams<
      SetPoolOraclePolicyArgs,
      SetPoolOraclePolicyAccounts
    >,
  ): TransactionInstruction;
  buildSetPoolOraclePolicyTx(
    params: BuildTransactionParams<
      SetPoolOraclePolicyArgs,
      SetPoolOraclePolicyAccounts
    >,
  ): Transaction;
  buildSetProtocolEmergencyPauseInstruction(
    params: BuildInstructionParams<
      SetProtocolEmergencyPauseArgs,
      SetProtocolEmergencyPauseAccounts
    >,
  ): TransactionInstruction;
  buildSetProtocolEmergencyPauseTx(
    params: BuildTransactionParams<
      SetProtocolEmergencyPauseArgs,
      SetProtocolEmergencyPauseAccounts
    >,
  ): Transaction;
  buildSettleClaimCaseInstruction(
    params: BuildInstructionParams<
      SettleClaimCaseArgs,
      SettleClaimCaseAccounts
    >,
  ): TransactionInstruction;
  buildSettleClaimCaseTx(
    params: BuildTransactionParams<
      SettleClaimCaseArgs,
      SettleClaimCaseAccounts
    >,
  ): Transaction;
  buildSettleObligationInstruction(
    params: BuildInstructionParams<
      SettleObligationArgs,
      SettleObligationAccounts
    >,
  ): TransactionInstruction;
  buildSettleObligationTx(
    params: BuildTransactionParams<
      SettleObligationArgs,
      SettleObligationAccounts
    >,
  ): Transaction;
  buildUpdateAllocationCapsInstruction(
    params: BuildInstructionParams<
      UpdateAllocationCapsArgs,
      UpdateAllocationCapsAccounts
    >,
  ): TransactionInstruction;
  buildUpdateAllocationCapsTx(
    params: BuildTransactionParams<
      UpdateAllocationCapsArgs,
      UpdateAllocationCapsAccounts
    >,
  ): Transaction;
  buildUpdateCapitalClassControlsInstruction(
    params: BuildInstructionParams<
      UpdateCapitalClassControlsArgs,
      UpdateCapitalClassControlsAccounts
    >,
  ): TransactionInstruction;
  buildUpdateCapitalClassControlsTx(
    params: BuildTransactionParams<
      UpdateCapitalClassControlsArgs,
      UpdateCapitalClassControlsAccounts
    >,
  ): Transaction;
  buildUpdateHealthPlanControlsInstruction(
    params: BuildInstructionParams<
      UpdateHealthPlanControlsArgs,
      UpdateHealthPlanControlsAccounts
    >,
  ): TransactionInstruction;
  buildUpdateHealthPlanControlsTx(
    params: BuildTransactionParams<
      UpdateHealthPlanControlsArgs,
      UpdateHealthPlanControlsAccounts
    >,
  ): Transaction;
  buildUpdateLpPositionCredentialingInstruction(
    params: BuildInstructionParams<
      UpdateLpPositionCredentialingArgs,
      UpdateLpPositionCredentialingAccounts
    >,
  ): TransactionInstruction;
  buildUpdateLpPositionCredentialingTx(
    params: BuildTransactionParams<
      UpdateLpPositionCredentialingArgs,
      UpdateLpPositionCredentialingAccounts
    >,
  ): Transaction;
  buildUpdateMemberEligibilityInstruction(
    params: BuildInstructionParams<
      UpdateMemberEligibilityArgs,
      UpdateMemberEligibilityAccounts
    >,
  ): TransactionInstruction;
  buildUpdateMemberEligibilityTx(
    params: BuildTransactionParams<
      UpdateMemberEligibilityArgs,
      UpdateMemberEligibilityAccounts
    >,
  ): Transaction;
  buildUpdateOracleProfileInstruction(
    params: BuildInstructionParams<
      UpdateOracleProfileArgs,
      UpdateOracleProfileAccounts
    >,
  ): TransactionInstruction;
  buildUpdateOracleProfileTx(
    params: BuildTransactionParams<
      UpdateOracleProfileArgs,
      UpdateOracleProfileAccounts
    >,
  ): Transaction;
  buildUpdateReserveDomainControlsInstruction(
    params: BuildInstructionParams<
      UpdateReserveDomainControlsArgs,
      UpdateReserveDomainControlsAccounts
    >,
  ): TransactionInstruction;
  buildUpdateReserveDomainControlsTx(
    params: BuildTransactionParams<
      UpdateReserveDomainControlsArgs,
      UpdateReserveDomainControlsAccounts
    >,
  ): Transaction;
  buildVerifyOutcomeSchemaInstruction(
    params: BuildInstructionParams<
      VerifyOutcomeSchemaArgs,
      VerifyOutcomeSchemaAccounts
    >,
  ): TransactionInstruction;
  buildVerifyOutcomeSchemaTx(
    params: BuildTransactionParams<
      VerifyOutcomeSchemaArgs,
      VerifyOutcomeSchemaAccounts
    >,
  ): Transaction;
  buildVersionPolicySeriesInstruction(
    params: BuildInstructionParams<
      VersionPolicySeriesArgs,
      VersionPolicySeriesAccounts
    >,
  ): TransactionInstruction;
  buildVersionPolicySeriesTx(
    params: BuildTransactionParams<
      VersionPolicySeriesArgs,
      VersionPolicySeriesAccounts
    >,
  ): Transaction;
  buildWithdrawPoolOracleFeeSolInstruction(
    params: BuildInstructionParams<
      WithdrawArgs,
      WithdrawPoolOracleFeeSolAccounts
    >,
  ): TransactionInstruction;
  buildWithdrawPoolOracleFeeSolTx(
    params: BuildTransactionParams<
      WithdrawArgs,
      WithdrawPoolOracleFeeSolAccounts
    >,
  ): Transaction;
  buildWithdrawPoolOracleFeeSplInstruction(
    params: BuildInstructionParams<
      WithdrawArgs,
      WithdrawPoolOracleFeeSplAccounts
    >,
  ): TransactionInstruction;
  buildWithdrawPoolOracleFeeSplTx(
    params: BuildTransactionParams<
      WithdrawArgs,
      WithdrawPoolOracleFeeSplAccounts
    >,
  ): Transaction;
  buildWithdrawPoolTreasurySolInstruction(
    params: BuildInstructionParams<
      WithdrawArgs,
      WithdrawPoolTreasurySolAccounts
    >,
  ): TransactionInstruction;
  buildWithdrawPoolTreasurySolTx(
    params: BuildTransactionParams<
      WithdrawArgs,
      WithdrawPoolTreasurySolAccounts
    >,
  ): Transaction;
  buildWithdrawPoolTreasurySplInstruction(
    params: BuildInstructionParams<
      WithdrawArgs,
      WithdrawPoolTreasurySplAccounts
    >,
  ): TransactionInstruction;
  buildWithdrawPoolTreasurySplTx(
    params: BuildTransactionParams<
      WithdrawArgs,
      WithdrawPoolTreasurySplAccounts
    >,
  ): Transaction;
  buildWithdrawProtocolFeeSolInstruction(
    params: BuildInstructionParams<
      WithdrawArgs,
      WithdrawProtocolFeeSolAccounts
    >,
  ): TransactionInstruction;
  buildWithdrawProtocolFeeSolTx(
    params: BuildTransactionParams<
      WithdrawArgs,
      WithdrawProtocolFeeSolAccounts
    >,
  ): Transaction;
  buildWithdrawProtocolFeeSplInstruction(
    params: BuildInstructionParams<
      WithdrawArgs,
      WithdrawProtocolFeeSplAccounts
    >,
  ): TransactionInstruction;
  buildWithdrawProtocolFeeSplTx(
    params: BuildTransactionParams<
      WithdrawArgs,
      WithdrawProtocolFeeSplAccounts
    >,
  ): Transaction;
  fetchAllocationLedger(
    address: PublicKeyish,
  ): Promise<AllocationLedger | null>;
  fetchAllocationPosition(
    address: PublicKeyish,
  ): Promise<AllocationPosition | null>;
  fetchCapitalClass(address: PublicKeyish): Promise<CapitalClass | null>;
  fetchClaimAttestation(
    address: PublicKeyish,
  ): Promise<ClaimAttestation | null>;
  fetchClaimCase(address: PublicKeyish): Promise<ClaimCase | null>;
  fetchDomainAssetLedger(
    address: PublicKeyish,
  ): Promise<DomainAssetLedger | null>;
  fetchDomainAssetVault(
    address: PublicKeyish,
  ): Promise<DomainAssetVault | null>;
  fetchFundingLine(address: PublicKeyish): Promise<FundingLine | null>;
  fetchFundingLineLedger(
    address: PublicKeyish,
  ): Promise<FundingLineLedger | null>;
  fetchHealthPlan(address: PublicKeyish): Promise<HealthPlan | null>;
  fetchLPPosition(address: PublicKeyish): Promise<LPPosition | null>;
  fetchLiquidityPool(address: PublicKeyish): Promise<LiquidityPool | null>;
  fetchMemberPosition(address: PublicKeyish): Promise<MemberPosition | null>;
  fetchMembershipAnchorSeat(
    address: PublicKeyish,
  ): Promise<MembershipAnchorSeat | null>;
  fetchObligation(address: PublicKeyish): Promise<Obligation | null>;
  fetchOracleProfile(address: PublicKeyish): Promise<OracleProfile | null>;
  fetchOutcomeSchema(address: PublicKeyish): Promise<OutcomeSchema | null>;
  fetchPlanReserveLedger(
    address: PublicKeyish,
  ): Promise<PlanReserveLedger | null>;
  fetchPolicySeries(address: PublicKeyish): Promise<PolicySeries | null>;
  fetchPoolClassLedger(address: PublicKeyish): Promise<PoolClassLedger | null>;
  fetchPoolOracleApproval(
    address: PublicKeyish,
  ): Promise<PoolOracleApproval | null>;
  fetchPoolOracleFeeVault(
    address: PublicKeyish,
  ): Promise<PoolOracleFeeVault | null>;
  fetchPoolOraclePermissionSet(
    address: PublicKeyish,
  ): Promise<PoolOraclePermissionSet | null>;
  fetchPoolOraclePolicy(
    address: PublicKeyish,
  ): Promise<PoolOraclePolicy | null>;
  fetchPoolTreasuryVault(
    address: PublicKeyish,
  ): Promise<PoolTreasuryVault | null>;
  fetchProtocolFeeVault(
    address: PublicKeyish,
  ): Promise<ProtocolFeeVault | null>;
  fetchProtocolGovernance(
    address?: PublicKeyish,
  ): Promise<ProtocolGovernance | null>;
  fetchReserveDomain(address: PublicKeyish): Promise<ReserveDomain | null>;
  fetchSchemaDependencyLedger(
    address: PublicKeyish,
  ): Promise<SchemaDependencyLedger | null>;
  fetchSeriesReserveLedger(
    address: PublicKeyish,
  ): Promise<SeriesReserveLedger | null>;
}
