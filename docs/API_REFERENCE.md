# API Reference — `@omegax/protocol-sdk`

This page documents the public SDK surface shipped in `0.8.4`.

## Core runtime entrypoints

- `createConnection(...)`
- `getOmegaXNetworkInfo(...)`
- `OMEGAX_NETWORKS`
- `createRpcClient(...)`
- `createProtocolClient(...)`
- `getProtocolIdl()`
- `listProtocolInstructionNames()`
- `listProtocolInstructionAccounts(...)`
- `listProtocolAccountNames()`
- `accountExists(...)`
- `decodeProtocolAccount(...)`
- `buildProtocolInstruction(...)`
- `buildProtocolTransaction(...)`
- `compileTransactionToV0(...)`

## RPC client

Returned by `createRpcClient(...)`.

- `getRecentBlockhash()`
- `broadcastSignedTx(...)`
- `simulateSignedTx(...)`
- `getSignatureStatus(...)`

`simulateSignedTx(...)` verifies signatures by default. If an RPC rejects the
signature-verifying simulation argument combination, the SDK fails closed unless
the caller explicitly passes `allowSigVerifyFallback: true`. Results include
`sigVerifyRequested`, `sigVerifyUsed`, `signatureVerified`, and
`verificationDowngraded` so intake services can reject unverified preflight
results.

## Canonical instruction builders

Returned by `createProtocolClient(...)`.

### Governance and scoped controls

- `buildInitializeProtocolGovernanceTx(...)`
- `buildSetProtocolEmergencyPauseTx(...)`
- `buildCreateReserveDomainTx(...)`
- `buildUpdateReserveDomainControlsTx(...)`
- `buildCreateDomainAssetVaultTx(...)`
- `buildCreateHealthPlanTx(...)`
- `buildUpdateHealthPlanControlsTx(...)`
- `buildCreatePolicySeriesTx(...)`
- `buildVersionPolicySeriesTx(...)`
- `buildOpenMemberPositionTx(...)`
- `buildUpdateMemberEligibilityTx(...)`

### Plan-side funding and obligations

- `buildOpenFundingLineTx(...)`
- `buildFundSponsorBudgetTx(...)`
- `buildRecordPremiumPaymentTx(...)`
- `buildCreateObligationTx(...)`
- `buildReserveObligationTx(...)`
- `buildSettleObligationTx(...)`
- `buildReleaseReserveTx(...)`

### Claim-case lifecycle

- `buildOpenClaimCaseTx(...)`
- `buildAttachClaimEvidenceRefTx(...)`
- `buildAdjudicateClaimCaseTx(...)`
- `buildSettleClaimCaseTx(...)`

### LP capital and class lifecycle

- `buildCreateLiquidityPoolTx(...)`
- `buildCreateCapitalClassTx(...)`
- `buildUpdateCapitalClassControlsTx(...)`
- `buildDepositIntoCapitalClassTx(...)`
- `buildRequestRedemptionTx(...)`
- `buildProcessRedemptionQueueTx(...)`

### Allocation and impairment

- `buildCreateAllocationPositionTx(...)`
- `buildUpdateAllocationCapsTx(...)`
- `buildAllocateCapitalTx(...)`
- `buildDeallocateCapitalTx(...)`
- `buildMarkImpairmentTx(...)`

### Oracle and schema registry

- `buildRegisterOracleTx(...)`
- `buildClaimOracleTx(...)`
- `buildUpdateOracleProfileTx(...)`
- `buildSetPoolOracleTx(...)`
- `buildSetPoolOraclePermissionsTx(...)`
- `buildSetPoolOraclePolicyTx(...)`
- `buildRegisterOutcomeSchemaTx(...)`
- `buildVerifyOutcomeSchemaTx(...)`
- `buildBackfillSchemaDependencyLedgerTx(...)`
- `buildCloseOutcomeSchemaTx(...)`

Every instruction also exposes a sibling `build...Instruction(...)` helper.

Custody-sensitive builders now mirror the on-chain custody requirements directly. `buildCreateDomainAssetVaultTx(...)` derives the protocol-owned `domain_asset_vault_token` PDA, while sponsor funding, premium payments, LP capital deposits, and redemption processing require source or recipient token accounts, the canonical vault token account, asset mint, and token program accounts.

## Canonical account readers

Returned by `createProtocolClient(...)`.

