# @omegax/protocol-sdk

Build health apps, oracle services, and outcome-triggered settlement flows on Solana devnet beta with the canonical OmegaX Protocol SDK.

`@omegax/protocol-sdk` gives builders unsigned transaction builders, readers, PDA helpers, reserve-aware read models, and oracle attestation helpers for the current public OmegaX surface.

## What you can build today

- oracle and event-production services that register operators, manage policy, and emit compatible outcome and claim-case attestations
- health apps, wallets, and agents that read member, claim, obligation, and payout state
- sponsor and capital integrations that create plans, funding lines, pools, classes, allocations, and redemptions

## Who should use it

- oracle and event producers
- health / wallet / app builders
- sponsor, treasury, and capital integrators

## Choose your path

### Oracle and event producers

Use the protocol registry builders plus `@omegax/protocol-sdk/oracle` to register oracles, manage pool policy, and package attestations.

Start with:

- `/docs/GETTING_STARTED.md`
- `/docs/WORKFLOWS.md`
- [Oracle Event Production](https://docs.omegax.health/docs/oracle/event-production)

### Health / wallet / app builders

Use reader helpers and member / claim builders to power user-facing views and outcome-driven product flows.

Start with:

- `/docs/GETTING_STARTED.md`
- `/docs/WORKFLOWS.md`
- `/docs/API_REFERENCE.md`

### Sponsor and capital integrators

Use reserve-domain, plan, capital, allocation, and queue builders to launch or manage sponsor and LP lanes on the canonical model.

Start with:

- `/docs/WORKFLOWS.md`
- `/docs/API_REFERENCE.md`
- `/docs/TROUBLESHOOTING.md`

## Install

```bash
npm install @omegax/protocol-sdk
```

## Runtime basics

- Node.js `>=20`
- ESM-only package
- Protocol builders are unsigned
- `programId` must be configured explicitly in runtime integrations
- Public integrations should stay on devnet until OmegaX announces mainnet availability

## Quickstart

Create clients once, then branch into the workflow that matches your product.

```ts
import {
  PROTOCOL_PROGRAM_ID,
  createConnection,
  createProtocolClient,
  createRpcClient,
  getOmegaXNetworkInfo,
  listProtocolInstructionNames,
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
const instructions = listProtocolInstructionNames();
```

From there:

- oracle and event producers usually move into `buildRegisterOracleTx(...)`, `buildClaimOracleTx(...)`, `buildSetPoolOraclePolicyTx(...)`, `buildAttestClaimCaseTx(...)`, and `attestOutcome(...)`
- health and wallet builders usually move into member / claim reads plus `buildOpenMemberPositionTx(...)` and `buildOpenClaimCaseTx(...)`
- sponsor and capital integrators usually move into reserve-domain, plan, pool, class, allocation, and redemption builders from `/docs/WORKFLOWS.md`

## Public surface coverage

This package exposes the live canonical object model:

- protocol governance and scoped controls
- reserve domains and domain asset vaults
- health plans and policy series
- member positions
- funding lines, obligations, and claim cases
- liquidity pools, capital classes, LP positions, and allocation positions
- oracle profiles, pool oracle approvals, oracle policies, and permission sets
- outcome schemas and schema dependency ledgers
- reserve-aware read models for sponsors, members, and capital providers
- RPC helpers for unsigned transaction submission flows

## Release status

- SDK release target: `0.8.4`
- Protocol surface target: `omegax-protocol` commit `f343039`
- Current public network target: Solana devnet beta
- Public docs: [docs.omegax.health](https://docs.omegax.health)

## Release notes

- `0.8.4` refreshes generated bindings for the post-fee-vault hardening surface, derives protocol-owned domain vault token accounts, adds fee-vault PDA helpers, binds client builders and optional account placeholders to the configured program id, fixes membership-anchor PDA derivation, and hardens signed simulation fallback behavior.
- `0.8.3` refreshes generated bindings for `omegax-protocol v0.3.1`, requires concrete domain vault token accounts, and reflects custody-aware inflows plus NAV-derived redemptions.
- `0.8.2` keeps invite-only member enrollment builders aligned with the protocol account metas by preserving the optional invite-authority signer.
- `0.8.1` refreshes generated bindings and protocol parity for the latest linked-claim and obligation-settlement hardening on the public `v0.3.0` surface.
- `0.8.0` adds full parity for the current oracle and schema registry surface, plus a first-class oracle attestation helper module for service-side signing flows.
- The package now exports `@omegax/protocol-sdk/oracle` alongside the root exports so oracle workers can use a narrower import surface when they only need attestation helpers.
- Canonical protocol builders, readers, seeds, generated bindings, and local surface verification are aligned to the current `omegax-protocol` `main` surface.

## Documentation map

- `/docs/INDEX.md` for the maintainer and builder reading order
- `/docs/GETTING_STARTED.md` for installation, client setup, and choosing the right builder path
- `/docs/WORKFLOWS.md` for oracle, app, sponsor, and capital flows on the canonical surface
- `/docs/API_REFERENCE.md` for the exported package surface
- `/docs/TROUBLESHOOTING.md` for common failure modes and remediation
- `/docs/RELEASE_NOTES.md` for versioned SDK release notes
- `/docs/RELEASE.md` for the release checklist
- `/docs/DOCS_SYNC_WORKFLOW.md` for SDK to portal sync rules
- `/docs/CROSS_REPO_RELEASE_ORDER.md` for the coordinated protocol + docs + SDK publish order

## Canonical module map

- Root package: connection helpers, RPC helpers, protocol builders, PDA helpers, reserve-model helpers, shared types
- `@omegax/protocol-sdk/protocol`: IDL-backed builder and reader helpers such as `createProtocolClient(...)`, `listProtocolInstructionNames(...)`, `decodeProtocolAccount(...)`, and `compileTransactionToV0(...)`
- `@omegax/protocol-sdk/protocol_seeds`: deterministic PDA helpers such as `deriveReserveDomainPda(...)`, `deriveHealthPlanPda(...)`, `deriveFundingLinePda(...)`, and `deriveCapitalClassPda(...)`
- `@omegax/protocol-sdk/protocol_models`: constants and read-model helpers such as `recomputeReserveBalanceSheet(...)`, `buildSponsorReadModel(...)`, `buildCapitalReadModel(...)`, and `buildMemberReadModel(...)`
- `@omegax/protocol-sdk/claims`: claim and obligation failure normalization helpers such as `normalizeClaimSimulationFailure(...)`
- `@omegax/protocol-sdk/oracle`: oracle attestation helpers such as `createOracleSignerFromEnv(...)`, `createOracleSignerFromKmsAdapter(...)`, and `attestOutcome(...)`, alongside the root-level `buildAttestClaimCaseTx(...)` helper for on-chain claim-case attestations
- `@omegax/protocol-sdk/rpc`: `createConnection(...)`, `createRpcClient(...)`, and network metadata helpers
- `@omegax/protocol-sdk/utils`: hashing, binary encoding, and misc utilities
- `@omegax/protocol-sdk/types`: generated protocol contract types plus SDK RPC and failure types

## What the SDK is for

- Sponsors and operators can build reserve-domain, health-plan, policy-series, funding-line, obligation, and claim-case transactions directly.
- Capital providers can derive capital-class and allocation addresses, inspect ledgers, and build deposit and redemption flows against canonical pool and class objects.
- Wallet apps and members can inspect plan participation, obligations, claim state, and payout history with the read-model helpers.
- Oracle operators can register profiles, configure pool policy, and use a narrower attestation helper surface for outcome packaging.
- External integrators can enumerate the live instruction and account surface with `listProtocolInstructionNames(...)` and `listProtocolAccountNames(...)`.

## What the SDK does not do

- It does not keep pool-first compatibility aliases.
- It does not hide settlement-critical accounting in offchain helpers.
- It does not invent a second protocol surface for wrappers or regulated participation.
- It does not sign transactions on your behalf.

## Local verification

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

To refresh checked-in protocol artifacts from a sibling `omegax-protocol` workspace:

```bash
npm run generate:protocol-bindings
```

## Release coordination

This package is released only when all three surfaces agree:

1. `omegax-protocol`
2. `omegax-docs`
3. `omegax-sdk`

Use `/docs/CROSS_REPO_RELEASE_ORDER.md` and `/docs/OMEGAX_DOCS_SYNC.json` to keep that publish train honest.
