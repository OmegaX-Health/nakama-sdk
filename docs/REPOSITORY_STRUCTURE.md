# Repository Structure

This repo has one main job: keep the TypeScript SDK aligned with the canonical
OmegaX protocol surface while making the public integration surface easy to
inspect, test, and package.

## Source Ownership

- `src/index.ts` is the root package barrel. Keep it small and boring.
- `src/protocol.ts` owns the public protocol builders, account readers, safe
  client, and transaction assembly helpers.
- `src/protocol_seeds.ts` owns deterministic PDA derivation and program ID
  helpers.
- `src/protocol_models.ts` owns canonical constants and reserve/read-model
  helpers.
- `src/claims.ts`, `src/oracle.ts`, `src/rpc.ts`, `src/transactions.ts`,
  `src/errors.ts`, `src/magicblock.ts`, `src/types.ts`, and `src/utils.ts` own
  their exported package subpaths.
- `src/internal/` is for authored implementation details that should not become
  package subpaths. For example, `src/internal/protocol-codec.ts` owns IDL
  encoding, account decoding, and hash normalization used by `src/protocol.ts`.
- `src/generated/` is script-owned output from the canonical protocol artifacts.
  Do not hand-edit it.

## Support Surfaces

- `tests/` contains unit, parity, release-state, and protocol-workspace checks.
  Shared test adapters live in `tests/support/`.
- `scripts/` contains local and CI verification commands. See
  `../scripts/README.md` for the script taxonomy.
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
- Generated protocol bindings, IDL fixtures, and generated API docs must be
  refreshed through the project scripts, not edited by hand.
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
- Protocol-facing builders, readers, seeds, or fixtures:
  `npm run verify:protocol:local`.
- Release-sensitive changes: follow `SDK_QUALITY.md` and `docs/RELEASE.md`
  before tagging or publishing.