- `fetchProtocolGovernance(...)`
- `fetchReserveDomain(...)`
- `fetchDomainAssetVault(...)`
- `fetchDomainAssetLedger(...)`
- `fetchHealthPlan(...)`
- `fetchPlanReserveLedger(...)`
- `fetchPolicySeries(...)`
- `fetchSeriesReserveLedger(...)`
- `fetchMemberPosition(...)`
- `fetchFundingLine(...)`
- `fetchFundingLineLedger(...)`
- `fetchClaimCase(...)`
- `fetchObligation(...)`
- `fetchLiquidityPool(...)`
- `fetchCapitalClass(...)`
- `fetchPoolClassLedger(...)`
- `fetchLPPosition(...)`
- `fetchAllocationPosition(...)`
- `fetchAllocationLedger(...)`
- `fetchOracleProfile(...)`
- `fetchPoolOracleApproval(...)`
- `fetchPoolOracleFeeVault(...)`
- `fetchPoolOraclePolicy(...)`
- `fetchPoolOraclePermissionSet(...)`
- `fetchPoolTreasuryVault(...)`
- `fetchProtocolFeeVault(...)`
- `fetchOutcomeSchema(...)`
- `fetchSchemaDependencyLedger(...)`

## PDA helpers

Available from the root package and `@omegax/protocol-sdk/protocol_seeds`.

- `getProgramId()`
- `toPublicKey(...)`
- `normalizeAddress(...)`
- `utf8ByteLength(...)`
- `isSeedIdSafe(...)`
- `assertSeedId(...)`
- `deriveProtocolGovernancePda(...)`
- `deriveReserveDomainPda(...)`
- `deriveDomainAssetVaultPda(...)`
- `deriveDomainAssetVaultTokenAccountPda(...)`
- `deriveDomainAssetLedgerPda(...)`
- `deriveHealthPlanPda(...)`
- `derivePlanReserveLedgerPda(...)`
- `derivePolicySeriesPda(...)`
- `deriveSeriesReserveLedgerPda(...)`
- `deriveMemberPositionPda(...)`
- `deriveFundingLinePda(...)`
- `deriveFundingLineLedgerPda(...)`
- `deriveClaimCasePda(...)`
- `deriveObligationPda(...)`
- `deriveLiquidityPoolPda(...)`
- `deriveCapitalClassPda(...)`
- `derivePoolClassLedgerPda(...)`
- `deriveLpPositionPda(...)`
- `deriveAllocationPositionPda(...)`
- `deriveAllocationLedgerPda(...)`
- `deriveOracleProfilePda(...)`
- `derivePoolOracleApprovalPda(...)`
- `derivePoolOracleFeeVaultPda(...)`
- `derivePoolOraclePolicyPda(...)`
- `derivePoolOraclePermissionSetPda(...)`
- `derivePoolTreasuryVaultPda(...)`
- `deriveProtocolFeeVaultPda(...)`
- `deriveOutcomeSchemaPda(...)`
- `deriveSchemaDependencyLedgerPda(...)`

Seed constants:

- `SEED_PROTOCOL_GOVERNANCE`
- `SEED_RESERVE_DOMAIN`
- `SEED_DOMAIN_ASSET_VAULT`
- `SEED_DOMAIN_ASSET_VAULT_TOKEN`
- `SEED_DOMAIN_ASSET_LEDGER`
- `SEED_HEALTH_PLAN`
- `SEED_PLAN_RESERVE_LEDGER`
- `SEED_POLICY_SERIES`
- `SEED_SERIES_RESERVE_LEDGER`
- `SEED_MEMBER_POSITION`
- `SEED_FUNDING_LINE`
- `SEED_FUNDING_LINE_LEDGER`
- `SEED_CLAIM_CASE`
- `SEED_OBLIGATION`
- `SEED_LIQUIDITY_POOL`
- `SEED_CAPITAL_CLASS`
- `SEED_POOL_CLASS_LEDGER`
- `SEED_LP_POSITION`
- `SEED_ALLOCATION_POSITION`
- `SEED_ALLOCATION_LEDGER`
- `SEED_ORACLE_PROFILE`
- `SEED_POOL_ORACLE_APPROVAL`
- `SEED_POOL_ORACLE_FEE_VAULT`
- `SEED_POOL_ORACLE_POLICY`
- `SEED_POOL_ORACLE_PERMISSION_SET`
- `SEED_POOL_TREASURY_VAULT`
- `SEED_PROTOCOL_FEE_VAULT`
- `SEED_OUTCOME_SCHEMA`
- `SEED_SCHEMA_DEPENDENCY_LEDGER`
- `ZERO_PUBKEY`
- `ZERO_PUBKEY_KEY`
- `MAX_ID_SEED_BYTES`

## Reserve-model helpers

Available from the root package and `@omegax/protocol-sdk/protocol_models`.

- `toBigIntAmount(...)`
- `recomputeReserveBalanceSheet(...)`
- `sumReserveBalanceSheets(...)`
- `buildSponsorReadModel(...)`
- `buildCapitalReadModel(...)`
- `buildMemberReadModel(...)`
- `bpsRatio(...)`
- `shortenAddress(...)`

Status and labeling helpers:

