# Getting Started — `@omegax/protocol-sdk`

This guide gets you from install to a usable OmegaX client on Solana devnet beta, then points you into the right builder path.

## Prerequisites

- Node.js `>=20`
- ESM runtime
- A Solana RPC endpoint
- The canonical deployed OmegaX `programId` for your target cluster

Public integrations should target devnet beta until OmegaX announces public mainnet availability.

## Install

```bash
npm install @omegax/protocol-sdk
npm install --save-dev tsx
```

## Check Your Environment

```bash
npx @omegax/protocol-sdk doctor
```

`doctor` checks Node, ESM, package imports, network metadata, the canonical
program ID, typed errors, and protocol instruction/account listings. Add
`--rpc-url <url>` when you want it to check RPC connectivity too.

## First success smoke

Run this before choosing a deeper workflow. It verifies package imports, network
metadata, safe client creation, deterministic PDA derivation, and the public
instruction/account surface without funded signers or a live transaction.

```bash
npm run example:smoke
```

In a separate integration project, copy `examples/devnet-smoke.ts` and run:

```bash
npx tsx devnet-smoke.ts
```

## Choose your builder path

- Oracle and event producers: register oracle operators, configure pool policy, and package compatible outcome attestations.
- Health / wallet / app builders: read member, claim, and payout state, then build user-facing enrollment or claim flows.
- Sponsor and capital integrators: launch reserve domains, reserve asset rails, plans, funding lines, pools, classes, allocation flows, and reserve-backed settlement on the canonical surface.

## Create clients

```ts
import {
  PROTOCOL_PROGRAM_ID,
  createConnection,
  createSafeProtocolClient,
  createRpcClient,
  getOmegaXNetworkInfo,
} from '@omegax/protocol-sdk';

const network =
  (process.env.OMEGAX_NETWORK as 'devnet' | 'mainnet' | undefined) ?? 'devnet';
const networkInfo = getOmegaXNetworkInfo(network);

const connection = createConnection({
  network,
  rpcUrl: process.env.SOLANA_RPC_URL ?? networkInfo.defaultRpcUrl,
  commitment: 'confirmed',
});

const protocol = createSafeProtocolClient(connection, {
  programId: PROTOCOL_PROGRAM_ID,
});
const rpc = createRpcClient(connection);
```

Production clients default to the canonical OmegaX program. Custom program IDs
are rejected unless `unsafeAllowCustomProgramId: true` or
`OMEGAX_SDK_UNSAFE_ALLOW_CUSTOM_PROGRAM_ID=1` is used for devnet, localnet, or
tests.

Use `createProtocolClient(...)` only for protocol engineering, generated-surface
tests, or advanced flows that need raw IDL-backed builders.

For framework-specific snippets, see `docs/RECIPES.md`.

## Inspect the current public surface

Use the SDK to inspect the live contract shape before choosing builders.

```ts
import { listProtocolInstructionNames } from '@omegax/protocol-sdk';

const instructions = listProtocolInstructionNames();
```

## Build, sign, and broadcast

Every canonical instruction follows the same pattern:

- choose the workflow-specific `build...Tx(...)`
- pass the required `args`
- pass the runtime `accounts`
- attach a fresh `recentBlockhash`

When you have a transaction:

```ts
const signedTx = await wallet.signTransaction(tx);
const signedTxBase64 = Buffer.from(signedTx.serialize()).toString('base64');
const result = await rpc.broadcastSignedTx({
  signedTxBase64,
  commitment: 'confirmed',
});
```

Simulate before sending when you want preflight detail:

```ts
const signedTx = await wallet.signTransaction(tx);
const signedTxBase64 = Buffer.from(signedTx.serialize()).toString('base64');
const simulation = await rpc.simulateSignedTx({
  signedTxBase64,
  sigVerify: true,
});
if (!simulation.signatureVerified) {
  throw new Error('Transaction signature was not verified during simulation.');
}
```

Simulation is preflight feedback, not authentication. Claim and intake services
that accept user-submitted transactions should call `validateSignedClaimTx(...)`
with the server-stored `expectedUnsignedTxBase64` plus a `ClaimIntent`
containing `intentId`, `nonce`, `expiresAtIso`, `requiredSigner`, and
`unsignedTxBase64`. Treat the submitted intent as metadata to check against
server state, not as the source of truth for the transaction bytes. Operator
flows can set `requireExactMessage: true`; wallet flows may allow blockhash-only
refresh when every non-blockhash byte still matches.

## Path A: Oracle and event producers

Start here when your service needs to turn private or messy inputs into OmegaX-compatible outcome events.

Relevant builders and helpers:

