# Integration Workflows — `@omegax/protocol-sdk`

These workflows map the canonical OmegaX economic model to the actual SDK builders and readers.

Use them by builder lane rather than reading the entire catalog in protocol-object order.

## Shared integration pattern

1. Create `connection`, `protocol`, and `rpc` clients.
2. Derive canonical addresses with PDA helpers.
3. Build unsigned transactions with `build...Tx(...)`.
4. Sign with your wallet or signer stack.
5. Broadcast with `broadcastSignedTx(...)`.
6. Verify state with `fetch...(...)` readers and reserve-model helpers.

Use `createSafeProtocolClient(...)` for product and operator flows. Raw
`createProtocolClient(...)` builders are useful for protocol engineering and
tests, but production flows should stay on the safe layer unless an explicit
unsafe custom-program override is part of a devnet or localnet workflow.

Runnable starting points:

- `npm run example:smoke` for a no-signature safe-client import and PDA smoke.
- `npm run example:app` for member, claim, and obligation read-model shaping.
- `npm run example:oracle` for protocol-bound oracle attestation signing and verification.

## Path A: Oracle and event producers

Use this path when your service needs to normalize private inputs into OmegaX-compatible outcome events and policy-bound oracle actions.

### Workflow A1: Oracle and schema registry operations

Use this when an operator needs to register oracle metadata, configure pool oracle controls, or manage the schema registry through the canonical protocol surface.

Builders:

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

Readers:

- `fetchOracleProfile(...)`
- `fetchPoolOracleApproval(...)`
- `fetchPoolOraclePolicy(...)`
- `fetchPoolOraclePermissionSet(...)`
- `fetchOutcomeSchema(...)`
- `fetchSchemaDependencyLedger(...)`

### Workflow A2: Oracle attestation services

Use this when an external oracle worker or service needs a stable signing surface for outcome attestations before it forwards them into downstream transport or settlement systems.

Helpers:

- `createOracleSignerFromEnv(...)`
- `createOracleSignerFromKmsAdapter(...)`
- `attestOutcome(...)`
- `attestProtocolOutcome(...)`
- `verifyOracleAttestation(...)`
- `verifyProtocolOracleAttestation(...)`

Use `attestProtocolOutcome(...)` for settlement-grade claim evidence. It binds
the signed payload to network, program ID, health plan, funding line, claim
case, schema key hash, audience, nonce, issue time, as-of time, and expiry.
Use `verifyProtocolOracleAttestation(...)` before settlement intake so the SDK
checks signature, trusted expected verifier identity, expiry, expected
network/program/account IDs, audience, nonce, and optional
pool/class/allocation scope together. Generic
`attestOutcome(...)` and `verifyOracleAttestation(...)` remain available for
non-settlement telemetry.
Verifier calls reject unexpected optional policy/pool/class/allocation scope by
default; pass the expected scope fields for settlement, or set
`allowUnexpectedOptionalScope` only for non-settlement wildcard consumers.

See `examples/oracle-attestation.ts` for an offline KMS-adapter example that
does not require secrets or a funded signer.

On-chain claim-case attestations use `buildAttestClaimCaseTx(...)`. The helper now mirrors the expanded protocol account list: pass the oracle signer, `healthPlanAddress`, writable `claimCaseAddress`, `fundingLineAddress`, and schema hashes. When the claim is scoped to pool capital, also pass the liquidity pool and capital class so the SDK can derive the allocation and pool-oracle scope accounts together; partial pool scope is rejected.

Useful constants:

- `CLAIM_ATTESTATION_DECISION_SUPPORT_APPROVE`
- `CLAIM_ATTESTATION_DECISION_SUPPORT_DENY`
- `CLAIM_ATTESTATION_DECISION_REQUEST_REVIEW`
- `CLAIM_ATTESTATION_DECISION_ABSTAIN`
- `POOL_ORACLE_PERMISSION_ATTEST_CLAIM`

## Path B: Health / wallet / app builders

Use this path when your app needs member, claim, obligation, and payout state without owning the entire sponsor or capital stack.

### Workflow B1: Protection claims and premium flows

Use this when a policy series needs explicit premium intake, claim review, and settlement consequences.

Builders:

