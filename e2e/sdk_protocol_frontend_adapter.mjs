import * as protocol from '../src/protocol.js';
import * as models from '../src/protocol_models.js';
import * as seeds from '../src/protocol_seeds.js';

const adapter = Object.freeze({
  ...protocol,
  ...models,
  ...seeds,
});

export default adapter;

export * from '../src/protocol.js';
export * from '../src/protocol_models.js';
export {
  MAX_ID_SEED_BYTES,
  SEED_ALLOCATION_LEDGER,
  SEED_ALLOCATION_POSITION,
  SEED_CAPITAL_CLASS,
  SEED_CLAIM_CASE,
  SEED_DOMAIN_ASSET_LEDGER,
  SEED_DOMAIN_ASSET_VAULT,
  SEED_DOMAIN_ASSET_VAULT_TOKEN,
  SEED_FUNDING_LINE,
  SEED_FUNDING_LINE_LEDGER,
  SEED_HEALTH_PLAN,
  SEED_LIQUIDITY_POOL,
  SEED_LP_POSITION,
  SEED_MEMBER_POSITION,
  SEED_OBLIGATION,
  SEED_PLAN_RESERVE_LEDGER,
  SEED_POLICY_SERIES,
  SEED_POOL_CLASS_LEDGER,
  SEED_POOL_ORACLE_FEE_VAULT,
  SEED_POOL_TREASURY_VAULT,
  SEED_PROTOCOL_FEE_VAULT,
  SEED_PROTOCOL_GOVERNANCE,
  SEED_RESERVE_DOMAIN,
  SEED_SERIES_RESERVE_LEDGER,
  ZERO_PUBKEY,
  ZERO_PUBKEY_KEY,
  assertSeedId,
  deriveAllocationLedgerPda,
  deriveAllocationPositionPda,
  deriveCapitalClassPda,
  deriveClaimCasePda,
  deriveDomainAssetLedgerPda,
  deriveDomainAssetVaultTokenAccountPda,
  deriveDomainAssetVaultPda,
  deriveFundingLineLedgerPda,
  deriveFundingLinePda,
  deriveHealthPlanPda,
  deriveLiquidityPoolPda,
  deriveLpPositionPda,
  deriveMemberPositionPda,
  deriveObligationPda,
  derivePlanReserveLedgerPda,
  derivePolicySeriesPda,
  derivePoolClassLedgerPda,
  derivePoolOracleFeeVaultPda,
  derivePoolTreasuryVaultPda,
  deriveProtocolFeeVaultPda,
  deriveReserveDomainPda,
  deriveSeriesReserveLedgerPda,
  isSeedIdSafe,
  normalizeAddress,
  toPublicKey,
  utf8ByteLength,
} from '../src/protocol_seeds.js';
