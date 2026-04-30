import { PublicKey } from '@solana/web3.js';

import { PROTOCOL_PROGRAM_ID } from './generated/protocol_contract.js';
import type { PublicKeyish } from './generated/protocol_types.js';

const TEXT_ENCODER = new TextEncoder();
const PROGRAM_ID = new PublicKey(PROTOCOL_PROGRAM_ID);

export const ZERO_PUBKEY = '11111111111111111111111111111111';
export const ZERO_PUBKEY_KEY = new PublicKey(ZERO_PUBKEY);
export const MAX_ID_SEED_BYTES = 32;

export const SEED_PROTOCOL_GOVERNANCE = 'protocol_governance';
export const SEED_RESERVE_DOMAIN = 'reserve_domain';
export const SEED_DOMAIN_ASSET_VAULT = 'domain_asset_vault';
export const SEED_DOMAIN_ASSET_VAULT_TOKEN = 'domain_asset_vault_token';
export const SEED_DOMAIN_ASSET_LEDGER = 'domain_asset_ledger';
export const SEED_HEALTH_PLAN = 'health_plan';
export const SEED_PLAN_RESERVE_LEDGER = 'plan_reserve_ledger';
export const SEED_POLICY_SERIES = 'policy_series';
export const SEED_SERIES_RESERVE_LEDGER = 'series_reserve_ledger';
export const SEED_MEMBER_POSITION = 'member_position';
export const SEED_MEMBERSHIP_ANCHOR_SEAT = 'membership_anchor_seat';
export const SEED_FUNDING_LINE = 'funding_line';
export const SEED_FUNDING_LINE_LEDGER = 'funding_line_ledger';
export const SEED_CLAIM_CASE = 'claim_case';
export const SEED_OBLIGATION = 'obligation';
export const SEED_LIQUIDITY_POOL = 'liquidity_pool';
export const SEED_CAPITAL_CLASS = 'capital_class';
export const SEED_POOL_CLASS_LEDGER = 'pool_class_ledger';
export const SEED_LP_POSITION = 'lp_position';
export const SEED_ALLOCATION_POSITION = 'allocation_position';
export const SEED_ALLOCATION_LEDGER = 'allocation_ledger';
export const SEED_ORACLE_PROFILE = 'oracle_profile';
export const SEED_POOL_ORACLE_APPROVAL = 'pool_oracle_approval';
export const SEED_POOL_ORACLE_POLICY = 'pool_oracle_policy';
export const SEED_POOL_ORACLE_PERMISSION_SET = 'pool_oracle_permission_set';
export const SEED_PROTOCOL_FEE_VAULT = 'protocol_fee_vault';
export const SEED_POOL_TREASURY_VAULT = 'pool_treasury_vault';
export const SEED_POOL_ORACLE_FEE_VAULT = 'pool_oracle_fee_vault';
export const SEED_OUTCOME_SCHEMA = 'outcome_schema';
export const SEED_SCHEMA_DEPENDENCY_LEDGER = 'schema_dependency_ledger';
export const SEED_CLAIM_ATTESTATION = 'claim_attestation';

export function getProgramId(): PublicKey {
  return PROGRAM_ID;
}

export function utf8ByteLength(value: string): number {
  return TEXT_ENCODER.encode(value).length;
}

export function isSeedIdSafe(value: string): boolean {
  const length = utf8ByteLength(value);
  return length > 0 && length <= MAX_ID_SEED_BYTES;
}

export function assertSeedId(value: string, label = 'seed id'): void {
  if (!isSeedIdSafe(value)) {
    throw new Error(`${label} must be 1..${MAX_ID_SEED_BYTES} UTF-8 bytes.`);
  }
}

function isPublicKeyLike(value: unknown): value is {
  toBase58(): string;
} {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as { toBase58?: unknown }).toBase58 === 'function'
  );
}

export function toPublicKey(value: PublicKeyish): PublicKey {
  if (value instanceof PublicKey) {
    return value;
  }
  if (isPublicKeyLike(value)) {
    return new PublicKey(value.toBase58());
  }
  if (value === null || value === undefined) {
    throw new Error('public key value is required');
  }
  return new PublicKey(value);
}

export function normalizeAddress(value: PublicKeyish): string {
  return toPublicKey(value).toBase58();
}

function derivePda(
  seeds: Uint8Array[],
  programId: PublicKeyish = PROGRAM_ID,
): PublicKey {
  return PublicKey.findProgramAddressSync(seeds, toPublicKey(programId))[0];
}

