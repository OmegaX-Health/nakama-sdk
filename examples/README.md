# Nakama SDK Examples

These examples exercise the Ethereum mainnet SDK without funded accounts,
private keys, proprietary infrastructure, or transaction submission.

## Ethereum mainnet smoke

Checks chain identity, CAIP account formatting, generated ABI provenance, and
the fail-closed deployment manifest.

```bash
npm run example:smoke
```

In an installed consumer project:

```bash
npm install @nakama-health/protocol-sdk
npm install --save-dev tsx
npx tsx node_modules/@nakama-health/protocol-sdk/examples/ethereum-mainnet-smoke.ts
```

## Contract calldata

Encodes and decodes the canonical `deriveClaimId` call from the generated
`NakamaPolicyRegistry` ABI.

```bash
npm run example:contract
```

## Claim-recipient authorization

Builds the exact EIP-712 payload a claimant submits to an EIP-1193 wallet, then
derives its digest and replay key without handling a private key.

```bash
npm run example:authorization
```

## Check all examples

```bash
npm run examples:check
```

## Consumer dogfood app

`examples/consumer-app` installs the packed SDK as an external consumer, checks
the canonical Ethereum subpaths, compiles, and runs a no-signature smoke.

```bash
npm run dogfood:consumer
```

## Public CLI

```bash
npx @nakama-health/protocol-sdk doctor
npx @nakama-health/protocol-sdk scaffold node-backend --out nakama-provider-backend
npx @nakama-health/protocol-sdk examples
```
