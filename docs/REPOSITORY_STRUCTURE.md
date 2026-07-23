# Repository structure

The SDK has a canonical Robinhood surface, a generated artifact seam, and
explicit legacy migration surfaces. Keeping those boundaries visible prevents
an old network implementation from silently becoming production behavior.

## Canonical source

- `src/index.ts` exports only `src/robinhood/index.ts`.
- `src/robinhood.ts` provides the explicit `/robinhood` package entrypoint.
- `src/robinhood/chains.ts` owns Robinhood chain, CAIP, RPC, address, and provider
  validation.
- `src/robinhood/assets.ts` owns exact USDG identity and integer-unit amounts.
- `src/robinhood/artifacts.ts` validates artifacts/deployments and produces live
  runtime proof.
- `src/robinhood/protocol.ts` owns product reads, typed action builders,
  simulations, event decoding, and protocol-domain mappings.
- `src/robinhood/wallet.ts` owns EIP-1193 submissions, the disabled-by-default
  Phase-0 smart-account boundary, and provider-neutral quote-only paymaster
  policy.
- `src/robinhood/decision.ts` owns the exact protocol EIP-712 decision schema.
- `src/robinhood/receipts.ts` owns L2 receipt, L1 posting, reorg, and independent
  economic-finality assessment.
- `src/robinhood/query.ts` owns indexer reconciliation, bounded public
  pagination/retries, block-snapshot consistency, reorg invalidation, and
  read-only offline caching.
- `src/robinhood/virtuals.ts` owns offline structural launch-packet validation.

Files named `*-integrity.ts` and `generated-artifact-store.ts` are internal
capability stores. They prevent consumers from constructing runtime proofs,
prepared actions, sealed submissions, or generated artifact state by shape
alone; they are not public exports.

## Generated artifacts

- `contracts/robinhood/protocol_contract.json` is a byte-identical import of the
  sibling protocol artifact.
- `contracts/robinhood/*.abi.json` contains the 12 exact contract ABIs.
- `src/generated/robinhood_protocol.ts` is generated TypeScript metadata.
- `scripts/sync-robinhood-artifacts.mjs` is the only supported generator/import
  path and recomputes source and ABI SHA-256 values.

Never hand-edit generated output. Change and validate the protocol source, run
`npm run import:robinhood-contract`, inspect the diff, then require
`npm run sync:robinhood-artifacts:check` to reproduce it.

## Deployment evidence

`deployments/robinhood-mainnet.json` and
`deployments/robinhood-testnet.json` are release evidence, not address books.
Their closed schema is `deployments/robinhood-deployment.schema.json`. An
unconfigured manifest must have no contract addresses and cannot be promoted by
SDK code; a deployed manifest must supply the full 12-role suite, hashes,
verification URLs, transaction/block identity, audit evidence, and approval.

## Consumer surfaces

- `examples/` demonstrates offline or fail-closed Robinhood usage.
- `templates/` contains Node backend, Next route, and human-review oracle-worker
  starters.
- `src/cli.ts` provides a read-only Robinhood doctor.
- `tests/robinhood-*.test.ts` covers chain, assets, artifacts, actions,
  decisions, receipts, smart accounts, cache behavior, and Virtuals structure.
- `e2e/` and `scripts/dx-smoke.mjs` test the built/packed package as a consumer.

## Legacy code

The top-level Ethereum and Solana modules remain only because existing consumers
may still import their explicit package subpaths. They are excluded from the
canonical root. Changes to those modules are compatibility work and must not
weaken or alias the Robinhood contracts, assets, networks, or safety proofs.