- `buildRegisterOracleTx(...)`
- `buildClaimOracleTx(...)`
- `buildUpdateOracleProfileTx(...)`
- `buildSetPoolOracleTx(...)`
- `buildSetPoolOraclePermissionsTx(...)`
- `buildSetPoolOraclePolicyTx(...)`
- `buildAttestClaimCaseTx(...)`
- `createOracleSignerFromEnv(...)`
- `createOracleSignerFromKmsAdapter(...)`
- `attestOutcome(...)`
- `attestProtocolOutcome(...)`
- `verifyProtocolOracleAttestation(...)`

Then continue with:

- [SDK Workflows](WORKFLOWS.md)
- [API Reference](API_REFERENCE.md)
- [Oracle Event Production](https://docs.omegax.health/docs/oracle/event-production)

## Path B: Health / wallet / app builders

Start here when your product needs to show users what they hold, what happened, and what can be paid.

Relevant builders and helpers:

- `buildOpenMemberPositionTx(...)`
- `buildOpenClaimCaseTx(...)`
- `buildAttachClaimEvidenceRefTx(...)`
- `buildMemberReadModel(...)`
- `describeEligibilityStatus(...)`
- `describeClaimStatus(...)`
- `describeObligationStatus(...)`

Then continue with:

- [SDK Workflows](WORKFLOWS.md)
- [API Reference](API_REFERENCE.md)
- [Troubleshooting](TROUBLESHOOTING.md)

## Path C: Sponsor and capital integrators

Start here when you need to create settlement boundaries, plan lanes, or LP capital flows on the canonical model.

Reserve-moving builders require real token rails. Create the domain vault through the protocol so it initializes the canonical SPL vault token account, provide source and vault token accounts for funding or deposits, and let redemption payout amounts be derived by the protocol instead of supplying asset amounts from the client. Use the safe client for sponsor funding, premium payments, settlement, LP deposits, redemption requests, queue processing, and fee/treasury withdrawals so PDA derivation, classic SPL token guards, and token-account preflights stay in one place. Safe settlement calls also require `recipientOwnerAddress` to preflight payout token-account ownership before signing.

Example: derive canonical addresses for a sponsor-side deployment:

```ts
import {
  deriveProtocolGovernancePda,
  deriveReserveDomainPda,
  deriveReserveAssetRailPda,
  deriveDomainAssetVaultTokenAccountPda,
  deriveHealthPlanPda,
  derivePolicySeriesPda,
  deriveFundingLinePda,
} from '@omegax/protocol-sdk';

const protocolGovernance = deriveProtocolGovernancePda(programId).toBase58();
const reserveDomain = deriveReserveDomainPda({
  domainId: 'open-usdc-domain',
  programId,
}).toBase58();
const healthPlan = deriveHealthPlanPda({
  reserveDomain,
  planId: 'builder-demo-plan',
  programId,
}).toBase58();
const vaultTokenAccount = deriveDomainAssetVaultTokenAccountPda({
  reserveDomain,
  assetMint: process.env.ASSET_MINT!,
  programId,
}).toBase58();
const reserveAssetRail = deriveReserveAssetRailPda({
  reserveDomain,
  assetMint: process.env.ASSET_MINT!,
  programId,
}).toBase58();
const policySeries = derivePolicySeriesPda({
  healthPlan,
  seriesId: 'builder-demo-protection',
  programId,
}).toBase58();
const fundingLine = deriveFundingLinePda({
  healthPlan,
  lineId: 'builder-demo-premium',
  programId,
}).toBase58();
```

Relevant builders and helpers:

- `buildInitializeProtocolGovernanceTx(...)`
- `buildAcceptProtocolGovernanceAuthorityTx(...)`
- `buildCancelProtocolGovernanceAuthorityTransferTx(...)`
- `buildCreateReserveDomainTx(...)`
- `buildCreateDomainAssetVaultTx(...)`
- `buildConfigureReserveAssetRailTx(...)`
- `buildCreateHealthPlanTx(...)`
- `buildCreatePolicySeriesTx(...)`
- `buildInitializeSeriesReserveLedgerTx(...)`
- `buildOpenFundingLineTx(...)`
- `buildSettleClaimCaseTx(...)`
- `buildSettleClaimCaseSelectedAssetTx(...)`
- `buildCreateLiquidityPoolTx(...)`
- `buildCreateCapitalClassTx(...)`
- `buildCreateAllocationPositionTx(...)`
- `recomputeReserveBalanceSheet(...)`

Then continue with:

- [SDK Workflows](WORKFLOWS.md)
- [API Reference](API_REFERENCE.md)
- [Release Notes](RELEASE_NOTES.md)

## Next steps

1. Use [SDK Workflows](WORKFLOWS.md) to map your builder path to the right canonical builders and readers.
2. Use [API Reference](API_REFERENCE.md) to inspect the exported reader, helper, and builder surface in detail.
3. Use [Release Notes](RELEASE_NOTES.md) to confirm the current SDK version and newly added modules.
4. Run `npm run generate:protocol-bindings` whenever the sibling protocol repo changes.
5. Run `npm run verify:protocol:local` before shipping SDK changes that affect runtime parity.
