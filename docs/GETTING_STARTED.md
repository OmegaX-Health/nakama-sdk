# Getting Started — `@nakama-health/protocol-sdk`

This guide gets an integration onto the canonical Ethereum mainnet surface
without custodying a key or trusting an unconfigured contract address.

## Prerequisites

- Node.js `>=20` or an ESM-compatible browser build
- an Ethereum mainnet RPC or EIP-1193 wallet provider
- a durable atomic replay store if a backend consumes claim authorizations

The checked-in deployment is intentionally `unconfigured`. You can build,
decode, and verify against the canonical ABI now, but contract-targeted writes
must wait for a source-verified, independently audited deployment manifest.

## Install and inspect

```bash
npm install @nakama-health/protocol-sdk
npx @nakama-health/protocol-sdk doctor
```

`doctor` checks Node, ESM, canonical Ethereum subpaths, chain identity, ABI and
bytecode provenance, deployment status, and typed errors. Add
`--rpc-url <url>` to verify that your endpoint actually reports chain ID `1`.

Run the no-signature package smoke:

```bash
npm run example:smoke
```

## Create a mainnet client

```ts
import { createEthereumPublicClient } from '@nakama-health/protocol-sdk/ethereum';

const client = createEthereumPublicClient({
  rpcUrl: process.env.ETHEREUM_MAINNET_RPC_URL,
});
```

Applications choose their own endpoint. Passing an injected EIP-1193 provider
instead is supported; passing both configurations is rejected.

## Check deployment before contract use

```ts
import {
  NAKAMA_ETHEREUM_MAINNET_DEPLOYMENT,
  validateEthereumDeploymentManifest,
} from '@nakama-health/protocol-sdk';

const deployment = validateEthereumDeploymentManifest(
  NAKAMA_ETHEREUM_MAINNET_DEPLOYMENT,
  { requireDeployed: true },
);
```

This currently throws by design. After deployment, use
`validateEthereumContractDeployment(...)` to prove chain, address, bytecode,
the one factory creation transaction, nonce-derived registry and protocol,
the protocol's `deploymentFactory()` back-pointer, mutual getters, canonical
receipt, safe head, all three runtime templates, three exact Sourcify records,
and audit status against live state.

## Ask a self-custodial wallet to transact

```ts
import {
  createEip1193TransactionSigningPayload,
  requestSigningSubmissionV2,
} from '@nakama-health/protocol-sdk/ethereum';

const payload = createEip1193TransactionSigningPayload({
  from: claimantAddress,
  to: deployment.liveContracts.protocol.address,
  data: calldata,
  value: '0x0',
});

const submission = await requestSigningSubmissionV2(
  window.ethereum,
  payload,
  serverIssuedIntentId,
);
```

The SDK checks the payload, the EIP-7825 gas ceiling, and the connected wallet
chain, then delegates signing and submission to the user's provider. It never accepts a private key, and the
returned `ReceiptSubmissionV2` cannot substitute a signature or change the
CAIP-bound account.

## Verify finality

```ts
import { verifyEthereumTransactionIntent } from '@nakama-health/protocol-sdk/ethereum_contract';

const result = await verifyEthereumTransactionIntent(client, {
  submission,
  expectedIntentId: serverIssuedIntentId,
  signingPayload: payload,
  minimumConfirmations: 12,
});
```

Verification first proves that the mined sender, destination, calldata, and
value exactly match the server-owned intent, then rejects reverts, insufficient
depth, noncanonical block hashes, receipt changes, and receipts beyond
Ethereum's safe head.

Continue with [Recipes](RECIPES.md), [Workflows](WORKFLOWS.md), and the
[API Reference](API_REFERENCE.md). Legacy Solana modules remain available only
through explicit subpaths and optional peer dependencies for historical reads,
decoding, and migration; their builders and write paths fail closed.
