# Robinhood troubleshooting

Start by preserving the fail-closed behavior. Both checked-in deployment
manifests are unconfigured, so a runtime-dependent example failing with a
deployment/artifact error is the correct result until an audited 12-contract
deployment is published.

## Fast local diagnosis

```bash
npm run sync:robinhood-artifacts:check
npm run runtime:check
npm run typecheck
npm test
npm run build
npm run examples:check
```

If the package itself is installed elsewhere, run the read-only doctor with a
caller-owned RPC:

```bash
nakama-sdk doctor --network mainnet --rpc-url "$ROBINHOOD_MAINNET_RPC_URL" --json
```

The doctor checks chain identity and reports artifact/deployment readiness; it
does not deploy, switch a wallet, sign, or submit.

## Artifact parity fails

Run `npm run sync:robinhood-artifacts:check` first. A difference means the exact
sibling source artifact, one of its 12 standalone ABIs, the checked-in import,
or generated TypeScript no longer agrees by bytes/hash/content.

Only after the protocol change has been reviewed should a maintainer run:

```bash
npm run import:robinhood-contract
```

Inspect the source artifact SHA-256, every ABI SHA-256, compiler settings,
component code hashes, and deployment-code commitment. Never hand-edit a JSON
ABI or generated TypeScript to make the check pass.

## Deployment readiness fails

An `unconfigured` manifest must contain no contract addresses and cannot create
a read client or action builder. A deployed manifest needs all 12 unique,
nonzero role addresses plus exact ABI/runtime hashes, verification URLs,
deployment transaction/block identity, protocol release/commit, canonical USDG,
audit evidence, and release approval.

Do not copy addresses from a chat, explorer search, marketing page, or another
chain. Populate the manifest from reviewed deployment output, validate it, then
run `verifyRobinhoodDeploymentRuntime(...)` against a caller-selected archival
RPC before treating it as usable.

## Wrong-chain failures

Robinhood mainnet is chain `4663` (`0x1237`) and testnet is `46630` (`0xb626`).
The SDK has no chain-1 fallback. Confirm both the configured network and the RPC
or wallet's `eth_chainId`; ask the user to reconnect if needed, because SDK code
must not switch their network.

## USDG failures

Mainnet Global Dollar is exactly
`0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168` with symbol `USDG` and six decimals.
A lookalike address, `USDC` label, wrong decimals, cross-chain amount, negative
value, or extra precision is rejected. Testnet USDG intentionally fails until a
canonical address and verified code are published.

## A prepared action cannot be submitted

Check the boundary in order:

1. The action must come from `createRobinhoodActionBuilder(...)`, not a cast,
   clone, JSON round-trip, or reconstructed object.
2. It must be bound to the same verified manifest, runtime capability, program
   ID, sender, chain, target, selector, calldata, value, intent, and expiry.
3. `simulateRobinhoodAction(...)` must succeed on the selected chain.
4. `requestRobinhoodAction(...)` must be called before the maximum simulation
   age and will rerun the exact simulation.
5. The EIP-1193 wallet must already be on the correct network and approve the
   exact transaction.

If any material state changed, rebuild from a fresh direct read. Do not mutate
the explanation or action to bypass a failure.

## Smart-account submission fails

This is expected in Phase 0. The client validates and simulates a narrow set of
permissionless maintenance actions, but `submit(...)` is disabled until the SDK
can independently verify finalized module code, installed policy, revocation,
and calldata constraints. Use the interactive user-authorized wallet path for
allowed actions; do not replace proof with adapter claims.

## Finality appears stuck or disagrees

Keep the most conservative explicit state. One provider is enough for display
progress but never economic finality. The independent lane requires the sealed
wallet submission, exact transaction input/value/from/to/chain readback, two L2
readers, and two L1 batch readers with distinct provider IDs, endpoint origins,
and operators.

Provider conflict, receipt change, canonical-block mismatch, transaction
replacement, revert, timeout, and reorg each have different remediation. Capture
the observations and investigate rather than increasing confirmation depth until
one answer wins.

## Decision verification fails

Rebuild the immutable `NakamaDecision` typed data from trusted current state.
Confirm chain, DecisionModule, program/request IDs, terms/evidence commitments,
evidence version, initial/appeal round, reviewer role, action/amount, recipient,
reason, nonce, and expiry. Then verify the expected signer and atomically reserve
the replay key before relay. Contract wallets also require a public client for
EIP-1271.

## An offline/indexer result cannot authorize a write

This is intentional. Offline cache records are public-safe UX aids, and indexer
records are secondary observations. Refresh a direct-chain pinned read, verify
its context, reconcile the indexer result, and call
`assertRobinhoodWriteStateSafe(...)` before preparing a new action. Never cache
private health evidence in these helpers.

## A Virtuals packet passes but is not launchable

Structural validation only proves that supplied fields agree with each other.
It cannot verify current Virtuals contracts/fees, platform acceptance, legal
eligibility, beneficial ownership, KYC/KYB, Robinhood code, simulation truth, or
finalized configuration. Resolve each gate from current independent sources and
use the official Virtuals launch surface; this package intentionally has no
launch signer or broadcaster.

## Legacy import issues

Old Ethereum and Solana modules require their explicit package subpaths and,
for Solana, optional peer dependencies. New code should import the root or
`@nakama-health/protocol-sdk/robinhood`. Do not add legacy modules back to the
root to resolve an import error.
