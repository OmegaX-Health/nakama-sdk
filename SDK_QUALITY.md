# Nakama SDK Quality Doctrine

This SDK is the public integration boundary for Nakama's Ethereum protocol.
It should preserve user agency and Ethereum neutrality: applications
bring their own RPC and wallet, users keep their keys, and contract state is the
settlement source of truth.

## Canonical network

- Canonical chain identity is Ethereum mainnet: chain ID `1`, CAIP-2
  `eip155:1`.
- RPC URLs are caller-owned configuration. No vendor endpoint is privileged.
- EIP-1193 requests must validate the wallet's current chain and must not switch
  it silently.
- Ethereum addresses are checksummed at trust boundaries and CAIP-10 identifiers
  retain chain context.

## Contract parity

- The canonical artifact contains `NakamaProtocolFactory`,
  `NakamaPolicyRegistry`, `NakamaCoverageProtocol`, and the `ReserveVault`
  template. The SDK refuses another contract set, chain, deployment plan, or
  source artifact.
- All four checked-in ABIs, generated constants, ABI SHA-256 digests, metadata,
  and the deployment manifest must agree before release.
- Calldata and event helpers consume ABI input; there is no hand-maintained
  parallel instruction schema.
- The protocol has scoped controllers and bounded scoped pauses, with no global
  owner, upgrade proxy, or global pause in the canonical ABI. SDK docs must not
  invent those powers.

## Deployment safety

- An unconfigured manifest contains no factory, registry, protocol, deployer,
  transaction, block, bytecode, or verification claim. ReserveVault remains a
  CREATE2 template and never receives a launch address.
- A configured deployment must prove one successful factory receipt, registry
  at factory nonce one, protocol at nonce two, mutual factory/registry/core
  getters, at least 12 confirmations, and an independent audit.
- Published manifests bind the audit report, release approval, protocol
  artifact, standalone ABI, source-verification provider/URL, and verification
  evidence by canonical lowercase SHA-256 digest. Raw deployment output remains
  `deployed-unverified` until the reviewed promotion gate succeeds.
- Live validation checks all three exact runtime hashes and immutable-aware
  templates, the factory creation input, and the approved ReserveVault template.
- Source verification is exactly Sourcify v2 on Ethereum mainnet for the
  factory, registry, and core; each canonical lookup must reproduce the exact
  creation/runtime matches, timestamp, and match ID in the manifest.
- Until those fields exist, contract-targeted writes are unavailable. A zero or
  placeholder address is never a release shortcut.

## Signing and authorization

- `SigningPayloadV2` carries version `2`, CAIP-2 chain identity, CAIP-10 account
  identity, and exactly one transaction or typed-data branch.
- Wallet results use kind-matched `ReceiptSubmissionV2` or
  `AuthorizationSubmissionV2` envelopes tied to a server-issued intent ID;
  transaction hashes and signatures are never interchangeable.
- The SDK never accepts, stores, or derives a private key.
- Claim-recipient authorization must exactly match the policy registry's EIP-712
  domain (`Nakama Policy Registry`, version `1`) and `ClaimRecipient` type.
- Verification binds contract, chain, claimant, claim ID, recipient, trusted
  onchain nonce, and deadline. ERC-1271 claimants require RPC-backed signature
  validation.
- Relayers must atomically consume both the typed-data digest and claim/nonce
  replay key in durable shared storage.

## Assets and finality

- ERC-20 integrations validate code before reading metadata, balance, or
  allowance and can pin expected decimals and symbol.
- Transaction success means more than a receipt: verification checks revert
  status, confirmation depth, canonical block hash, a stable second receipt,
  and Ethereum safe head.
- Revert data should be decoded with the canonical ABI when available and
  surfaced as typed SDK errors.
- Contract-write backends must verify the mined sender, destination, calldata,
  value, and submitted intent ID against their server-owned transaction intent
  before accepting the receipt.

## Legacy compatibility

- Solana modules remain only for historical decoding, reads, simulation, and
  migration while consumers move to Ethereum.
- Legacy Solana modules are absent from the canonical root, and their runtime
  dependencies are optional peers installed only by explicit migration users.
- Every Solana instruction/transaction builder, safe-client write method,
  broadcast, and MagicBlock write path fails with
  `NAKAMA_LEGACY_WRITE_DISABLED`.
- Explicit EIP-1193 gas limits above the EIP-7825 `0x1000000` ceiling fail
  before a wallet request is constructed.
- New examples and docs use `ethereum`, `ethereum_contract`, or
  `ethereum_oracle`; they do not present legacy subpaths as canonical.

## Generated artifacts and docs

- `npm run import:ethereum-contract` imports the canonical sibling protocol
  artifact and records ABI plus bytecode provenance.
- `npm run generate:protocol-bindings` regenerates the TypeScript ABI and
  deployment constants from checked-in inputs.
- `npm run docs:api:generate` owns generated API markdown.
- README, API reference, runtime manifest, generated docs, package exports, and
  tests must agree on availability and side effects.

## Required validation

```bash
npm run protocol:artifact:check
npm run typecheck
npm run lint
npm run format:check
npm run build
npm test
npm run docs:api:check
npm run docs:check
npm run runtime:check
npm run audit:packed-consumer
```

Mainnet fork tests, independent contract review, source verification, and live
RPC/deployment checks are release gates outside a standalone SDK unit suite.
