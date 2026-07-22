# API Reference — `@nakama-health/protocol-sdk`

The canonical SDK surface targets Ethereum mainnet (`eip155:1`). The generated
deployment manifest is intentionally unconfigured, so contract-targeted writes
remain unavailable until a real audited deployment is recorded and validated.

Generated symbol-level documentation lives in `generated/api/README.md`.

## Ethereum network and wallet API

Available from the package root and
`@nakama-health/protocol-sdk/ethereum`.

- `createEthereumPublicClient(...)` creates a viem public client pinned to
  chain ID 1. It accepts one custom HTTP RPC URL or one EIP-1193 provider.
- `normalizeEthereumAddress(...)` validates and checksums an address.
- `toEthereumMainnetCaip10(...)` emits an `eip155:1:<address>` account ID.
- `parseEthereumMainnetCaip10(...)` rejects non-mainnet CAIP account IDs.
- `createEip1193TransactionSigningPayload(...)` creates a chain-bound
  `SigningPayloadV2` transaction request and rejects an explicit gas limit
  above the EIP-7825 ceiling.
- `createEip712SigningPayload(...)` creates a chain-bound `SigningPayloadV2`
  typed-data request.
- `validateSigningPayloadV2(...)` rejects wrong CAIP identifiers, account/from
  mismatches, and mixed transaction/typed-data branches at a wire boundary.
- `createReceiptSubmissionV2(...)` and
  `createAuthorizationSubmissionV2(...)` bind a wallet result to the original
  intent, chain, account, and request kind.
- `validateReceiptSubmissionV2(...)` and
  `validateAuthorizationSubmissionV2(...)` reject transaction-hash/signature
  substitution and malformed submission envelopes.
- `assertEip1193Mainnet(...)` verifies the wallet is already on chain ID 1.
- `requestSigningPayloadV2(...)` calls `eth_sendTransaction` or
  `eth_signTypedData_v4` after the chain check.
- `requestSigningSubmissionV2(...)` performs the request and returns the
  matching canonical `ReceiptSubmissionV2` or `AuthorizationSubmissionV2`.

Constants:

- `ETHEREUM_MAINNET_CHAIN_ID` is `1`.
- `ETHEREUM_MAINNET_CHAIN_ID_HEX` is `0x1`.
- `ETHEREUM_MAINNET_CAIP2` is `eip155:1`.
- `ETHEREUM_MAINNET_TRANSACTION_GAS_LIMIT_CAP` is `0x1000000n`.

`SigningPayloadV2` uses `version: 2`, `chainId: "eip155:1"`, a CAIP-10
`accountId`, and the discriminants `transaction` or `typed_data`.
`requestSigningPayloadV2(...)` never changes the wallet network and never
handles a private key. `AuthorizationStatusV2` provides an optional relayer
lifecycle vocabulary without treating offchain status as settlement truth.

## Contract, calldata, asset, and finality API

Available from the package root and
`@nakama-health/protocol-sdk/ethereum_contract`.

- `validateEthereumDeploymentManifest(...)` validates schema v3, chain,
  one-factory deployment identity, three live contract records, the
  ReserveVault CREATE2 template, four ABI hashes, audit/release digests, and
  per-contract Sourcify evidence.
  `requireDeployed: true` rejects the checked-in unconfigured/unaudited manifest.
- `validateEthereumContractDeployment(...)` additionally checks the factory
  receipt and creation input, nonce-one registry, nonce-two protocol, the
  protocol's `deploymentFactory()` back-pointer, mutual getters, three live
  runtime templates, safe/finalized evidence, and fresh Sourcify lookups.
- `verifyEthereumSourcifyDeployment(...)` independently GETs each canonical
  `https://sourcify.dev/server/v2/contract/1/<checksummed-address>` endpoint and
  requires mainnet, address, exact creation/runtime matches, timestamp, and
  match ID to equal the published evidence.
- `assertEthereumCreationBytecodeHash(...)` is the low-level integrity
  primitive used to bind deployment transaction input to the generated
  creation-bytecode hash.
- `encodeEthereumCalldata(...)` encodes an ABI function call.
- `decodeEthereumCalldata(...)` decodes ABI calldata.
- `decodeEthereumEventLogs(...)` decodes matching event logs and defaults to
  strict failure.
- `decodeEthereumRevert(...)` decodes Solidity custom or standard errors when
  the supplied ABI supports them.
- `inspectErc20(...)` checks contract code and reads `name`, `symbol`,
  `decimals`, and `totalSupply`; optional owner/spender inputs add balance and
  allowance minimum checks.
- `waitForEthereumReceipt(...)` waits for the configured confirmation count and
  then performs canonical-chain and safe-head verification.
- `verifyEthereumReceipt(...)` rejects reverted receipts, insufficient
  confirmations, block-hash changes, receipt changes, and transactions beyond
  the safe head.
