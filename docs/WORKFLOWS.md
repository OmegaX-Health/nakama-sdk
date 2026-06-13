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

Use this path when your service needs to sign OmegaX-compatible outcome events and feed settlement-grade evidence into the claim lifecycle.

### Workflow A1: Oracle attestation services

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
network/program/account IDs, audience, and nonce together. Generic
`attestOutcome(...)` and `verifyOracleAttestation(...)` remain available for
non-settlement telemetry.

Off-chain attestations bind to a claim case by hash; the on-chain decision is
recorded by the plan's claims operator through `buildAdjudicateClaimCaseTx(...)`,
which carries the evidence and decision-support hashes into protocol state.

See `examples/oracle-attestation.ts` for an offline KMS-adapter example that
does not require secrets or a funded signer.

## Path B: Health / wallet / app builders

Use this path when your app needs member, claim, obligation, and payout state without owning the entire sponsor or capital stack.

### Workflow B1: Protection claims and premium flows

Use this when a policy series needs explicit premium intake, claim review, and settlement consequences.

Builders:

- `buildRecordPremiumPaymentTx(...)`
- `buildOpenClaimCaseTx(...)`
- `buildAuthorizeClaimRecipientTx(...)`
- `buildAdjudicateClaimCaseTx(...)`
- `buildSettleClaimCaseTx(...)`
- `buildCreateObligationTx(...)`
- `buildReserveObligationTx(...)`
- `buildReleaseReserveTx(...)`
- `buildSettleObligationTx(...)`

Readers:

- `fetchClaimCase(...)`
- `fetchObligation(...)`
- `fetchFundingLineLedger(...)`
- `fetchPlanReserveLedger(...)`

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

## Path C: Sponsor and reserve integrators

Use this path when you need to create the settlement boundary, launch sponsor programs, and fund plan reserves.

### Workflow C1: Reserve-domain and asset-vault bootstrap

Use this when preparing the settlement boundary for a new domain and asset.

`buildCreateDomainAssetVaultTx(...)` derives the protocol-owned SPL vault token account at the canonical `domain_asset_vault_token` PDA. Do not create or pass an admin-owned token account; the protocol initializes the PDA-owned account inline.

Builders:

- `buildCreateReserveDomainTx(...)`
- `buildUpdateReserveDomainControlsTx(...)`
- `buildCreateDomainAssetVaultTx(...)`

Readers:

- `fetchReserveDomain(...)`
- `fetchDomainAssetVault(...)`
- `fetchDomainAssetLedger(...)`

PDA helpers:

- `deriveReserveDomainPda(...)`
- `deriveDomainAssetVaultPda(...)`
- `deriveDomainAssetVaultTokenAccountPda(...)`
- `deriveDomainAssetLedgerPda(...)`

### Workflow C2: Sponsor-funded health plan

Use this for sponsor budgets, reward programs, and plans funded from sponsor budgets, premium income, and reserve capital contributions.

Sponsor budget, premium, reserve-capital, and settlement builders move tokens as
part of the instruction. Provide the payer source or payout recipient token
account, the canonical domain vault token account, the asset mint, and the token
program alongside the reserve ledgers.

Product integrations should prefer `createSafeProtocolClient(...)` for sponsor
funding, premium payment, and settlement flows. The safe layer derives
PDA-owned vaults, enforces classic SPL Token accounts, and preflights
token-account mint/owner where a `Connection` is available. Safe settlement
additionally requires `recipientOwnerAddress` so the payout token account owner
is checked before signing.

`buildOpenClaimCaseTx(...)` requires an explicit `claimantAddress` or
`memberWalletAddress`; operator-submitted claims never default the claimant to
the operator authority.

Builders:

- `buildCreateHealthPlanTx(...)`
- `buildUpdateHealthPlanControlsTx(...)`
- `buildCreatePolicySeriesTx(...)`
- `buildVersionPolicySeriesTx(...)`
- `buildOpenFundingLineTx(...)`
- `buildFundSponsorBudgetTx(...)`
- `buildRecordPremiumPaymentTx(...)`
- `buildDepositReserveCapitalTx(...)`
- `buildRecordReserveEarningsTx(...)`
- `buildReturnReserveCapitalTx(...)`
- `buildOpenClaimCaseTx(...)`
- `buildAuthorizeClaimRecipientTx(...)`
- `buildAdjudicateClaimCaseTx(...)`
- `buildSettleClaimCaseTx(...)`
- `buildCreateObligationTx(...)`
- `buildReserveObligationTx(...)`
- `buildReleaseReserveTx(...)`
- `buildSettleObligationTx(...)`

Readers:

- `fetchHealthPlan(...)`
- `fetchPolicySeries(...)`
- `fetchFundingLine(...)`
- `fetchFundingLineLedger(...)`
- `fetchCapitalContribution(...)`
- `fetchClaimCase(...)`
- `fetchPlanReserveLedger(...)`
- `fetchObligation(...)`

Reserve helpers:

- `recomputeReserveBalanceSheet(...)`
- `buildSponsorReadModel(...)`
- `buildCapitalReadModel(...)`

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
