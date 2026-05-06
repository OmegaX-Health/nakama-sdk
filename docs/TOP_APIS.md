# Top APIs - `@omegax/protocol-sdk`

Use this page when you know your builder lane and want the shortest route to the
right SDK surface.

## Health App

Start here for member-facing apps, wallets, and agent surfaces.

- `createConnection(...)`
- `createSafeProtocolClient(...)`
- `deriveReserveDomainPda(...)`
- `deriveHealthPlanPda(...)`
- `deriveMemberPositionPda(...)`
- `deriveClaimCasePda(...)`
- `buildMemberReadModel(...)`
- `validateSignedClaimTx(...)`

First command:

```bash
npx @omegax/protocol-sdk doctor
```

Starter:

```bash
npx @omegax/protocol-sdk scaffold next-route --out omegax-health-route
```

## Hospital / Provider Backend

Start here for backend services that need stable protocol metadata, plan IDs,
claim state, and typed SDK failures.

- `createConnection(...)`
- `createSafeProtocolClient(...)`
- `getOmegaXNetworkInfo(...)`
- `listProtocolInstructionNames(...)`
- `listProtocolAccountNames(...)`
- `buildOpenClaimCaseTx(...)`
- `buildAttestClaimCaseTx(...)`
- `OmegaXError`
- `OmegaXProgramMismatchError`
- `OmegaXAccountNotFoundError`

Starter:

```bash
npx @omegax/protocol-sdk scaffold node-backend --out omegax-provider-backend
```

## Oracle Worker

Start here for services that attest outcomes or claim-case evidence.

- `createOracleSignerFromEnv(...)`
- `createOracleSignerFromKmsAdapter(...)`
- `attestProtocolOutcome(...)`
- `verifyProtocolOracleAttestation(...)`
- `buildRegisterOracleTx(...)`
- `buildClaimOracleTx(...)`
- `buildSetPoolOraclePolicyTx(...)`
- `buildAttestClaimCaseTx(...)`

Starter:

```bash
npx @omegax/protocol-sdk scaffold oracle-worker --out omegax-oracle-worker
```

## Sponsor / Capital Operator

Start here for reserve, sponsor, premium, LP, allocation, and redemption flows.

- `createSafeProtocolClient(...)`
- `deriveDomainAssetVaultPda(...)`
- `deriveDomainAssetVaultTokenAccountPda(...)`
- `deriveReserveAssetRailPda(...)`
- `buildSponsorReadModel(...)`
- `buildCapitalReadModel(...)`
- `buildFundSponsorBudgetTx(...)`
- `buildRecordPremiumPaymentTx(...)`
- `buildDepositIntoCapitalClassTx(...)`
- `buildRequestRedemptionTx(...)`
- `buildProcessRedemptionQueueTx(...)`
- `buildSettleObligationTx(...)`

Use the safe client for these flows. Raw `createProtocolClient(...)`,
`buildProtocolInstruction(...)`, and custom program IDs are advanced
protocol-maintainer surfaces.

## Deep Reference

Generated symbol-level markdown is available at `docs/generated/api/README.md`.
Use it after you know which builder lane you are integrating.