- `verifyEthereumTransactionIntent(...)` fetches the submitted transaction,
  binds the submission to a trusted expected intent ID, proves its sender,
  destination, calldata, and value equal the server-owned transaction intent,
  then performs the full receipt and finality checks.

The default confirmation count is `DEFAULT_ETHEREUM_CONFIRMATIONS` (`12`). Safe
head verification is enabled by default.

Generated contract constants:

- `NAKAMA_PROTOCOL_FACTORY_ABI`
- `NAKAMA_POLICY_REGISTRY_ABI`
- `NAKAMA_COVERAGE_PROTOCOL_ABI`
- `NAKAMA_RESERVE_VAULT_ABI`
- matching `*_ABI_SHA256` and `*_ARTIFACT_METADATA` constants
- `NAKAMA_ETHEREUM_MAINNET_DEPLOYMENT`

## EIP-712 claim-recipient authorization API

Available from the package root and
`@nakama-health/protocol-sdk/ethereum_oracle`.

- `createClaimRecipientAuthorizationTypedData(...)` constructs the contract's
  canonical `ClaimRecipient` domain and message for chain ID 1.
- `createClaimRecipientAuthorizationSigningPayload(...)` wraps the canonical
  typed data in `SigningPayloadV2` for an EIP-1193 wallet.
- `hashClaimRecipientAuthorization(...)` returns the EIP-712 digest.
- `verifyClaimRecipientAuthorization(...)` validates the fixed type schema,
  domain name and version, chain, verifying contract, expected claimant,
  trusted onchain nonce, deadline, signature, and fixed-width fields. Passing a
  public client enables ERC-1271 claimant validation.
- `claimRecipientNonceReplayKey(...)` derives the contract/claim/nonce key.
- `verifyAndConsumeClaimRecipientAuthorization(...)` performs verification and
  atomically consumes the digest and nonce key through a caller-provided replay
  guard.

`ClaimRecipientReplayGuard.consume(...)` must be atomic across all supplied
keys. `InMemoryClaimRecipientReplayGuard` is intended for tests and
single-process demos; production services need a durable shared implementation.

## Ethereum errors

Available from the package root and
`@nakama-health/protocol-sdk/errors`.

- `NakamaEthereumConfigError` — `NAKAMA_ETHEREUM_CONFIG_ERROR`
- `NakamaEthereumAddressError` — `NAKAMA_ETHEREUM_ADDRESS_ERROR`
- `NakamaEthereumWrongChainError` — `NAKAMA_ETHEREUM_WRONG_CHAIN`
- `NakamaEthereumContractError` — `NAKAMA_ETHEREUM_CONTRACT_ERROR`
- `NakamaEthereumReceiptError` — `NAKAMA_ETHEREUM_RECEIPT_ERROR`
- `NakamaEthereumAttestationError` — `NAKAMA_ETHEREUM_ATTESTATION_ERROR`
- `NakamaEthereumReplayError` — `NAKAMA_ETHEREUM_REPLAY`
- `NakamaLegacyWriteDisabledError` — `NAKAMA_LEGACY_WRITE_DISABLED`

All extend the existing typed SDK error base and expose `code`, optional
`details`, and optional `cause`.

## Generated ABI ownership

The checked-in inputs are the ABI and metadata pairs for
`NakamaProtocolFactory`, `NakamaPolicyRegistry`, `NakamaCoverageProtocol`, and
`ReserveVault` under `contracts/ethereum/`, plus
`deployments/ethereum-mainnet.json` and
`deployments/ethereum-mainnet.final.schema.json`. Run
`npm run generate:protocol-bindings` to regenerate
`src/generated/ethereum_protocol.ts`; `npm run protocol:artifact:check` fails if
any ABI, metadata record, schema, manifest, or generated output drifts from the
canonical sibling `nakama-protocol` artifact.

The Anchor IDL generator is retained only under
`npm run sync:legacy-solana-idl` for migration compatibility.

## Legacy Solana surface

The following subpaths are deprecated for new integrations:

- `@nakama-health/protocol-sdk/protocol`
- `@nakama-health/protocol-sdk/protocol_seeds`
- `@nakama-health/protocol-sdk/rpc`
- `@nakama-health/protocol-sdk/transactions`
- `@nakama-health/protocol-sdk/claims`
- `@nakama-health/protocol-sdk/oracle`
- `@nakama-health/protocol-sdk/magicblock`

Their decoding, derivation, simulation, and read helpers remain for migration.
They are excluded from the package root and require explicit installation of
the optional Solana peers. Every protocol instruction/transaction builder,
raw-client builder, safe-client write method, `broadcastSignedTx(...)`, and
MagicBlock write path fails with `NAKAMA_LEGACY_WRITE_DISABLED`; these subpaths
are not Ethereum compatibility shims.

```bash
npm install @coral-xyz/anchor @solana/web3.js bn.js bs58 tweetnacl
```
