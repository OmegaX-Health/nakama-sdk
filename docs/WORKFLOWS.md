# Integration Workflows — `@nakama-health/protocol-sdk`

The canonical flow is Ethereum mainnet read, user-authorized write, then
reorg-aware verification. The SDK does not custody keys, select a privileged
RPC, or substitute an offchain database for contract state.

## 1. Read and identify

Create a client with `createEthereumPublicClient(...)`, normalize identities
with `toEthereumMainnetCaip10(...)`, and use the generated ABI with viem or the
SDK's calldata/event helpers. Pin token address and decimals before treating an
ERC-20 as a supported reserve asset.

Runnable starting points:

- `npm run example:smoke` checks chain and artifact provenance.
- `npm run example:contract` exercises canonical ABI calldata.
- `npm run example:authorization` builds the claim-recipient EIP-712 payload.

## 2. Prove the deployment

`validateEthereumDeploymentManifest(...)` handles static schema and artifact
checks. `validateEthereumContractDeployment(...)` adds live proof of the one
factory receipt and creation input, nonce-one registry, nonce-two protocol,
the protocol's `deploymentFactory()` back-pointer, mutual getters, three runtime
templates, canonical block, safe head, confirmation depth, and three refreshed
Sourcify exact-match records.

A raw deployer receipt is an intermediate `deployed-unverified` artifact. It is
not an SDK write target. Only the reviewed promotion step may produce
`status: "deployed"`, `verified: true`, and the audited final manifest.

## 3. Let the wallet authorize

Encode contract calldata from `NAKAMA_COVERAGE_PROTOCOL_ABI`, create a
`SigningPayloadV2`, and pass it to the caller-provided EIP-1193 provider.
`requestSigningPayloadV2(...)` checks chain ID again immediately before the
wallet request and never switches networks silently.
`requestSigningSubmissionV2(...)` returns a kind-matched, CAIP-bound submission
envelope tied to a server-issued intent ID.

## 4. Verify transaction outcome

Use `verifyEthereumTransactionIntent(...)` to compare the submitted transaction
with the trusted intent ID and server-owned sender, destination, calldata, and
value before applying the receipt checks. `waitForEthereumReceipt(...)` and
`verifyEthereumReceipt(...)` remain available for hash-only observation, but a
wallet approval or an RPC's first receipt response is not settlement; require a
successful, canonical, stable, sufficiently confirmed receipt at or below safe
head.

## 5. Consume claim-recipient authorization

The contract's EIP-712 schema is
`ClaimRecipient(bytes32 claimId,address recipient,uint256 nonce,uint256 deadline)`
under the `Nakama Policy Registry` version `1` domain. A relayer verifies the
expected claimant, registry, chain, trusted nonce, deadline, and signature,
then atomically consumes both digest and claim/nonce replay keys.

## Legacy migration

Old Solana account decoders, PDA helpers, simulations, and model adapters remain
available through explicit subpaths and optional peers for migration. Every
legacy instruction/transaction builder and safe-client write method,
`broadcastSignedTx(...)`, and every MagicBlock network or write path throws
`NAKAMA_LEGACY_WRITE_DISABLED`; new integrations should not import those
subpaths.

## Local release preflight

```bash
npm ci
npm run protocol:artifact:check
npm run typecheck
npm run lint
npm run format:check
npm run build
npm test
npm run docs:api:check
npm run docs:check
npm run runtime:check
npm run examples:check
npm run dogfood:consumer
npm run cli:check
npm run templates:check
npm run security:secrets
npm run security:package
npm run audit:prod
npm run audit:packed-consumer
npm pack --dry-run
```
