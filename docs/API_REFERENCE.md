# API Reference — `@omegax/protocol-sdk`

This page documents the public SDK surface shipped in `0.8.6`.

Use `docs/TOP_APIS.md` first if you are choosing an integration path. Use
`docs/generated/api/README.md` for generated symbol-level markdown.

## Core runtime entrypoints

- `createConnection(...)`
- `getOmegaXNetworkInfo(...)`
- `OMEGAX_NETWORKS`
- `createRpcClient(...)`
- `createSafeProtocolClient(...)`
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
- `preflightClassicTokenAccount(...)`

Typed SDK errors:

Available from the root package and `@omegax/protocol-sdk/errors`.
See `docs/ERROR_CATALOG.md` for likely causes and fixes.

- `OmegaXError`
- `OmegaXConfigError`
- `OmegaXInvalidPublicKeyError`
- `OmegaXProgramMismatchError`
- `OmegaXAccountNotFoundError`
- `OmegaXAccountOwnerMismatchError`
- `OmegaXTokenAccountPreflightError`
- `OmegaXInstructionBuildError`
- `OmegaXTransactionDecodeError`
- `OmegaXRpcError`

Safe-client public types:

- `SafeProtocolClientOptions`
- `SafeProtocolClient`
- `SafeDepositCommitmentTxParams`
- `SafeFundSponsorBudgetTxParams`
- `SafeRecordPremiumPaymentTxParams`
- `SafeDepositIntoCapitalClassTxParams`
- `SafeRequestRedemptionTxParams`
- `SafeProcessRedemptionQueueTxParams`
- `SafeSettleObligationTxParams`
- `SafeRegisterOracleTxParams`
- `SafeAttestClaimCaseTxParams`

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

Product and operator flows should start with `createSafeProtocolClient(...)`.
Raw generated builders are returned by `createProtocolClient(...)`.

Use `createSafeProtocolClient(...)` for product and operator flows. It wraps the
checked convenience builders, pins the canonical program ID by default, and
preflights classic SPL token custody accounts when a `Connection` is available.
The safe layer covers claim and settlement flows plus sponsor funding, premium
payments, LP deposits, redemption requests, redemption queue processing, and
protocol/pool/oracle fee-withdrawal builders.
Safe settlement calls additionally require `recipientOwnerAddress` so the SDK
can preflight the payout token-account owner, not only the vault and mint.
`buildProtocolInstruction(...)`, `buildProtocolTransaction(...)`, and the raw
dynamic builders remain advanced APIs for protocol engineering and tests; they
reject permissive numeric coercion and fixed-array length drift before Borsh
encoding.

### Governance and scoped controls

- `buildInitializeProtocolGovernanceTx(...)`
- `buildRotateProtocolGovernanceAuthorityTx(...)`
- `buildSetProtocolEmergencyPauseTx(...)`
- `buildCreateReserveDomainTx(...)`
- `buildUpdateReserveDomainControlsTx(...)`
- `buildCreateDomainAssetVaultTx(...)`
- `buildConfigureReserveAssetRailTx(...)`
- `buildPublishReserveAssetRailPriceTx(...)`
- `buildInitProtocolFeeVaultTx(...)`
- `buildWithdrawProtocolFeeSolTx(...)`
- `buildWithdrawProtocolFeeSplTx(...)`
- `buildCreateHealthPlanTx(...)`
- `buildUpdateHealthPlanControlsTx(...)`
- `buildCreatePolicySeriesTx(...)`
- `buildInitializeSeriesReserveLedgerTx(...)`
- `buildVersionPolicySeriesTx(...)`
- `buildOpenMemberPositionTx(...)`
- `buildUpdateMemberEligibilityTx(...)`
- `buildAuthorizeClaimRecipientTx(...)`

### Plan-side funding and obligations

- `buildOpenFundingLineTx(...)`
- `buildFundSponsorBudgetTx(...)`
- `buildRecordPremiumPaymentTx(...)`
- `buildCreateCommitmentCampaignTx(...)`
- `buildCreateCommitmentPaymentRailTx(...)`
- `buildDepositCommitmentTx(...)`
- `buildActivateDirectPremiumCommitmentTx(...)`
- `buildActivateTreasuryCreditCommitmentTx(...)`
- `buildActivateWaterfallCommitmentTx(...)`
- `buildRefundCommitmentTx(...)`
- `buildPauseCommitmentCampaignTx(...)`
- `buildCreateObligationTx(...)`
- `buildReserveObligationTx(...)`
- `buildSettleObligationTx(...)`
- `buildReleaseReserveTx(...)`

### Claim-case lifecycle

- `buildOpenClaimCaseTx(...)`
- `buildAttachClaimEvidenceRefTx(...)`
- `buildAdjudicateClaimCaseTx(...)`
- `buildSettleClaimCaseTx(...)`
- `buildAttestClaimCaseTx(...)`

### LP capital and class lifecycle