- `buildRecordPremiumPaymentTx(...)`
- `buildOpenClaimCaseTx(...)`
- `buildAttachClaimEvidenceRefTx(...)`
- `buildAdjudicateClaimCaseTx(...)`
- `buildSettleClaimCaseTx(...)`
- `buildSettleClaimCaseSelectedAssetTx(...)`
- `buildCreateObligationTx(...)`
- `buildReserveObligationTx(...)`
- `buildSettleObligationTx(...)`

Readers:

- `fetchClaimCase(...)`
- `fetchObligation(...)`
- `fetchFundingLineLedger(...)`
- `fetchPlanReserveLedger(...)`
- `fetchSeriesReserveLedger(...)`

Failure helpers:

- `normalizeClaimSimulationFailure(...)`
- `normalizeClaimRpcFailure(...)`
- `validateSignedClaimTx(...)` for checking the submitted signed transaction
  against a server-stored unsigned transaction plus a nonce-bearing, expiring
  `ClaimIntent` before trusting claim intake.

See `examples/app-builder-read.ts` for deterministic app-facing read-model
shaping from member, claim, and obligation snapshots.

### Workflow B2: Member read models

Use this when you want wallet-facing or app-facing views rather than raw account objects.

Helpers:

- `buildMemberReadModel(...)`
- `describeEligibilityStatus(...)`
- `describeClaimStatus(...)`
- `describeObligationStatus(...)`
- `shortenAddress(...)`

Note:

- `buildOpenMemberPositionTx(...)` lives in the sponsor-funded plan workflow below because the same canonical builder can be used by app-facing products or sponsor-controlled products depending on plan configuration.

## Path C: Sponsor and capital integrators

Use this path when you need to create the settlement boundary, launch sponsor programs, or connect LP capital to those lanes.

### Workflow C1: Governance and reserve-domain bootstrap

Use this when preparing the settlement boundary for a new domain and asset.

`buildCreateDomainAssetVaultTx(...)` derives the protocol-owned SPL vault token account at the canonical `domain_asset_vault_token` PDA. Do not create or pass an admin-owned token account; the protocol initializes the PDA-owned account inline.

Reserve asset rails are first-class protocol objects. Use `buildConfigureReserveAssetRailTx(...)` to set the role, oracle source, decimals, and bounds for an asset, then `buildPublishReserveAssetRailPriceTx(...)` when a governance or oracle source publishes the current reserve price. `deriveReserveAssetRailPda(...)` gives clients the canonical rail address for reads and instruction accounts.

Builders:

- `buildInitializeProtocolGovernanceTx(...)`
- `buildRotateProtocolGovernanceAuthorityTx(...)`
- `buildAcceptProtocolGovernanceAuthorityTx(...)`
- `buildCancelProtocolGovernanceAuthorityTransferTx(...)`
- `buildSetProtocolEmergencyPauseTx(...)`
- `buildCreateReserveDomainTx(...)`
- `buildUpdateReserveDomainControlsTx(...)`
- `buildCreateDomainAssetVaultTx(...)`
- `buildConfigureReserveAssetRailTx(...)`
- `buildPublishReserveAssetRailPriceTx(...)`
- `buildInitProtocolFeeVaultTx(...)`
- `buildWithdrawProtocolFeeSolTx(...)`
- `buildWithdrawProtocolFeeSplTx(...)`
- `buildInitPoolTreasuryVaultTx(...)`
- `buildInitPoolOracleFeeVaultTx(...)`

Readers:

- `fetchProtocolGovernance(...)`
- `fetchReserveDomain(...)`
- `fetchDomainAssetVault(...)`
- `fetchDomainAssetLedger(...)`
- `fetchReserveAssetRail(...)`

PDA helpers:

- `deriveReserveAssetRailPda(...)`
- `deriveProtocolFeeVaultPda(...)`
- `derivePoolTreasuryVaultPda(...)`
- `derivePoolOracleFeeVaultPda(...)`

### Workflow C2: Sponsor-funded health plan

Use this for sponsor budgets, reward programs, or early-stage plans that do not need LP capital.

Sponsor budget, premium, and obligation-settlement builders now move tokens as
part of the instruction. Provide the payer source or payout recipient token
account, the canonical domain vault token account, the asset mint, and the token
program alongside the reserve ledgers. Premium and claim-settlement fee flows
also require the matching protocol or oracle fee-vault accounts when fees are
configured.

Product integrations should prefer `createSafeProtocolClient(...)` for sponsor
funding, premium payment, settlement, fee withdrawal, and treasury withdrawal
flows. The safe layer derives PDA-owned vaults, enforces classic SPL Token
accounts, and preflights token-account mint/owner where a `Connection` is
available. Safe settlement additionally requires `recipientOwnerAddress` so the
payout token account owner is checked before signing.