function stringSeed(value: string, label: string): Uint8Array {
  assertSeedId(value, label);
  return TEXT_ENCODER.encode(value);
}

function normalizeHex32(value: string, label: string): string {
  const normalized = value.trim().toLowerCase().replace(/^0x/, '');
  if (!/^[0-9a-f]{64}$/.test(normalized)) {
    throw new Error(`${label} must be a 32-byte hex string.`);
  }
  return normalized;
}

function hexSeed(value: string, label: string): Uint8Array {
  return Uint8Array.from(Buffer.from(normalizeHex32(value, label), 'hex'));
}

export function deriveProtocolGovernancePda(
  programId: PublicKeyish = PROGRAM_ID,
): PublicKey {
  return derivePda([TEXT_ENCODER.encode(SEED_PROTOCOL_GOVERNANCE)], programId);
}

export function deriveReserveDomainPda(params: {
  domainId: string;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_RESERVE_DOMAIN),
      stringSeed(params.domainId, 'domain id'),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveDomainAssetVaultPda(params: {
  reserveDomain: PublicKeyish;
  assetMint: PublicKeyish;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_DOMAIN_ASSET_VAULT),
      toPublicKey(params.reserveDomain).toBytes(),
      toPublicKey(params.assetMint).toBytes(),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveDomainAssetVaultTokenAccountPda(params: {
  reserveDomain: PublicKeyish;
  assetMint: PublicKeyish;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_DOMAIN_ASSET_VAULT_TOKEN),
      toPublicKey(params.reserveDomain).toBytes(),
      toPublicKey(params.assetMint).toBytes(),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveDomainAssetLedgerPda(params: {
  reserveDomain: PublicKeyish;
  assetMint: PublicKeyish;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_DOMAIN_ASSET_LEDGER),
      toPublicKey(params.reserveDomain).toBytes(),
      toPublicKey(params.assetMint).toBytes(),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveHealthPlanPda(params: {
  reserveDomain: PublicKeyish;
  planId: string;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_HEALTH_PLAN),
      toPublicKey(params.reserveDomain).toBytes(),
      stringSeed(params.planId, 'plan id'),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function derivePlanReserveLedgerPda(params: {
  healthPlan: PublicKeyish;
  assetMint: PublicKeyish;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_PLAN_RESERVE_LEDGER),
      toPublicKey(params.healthPlan).toBytes(),
      toPublicKey(params.assetMint).toBytes(),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function derivePolicySeriesPda(params: {
  healthPlan: PublicKeyish;
  seriesId: string;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_POLICY_SERIES),
      toPublicKey(params.healthPlan).toBytes(),
      stringSeed(params.seriesId, 'series id'),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveSeriesReserveLedgerPda(params: {
  policySeries: PublicKeyish;
  assetMint: PublicKeyish;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_SERIES_RESERVE_LEDGER),
      toPublicKey(params.policySeries).toBytes(),
      toPublicKey(params.assetMint).toBytes(),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveMemberPositionPda(params: {
  healthPlan: PublicKeyish;
  wallet: PublicKeyish;
  seriesScope?: PublicKeyish;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_MEMBER_POSITION),
      toPublicKey(params.healthPlan).toBytes(),
      toPublicKey(params.wallet).toBytes(),
      toPublicKey(params.seriesScope ?? ZERO_PUBKEY_KEY).toBytes(),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveMembershipAnchorSeatPda(params: {
  healthPlan: PublicKeyish;
  anchorRef: PublicKeyish;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_MEMBERSHIP_ANCHOR_SEAT),
      toPublicKey(params.healthPlan).toBytes(),
      toPublicKey(params.anchorRef).toBytes(),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveFundingLinePda(params: {
  healthPlan: PublicKeyish;
  lineId: string;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_FUNDING_LINE),
      toPublicKey(params.healthPlan).toBytes(),
      stringSeed(params.lineId, 'funding line id'),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveFundingLineLedgerPda(params: {
  fundingLine: PublicKeyish;
  assetMint: PublicKeyish;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_FUNDING_LINE_LEDGER),
      toPublicKey(params.fundingLine).toBytes(),
      toPublicKey(params.assetMint).toBytes(),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveClaimCasePda(params: {
  healthPlan: PublicKeyish;
  claimId: string;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_CLAIM_CASE),
      toPublicKey(params.healthPlan).toBytes(),
      stringSeed(params.claimId, 'claim id'),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveObligationPda(params: {
  fundingLine: PublicKeyish;
  obligationId: string;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_OBLIGATION),
      toPublicKey(params.fundingLine).toBytes(),
      stringSeed(params.obligationId, 'obligation id'),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveLiquidityPoolPda(params: {
  reserveDomain: PublicKeyish;
  poolId: string;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_LIQUIDITY_POOL),
      toPublicKey(params.reserveDomain).toBytes(),
      stringSeed(params.poolId, 'pool id'),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveCapitalClassPda(params: {
  liquidityPool: PublicKeyish;
  classId: string;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_CAPITAL_CLASS),
      toPublicKey(params.liquidityPool).toBytes(),
      stringSeed(params.classId, 'capital class id'),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function derivePoolClassLedgerPda(params: {
  capitalClass: PublicKeyish;
  assetMint: PublicKeyish;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_POOL_CLASS_LEDGER),
      toPublicKey(params.capitalClass).toBytes(),
      toPublicKey(params.assetMint).toBytes(),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveLpPositionPda(params: {
  capitalClass: PublicKeyish;
  owner: PublicKeyish;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_LP_POSITION),
      toPublicKey(params.capitalClass).toBytes(),
      toPublicKey(params.owner).toBytes(),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveAllocationPositionPda(params: {
  capitalClass: PublicKeyish;
  fundingLine: PublicKeyish;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_ALLOCATION_POSITION),
      toPublicKey(params.capitalClass).toBytes(),
      toPublicKey(params.fundingLine).toBytes(),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveAllocationLedgerPda(params: {
  allocationPosition: PublicKeyish;
  assetMint: PublicKeyish;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_ALLOCATION_LEDGER),
      toPublicKey(params.allocationPosition).toBytes(),
      toPublicKey(params.assetMint).toBytes(),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveOracleProfilePda(params: {
  oracle: PublicKeyish;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_ORACLE_PROFILE),
      toPublicKey(params.oracle).toBytes(),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function derivePoolOracleApprovalPda(params: {
  liquidityPool: PublicKeyish;
  oracle: PublicKeyish;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_POOL_ORACLE_APPROVAL),
      toPublicKey(params.liquidityPool).toBytes(),
      toPublicKey(params.oracle).toBytes(),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function derivePoolOraclePolicyPda(params: {
  liquidityPool: PublicKeyish;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_POOL_ORACLE_POLICY),
      toPublicKey(params.liquidityPool).toBytes(),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function derivePoolOraclePermissionSetPda(params: {
  liquidityPool: PublicKeyish;
  oracle: PublicKeyish;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_POOL_ORACLE_PERMISSION_SET),
      toPublicKey(params.liquidityPool).toBytes(),
      toPublicKey(params.oracle).toBytes(),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveProtocolFeeVaultPda(params: {
  reserveDomain: PublicKeyish;
  assetMint: PublicKeyish;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_PROTOCOL_FEE_VAULT),
      toPublicKey(params.reserveDomain).toBytes(),
      toPublicKey(params.assetMint).toBytes(),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function derivePoolTreasuryVaultPda(params: {
  liquidityPool: PublicKeyish;
  assetMint: PublicKeyish;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_POOL_TREASURY_VAULT),
      toPublicKey(params.liquidityPool).toBytes(),
      toPublicKey(params.assetMint).toBytes(),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function derivePoolOracleFeeVaultPda(params: {
  liquidityPool: PublicKeyish;
  oracle: PublicKeyish;
  assetMint: PublicKeyish;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_POOL_ORACLE_FEE_VAULT),
      toPublicKey(params.liquidityPool).toBytes(),
      toPublicKey(params.oracle).toBytes(),
      toPublicKey(params.assetMint).toBytes(),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveOutcomeSchemaPda(params: {
  schemaKeyHashHex: string;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_OUTCOME_SCHEMA),
      hexSeed(params.schemaKeyHashHex, 'schema key hash'),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveSchemaDependencyLedgerPda(params: {
  schemaKeyHashHex: string;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_SCHEMA_DEPENDENCY_LEDGER),
      hexSeed(params.schemaKeyHashHex, 'schema key hash'),
    ],
    params.programId ?? PROGRAM_ID,
  );
}

export function deriveClaimAttestationPda(params: {
  claimCase: PublicKeyish;
  oracle: PublicKeyish;
  programId?: PublicKeyish;
}): PublicKey {
  return derivePda(
    [
      TEXT_ENCODER.encode(SEED_CLAIM_ATTESTATION),
      toPublicKey(params.claimCase).toBytes(),
      toPublicKey(params.oracle).toBytes(),
    ],
    params.programId ?? PROGRAM_ID,
  );
}
