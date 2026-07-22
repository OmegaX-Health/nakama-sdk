# Canonical Robinhood workflows

Every production workflow begins with an explicit Robinhood network and a
caller-selected RPC. A static manifest is only configuration; live runtime proof
must come from `verifyRobinhoodDeploymentRuntime(...)`, and both checked-in
manifests intentionally fail that prerequisite today.

## Read a protection program

1. Create the public client for chain `4663` or `46630`.
2. Load the generated bundle and selected deployment manifest.
3. Assert the deployment is complete, audited, approved, and verified.
4. Verify all 12 live runtimes and suite relationships through the same client.
5. Construct `createRobinhoodReadClient(...)` with the manifest, immutable
   bundle, SDK-issued runtime proof, and exact program ID.
6. Read at a pinned block. Preserve the returned block hash, safe/finalized
   markers, and reconciliation state alongside the product value.

An indexer can improve discovery and latency, but it cannot authorize a write.
Use `reconcileRobinhoodRead(...)` against a fresh direct-chain observation, then
call `assertRobinhoodWriteStateSafe(...)` before preparing the action.

## Submit a user action

The wallet path is deliberately linear because each step binds the next:

1. Reconcile the direct state that controls the action.
2. Build one action through `createRobinhoodActionBuilder(...)`.
3. Display its explanation, exact USDG amount, recipient, expiry, and expected
   state changes.
4. Simulate that capability-marked action with `simulateRobinhoodAction(...)`.
5. Pass the successful result to `requestRobinhoodAction(...)`; it verifies the
   action/runtime/program bindings and reruns a fresh exact simulation.
6. Let the user's EIP-1193 wallet authorize `eth_sendTransaction`.
7. Convert the SDK-sealed submission to finality input and track it without
   reconstructing or relabeling the action.

An arbitrary calldata object, a cloned prepared action, a changed label, an old
simulation, or caller-fabricated runtime proof is rejected. The SDK never holds
a private key and never switches the user's network.

## Fund with USDG

`parseRobinhoodUsdg(...)` represents the amount as integer units plus exact
network, CAIP-2, token address, symbol, and decimals. Mainnet accepts only
`0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168`; testnet remains unavailable until
a canonical address is published.

Approval and funding are separate actions. The approval builder decodes its own
calldata before returning it, confirming the canonical vault spender, positive
bounded amount, and matching human disclosure. Do not request an unlimited
approval through a generic transaction helper.

## Review and sign a decision

Build one `NakamaDecision` EIP-712 payload from trusted request/program state,
then generate the preview from that same payload. The message commits to the
program, request, terms, evidence manifest/version, review round, reviewer role,
decision action, approved amount, recipient commitment, public reason code,
nonce, and expiry.

After signature collection, call `verifyNakamaDecision(...)` with the expected
reviewer, module, nonce, and time. Persist
`nakamaDecisionReplayKey(...)` atomically before relaying, and provide a public
client when contract-wallet EIP-1271 verification is allowed.

## Determine economic finality

A single provider can report `soft_confirmed`, `l1_posted`, or `finalized` for
display, but the result remains `economicFinal: false`. Economic finality needs:

- the exact SDK-sealed submission, including action commitment, calldata hash,
  value, sender, target, chain, and intent;
- transaction input/value/sender/target readback matching that submission;
- two L2 readers with distinct provider, endpoint-origin, and operator identity;
- two L1 batch-evidence readers with the same independence rules; and
- agreement on the canonical receipt, L2 ordering, and L1 posting/finality.

Provider disagreement, a changed receipt, replacement, timeout, revert, or
canonical-block mismatch remains explicit and cannot be collapsed into success.

## Simulate a maintenance agent

The Phase-0 smart-account client can simulate only permissionless maintenance:
expiry, no-quorum escalation, information-timeout escalation, and unappealed
denial finalization. Economic, membership, role, funding, settlement, pause, and
other privileged actions are rejected.

Submission is disabled even for the allowlist. It will remain disabled until an
independent finalized read verifies module code, policy installation, revocation
state, limits, target, selector, program, and action constraints; an adapter's
self-attestation is insufficient.

## Validate a Virtuals packet

`validateVirtualsLaunchPacketStructure(...)` runs offline. Use it to catch
missing ownership references, inconsistent allocations, incorrect USDG/chain
identity, duplicate addresses, mismatched simulation hashes, and impossible
block ordering before a packet reaches an official workflow.

Passing does not prove Virtuals acceptance, legal eligibility, KYC/KYB,
beneficial ownership, deployed code, or finalized configuration. Resolve those
through current official platform, legal, identity, and Robinhood RPC sources;
this SDK never signs or broadcasts a launch.