`buildOpenClaimCaseTx(...)` requires an explicit `claimantAddress` or
`memberWalletAddress`; operator-submitted claims never default the claimant to
the operator authority.

Builders:

- `buildCreateHealthPlanTx(...)`
- `buildUpdateHealthPlanControlsTx(...)`
- `buildCreatePolicySeriesTx(...)`
- `buildInitializeSeriesReserveLedgerTx(...)`
- `buildVersionPolicySeriesTx(...)`
- `buildOpenMemberPositionTx(...)`
- `buildUpdateMemberEligibilityTx(...)`
- `buildOpenFundingLineTx(...)`
- `buildFundSponsorBudgetTx(...)`
- `buildRecordPremiumPaymentTx(...)`
- `buildOpenClaimCaseTx(...)`
- `buildAdjudicateClaimCaseTx(...)`
- `buildSettleClaimCaseTx(...)`
- `buildSettleClaimCaseSelectedAssetTx(...)`
- `buildCreateObligationTx(...)`
- `buildReserveObligationTx(...)`
- `buildSettleObligationTx(...)`
- `buildReleaseReserveTx(...)`

Readers:

- `fetchHealthPlan(...)`
- `fetchPolicySeries(...)`
- `fetchMemberPosition(...)`
- `fetchFundingLine(...)`
- `fetchFundingLineLedger(...)`
- `fetchClaimCase(...)`
- `fetchPlanReserveLedger(...)`
- `fetchSeriesReserveLedger(...)`
- `fetchObligation(...)`

Reserve helpers:

- `recomputeReserveBalanceSheet(...)`
- `buildSponsorReadModel(...)`

### Workflow C3: LP capital, classes, and redemptions

Use this when capital providers enter through canonical liquidity pools and capital classes.

LP deposits now transfer the deposited asset into the configured domain vault before shares are credited. Redemption requests and queue processing pass shares only; the program derives asset payout from class NAV and queued redemption state.

Product integrations should use `createSafeProtocolClient(...)` for LP deposits,
redemption requests, and redemption queue processing so pool class ledger, LP
position, vault, and treasury accounts are derived consistently instead of being
supplied piecemeal.

Builders:

- `buildCreateLiquidityPoolTx(...)`
- `buildCreateCapitalClassTx(...)`
- `buildUpdateCapitalClassControlsTx(...)`
- `buildDepositIntoCapitalClassTx(...)`
- `buildUpdateLpPositionCredentialingTx(...)`
- `buildRequestRedemptionTx(...)`
- `buildProcessRedemptionQueueTx(...)`

Readers:

- `fetchLiquidityPool(...)`
- `fetchCapitalClass(...)`
- `fetchPoolClassLedger(...)`
- `fetchLPPosition(...)`
- `fetchDomainAssetLedger(...)`

Reserve helpers:

- `recomputeReserveBalanceSheet(...)`
- `buildCapitalReadModel(...)`

### Workflow C4: Allocation and impairment

Use this when LP capital is bridged into plan-side funding lines.

Reserve, release, settlement, and impairment builders reject partial LP
allocation scope. Provide capital class, allocation position, and pool asset
mint together so the SDK can include the matching `PoolClassLedger`,
`AllocationPosition`, and `AllocationLedger` accounts together.

Builders:

- `buildCreateAllocationPositionTx(...)`
- `buildUpdateAllocationCapsTx(...)`
- `buildAllocateCapitalTx(...)`
- `buildDeallocateCapitalTx(...)`
- `buildMarkImpairmentTx(...)`

Readers:

- `fetchAllocationPosition(...)`
- `fetchAllocationLedger(...)`
- `fetchCapitalClass(...)`
- `fetchFundingLine(...)`
- `fetchObligation(...)`

## Local release preflight

```bash
npm ci
npm run typecheck
npm run lint
npm run format:check
npm run build
npm test
npm run docs:check
npm run docs:api:check
npm run docs:sync:check:strict
npm run runtime:check
npm run examples:check
npm run dogfood:consumer
npm run cli:check
npm run templates:check
npm run dx:smoke
npm run security:secrets
npm run security:install-scripts
npm run security:package
npm run audit:prod
npm pack --dry-run
npm run verify:protocol:local
```