- `buildCreateLiquidityPoolTx(...)`
- `buildInitPoolTreasuryVaultTx(...)`
- `buildWithdrawPoolTreasurySolTx(...)`
- `buildWithdrawPoolTreasurySplTx(...)`
- `buildCreateCapitalClassTx(...)`
- `buildUpdateCapitalClassControlsTx(...)`
- `buildDepositIntoCapitalClassTx(...)`
- `buildUpdateLpPositionCredentialingTx(...)`
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
- `buildInitPoolOracleFeeVaultTx(...)`
- `buildWithdrawPoolOracleFeeSolTx(...)`
- `buildWithdrawPoolOracleFeeSplTx(...)`
- `buildRegisterOutcomeSchemaTx(...)`
- `buildVerifyOutcomeSchemaTx(...)`
- `buildBackfillSchemaDependencyLedgerTx(...)`
- `buildCloseOutcomeSchemaTx(...)`

Every instruction also exposes a sibling `build...Instruction(...)` helper.

Custody-sensitive builders now mirror the on-chain custody requirements directly. `buildCreateDomainAssetVaultTx(...)` derives the protocol-owned `domain_asset_vault_token` PDA, while sponsor funding, premium payments, obligation settlement, LP capital deposits, and redemption processing require source or recipient token accounts, the canonical vault token account, asset mint, and token program accounts. LP allocation reserve/release/settle/impairment helpers require pool class ledger, allocation position, and allocation ledger scope together rather than accepting partial optional account sets.

## Canonical account readers

Returned by `createProtocolClient(...)`.

- `fetchProtocolGovernance(...)`
- `fetchReserveDomain(...)`
- `fetchDomainAssetVault(...)`
- `fetchDomainAssetLedger(...)`
- `fetchReserveAssetRail(...)`
- `fetchHealthPlan(...)`
- `fetchPlanReserveLedger(...)`
- `fetchPolicySeries(...)`
- `fetchSeriesReserveLedger(...)`
- `fetchMemberPosition(...)`
- `fetchMembershipAnchorSeat(...)`
- `fetchFundingLine(...)`
- `fetchFundingLineLedger(...)`
- `fetchCommitmentCampaign(...)`
- `fetchCommitmentPaymentRail(...)`
- `fetchCommitmentLedger(...)`
- `fetchCommitmentPosition(...)`
- `fetchClaimCase(...)`
- `fetchClaimAttestation(...)`
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
- `deriveReserveAssetRailPda(...)`
- `deriveHealthPlanPda(...)`
- `derivePlanReserveLedgerPda(...)`
- `derivePolicySeriesPda(...)`
- `deriveSeriesReserveLedgerPda(...)`
- `deriveMemberPositionPda(...)`
- `deriveMembershipAnchorSeatPda(...)`
- `deriveFundingLinePda(...)`
- `deriveFundingLineLedgerPda(...)`
- `deriveCommitmentCampaignPda(...)`
- `deriveCommitmentPaymentRailPda(...)`
- `deriveCommitmentLedgerPda(...)`
- `deriveCommitmentPositionPda(...)`
- `deriveClaimCasePda(...)`
- `deriveClaimAttestationPda(...)`
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
- `SEED_RESERVE_ASSET_RAIL`
- `SEED_HEALTH_PLAN`
- `SEED_PLAN_RESERVE_LEDGER`
- `SEED_POLICY_SERIES`
- `SEED_SERIES_RESERVE_LEDGER`
- `SEED_MEMBER_POSITION`
- `SEED_MEMBERSHIP_ANCHOR_SEAT`
- `SEED_FUNDING_LINE`
- `SEED_FUNDING_LINE_LEDGER`
- `SEED_COMMITMENT_CAMPAIGN`
- `SEED_COMMITMENT_PAYMENT_RAIL`
- `SEED_COMMITMENT_LEDGER`
- `SEED_COMMITMENT_POSITION`
- `SEED_CLAIM_CASE`
- `SEED_CLAIM_ATTESTATION`
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
- `COMMITMENT_MODE_DIRECT_PREMIUM`
- `COMMITMENT_MODE_TREASURY_CREDIT`
- `COMMITMENT_MODE_WATERFALL_RESERVE`
- `COMMITMENT_CAMPAIGN_STATUS_DRAFT`
- `COMMITMENT_CAMPAIGN_STATUS_ACTIVE`
- `COMMITMENT_CAMPAIGN_STATUS_PAUSED`
- `COMMITMENT_CAMPAIGN_STATUS_CANCELED`
- `COMMITMENT_CAMPAIGN_STATUS_CLOSED`
- `COMMITMENT_POSITION_PENDING`
- `COMMITMENT_POSITION_DIRECT_PREMIUM_ACTIVATED`
- `COMMITMENT_POSITION_TREASURY_LOCKED`
- `COMMITMENT_POSITION_REFUNDED`
- `COMMITMENT_POSITION_WATERFALL_RESERVE_ACTIVATED`
- `RESERVE_ASSET_ROLE_PRIMARY_STABLE`
- `RESERVE_ASSET_ROLE_SECONDARY_STABLE`
- `RESERVE_ASSET_ROLE_VOLATILE_COLLATERAL`
- `RESERVE_ASSET_ROLE_TREASURY_LAST_RESORT`
- `RESERVE_ORACLE_SOURCE_NONE`
- `RESERVE_ORACLE_SOURCE_CHAINLINK_DATA_STREAM`
- `RESERVE_ORACLE_SOURCE_CHAINLINK_DATA_FEED`
- `RESERVE_ORACLE_SOURCE_GOVERNANCE_ATTESTED`
- `ELIGIBILITY_PENDING`
- `ELIGIBILITY_ELIGIBLE`
- `ELIGIBILITY_PAUSED`
- `ELIGIBILITY_CLOSED`
- `MEMBERSHIP_MODE_OPEN`
- `MEMBERSHIP_MODE_TOKEN_GATE`
- `MEMBERSHIP_MODE_INVITE_ONLY`
- `MEMBERSHIP_GATE_KIND_OPEN`
- `MEMBERSHIP_GATE_KIND_INVITE_ONLY`
- `MEMBERSHIP_GATE_KIND_NFT_ANCHOR`
- `MEMBERSHIP_GATE_KIND_STAKE_ANCHOR`
- `MEMBERSHIP_GATE_KIND_FUNGIBLE_SNAPSHOT`
- `MEMBERSHIP_PROOF_MODE_OPEN`
- `MEMBERSHIP_PROOF_MODE_TOKEN_GATE`
- `MEMBERSHIP_PROOF_MODE_INVITE_PERMIT`
- `CLAIM_INTAKE_OPEN`
- `CLAIM_INTAKE_UNDER_REVIEW`
- `CLAIM_INTAKE_APPROVED`
- `CLAIM_INTAKE_DENIED`
- `CLAIM_INTAKE_SETTLED`
- `CLAIM_INTAKE_CLOSED`
- `CLAIM_ATTESTATION_DECISION_SUPPORT_APPROVE`
- `CLAIM_ATTESTATION_DECISION_SUPPORT_DENY`
- `CLAIM_ATTESTATION_DECISION_REQUEST_REVIEW`
- `CLAIM_ATTESTATION_DECISION_ABSTAIN`
- `POOL_ORACLE_PERMISSION_ATTEST_CLAIM`
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
- `ORACLE_TYPE_LAB`
- `ORACLE_TYPE_HOSPITAL_CLINIC`
- `ORACLE_TYPE_HEALTH_APP`
- `ORACLE_TYPE_WEARABLE_DATA_PROVIDER`
- `ORACLE_TYPE_OTHER`
- `SCHEMA_FAMILY_KERNEL`
- `SCHEMA_FAMILY_CLINICAL`
- `SCHEMA_FAMILY_CLAIMS_CODING`
- `SCHEMA_VISIBILITY_PUBLIC`
- `SCHEMA_VISIBILITY_PRIVATE`
- `SCHEMA_VISIBILITY_RESTRICTED`
- `NATIVE_SOL_MINT`

