# Nakama SDK Examples

These examples are safe first-run checks for external builders. They do not
require funded signers, private keys, or live transaction submission.

## Devnet Smoke

Verifies the package import surface, safe client setup, PDA derivation, network
metadata, and public protocol surface.

```bash
npm run example:smoke
```

Optional:

```bash
SOLANA_RPC_URL=https://api.devnet.solana.com npm run example:smoke
```

In an installed consumer project, use the packaged examples and CLI:

```bash
npm install @nakama-health/protocol-sdk
npm install --save-dev tsx
npx @nakama-health/protocol-sdk examples
npx tsx node_modules/@nakama-health/protocol-sdk/examples/devnet-smoke.ts
```

## App Builder Read Model

Shows how a health app, wallet, or backend can turn member positions,
obligations, and claim cases into a user-facing read model.

```bash
npm run example:app
```

## Oracle Attestation

Shows how an oracle service can sign and verify a protocol-bound claim
attestation with a KMS-style adapter. The example uses an in-memory keypair for
demonstration only.

```bash
npm run example:oracle
```

## Check All Examples

```bash
npm run examples:check
```

## Consumer Dogfood App

`examples/consumer-app` is a tracked external-consumer dogfood fixture. It does
not import SDK source files directly.

```bash
npm run dogfood:consumer
```

The script packs the SDK, installs the tarball into a temporary copy of the app,
typechecks, builds, scaffolds the public templates, and runs no-signature
smokes.

## Public CLI

```bash
npx @nakama-health/protocol-sdk doctor
npx @nakama-health/protocol-sdk scaffold node-backend --out nakama-provider-backend
npx @nakama-health/protocol-sdk examples
```
