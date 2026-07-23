# Nakama SDK Examples

These examples exercise the Robinhood Chain SDK without funded accounts,
private keys, platform credentials, or transaction submission.

## Robinhood Chain smoke

Checks chain identity, CAIP formatting, canonical USDG metadata, generated ABI
provenance, and the fail-closed deployment manifest.

```bash
npm run example:smoke
```

## Human decision payload

Builds the exact `Decision` EIP-712 wallet payload, human preview, digest, and
round-scoped replay key. An AI agent never signs this payload.

```bash
npm run example:contract
```

## Virtuals launch packet

Validates the offline launch packet structure, allocations, code-hash evidence,
and finality fields. Caller-supplied gates remain claims until independently
verified through the platform, legal, identity, and onchain workflows.

```bash
npm run example:authorization
```

## Full checks

```bash
npm run examples:check
npm run dogfood:consumer
```

The dogfood app installs the packed SDK as an external consumer, compiles both
the canonical root and `/robinhood` subpath, and runs a no-signature smoke.

## Public CLI

```bash
npx @nakama-health/protocol-sdk doctor --network mainnet
npx @nakama-health/protocol-sdk scaffold node-backend --out nakama-provider-backend
npx @nakama-health/protocol-sdk examples
```
