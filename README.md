# `@nakama-health/protocol-sdk`

The canonical TypeScript SDK for Nakama protection programs on Robinhood Chain.
It binds product reads and actions to explicit chain identity, the protocol's
generated ABIs, verified deployment/runtime evidence, exact USDG amounts,
simulation, self-custodial wallets, and reorg-aware finality.

The SDK is implementation-ready but not deployment-ready. All 12 protocol ABIs
are synchronized from `nakama-protocol`; both checked-in deployment manifests
remain `unconfigured`, so contract reads and writes fail closed until reviewed
addresses, runtime hashes, audit evidence, and release approval are published.

## Install

```bash
npm install @nakama-health/protocol-sdk
```

Node.js `>=20` is required. The package is ESM-first and uses
[viem](https://viem.sh) for EVM encoding and clients.

## Network and settlement identity

The root export and `@nakama-health/protocol-sdk/robinhood` are the same
Robinhood-native surface:

| Network           | Chain ID | CAIP-2         | Status                                  |
| ----------------- | -------: | -------------- | --------------------------------------- |
| Robinhood mainnet |   `4663` | `eip155:4663`  | Explicitly supported                    |
| Robinhood testnet |  `46630` | `eip155:46630` | Explicitly supported; USDG unconfigured |

There is no chain-1 default. Client construction requires both a network and a
caller-selected RPC URL or EIP-1193 provider:

```ts
import { createRobinhoodPublicClient } from '@nakama-health/protocol-sdk';

const client = createRobinhoodPublicClient({
  network: 'mainnet',
  rpcUrl: process.env.ROBINHOOD_MAINNET_RPC_URL!,
});
```

The SDK knows Robinhood's public endpoints for display and setup, but it never
silently selects one for production calls.

Mainnet settlement is Global Dollar (`USDG`) at
`0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168`, with six decimals. The asset API
binds amount, chain, token address, symbol, and decimals together:

```ts
import { parseRobinhoodUsdg } from '@nakama-health/protocol-sdk';

const amount = parseRobinhoodUsdg('125.50', 'mainnet');
console.log(amount.units); // 125500000n
```

Testnet USDG has no canonical address in this release. Parsing or preparing a
testnet USDG action fails until a verified asset configuration is supplied.

## Generated protocol seam

The 12 ABIs are copied byte-for-byte from the canonical protocol artifact and
their SHA-256 values are checked during generation:

```text
../nakama-protocol/shared/robinhood/protocol_contract.json
../nakama-protocol/shared/robinhood/<ContractName>.abi.json
                         │
                         ▼
scripts/sync-robinhood-artifacts.mjs
                         │
           ┌─────────────┴──────────────────┐
           ▼                                ▼
contracts/robinhood/*            src/generated/robinhood_protocol.ts
```

```bash
npm run import:robinhood-contract
npm run sync:robinhood-artifacts:check
```

The bundle currently contains `AssetRegistry`, `TemplateRegistry`,
`PoolRegistry`, `NakamaFactory`, `ProtectionProgram`, `PoolVault`,
`MembershipRegistry`, `DecisionModule`, `ClaimManager`, `SettlementModule`,
`AgentAuthorizationRegistry`, and `SafetyGuardian`.

## Deployment gate

Use the checked-in manifests for inspection, then require a deployed manifest
before constructing product clients:

```ts
import {
  assertRobinhoodDeploymentReady,
  getGeneratedRobinhoodArtifactBundle,
} from '@nakama-health/protocol-sdk';

const bundle = getGeneratedRobinhoodArtifactBundle();
const manifest = bundle.deployments.mainnet;

assertRobinhoodDeploymentReady(manifest, bundle); // throws today by design
```

A writable release must name every contract address, ABI checksum, runtime
bytecode hash, verification URL, deployment transaction/block, protocol commit,
audit report, and release approval. `verifyRobinhoodDeploymentRuntime(...)`
then checks the selected RPC's chain ID and live bytecode hashes. A manifest
alone is never accepted as runtime proof.

## Typed product reads

`createRobinhoodReadClient(...)` provides program, accounting, membership,
request, obligation, role, and pause reads at pinned block numbers. Each result
contains its network, CAIP-2 identity, block hash, head/safe/finalized markers,
and reconciliation state.

Indexer output is treated as a cache. `reconcileRobinhoodRead(...)` compares it
with a direct-chain read, and `assertRobinhoodWriteStateSafe(...)` blocks a
follow-up write when the indexer is stale or divergent. Public-safe reads can
be stored with the bounded offline cache helpers; private health evidence must
remain offchain.

`collectRobinhoodIndexerPages(...)` isolates a provider-specific public indexer
behind a bounded adapter. It validates chain, block hash, safe/finalized heads,
reconciliation status, page size, retry count, cursor progress, and one stable
snapshot across every page. `invalidateRobinhoodOfflineCacheAfterReorg(...)`
conservatively drops cached descendants after a detected reorg. Neither helper
can make indexed or offline state safe for writes.

## Typed actions, simulation, and wallets

`createRobinhoodActionBuilder(...)` covers the program lifecycle, exact USDG
approval/funding, memberships, exact-digest eligibility revocation,
requests/evidence, initial and appeal decisions, settlement, agent
authorizations, and guardian controls. Canonical eligibility/revocation EIP-712
helpers bind the chain and MembershipRegistry while allowing any wallet to relay
the attestor's signature without receiving attestor authority. Construction
requires an audited deployment plus live runtime verification, so placeholder
addresses cannot produce a transaction.

Every prepared action carries an intent ID, CAIP-10 account, target, selector,
calldata, expiry, human explanation, and expected state change. It is frozen and
internally capability-marked; reconstructed, cloned, relabeled, or caller-built
objects cannot cross the submission boundary. The safe order is fixed:

1. Reconcile the relevant read state.
2. Build one typed action from a verified deployment/runtime.
3. Simulate that exact action with `simulateRobinhoodAction(...)`.
4. Show the explanation and state changes to the user.
5. Submit the successful simulation through `requestRobinhoodAction(...)`.
6. Track canonical finality with `waitForRobinhoodFinality(...)`.

The SDK never accepts a private key and never switches the wallet's network.
`requestRobinhoodAction(...)` only calls `eth_sendTransaction` for the already
simulated action.

Phase-0 smart-account submission is intentionally disabled. The policy API can
simulate only a narrow allowlist of permissionless maintenance calls, but
`submit(...)` fails until the SDK has an independent finalized onchain verifier
for module code, installed policy, revocation state, and calldata constraints.
An adapter's self-attestation is never treated as proof.

`createRobinhoodPaymasterClient(...)` is also quote-only. Its provider-neutral
policy and returned quote must bind sponsor, account, program, action
commitment, policy commitment, target, selector, native value, gas, rate window,
and expiry. It does not submit a user operation or turn provider-supplied
payloads into trusted onchain proof. Account creation/recovery, passkey UX,
signer changes, compatible wallet fallback, provider selection, and
independently verified submission are external Phase-0 gates.

For sponsor onboarding, `createRobinhoodSponsorFundingBatch(...)` can produce a
non-submitting exact approval-plus-funding plan. It rejects mismatched accounts,
programs, timing, vaults, amounts, and infinite approval; a provider still needs
separate review before it may encode or execute that plan.

## Decision signatures

The decision helpers exactly mirror the protocol's EIP-712 type:

```ts
import {
  NAKAMA_DECISION_ACTION,
  NAKAMA_DECISION_REVIEWER_ROLE,
  NAKAMA_DECISION_REVIEW_ROUND,
  createNakamaDecisionSigningPayload,
} from '@nakama-health/protocol-sdk';

const payload = createNakamaDecisionSigningPayload({
  network: 'mainnet',
  reviewer,
  decisionModule,
  message: {
    programId,
    requestId,
    termsCommitment,
    evidenceManifestCommitment,
    evidenceVersion: 1,
    reviewRound: NAKAMA_DECISION_REVIEW_ROUND.initial,
    reviewerRole: NAKAMA_DECISION_REVIEWER_ROLE.initialReviewer,
    action: NAKAMA_DECISION_ACTION.approve,
    approvedAmount: 2_500_000n,
    recipientCommitment,
    publicReasonCode,
    nonce,
    validUntil,
  },
});
```

The domain is `Nakama Protection Decision`, version `1`, with the selected
Robinhood chain ID and the deployed `DecisionModule`. Verification binds the
signer, module, nonce, expiry, digest, and replay key, with EIP-1271 support when
a public client is supplied.

## Receipt and finality model

Robinhood Chain is an L2, so a mined receipt is useful UI feedback rather than
the final settlement state. The receipt API distinguishes `submitted`,
`soft_confirmed`, `l1_posted`, `finalized`, `reverted`, `replaced`, `timed_out`,
and `reorged`; it checks the canonical block hash instead of relying on a
confirmation count alone.

Economic-finality tracking begins with the exact sealed wallet submission. It
binds the action commitment, calldata hash, native value, chain, sender, and
target; each L2 reader must read back and match the transaction input. Economic
finality additionally requires independent provider/operator identities for two
L2 readers and two L1 batch-evidence readers. Single-provider `finalized` is a
display state and never sets `economicFinal`.

## Offline Virtuals launch packet

`validateVirtualsLaunchPacketStructure(...)` checks a caller-supplied launch
packet for explicit Robinhood mainnet identity, canonical USDG, the five named
Virtuals contract roles, nonzero and unique addresses, runtime hash parity,
beneficial-owner references, transparent allocation concentration, fee-share
arithmetic, simulation metadata, and finalized block ordering.

It is intentionally offline and non-authoritative. Self-supplied gate booleans,
identity flags, hashes, and block numbers do not prove Virtuals acceptance,
legal eligibility, ownership, or onchain state. Production launch tooling must
obtain platform/legal/identity approvals independently, read verified contract
configuration from Robinhood RPC, simulate the exact packet, and then use the
official Virtuals launch surface. This SDK never signs or broadcasts a Virtuals
launch.

See [the Robinhood and Virtuals guide](docs/ROBINHOOD_VIRTUALS.md) for the full
boundary and launch checklist.

## Legacy network surfaces

Earlier Ethereum-mainnet and Solana integrations remain available only through
explicit subpaths. They are absent from the root export and are not a fallback:

- `@nakama-health/protocol-sdk/ethereum`
- `@nakama-health/protocol-sdk/ethereum_contract`
- `@nakama-health/protocol-sdk/ethereum_oracle`
- `@nakama-health/protocol-sdk/protocol` and the other legacy Solana subpaths

Legacy Solana write builders remain disabled. Applications migrating old
Ethereum code must retain explicit imports; new integrations should import the
package root or `/robinhood`.

## Verification

```bash
npm run sync:robinhood-artifacts:check
npm run typecheck
npm run lint
npm test
npm run build
npm run examples:check
npm run security:package
```

No contract deployment, token launch, package publication, or production write
is performed by these commands.
