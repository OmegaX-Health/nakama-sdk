# API Reference — Robinhood-native surface

The package root and `/robinhood` subpath expose the same canonical API. Legacy
Ethereum-mainnet and Solana APIs require explicit subpaths and never become a
fallback for Robinhood.

## Chain and identity

- `ROBINHOOD_MAINNET_CHAIN_ID`: `4663`
- `ROBINHOOD_TESTNET_CHAIN_ID`: `46630`
- `ROBINHOOD_MAINNET_CAIP2`: `eip155:4663`
- `ROBINHOOD_TESTNET_CAIP2`: `eip155:46630`
- `getRobinhoodChain(...)`, `getRobinhoodChainId(...)`, and
  `getRobinhoodCaip2(...)` require `mainnet` or `testnet`.
- `createRobinhoodPublicClient(...)` requires an explicit network and exactly
  one RPC URL or EIP-1193 provider.
- `toRobinhoodCaip10(...)` and `parseRobinhoodCaip10(...)` bind accounts to the
  selected chain.
- `assertRobinhoodProviderChain(...)` verifies but never switches a wallet.

## USDG

- `ROBINHOOD_USDG_MAINNET_ADDRESS` is the canonical Robinhood mainnet Global
  Dollar address.
- `requireRobinhoodUsdg(...)` rejects unconfigured or mismatched metadata.
- `parseRobinhoodUsdg(...)` converts a decimal string to exact six-decimal base
  units without rounding.
- `createRobinhoodAssetAmount(...)` and `formatRobinhoodAssetAmount(...)` keep
  the token identity attached to the value.
- `verifyRobinhoodUsdg(...)` checks RPC chain ID, runtime code, name, symbol,
  and decimals against live state.

## Artifacts and deployments

- `ROBINHOOD_CONTRACT_IDENTITIES` maps 12 SDK roles to canonical Solidity
  contract names. The public `requestManager` role maps to `ClaimManager`.
- `getGeneratedRobinhoodArtifactBundle(...)` returns imported ABI provenance
  and both network manifests.
- `validateRobinhoodArtifactBundle(...)` and
  `validateRobinhoodDeploymentManifest(...)` enforce exact schemas and hashes.
- `assertRobinhoodDeploymentReady(...)` requires all contracts, verified
  release evidence, asset configuration, and—by default—an audit.
- `verifyRobinhoodDeploymentRuntime(...)` rechecks chain identity and every
  live runtime bytecode hash.
- `getRobinhoodContractArtifact(...)` and
  `getRobinhoodContractDeployment(...)` resolve one typed role.

The aggregate source artifact and standalone ABI files are copied from
`nakama-protocol/shared/robinhood`; `sync:robinhood-artifacts:check` detects any
drift.

## Domain reads

`createRobinhoodReadClient(...)` requires a public client, ready manifest,
artifact bundle, internally verified runtime proof, and bytes32 program ID. It
exposes:

- `readProgram()`
- `readAccounting()`
- `readMembership(...)`
- `readRequest(...)`
- `readObligation(...)`
- `readRole(...)`
- `readPause(...)`

Every `RobinhoodRead<T>` includes a `RobinhoodReadContext` with chain identity,
pinned block, block hash, head/safe/finalized blocks, observation time, and
reconciliation status. Fields that are not available from a direct contract
read remain `null`; the SDK does not invent indexer data.

`reconcileRobinhoodRead(...)` compares an indexed and direct result.
`assertRobinhoodWriteStateSafe(...)` allows only reconciled or direct-chain
state. `createRobinhoodOfflineCacheRecord(...)` and
`readRobinhoodOfflineCache(...)` provide bounded caching for public-safe values.

## Actions

`createRobinhoodActionBuilder(...)` requires a ready audited manifest and a
matching `VerifiedRobinhoodDeploymentRuntime`. It produces versioned
frozen `PreparedRobinhoodAction` capabilities for:

- program review, funding, dual activation/cancellation approvals, activation,
  runoff, close, and pre-promise cancellation;
- exact USDG approval, funding, and matured refunds;
- membership activation, recovery, expiry, and cancellation;
- request opening, evidence updates, decisions, appeals, no-quorum escalation,
  and denial finalization;
