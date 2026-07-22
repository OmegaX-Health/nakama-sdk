# Getting Started — `@nakama-health/protocol-sdk`

This guide connects an application to the Robinhood-native SDK without
inventing a deployment address, trusting an indexer as settlement truth, or
giving a library custody of a signing key.

## 1. Install and choose the network explicitly

```bash
npm install @nakama-health/protocol-sdk
```

```ts
import { createRobinhoodPublicClient } from '@nakama-health/protocol-sdk';

const client = createRobinhoodPublicClient({
  network: 'mainnet',
  rpcUrl: process.env.ROBINHOOD_MAINNET_RPC_URL!,
});
```

Mainnet is chain `4663` (`eip155:4663`); testnet is chain `46630`
(`eip155:46630`). Both the network and transport are mandatory, and the SDK
does not fall back to Ethereum chain `1` or a public endpoint.

For an injected browser wallet, pass `{ network, provider }` instead of an RPC
URL. Passing both transports is a type error, and wallet requests verify the
connected chain without switching it.

## 2. Inspect the generated artifacts and deployment state

```ts
import {
  getGeneratedRobinhoodArtifactBundle,
  validateRobinhoodDeploymentManifest,
} from '@nakama-health/protocol-sdk';

const bundle = getGeneratedRobinhoodArtifactBundle();
const manifest = validateRobinhoodDeploymentManifest(
  bundle.deployments.mainnet,
  'mainnet',
);

console.log(bundle.status); // ready: all 12 ABIs are imported
console.log(manifest.status); // unconfigured: no deployed addresses yet
```

`assertRobinhoodDeploymentReady(...)` currently throws by design. After a
deployment is reviewed, call `verifyRobinhoodDeploymentRuntime(...)` against
the same RPC before constructing a read client or action builder. Static JSON
cannot prove that code still exists at an address.

## 3. Represent USDG exactly

```ts
import {
  formatRobinhoodAssetAmount,
  parseRobinhoodUsdg,
} from '@nakama-health/protocol-sdk';

const requestedAmount = parseRobinhoodUsdg('2500.00', 'mainnet');
console.log(requestedAmount.units); // 2500000000n
console.log(formatRobinhoodAssetAmount(requestedAmount)); // 2500
```

The amount carries mainnet chain identity, the canonical Global Dollar address,
symbol `USDG`, and six decimals. More than six fractional digits are rejected;
no rounding occurs. Testnet is fail-closed because a canonical USDG address has
not been configured.

## 4. Read product state

Once the deployment is published and verified:

```ts
import { createRobinhoodReadClient } from '@nakama-health/protocol-sdk';

const nakama = createRobinhoodReadClient({
  client,
  manifest,
  bundle,
  runtime: verifiedRuntime,
  programId,
});

const program = await nakama.readProgram();
console.log(program.value.state);
console.log(program.context.reconciliation); // direct_chain_only
```

Reads pin all calls to one block and return block/finality context alongside the
domain value. If the UI also uses an indexer, reconcile it with a direct read
before enabling a write.

## 5. Prepare, simulate, and submit one action

```ts
import {
  assertRobinhoodWriteStateSafe,
  createRobinhoodActionBuilder,
  requestRobinhoodAction,
  simulateRobinhoodAction,
} from '@nakama-health/protocol-sdk';

assertRobinhoodWriteStateSafe(program.context);

const actions = createRobinhoodActionBuilder({
  manifest,
  bundle,
  runtime: verifiedRuntime,
  programId,
});

const prepared = actions.openRequest({
  account: memberAddress,
  intentId: crypto.randomUUID(),
  membershipId,
  evidenceManifestCommitment,
  recipientCommitment,
  requestedAmount,
});

const simulated = await simulateRobinhoodAction({
  client,
  bundle,
  action: prepared,
});

if (!simulated.simulation.success) {
  throw new Error(
    simulated.simulation.decodedError?.name ?? 'Simulation failed',
  );
}

const submission = await requestRobinhoodAction(window.ethereum, simulated, {
  client,
  manifest,
  bundle,
  runtime: verifiedRuntime,
});
```

Display `prepared.explanation` and `prepared.expectedStateChanges` before the
wallet prompt. A failed, expired, wrong-chain, or unverified action cannot be
submitted through the SDK.

## 6. Track finality

Convert the exact sealed wallet result with
`createRobinhoodSubmittedTransactionFromSubmission(...)`. Each receipt reader
must read back transaction input and value. Single-provider state is UI-only;
economic finality requires two independent L2 readers and two independent L1
batch readers with distinct provider, endpoint, and operator identities.
Replaced, reverted, timed-out, and reorged transactions remain distinct.

## 7. Build decision signatures safely

Use `createNakamaDecisionSigningPayload(...)` and
`createNakamaDecisionPreview(...)` from the same object shown to the reviewer.
The signature domain binds Robinhood network and the deployed DecisionModule;
the message binds program, request, terms, evidence version, round, role,
action, amount, recipient commitment, reason, nonce, and expiry.

Backends should call `verifyNakamaDecision(...)` with trusted expected signer,
module, nonce, and time. Supply the public client for EIP-1271 contract wallets,
and persist `nakamaDecisionReplayKey(...)` atomically before relaying.

## 8. Treat the Virtuals checker as structural only

`validateVirtualsLaunchPacketStructure(...)` is an offline schema and
consistency check. It cannot prove that Virtuals approved a launch, the listed
owners passed KYC, counsel approved the structure, or the supplied hashes came
from Robinhood. See [Robinhood and Virtuals](ROBINHOOD_VIRTUALS.md) before using
it in a launch workflow.

## Run the local examples

```bash
npm run example:smoke
npm run example:contract
npm run example:authorization
```

All three are offline and do not sign, submit, deploy, or launch anything.