- `describeSeriesMode(...)`
- `describeSeriesStatus(...)`
- `describeFundingLineType(...)`
- `describeEligibilityStatus(...)`
- `describeClaimStatus(...)`
- `describeObligationStatus(...)`
- `describeCapitalRestriction(...)`

Constants:

- `SERIES_MODE_REWARD`
- `SERIES_MODE_PROTECTION`
- `SERIES_MODE_REIMBURSEMENT`
- `SERIES_MODE_PARAMETRIC`
- `SERIES_MODE_OTHER`
- `SERIES_STATUS_DRAFT`
- `SERIES_STATUS_ACTIVE`
- `SERIES_STATUS_PAUSED`
- `SERIES_STATUS_CLOSED`
- `FUNDING_LINE_TYPE_SPONSOR_BUDGET`
- `FUNDING_LINE_TYPE_PREMIUM_INCOME`
- `FUNDING_LINE_TYPE_LIQUIDITY_POOL_ALLOCATION`
- `FUNDING_LINE_TYPE_BACKSTOP`
- `FUNDING_LINE_TYPE_SUBSIDY`
- `FUNDING_LINE_STATUS_OPEN`
- `FUNDING_LINE_STATUS_PAUSED`
- `FUNDING_LINE_STATUS_CLOSED`
- `ELIGIBILITY_PENDING`
- `ELIGIBILITY_ELIGIBLE`
- `ELIGIBILITY_PAUSED`
- `ELIGIBILITY_CLOSED`
- `CLAIM_INTAKE_OPEN`
- `CLAIM_INTAKE_UNDER_REVIEW`
- `CLAIM_INTAKE_APPROVED`
- `CLAIM_INTAKE_DENIED`
- `CLAIM_INTAKE_SETTLED`
- `CLAIM_INTAKE_CLOSED`
- `OBLIGATION_STATUS_PROPOSED`
- `OBLIGATION_STATUS_RESERVED`
- `OBLIGATION_STATUS_CLAIMABLE_PAYABLE`
- `OBLIGATION_STATUS_SETTLED`
- `OBLIGATION_STATUS_CANCELED`
- `OBLIGATION_STATUS_IMPAIRED`
- `OBLIGATION_STATUS_RECOVERED`
- `OBLIGATION_DELIVERY_MODE_CLAIMABLE`
- `OBLIGATION_DELIVERY_MODE_PAYABLE`
- `REDEMPTION_POLICY_OPEN`
- `REDEMPTION_POLICY_QUEUE_ONLY`
- `REDEMPTION_POLICY_PAUSED`
- `CAPITAL_CLASS_RESTRICTION_OPEN`
- `CAPITAL_CLASS_RESTRICTION_RESTRICTED`
- `CAPITAL_CLASS_RESTRICTION_WRAPPER_ONLY`
- `LP_QUEUE_STATUS_NONE`
- `LP_QUEUE_STATUS_PENDING`
- `LP_QUEUE_STATUS_PROCESSED`
- `PAUSE_FLAG_PROTOCOL_EMERGENCY`
- `PAUSE_FLAG_DOMAIN_RAILS`
- `PAUSE_FLAG_PLAN_OPERATIONS`
- `PAUSE_FLAG_CLAIM_INTAKE`
- `PAUSE_FLAG_CAPITAL_SUBSCRIPTIONS`
- `PAUSE_FLAG_REDEMPTION_QUEUE_ONLY`
- `PAUSE_FLAG_ORACLE_FINALITY_HOLD`
- `PAUSE_FLAG_ALLOCATION_FREEZE`

## Claims helpers

Available from the root package and `@omegax/protocol-sdk/claims`.

- `normalizeClaimSimulationFailure(...)`
- `normalizeClaimRpcFailure(...)`

The claims module also re-exports:

- `describeClaimStatus(...)`
- `describeObligationStatus(...)`
- claim intake status constants
- obligation status constants

## Oracle helpers

Available from the root package and `@omegax/protocol-sdk/oracle`.

- `createOracleSignerFromEnv(...)`
- `createOracleSignerFromKmsAdapter(...)`
- `attestOutcome(...)`

## Shared utilities

Available from the root package and `@omegax/protocol-sdk/utils`.

- `stableStringify(...)`
- `sha256Hex(...)`
- `sha256Bytes(...)`
- `toIsoString(...)`
- `nowIso()`
- `newId(...)`
- `anchorDiscriminator(...)`
- `encodeU64Le(...)`
- `encodeI64Le(...)`
- `encodeU32Le(...)`
- `encodeU16Le(...)`
- `encodeString(...)`
- `readU32Le(...)`
- `readU16Le(...)`
- `readU64Le(...)`
- `readI64Le(...)`
- `readString(...)`
- `toHex(...)`
- `fromHex(...)`
- `hashStringTo32(...)`