- obligation settlement;
- agent grant/revoke/consume flows;
- scoped pause/unpause, dependency warnings, and guardian revocation.

`simulateRobinhoodAction(...)` pins the call and gas estimate to one block and
decodes known protocol reverts. `requestRobinhoodAction(...)` accepts only a
successful simulation of the exact builder-created action, rechecks deployment,
runtime, expiry, calldata disclosure, and provider chain, then independently
simulates again before calling `eth_sendTransaction`. Its sealed result binds
the action commitment, calldata hash, target, sender, value, chain, and intent.

`decodeRobinhoodEvent(...)` and `decodeRobinhoodError(...)` decode across the
role-specific imported ABIs without weakening the role boundary.

## Decision EIP-712

- `createNakamaDecisionTypedData(...)` creates the exact protocol type/domain.
- `createNakamaDecisionSigningPayload(...)` adds CAIP-bound reviewer identity.
- `createNakamaDecisionPreview(...)` derives the user display from that same
  payload.
- `requestNakamaDecisionSignature(...)` calls `eth_signTypedData_v4` after the
  chain check.
- `hashNakamaDecision(...)` and `nakamaDecisionReplayKey(...)` provide digest
  and protocol-scoped replay identity.
- `verifyNakamaDecision(...)` enforces domain, signer, nonce, expiry, EOA/EIP-1271
  signature, and normalized message values.

Protocol ordinals are exported as `NAKAMA_DECISION_REVIEW_ROUND`,
`NAKAMA_DECISION_REVIEWER_ROLE`, and `NAKAMA_DECISION_ACTION`; callers should
never hard-code independent numeric mappings.

## Wallet and smart-account boundaries

`requestRobinhoodAction(...)` is the EIP-1193 write boundary. It does not accept
a key or arbitrary transaction.

`createRobinhoodSmartAccountClient(...)` can perform bounded simulation for the
Phase-0 maintenance allowlist. Smart-account submission always fails closed in
this release because an injected adapter cannot independently prove finalized
module installation, revocation state, runtime code, and calldata enforcement.

## Receipts

- `createRobinhoodSubmittedTransactionFromSubmission(...)` converts only the
  exact sealed EIP-1193 result into an economic-finality record.
- `createRobinhoodSubmittedTransaction(...)` creates an untrusted display-only
  observation; it cannot enter the economic-finality path.
- `assessRobinhoodFinality(...)` is a pure state classifier.
- `readRobinhoodFinality(...)` obtains receipt, head, canonical hash,
  safe/finalized heads, optional L1-posting state, and exact transaction input.
- `waitForRobinhoodFinality(...)` waits for `soft_confirmed`, `l1_posted`, or
  `finalized`, while failing on revert, replacement, timeout, abort, or reorg.

Economic finality requires the sealed submission, two independent L2 readers,
two independent L1 batch readers, exact input/value readback, canonical receipt
agreement, and finalized L1 batch agreement.

## Virtuals packet structure

`validateVirtualsLaunchPacketStructure(...)` is the clearest name for the pure
offline checker. `validateVirtualsLaunchPlan(...)` remains as a compatibility
name; `decodeVirtualsLaunchPlan(...)` parses bigint strings ending in `n` before
calling the same structural validator.

Passing does not establish platform approval, legal eligibility, KYC, contract
authenticity, or onchain finality because every input is caller-supplied. The
checker only rejects structurally unsafe packets: wrong chain, missing canonical
USDG, absent contract roles, zero/duplicate addresses, unresolved owner links,
split allocations to the same recipient, invalid fee/allocation totals, code
hash mismatch, bad ISO timestamps, and inconsistent finalized block ordering.

## Typed errors

All Robinhood errors extend `NakamaRobinhoodError` and preserve a stable `code`,
optional `details`, and optional `cause`. Use the class or code for control flow;
messages are explanatory.

## Explicit legacy subpaths

- `/ethereum`, `/ethereum_contract`, `/ethereum_oracle`
- `/protocol`, `/protocol_models`, `/protocol_seeds`, `/rpc`, `/transactions`
- `/claims`, `/oracle`, `/magicblock`, `/types`, `/utils`, `/errors`

The root exports no chain-1 or Solana API.
