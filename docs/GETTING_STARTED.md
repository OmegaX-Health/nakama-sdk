# Getting Started — `@omegax/protocol-sdk`

This guide gets you from install to a usable OmegaX client on Solana devnet beta, then points you into the right builder path.

## Prerequisites

- Node.js `>=20`
- ESM runtime
- A Solana RPC endpoint
- The deployed OmegaX `programId` for your target cluster

Public integrations should target devnet beta until OmegaX announces public mainnet availability.

## Install

```bash
npm install @omegax/protocol-sdk
```

## Choose your builder path

- Oracle and event producers: register oracle operators, configure pool policy, and package compatible outcome attestations.
- Health / wallet / app builders: read member, claim, and payout state, then build user-facing enrollment or claim flows.
- Sponsor and capital integrators: launch reserve domains, plans, funding lines, pools, classes, and allocation flows on the canonical surface.

## Create clients

```ts
import {
  PROTOCOL_PROGRAM_ID,
  createConnection,
  createProtocolClient,
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

const programId = process.env.OMEGAX_PROGRAM_ID ?? PROTOCOL_PROGRAM_ID;
const protocol = createProtocolClient(connection, programId);
const rpc = createRpcClient(connection);
```

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
before trusting the signer or intent.

## Path A: Oracle and event producers

Start here when your service needs to turn private or messy inputs into OmegaX-compatible outcome events.

Relevant builders and helpers:

- `buildRegisterOracleTx(...)`
- `buildClaimOracleTx(...)`
- `buildUpdateOracleProfileTx(...)`
- `buildSetPoolOracleTx(...)`
- `buildSetPoolOraclePermissionsTx(...)`
- `buildSetPoolOraclePolicyTx(...)`
- `createOracleSignerFromEnv(...)`
- `createOracleSignerFromKmsAdapter(...)`
- `attestOutcome(...)`

Then continue with:

- `WORKFLOWS.md`
- `API_REFERENCE.md`
- `https://docs.omegax.health/docs/oracle/event-production`

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

- `WORKFLOWS.md`
- `API_REFERENCE.md`
- `TROUBLESHOOTING.md`

## Path C: Sponsor and capital integrators

Start here when you need to create settlement boundaries, plan lanes, or LP capital flows on the canonical model.

Reserve-moving builders require real token rails. Create the domain vault through the protocol so it initializes the canonical SPL vault token account, provide source and vault token accounts for funding or deposits, and let redemption payout amounts be derived by the protocol instead of supplying asset amounts from the client.

Example: derive canonical addresses for a sponsor-side deployment:

```ts
import {
  deriveProtocolGovernancePda,
  deriveReserveDomainPda,
  deriveDomainAssetVaultTokenAccountPda,
  deriveHealthPlanPda,
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
```

Relevant builders and helpers:

- `buildInitializeProtocolGovernanceTx(...)`
- `buildCreateReserveDomainTx(...)`
- `buildCreateDomainAssetVaultTx(...)`
- `buildCreateHealthPlanTx(...)`
- `buildCreatePolicySeriesTx(...)`
- `buildOpenFundingLineTx(...)`
- `buildCreateLiquidityPoolTx(...)`
- `buildCreateCapitalClassTx(...)`
- `buildCreateAllocationPositionTx(...)`
- `recomputeReserveBalanceSheet(...)`

Then continue with:

- `WORKFLOWS.md`
- `API_REFERENCE.md`
- `RELEASE_NOTES.md`

## Next steps

1. Use `WORKFLOWS.md` to map your builder path to the right canonical builders and readers.
2. Use `API_REFERENCE.md` to inspect the exported reader, helper, and builder surface in detail.
3. Use `RELEASE_NOTES.md` to confirm the current SDK version and newly added modules.
4. Run `npm run generate:protocol-bindings` whenever the sibling protocol repo changes.
5. Run `npm run verify:protocol:local` before shipping SDK changes that affect runtime parity.
