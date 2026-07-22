# Robinhood recipes

These snippets demonstrate boundaries rather than a live deployment. The
checked-in manifests are unconfigured, so the runtime-dependent recipes fail
closed until audited deployment evidence exists.

## Inspect network and artifact identity

```ts
import {
  getGeneratedRobinhoodArtifactBundle,
  getRobinhoodCaip2,
  getRobinhoodChainId,
} from '@nakama-health/protocol-sdk';

const bundle = getGeneratedRobinhoodArtifactBundle();
console.log(getRobinhoodChainId('mainnet')); // 4663
console.log(getRobinhoodCaip2('mainnet')); // eip155:4663
console.log(Object.keys(bundle.contracts)); // all 12 protocol roles
console.log(bundle.deployments.mainnet.status); // unconfigured today
```

## Parse exact USDG without rounding

```ts
import {
  formatRobinhoodAssetAmount,
  parseRobinhoodUsdg,
} from '@nakama-health/protocol-sdk/robinhood';

const amount = parseRobinhoodUsdg('125.500001', 'mainnet');
console.log(amount.units); // 125500001n
console.log(formatRobinhoodAssetAmount(amount)); // 125.500001
```

More than six fractional digits, a negative value, a wrong token address, or
testnet USDG before its address is configured is rejected.

## Prove deployment code before constructing a client

```ts
import {
  assertRobinhoodDeploymentReady,
  createRobinhoodPublicClient,
  getGeneratedRobinhoodArtifactBundle,
  verifyRobinhoodDeploymentRuntime,
} from '@nakama-health/protocol-sdk';

const bundle = getGeneratedRobinhoodArtifactBundle();
const manifest = bundle.deployments.mainnet;
const client = createRobinhoodPublicClient({
  network: 'mainnet',
  rpcUrl: process.env.ROBINHOOD_MAINNET_RPC_URL!,
});

assertRobinhoodDeploymentReady(manifest, bundle);
const runtime = await verifyRobinhoodDeploymentRuntime({
  client,
  manifest,
  bundle,
});
```

The assertion currently throws by design. Do not replace the proof with a cast,
fixture, copied JSON object, or caller-supplied boolean.

## Reconcile a direct read before writing

```ts
import {
  assertRobinhoodWriteStateSafe,
  reconcileRobinhoodRead,
} from '@nakama-health/protocol-sdk';

const reconciled = reconcileRobinhoodRead(directRead, indexerPage, {
  now: new Date().toISOString(),
  maxIndexerAgeSeconds: 30,
  identity: (program) => program.programId,
});

assertRobinhoodWriteStateSafe(reconciled.context);
```

Use an indexer for discovery and UX, then use the direct pinned read as the
authority. An `offline_cache`, stale, divergent, or malformed context cannot
authorize a write.

## Decode the canonical economic ledger event

```ts
import {
  decodeRobinhoodEconomicActivity,
  getGeneratedRobinhoodArtifactBundle,
} from '@nakama-health/protocol-sdk';

const bundle = getGeneratedRobinhoodArtifactBundle();
const activity = decodeRobinhoodEconomicActivity({
  log,
  manifest: bundle.deployments.mainnet,
  bundle,
});

console.log(activity.kind); // one of the nine protocol activity names
console.log(activity.accounting.trackedAssets); // post-activity vault state
```

The decoder accepts only `PoolVault.EconomicActivity` schema 2. It rejects a
wrong contract, unknown kind, substituted asset, or post-state accounting that
does not satisfy the protocol identities, so indexers do not need to reconcile
parallel economic event families.

## Encode durable blocked-attempt telemetry from an adapter

```ts
import { createRobinhoodRecordBlockedAttemptCall } from '@nakama-health/protocol-sdk';

const call = createRobinhoodRecordBlockedAttemptCall({
  manifest,
  bundle,
  runtime,
  programId,
  adapter: reviewedAdapterAddress,
  authorizationId,
  principal,
  selector,
  nativeValue: 0n,
  assetAmount,
});

await handoffToReviewedAdapter(call);
```

The returned object is adapter calldata, not a `PreparedRobinhoodAction` and not
a transaction sender. The reviewed adapter must make the registry call itself,
because `msg.sender` is part of the protocol authorization boundary; an EOA,
generic smart account, protocol contract, or USDG address cannot stand in for it.

## Request a decision signature

```ts
import {
  createNakamaDecisionPreview,
  createNakamaDecisionSigningPayload,
  requestNakamaDecisionSignature,
} from '@nakama-health/protocol-sdk';

const payload = createNakamaDecisionSigningPayload(decisionInput);
const preview = createNakamaDecisionPreview(payload);

showReviewer(preview);
const signature = await requestNakamaDecisionSignature(
  window.ethereum,
  payload,
);
```

Create the preview from the same immutable payload sent to the wallet. The SDK
uses `eth_signTypedData_v4`, exposes `EIP712Domain` in wallet JSON, and never
accepts a private key.

## Assess display finality without overstating it

```ts
import { readRobinhoodFinality } from '@nakama-health/protocol-sdk';

const display = await readRobinhoodFinality({
  submitted,
  reader,
  now: new Date().toISOString(),
});

console.log(display.status);
console.log(display.economicFinal); // always false in the single-reader lane
```

Use `readRobinhoodEconomicFinality(...)` only with the SDK-sealed wallet
submission, two independent L2 readers, and two independent L1 batch readers.

## Validate a launch packet offline

```ts
import { validateVirtualsLaunchPacketStructure } from '@nakama-health/protocol-sdk';

const checked = validateVirtualsLaunchPacketStructure(decodedPacket);
console.log(checked.warning);
```

The result is a consistency check, not Virtuals approval or onchain proof. Never
route it directly to a signer; re-resolve current official platform, legal,
identity, code, simulation, and finalized-chain evidence first.
