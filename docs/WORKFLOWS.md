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

Builders:

- `buildInitializeProtocolGovernanceTx(...)`
- `buildSetProtocolEmergencyPauseTx(...)`
- `buildCreateReserveDomainTx(...)`
- `buildUpdateReserveDomainControlsTx(...)`
- `buildCreateDomainAssetVaultTx(...)`
- `buildInitProtocolFeeVaultTx(...)`
- `buildInitPoolTreasuryVaultTx(...)`
- `buildInitPoolOracleFeeVaultTx(...)`

Readers:

- `fetchProtocolGovernance(...)`
- `fetchReserveDomain(...)`
- `fetchDomainAssetVault(...)`
- `fetchDomainAssetLedger(...)`

### Workflow C2: Sponsor-funded health plan

Use this for sponsor budgets, reward programs, or early-stage plans that do not need LP capital.

Sponsor budget and premium builders now move tokens as part of the instruction. Provide the payer source token account, the canonical domain vault token account, the asset mint, and the token program alongside the reserve ledgers. Premium and claim-settlement fee flows also require the matching protocol or oracle fee-vault accounts when fees are configured.

Builders:

- `buildCreateHealthPlanTx(...)`
- `buildUpdateHealthPlanControlsTx(...)`
- `buildCreatePolicySeriesTx(...)`
- `buildVersionPolicySeriesTx(...)`
- `buildOpenMemberPositionTx(...)`
- `buildUpdateMemberEligibilityTx(...)`
- `buildOpenFundingLineTx(...)`
- `buildFundSponsorBudgetTx(...)`
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
- `fetchPlanReserveLedger(...)`
- `fetchSeriesReserveLedger(...)`
- `fetchObligation(...)`

Reserve helpers:

- `recomputeReserveBalanceSheet(...)`
- `buildSponsorReadModel(...)`

### Workflow C3: LP capital, classes, and redemptions

Use this when capital providers enter through canonical liquidity pools and capital classes.

LP deposits now transfer the deposited asset into the configured domain vault before shares are credited. Redemption requests and queue processing pass shares only; the program derives asset payout from class NAV and queued redemption state.

Builders:

- `buildCreateLiquidityPoolTx(...)`
- `buildCreateCapitalClassTx(...)`
- `buildUpdateCapitalClassControlsTx(...)`
- `buildDepositIntoCapitalClassTx(...)`
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
npm run verify:protocol:local
```