## Claims helpers

Available from the root package and `@omegax/protocol-sdk/claims`.

- `normalizeClaimSimulationFailure(...)`
- `normalizeClaimRpcFailure(...)`
- `validateSignedClaimTx(...)`

`validateSignedClaimTx(...)` requires a matching unsigned transaction intent and
fails closed when the signed transaction does not match that intent. Claim
intents should include `intentId`, `nonce`, `expiresAtIso`, `requiredSigner`,
and `unsignedTxBase64`; the validator rejects stale intents, wrong nonces, wrong
signers, malformed transactions, and message tampering. Recent-blockhash refresh
is allowed only when every non-blockhash byte still matches, and
`requireExactMessage: true` disables even that for high-risk operator flows.

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
- `attestProtocolOutcome(...)`
- `verifyOracleAttestation(...)`
- `verifyProtocolOracleAttestation(...)`

Use `attestProtocolOutcome(...)` for settlement-grade protocol evidence. Its
context binds the evidence to network, program ID, health plan, funding line,
claim case, optional pool allocation scope, schema key hash, audience, nonce,
issue time, as-of time, and expiry. Generic `attestOutcome(...)` remains
available for telemetry and non-settlement event packaging. Use
`verifyProtocolOracleAttestation(...)` when settlement code needs signature
validity plus trusted expected verifier identity, expected
program/network/account, audience, nonce, and expiry
checks. Optional policy/pool/class/allocation scope is rejected unless it is
explicitly expected or `allowUnexpectedOptionalScope` is set for
telemetry-style wildcard matching.

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

## Transaction helpers

Available from the root package and `@omegax/protocol-sdk/transactions`.

- `decodeSolanaTransaction(...)`
- `serializeSolanaTransaction(...)`
- `serializeSolanaTransactionBase64(...)`
- `solanaTransactionMessageBytes(...)`
- `solanaTransactionIntentMessageBytes(...)`
- `solanaTransactionMessageBase64(...)`
- `solanaTransactionRequiredSigner(...)`
- `solanaTransactionFirstSignature(...)`
- `solanaTransactionSignerSignature(...)`
