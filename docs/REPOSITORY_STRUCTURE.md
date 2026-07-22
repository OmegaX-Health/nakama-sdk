# Repository Structure

This repo has one main job: keep the TypeScript SDK aligned with the canonical
Nakama protocol surface while making the public integration surface easy to
inspect, test, and package.

## Source Ownership

- `src/index.ts` is the root package barrel. Keep it small and boring.
- `src/ethereum.ts` owns Ethereum mainnet addresses, CAIP identifiers, the
  EIP-1193 wallet boundary, and the viem public client.
- `src/ethereum_contract.ts` owns ABI helpers, bytecode normalization, receipt
  finality, transaction-intent checks, and the deployment-verifier re-export.
- `src/ethereum_deployment.ts` owns schema-v3 manifest validation and live
  factory, policy-registry, core, ReserveVault-template, and Sourcify checks.
- `src/ethereum_oracle.ts` owns ClaimRecipient EIP-712 authorization bound to
  the Nakama Policy Registry, including EOA/ERC-1271 verification and replay
  protection.
- `src/errors.ts` owns typed Ethereum failures as well as retained migration
  errors.
- `src/internal/` is for authored implementation details that should not become
  package subpaths.
- `src/generated/` is script-owned output from the canonical protocol artifacts.
  Do not hand-edit it.

The Solana modules (`src/protocol.ts`, `src/protocol_seeds.ts`,
`src/protocol_models.ts`, `src/claims.ts`, `src/oracle.ts`, `src/rpc.ts`,
`src/transactions.ts`, and `src/magicblock.ts`) remain migration-only. New
integrations use the Ethereum modules.

## Support Surfaces

- `tests/` contains unit, parity, release-state, and protocol-workspace checks.
  Shared test adapters live in `tests/support/`.
- `scripts/` contains local and CI verification commands. See
  `../scripts/README.md` for the script taxonomy.
- `contracts/ethereum/` contains four canonical ABI/metadata pairs;
  `deployments/` contains the schema-v3 fail-closed manifest and final schema.
- `docs/` contains authored SDK docs plus generated TypeDoc markdown under
  `docs/generated/`.
- `examples/` and `templates/` are packaged developer experience fixtures.
- `e2e/` contains the protocol frontend adapter and local smoke harness.
- `typecheck/` contains compile-only consumer fixtures.
- `dist/` and `artifacts/` are generated outputs. They are not authored source.

## Change Rules

- Public SDK behavior belongs in exported `src/*.ts` modules and must remain
  represented in `package.json#exports`, `SDK_RUNTIME.json`, docs, and tests.
- Internal helpers belong under `src/internal/` when they reduce public-module
  size or clarify ownership without creating a new public API.
- Generated Ethereum bindings and generated API docs must be refreshed through
  the project scripts, not edited by hand. Anchor IDL fixtures are legacy
  migration assets.
- Protocol-facing changes should update builders/readers, tests, fixtures, and
  user-facing docs together.
- Release or docs-sync changes should keep `docs/OMEGAX_DOCS_SYNC.json` honest
  against the real `omegax-docs` commit.

## Validation By Change Type

- Authored TypeScript: `npm run typecheck`, `npm run lint`, `npm test`.
- Formatting-sensitive edits: `npm run format:check`.
- Public exports or package shape: `npm run build`, `npm run runtime:check`,
  `npm run security:package`.
- Docs: `npm run docs:check`, and `npm run docs:api:check` when generated API
  markdown should change.
- Ethereum artifact, ABI, metadata, or deployment-schema changes:
  `npm run sync:ethereum-abi:check` and `npm run verify:protocol:local`.
- Legacy Solana builders, readers, seeds, or fixtures:
  `npm run verify:legacy-solana:local`.
- Release-sensitive changes: follow `SDK_QUALITY.md` and `docs/RELEASE.md`
  before tagging or publishing.
