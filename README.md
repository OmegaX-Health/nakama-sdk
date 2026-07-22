# @nakama-health/protocol-sdk

Ethereum mainnet SDK foundation for Nakama's immutable protocol execution,
with explicit plan-attester and offchain health-service dependencies.

The canonical surface targets Ethereum mainnet (`chainId: 1`, CAIP-2
`eip155:1`) through [viem](https://viem.sh). It provides self-custodial wallet
payloads, ABI encoding and event decoding, ERC-20 preflight, reorg-aware receipt
verification, and the protocol's EIP-712 claim-recipient authorization with
nonce, deadline, claimant, contract, chain, and replay binding.

## Deployment status

The Ethereum contract interfaces are implemented, but production contracts are
not deployed or configured in this repository. The checked-in schema-v3
manifest has `status: "unconfigured"`, no factory, registry, or protocol
address, and no launch-time ReserveVault address. Deployment validators fail
closed, so the SDK cannot silently turn a placeholder into a mainnet target.

This package does not custody keys, choose a hosted wallet, require a proprietary
RPC, relay user transactions, or treat an offchain database as settlement truth.
Applications choose their own Ethereum mainnet RPC and EIP-1193 wallet.

The protocol deployer first emits `status: "deployed-unverified"`; that raw
receipt is never an SDK write target. The reviewed promotion step emits the
exact schema in `deployments/ethereum-mainnet.final.schema.json`. It binds the
single factory creation receipt, registry at factory nonce one, protocol at
nonce two, the protocol's immutable `deploymentFactory()` back-pointer, their
mutual getters, the ReserveVault CREATE2 template, three exact Sourcify records,
four ABIs, and the audit/release evidence. SHA-256
evidence uses lowercase 64-character text without `0x`; Ethereum addresses,
transaction hashes, and keccak bytecode hashes remain `0x`-prefixed.

## Install

```bash
npm install @nakama-health/protocol-sdk
```

Runtime requirements:

- Node.js `>=20` or an ESM-compatible browser build
- an Ethereum mainnet JSON-RPC URL or EIP-1193 provider
- a durable, atomic replay store for production attestation consumption

## Ethereum mainnet client

```ts
import {
  ETHEREUM_MAINNET_CAIP2,
  createEthereumPublicClient,
  toEthereumMainnetCaip10,
} from '@nakama-health/protocol-sdk/ethereum';

const client = createEthereumPublicClient({
  rpcUrl: process.env.ETHEREUM_MAINNET_RPC_URL,
});

console.log(client.chain?.id); // 1
console.log(ETHEREUM_MAINNET_CAIP2); // eip155:1
console.log(
  toEthereumMainnetCaip10('0x0000000000000000000000000000000000000001'),
);
```

Omit `rpcUrl` to use viem's Ethereum mainnet default transport, or pass an
injected `provider`. Supplying both is rejected.

## Self-custodial EIP-1193 transactions

`SigningPayloadV2` is the canonical versioned wire contract between a backend
and a wallet client. Every payload carries `chainId: "eip155:1"`, a CAIP-10
`accountId`, and exactly one `transaction` or `typed_data` branch. The helper
checks the wallet's current chain before requesting a signature or transaction;
it never switches networks silently.

```ts
import {
  createEip1193TransactionSigningPayload,
  requestSigningSubmissionV2,
} from '@nakama-health/protocol-sdk/ethereum';

const payload = createEip1193TransactionSigningPayload({
  from: '0x0000000000000000000000000000000000000001',
  to: '0x0000000000000000000000000000000000000002',
  data: '0x',
  value: '0x0',
});

const submission = await requestSigningSubmissionV2(
  window.ethereum,
  payload,
  serverIssuedIntentId,
);
```

The transaction helper rejects wrong-chain payloads, malformed JSON-RPC
quantities, explicit gas above the EIP-7825 `0x1000000` limit, odd-length
calldata, and branch substitution. It returns a
`ReceiptSubmissionV2` with a transaction hash; the backend must compare the
mined transaction with its server-owned intent before treating the receipt as
an authorized outcome.

## EIP-712 claim-recipient authorization

```ts
import {
  createClaimRecipientAuthorizationSigningPayload,
  verifyAndConsumeClaimRecipientAuthorization,
} from '@nakama-health/protocol-sdk/ethereum_oracle';
import { requestSigningPayloadV2 } from '@nakama-health/protocol-sdk/ethereum';

const signingPayload = createClaimRecipientAuthorizationSigningPayload({
  account: claimantAddress,
  verifyingContract: policyRegistryAddress,
  message: {
    claimId,
    recipient,
    nonce: trustedNonce,
    deadline: now + 300n,
  },
});

const signature = await requestSigningPayloadV2(
  window.ethereum,
  signingPayload,
);

const verified = await verifyAndConsumeClaimRecipientAuthorization({
  typedData: signingPayload.typedData,
  signature,
  expectedClaimant: claimantAddress,
  expectedVerifyingContract: policyRegistryAddress,
  expectedNonce: trustedNonce,
  replayGuard: durableAtomicReplayGuard,
});
```

This schema exactly mirrors `NakamaPolicyRegistry`'s
`ClaimRecipient(bytes32 claimId,address recipient,uint256 nonce,uint256 deadline)`
type and `Nakama Policy Registry` version `1` domain.
`verifyClaimRecipientAuthorization(...)` performs cryptographic and policy
validation without state mutation. Relayers should use
`verifyAndConsumeClaimRecipientAuthorization(...)`, whose replay guard
atomically consumes both the EIP-712 digest and the contract/claim nonce key.
The included `InMemoryClaimRecipientReplayGuard` is for tests and single-process
demos, not distributed production. Pass an Ethereum public client when the
claimant is an ERC-1271 smart-contract wallet.

## ABI, ERC-20, and receipt checks

Use `@nakama-health/protocol-sdk/ethereum_contract` for:

- `encodeEthereumCalldata(...)` and `decodeEthereumCalldata(...)`
- `decodeEthereumEventLogs(...)` and `decodeEthereumRevert(...)`
- `inspectErc20(...)` for code, metadata, balance, and allowance checks
- `waitForEthereumReceipt(...)` and `verifyEthereumReceipt(...)` for reverted,
  under-confirmed, reorged, or not-yet-safe transactions
- `verifyEthereumTransactionIntent(...)` for exact hash, sender, destination,
  calldata, value, receipt, canonical-chain, and safe-head verification against
  a server-owned intent ID and `SigningPayloadV2`
- `validateEthereumDeploymentManifest(...)` and
  `validateEthereumContractDeployment(...)` for the one factory receipt,
  nonce-one registry, nonce-two protocol, the protocol `deploymentFactory()`
  back-pointer, cross-getters, all three live immutable-aware runtime templates,
  the ReserveVault CREATE2 template, and independent-audit validation
- `verifyEthereumSourcifyDeployment(...)` to refresh all three exact-match
  records independently of the publication-time verification response

The package root exports ABI, ABI SHA-256, and artifact-metadata constants for
`NakamaProtocolFactory`, `NakamaPolicyRegistry`, `NakamaCoverageProtocol`, and
`ReserveVault`, plus `NAKAMA_ETHEREUM_MAINNET_DEPLOYMENT`.

## Generated contract seam

The canonical generator reads the imported ABI, compiled-artifact provenance,
and deployment manifest:

```text
contracts/ethereum/{NakamaProtocolFactory,NakamaPolicyRegistry,
                   NakamaCoverageProtocol,ReserveVault}.{abi,metadata}.json
deployments/ethereum-mainnet.json
deployments/ethereum-mainnet.final.schema.json
                │
                ▼
scripts/sync-ethereum-abi.mjs
                │
                ▼
src/generated/ethereum_protocol.ts
```

Run:

```bash
npm run import:ethereum-contract
npm run generate:protocol-bindings
npm run protocol:artifact:check
```

`import:ethereum-contract` imports all four compiled ABIs, their bytecode
provenance, the one-transaction deployment plan, and the final schema from the
canonical sibling artifact. Normal SDK builds use checked-in inputs, so package
generation stays deterministic and does not require the sibling repository.

The old Anchor IDL generator remains available only as
`npm run sync:legacy-solana-idl`; it is no longer the canonical generation
path.

## Legacy Solana compatibility

Solana modules remain temporarily available through explicit subpaths for
historical decoding, account reads, simulation, migration, and source
compatibility. They are absent from the package root and are not installed into
canonical Ethereum consumers. A project that needs them must install the
optional peers explicitly:

```bash
npm install @coral-xyz/anchor @solana/web3.js bn.js bs58 tweetnacl
```

They are not a writable network surface:

- Every legacy protocol instruction, transaction, convenience-builder, raw
  client, and safe-client write method throws `NAKAMA_LEGACY_WRITE_DISABLED`.
- `createRpcClient(...).broadcastSignedTx(...)` throws
  `NAKAMA_LEGACY_WRITE_DISABLED`.
- MagicBlock connection, transaction-builder, commitment, and private-payment
  write paths throw `NAKAMA_LEGACY_WRITE_DISABLED`.
- Solana transaction decoders, simulation helpers, PDA derivation, and account
  decoders remain available for read/migration work.

No Ethereum integration should import `protocol`, `protocol_seeds`, `rpc`,
`transactions`, `claims`, `oracle`, or `magicblock`; those subpaths describe the
legacy Solana surface.

## Public Ethereum subpaths

- `@nakama-health/protocol-sdk/ethereum`
- `@nakama-health/protocol-sdk/ethereum_contract`
- `@nakama-health/protocol-sdk/ethereum_oracle`
- `@nakama-health/protocol-sdk/errors`

## Local verification

```bash
npm ci
npm run generate:protocol-bindings
npm run protocol:artifact:check
npm run typecheck
npm run lint
npm run format:check
npm run build
npm test
npm run docs:check
npm run audit:packed-consumer
```

Mainnet deployment, contract audits, a durable replay backend, fork tests, and a
live RPC verification are release prerequisites outside this SDK foundation.
