# SDK quality contract

This SDK is the public integration boundary for Nakama protection programs on
Robinhood Chain. Its primary job is to keep identity, product state, assets,
actions, signatures, and finality explicit; convenience must never turn
placeholder configuration or self-asserted evidence into authority.

## Canonical product surface

- The package root and `/robinhood` expose the same canonical API.
- Robinhood mainnet is chain `4663` / `eip155:4663`; testnet is `46630` /
  `eip155:46630`. There is no implicit chain-1 or legacy-network fallback.
- Every RPC or wallet operation requires an explicit selected network. The SDK
  never silently chooses a production RPC and never switches the user's chain.
- Ethereum-mainnet and Solana APIs remain explicit legacy migration subpaths and
  cannot be re-exported by the root.

## Asset integrity

- Mainnet settlement is Global Dollar (`USDG`) at
  `0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168`, with six decimals.
- Amounts carry chain, CAIP-2, token address, name, symbol, decimals, and integer
  units together. Cross-asset comparisons, lookalike addresses, excess decimal
  precision, negative values, and rounding are rejected.
- Testnet USDG remains unavailable until a canonical address and code proof are
  published; callers cannot override it through an amount constructor.
- Approval builders verify their exact spender, positive bounded amount, and
  disclosure after encoding. The SDK does not expose a generic unlimited-
  approval shortcut.

## Artifact and deployment provenance

- The generated bundle contains exactly 12 named contracts: four global
  registries/factory roles and eight per-program components.
- `scripts/sync-robinhood-artifacts.mjs` imports the byte-identical canonical
  artifact and ABIs, recomputes every raw SHA-256, and generates the TypeScript
  binding. Generated files are never hand-maintained.
- The source artifact SHA-256 and factory-authorized CREATE2 deployment-code
  commitment are declared in `SDK_RUNTIME.json` and verified by
  `npm run runtime:check`.
- Generated artifacts are cloned and recursively frozen behind an internal
  revisioned store, so consumer mutation cannot poison future reads.
- Deployment manifests use a closed schema. An unconfigured manifest contains
  no contract addresses; a deployed one contains every unique role address,
  exact ABI/runtime hash, verification URL, deployment block/transaction,
  source release/commit, canonical asset, audit evidence, and approval evidence.
- Static configuration is not runtime proof. Live verification checks selected
  chain, all 12 code hashes, asset code/metadata, suite graph, program identity,
  and deployment commitment before issuing an internal runtime capability.

## Read and cache semantics

- Product reads are pinned to one block and carry network, CAIP-2, block number,
  block hash, head/safe/finalized markers, observation time, and reconciliation
  state.
- Memberships expose remaining benefit rather than inferring consumption from
  unrelated counters. Obligations distinguish `none`, `approved_unpaid`, and
  `settled`; pause state exposes its review deadline without inventing expiry.
- Indexers are caches. A write requires a fresh direct-chain observation and an
  explicit safe reconciliation result.
- Offline cache entries accept only bounded public-safe values with canonical
  timestamps and can never authorize a write. Private health evidence and PHI
  remain offchain and outside the cache API.

## Action and wallet integrity

- Typed builders encode only protocol-named operations against the verified
  suite and program ID. Returned actions are frozen and capability-marked.
- Caller-built, cloned, JSON-round-tripped, relabeled, expired, wrong-program,
  wrong-runtime, wrong-network, or semantically contradictory actions are
  rejected at simulation/submission boundaries.
- Submission requires a successful exact simulation and performs a fresh exact
  simulation before `eth_sendTransaction`.
- The wallet request is bound to chain, sender, target, selector, calldata,
  native value, intent, expiry, explanation, and expected state changes.
- The SDK never accepts a private key and never performs background signing.

## Decisions and replay safety

- EIP-712 types exactly mirror the protocol `NakamaDecision` schema and include
  an explicit `EIP712Domain` for wallet serialization.
- Domain, types, message, signing payload, and preview are immutable. The domain
  binds name/version, selected Robinhood chain, and deployed DecisionModule.
- Verification binds expected signer, program/module, role/round/action
  semantics, amount, evidence version, nonce, expiry, digest, and replay key.
- EIP-1271 is used only when a public client is provided and code exists at the
  expected reviewer address.
- Replay keys are round-aware and must be reserved atomically by the relayer.

## Smart-account boundary

- Phase-0 policies may simulate only four permissionless maintenance actions:
  membership expiry, no-quorum escalation, information-timeout escalation, and
  unappealed-denial finalization.
- Economic, funding, settlement, membership issuance/recovery, decision, role,
  pause, and other privileged actions are not agent-allowlisted.
- Smart-account submission remains disabled until independent finalized reads
  prove module code, installed policy, limits, revocation, target, selector,
  program, and action constraints. Adapter self-attestation is not proof.

## Receipt and finality semantics

- Receipt states preserve submitted, soft-confirmed, L1-posted, finalized,
  reverted, replaced, timed-out, and reorged outcomes.
- The SDK-sealed wallet result carries action commitment, calldata hash, value,
  chain, sender, target, transaction hash, and intent; a reconstructed object
  cannot enter the economic-finality lane.
- Readers must match exact transaction input/value/from/to/chain and canonical
  receipt ordering.
- One provider can supply a display state but never `economicFinal: true`.
- Economic finality requires two L2 readers and two L1 batch readers whose
  provider IDs, endpoint origins, and operators are independently distinct and
  whose observations agree.

## Virtuals boundary

- The launch-packet helper is offline structural validation. It checks explicit
  Robinhood/USDG identity, named contract evidence, ownership references,
  allocation/fee arithmetic, simulation-hash parity, timestamps, and finalized
  block ordering.
- Supplied booleans, hashes, identities, and block numbers are not independently
  trusted. Passing cannot prove platform approval, legal eligibility, KYC/KYB,
  ownership, deployed code, current fees, simulation truth, or launch finality.
- The SDK contains no Virtuals launch signer or broadcaster. Production tooling
  must resolve current official platform/legal/identity/RPC evidence and use the
  official launch surface.

## Required gates

Before a package handoff or release candidate, run at least:

```bash
npm run sync:robinhood-artifacts:check
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
npm run docs:api:check
npm run docs:check
npm run runtime:check
npm run examples:check
npm run dogfood:consumer
npm run cli:check
npm run templates:check
npm run dx:smoke
npm run security:secrets
npm run security:package
npm run audit:prod
npm run audit:packed-consumer
npm pack --dry-run
```

Passing local gates does not make an unconfigured deployment production-ready
and does not authorize a contract deployment, package publication, token launch,
or public marketing claim.
