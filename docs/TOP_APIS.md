# Top APIs

Import these from either `@nakama-health/protocol-sdk` or
`@nakama-health/protocol-sdk/robinhood`. The two paths expose the same canonical
Robinhood-native surface.

## Chain, identity, and USDG

- `createRobinhoodPublicClient(...)` creates a caller-RPC-bound viem client for
  an explicit `mainnet` or `testnet` network.
- `assertRobinhoodProviderChain(...)` confirms an EIP-1193 wallet is already on
  the selected chain without requesting a switch.
- `normalizeRobinhoodAddress(...)`, `toRobinhoodCaip10(...)`, and
  `parseRobinhoodCaip10(...)` validate address and account identity.
- `parseRobinhoodUsdg(...)`, `formatRobinhoodAssetAmount(...)`, and
  `verifyRobinhoodUsdg(...)` bind units to exact chain and token metadata.

## Artifacts and deployment proof

- `getGeneratedRobinhoodArtifactBundle(...)` loads an immutable copy of all 12
  canonical ABI artifacts plus fail-closed deployment manifests.
- `validateRobinhoodDeploymentManifest(...)` validates static manifest shape,
  identity, checksums, and evidence fields.
- `assertRobinhoodDeploymentReady(...)` rejects placeholders, partial suites,
  unaudited deployments, and missing approval evidence.
- `verifyRobinhoodDeploymentRuntime(...)` checks live chain identity, all 12
  runtime hashes, suite topology, USDG, and deployment commitments, then returns
  an SDK-issued proof capability.

## Product reads and writes

- `createRobinhoodReadClient(...)` reads program, accounting, membership,
  request, obligation, role, and pause state at pinned blocks.
- `reconcileRobinhoodRead(...)` compares an indexer page with direct-chain
  truth; `assertRobinhoodWriteStateSafe(...)` rejects stale or divergent state.
- `collectRobinhoodIndexerPages(...)` validates bounded public pagination,
  retry, finality, cursor, and one-snapshot behavior;
  `invalidateRobinhoodOfflineCacheAfterReorg(...)` discards affected cache.
- `createRobinhoodActionBuilder(...)` produces immutable, capability-marked
  actions bound to the verified suite and one program ID.
- `createNakamaEligibilityTypedData(...)` and
  `createNakamaEligibilityRevocationTypedData(...)` construct the canonical
  chain/registry-bound envelopes; the revocation action verifies the exact
  eligibility digest before preparing relayer calldata.
- `simulateRobinhoodAction(...)` performs the exact chain-pinned simulation.
- `requestRobinhoodAction(...)` reruns a fresh exact simulation and submits only
  the same action through an EIP-1193 wallet.

## Review decisions and finality

- `createNakamaDecisionSigningPayload(...)` and
  `createNakamaDecisionPreview(...)` create the exact protocol EIP-712 message
  and human review copy.
- `requestNakamaDecisionSignature(...)` requests a signature without accepting
  or handling a private key.
- `verifyNakamaDecision(...)` binds signer, role, round, nonce, expiry, module,
  digest, and optional EIP-1271 validation.
- `createRobinhoodSubmittedTransactionFromSubmission(...)` converts the sealed
  wallet result into finality input without losing its action binding.
- `readRobinhoodEconomicFinality(...)` and
  `waitForRobinhoodFinality(...)` distinguish UI confirmation from independently
  corroborated L2/L1 economic finality.

## Agents and Virtuals

- `verifyRobinhoodSmartAccountRuntime(...)` verifies the selected account,
  factory, entry point, validation, recovery, and passkey module bytecodes at one
  block before the narrow maintenance submission path can be constructed.
- `validateRobinhoodSmartAccountPolicy(...)` validates the narrow policy shape,
  and `createRobinhoodSmartAccountLifecycleClient(...)` binds account creation,
  passkey enrollment, signer rotation, and recovery to one approval, revision,
  expiry, mutation result, and readback.
- `createRobinhoodPaymasterClient(...)` validates provider-neutral,
  action-and-policy-bound sponsorship quotes. It has no submission method and
  treats the adapter payload as untrusted until an external onchain verifier
  exists.
- `hashRobinhoodPaymasterPolicy(...)` canonically commits every sponsorship
  limit so an adapter cannot quote against a substituted policy.
- `createRobinhoodSponsorFundingBatch(...)` creates a non-submitting two-action
  plan only when exact finite USDG approval and funding calldata agree on the
  canonical vault and amount.
- `validateVirtualsLaunchPacketStructure(...)` checks a supplied packet for
  internal consistency and explicit Robinhood/USDG identity. It performs no RPC,
  legal, identity, approval, launch, signing, or broadcast operation.
