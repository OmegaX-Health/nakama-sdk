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
  | 'CapitalContribution'
  | 'ClaimCase'
  | 'DomainAssetLedger'
  | 'DomainAssetVault'
  | 'FundingLine'
  | 'FundingLineLedger'
  | 'HealthPlan'
  | 'Obligation'
  | 'PlanReserveLedger'
  | 'PolicySeries'
  | 'ReserveDomain';

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
  evidence_ref_hash: Uint8Array | number[];
  decision_support_hash: Uint8Array | number[];
}

export interface AuthorizeClaimRecipientArgs {
  delegate_recipient: PublicKeyish;
}

export interface CapitalContribution {
  reserve_domain: string;
  health_plan: string;
  funding_line: string;
  contributor: string;
  asset_mint: string;
  contributed_amount: BigNumberish;
  returned_amount: BigNumberish;
  terms_hash: Uint8Array | number[];
  bump: number;
}

export interface ClaimCase {
  reserve_domain: string;
  health_plan: string;
  policy_series: string;
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

export interface ClaimCaseStateChangedEvent {
  claim_case: string;
  intake_status: number;
  approved_amount: BigNumberish;
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
  allowed_rail_mask: number;
  default_funding_priority: number;
  oracle_policy_hash: Uint8Array | number[];
  schema_binding_hash: Uint8Array | number[];
  compliance_baseline_hash: Uint8Array | number[];
  pause_flags: number;
}

export interface CreateObligationArgs {
  obligation_id: string;
  asset_mint: PublicKeyish;
  policy_series: PublicKeyish;
  member_wallet: PublicKeyish;
  beneficiary: PublicKeyish;
  claim_case: PublicKeyish;
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

export interface DepositReserveCapitalArgs {
  amount: BigNumberish;
  terms_hash: Uint8Array | number[];
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

export interface FundSponsorBudgetArgs {
  amount: BigNumberish;
}

export interface FundingFlowRecordedEvent {
  funding_line: string;
  amount: BigNumberish;
  flow_kind: number;
  reference_hash: Uint8Array | number[];
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

export interface LedgerInitializedEvent {
  scope_kind: number;
  scope: string;
  asset_mint: string;
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

export interface RecordPremiumPaymentArgs {
  amount: BigNumberish;
}

export interface RecordReserveEarningsArgs {
  amount: BigNumberish;
  earnings_ref_hash: Uint8Array | number[];
}

export interface ReleaseReserveArgs {
  amount: BigNumberish;
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

export interface ReturnReserveCapitalArgs {
  amount: BigNumberish;
  reason_hash: Uint8Array | number[];
}

export interface ScopedControlChangedEvent {
  scope_kind: number;
  scope: string;
  authority: string;
  pause_flags: number;
  reason_hash: Uint8Array | number[];
  audit_nonce: BigNumberish;
}

export interface SettleClaimCaseArgs {
  amount: BigNumberish;
}

export interface SettleObligationArgs {
  next_status: number;
  amount: BigNumberish;
  settlement_reason_hash: Uint8Array | number[];
}

export interface UpdateHealthPlanControlsArgs {
  sponsor_operator: PublicKeyish;
  claims_operator: PublicKeyish;
  oracle_authority: PublicKeyish;
  allowed_rail_mask: number;
  default_funding_priority: number;
  oracle_policy_hash: Uint8Array | number[];
  schema_binding_hash: Uint8Array | number[];
  compliance_baseline_hash: Uint8Array | number[];
  pause_flags: number;
  active: boolean;
  reason_hash: Uint8Array | number[];
}

export interface UpdateReserveDomainControlsArgs {
  allowed_rail_mask: number;
  pause_flags: number;
  active: boolean;
  reason_hash: Uint8Array | number[];
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
  comparability_hash: Uint8Array | number[];
  policy_overrides_hash: Uint8Array | number[];
  cycle_seconds: BigNumberish;
}

export interface AdjudicateClaimCaseAccounts {
  authority: PublicKeyish;
  health_plan: PublicKeyish;
  claim_case: PublicKeyish;
  obligation?: PublicKeyish;
}

export interface AuthorizeClaimRecipientAccounts {
  authority: PublicKeyish;
  claim_case: PublicKeyish;
}

export interface CreateDomainAssetVaultAccounts {
  authority: PublicKeyish;
  reserve_domain: PublicKeyish;
  domain_asset_vault: PublicKeyish;
  domain_asset_ledger: PublicKeyish;
  asset_mint: PublicKeyish;
  vault_token_account: PublicKeyish;
  token_program?: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface CreateHealthPlanAccounts {
  plan_admin: PublicKeyish;
  reserve_domain: PublicKeyish;
  health_plan: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface CreateObligationAccounts {
  authority: PublicKeyish;
  health_plan: PublicKeyish;
  domain_asset_ledger: PublicKeyish;
  funding_line: PublicKeyish;
  funding_line_ledger: PublicKeyish;
  plan_reserve_ledger: PublicKeyish;
  obligation: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface CreatePolicySeriesAccounts {
  authority: PublicKeyish;
  health_plan: PublicKeyish;
  policy_series: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface CreateReserveDomainAccounts {
  authority: PublicKeyish;
  reserve_domain: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface DepositReserveCapitalAccounts {
  contributor: PublicKeyish;
  health_plan: PublicKeyish;
  domain_asset_vault: PublicKeyish;
  domain_asset_ledger: PublicKeyish;
  funding_line: PublicKeyish;
  capital_contribution: PublicKeyish;
  funding_line_ledger: PublicKeyish;
  plan_reserve_ledger: PublicKeyish;
  source_token_account: PublicKeyish;
  asset_mint: PublicKeyish;
  vault_token_account: PublicKeyish;
  token_program?: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface FundSponsorBudgetAccounts {
  authority: PublicKeyish;
  health_plan: PublicKeyish;
  domain_asset_vault: PublicKeyish;
  domain_asset_ledger: PublicKeyish;
  funding_line: PublicKeyish;
  funding_line_ledger: PublicKeyish;
  plan_reserve_ledger: PublicKeyish;
  source_token_account: PublicKeyish;
  asset_mint: PublicKeyish;
  vault_token_account: PublicKeyish;
  token_program?: PublicKeyish;
}

export interface OpenClaimCaseAccounts {
  authority: PublicKeyish;
  health_plan: PublicKeyish;
  funding_line: PublicKeyish;
  claim_case: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface OpenFundingLineAccounts {
  authority: PublicKeyish;
  health_plan: PublicKeyish;
  domain_asset_vault: PublicKeyish;
  domain_asset_ledger: PublicKeyish;
  funding_line: PublicKeyish;
  funding_line_ledger: PublicKeyish;
  plan_reserve_ledger: PublicKeyish;
  policy_series?: PublicKeyish;
  system_program?: PublicKeyish;
}

export interface RecordPremiumPaymentAccounts {
  authority: PublicKeyish;
  health_plan: PublicKeyish;
  domain_asset_vault: PublicKeyish;
  domain_asset_ledger: PublicKeyish;
  funding_line: PublicKeyish;
  funding_line_ledger: PublicKeyish;
  plan_reserve_ledger: PublicKeyish;
  source_token_account: PublicKeyish;
  asset_mint: PublicKeyish;
  vault_token_account: PublicKeyish;
  token_program?: PublicKeyish;
}

export interface RecordReserveEarningsAccounts {
  authority: PublicKeyish;
  health_plan: PublicKeyish;
  domain_asset_vault: PublicKeyish;
  domain_asset_ledger: PublicKeyish;
  funding_line: PublicKeyish;
  funding_line_ledger: PublicKeyish;
  plan_reserve_ledger: PublicKeyish;
  source_token_account: PublicKeyish;
  asset_mint: PublicKeyish;
  vault_token_account: PublicKeyish;
  token_program?: PublicKeyish;
}

export interface ReleaseReserveAccounts {
  authority: PublicKeyish;
  health_plan: PublicKeyish;
  domain_asset_ledger: PublicKeyish;
  funding_line: PublicKeyish;
  funding_line_ledger: PublicKeyish;
  plan_reserve_ledger: PublicKeyish;
  obligation: PublicKeyish;
  claim_case?: PublicKeyish;
}

export interface ReserveObligationAccounts {
  authority: PublicKeyish;
  health_plan: PublicKeyish;
  domain_asset_ledger: PublicKeyish;
  funding_line: PublicKeyish;
  funding_line_ledger: PublicKeyish;
  plan_reserve_ledger: PublicKeyish;
  obligation: PublicKeyish;
  claim_case?: PublicKeyish;
}

export interface ReturnReserveCapitalAccounts {
  authority: PublicKeyish;
  health_plan: PublicKeyish;
  domain_asset_vault: PublicKeyish;
  domain_asset_ledger: PublicKeyish;
  funding_line: PublicKeyish;
  capital_contribution: PublicKeyish;
  funding_line_ledger: PublicKeyish;
  plan_reserve_ledger: PublicKeyish;
  asset_mint: PublicKeyish;
  vault_token_account: PublicKeyish;
  recipient_token_account: PublicKeyish;
  token_program?: PublicKeyish;
}

export interface SettleClaimCaseAccounts {
  authority: PublicKeyish;
  health_plan: PublicKeyish;
  domain_asset_vault: PublicKeyish;
  domain_asset_ledger: PublicKeyish;
  funding_line: PublicKeyish;
  funding_line_ledger: PublicKeyish;
  plan_reserve_ledger: PublicKeyish;
  claim_case: PublicKeyish;
  obligation?: PublicKeyish;
  asset_mint: PublicKeyish;
  vault_token_account: PublicKeyish;
  recipient_token_account: PublicKeyish;
  token_program?: PublicKeyish;
}

export interface SettleObligationAccounts {
  authority: PublicKeyish;
  health_plan: PublicKeyish;
  domain_asset_vault: PublicKeyish;
  domain_asset_ledger: PublicKeyish;
  funding_line: PublicKeyish;
  funding_line_ledger: PublicKeyish;
  plan_reserve_ledger: PublicKeyish;
  obligation: PublicKeyish;
  claim_case?: PublicKeyish;
  asset_mint?: PublicKeyish;
  vault_token_account?: PublicKeyish;
  recipient_token_account?: PublicKeyish;
  token_program?: PublicKeyish;
}

export interface UpdateHealthPlanControlsAccounts {
  authority: PublicKeyish;
  health_plan: PublicKeyish;
}

export interface UpdateReserveDomainControlsAccounts {
  authority: PublicKeyish;
  reserve_domain: PublicKeyish;
}

export interface VersionPolicySeriesAccounts {
  authority: PublicKeyish;
  health_plan: PublicKeyish;
  current_policy_series: PublicKeyish;
  next_policy_series: PublicKeyish;
  system_program?: PublicKeyish;
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
  buildDepositReserveCapitalInstruction(
    params: BuildInstructionParams<
      DepositReserveCapitalArgs,
      DepositReserveCapitalAccounts
    >,
  ): TransactionInstruction;
  buildDepositReserveCapitalTx(
    params: BuildTransactionParams<
      DepositReserveCapitalArgs,
      DepositReserveCapitalAccounts
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
  buildRecordReserveEarningsInstruction(
    params: BuildInstructionParams<
      RecordReserveEarningsArgs,
      RecordReserveEarningsAccounts
    >,
  ): TransactionInstruction;
  buildRecordReserveEarningsTx(
    params: BuildTransactionParams<
      RecordReserveEarningsArgs,
      RecordReserveEarningsAccounts
    >,
  ): Transaction;
  buildReleaseReserveInstruction(
    params: BuildInstructionParams<ReleaseReserveArgs, ReleaseReserveAccounts>,
  ): TransactionInstruction;
  buildReleaseReserveTx(
    params: BuildTransactionParams<ReleaseReserveArgs, ReleaseReserveAccounts>,
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
  buildReturnReserveCapitalInstruction(
    params: BuildInstructionParams<
      ReturnReserveCapitalArgs,
      ReturnReserveCapitalAccounts
    >,
  ): TransactionInstruction;
  buildReturnReserveCapitalTx(
    params: BuildTransactionParams<
      ReturnReserveCapitalArgs,
      ReturnReserveCapitalAccounts
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
  fetchCapitalContribution(
    address: PublicKeyish,
  ): Promise<CapitalContribution | null>;
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
  fetchObligation(address: PublicKeyish): Promise<Obligation | null>;
  fetchPlanReserveLedger(
    address: PublicKeyish,
  ): Promise<PlanReserveLedger | null>;
  fetchPolicySeries(address: PublicKeyish): Promise<PolicySeries | null>;
  fetchReserveDomain(address: PublicKeyish): Promise<ReserveDomain | null>;
}
