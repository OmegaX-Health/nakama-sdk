# OmegaX SDK Agent Rules

## Source Of Truth

- Treat `../omegax-protocol` as the active protocol source of truth while the project is devnet-first.
- Keep the SDK aligned to the canonical protocol surface, not archived forks or parallel variants.
- Keep `README.md`, `docs/*.md`, exported symbols, fixtures, and tests aligned with actual SDK behavior.

## Owned Surfaces

- `src/`: authored SDK surface, including builders, readers, RPC helpers, and exports.
- `tests/`: unit behavior, IDL parity, local protocol workspace parity, and fixtures.
- `scripts/`: verification, fixture-sync, and docs-sync helpers used locally and in CI.
- `docs/`: SDK docs plus `OMEGAX_DOCS_SYNC.json` for `omegax-docs` parity.
- `dist/` and `artifacts/`: generated outputs. Do not hand-edit them.

## Naming

- Do not introduce `v2`, `legacy`, or parallel compatibility names unless the live protocol still requires them.
- Prefer canonical terms such as `policy series`, `policy position`, `claim record`, and `protocol config`.
- When protocol naming changes, update the SDK surface in place instead of adding aliases by default.

## Workflow

- For protocol-facing builders, readers, seeds, account fixtures, or exported callables, update `src/`, tests, fixtures, and user-facing docs together.
- Refresh `tests/fixtures/omegax_protocol.idl.json` with `npm run sync:idl-fixture` when the canonical IDL changes.
- Validate docs parity through `docs/OMEGAX_DOCS_SYNC.json` instead of leaving release-doc path or version drift behind.

## Review Routing

- Do not request Codex, GitHub Copilot, or other automated code-review bots as a default SDK PR step.
- If an automated review request would create only a usage-limit, quota, or "review unavailable" comment, skip it and report the local validation that actually ran.
- Use CODEOWNERS, branch protection, and `npm-production` environment approval only for the protected release and publish paths where they are required.
- Ask for human review only when branch protection requires it, when a release/publish approval is needed, or when a security/protocol trust-boundary change cannot be validated locally.
- Treat ignored `.superstack/` review artifacts and old one-off audit snapshots as historical context, not active blockers or instructions to request another review.

## Validation

- Run `npm test` for normal SDK validation.
- Run `npm run verify:protocol:local` when protocol-facing code, seeds, fixtures, or workspace integration changes.
- Run `npm run docs:check` when touching `README.md`, `docs/`, or exported SDK callables mentioned there.
- Run `npm run docs:sync:check` when touching `docs/OMEGAX_DOCS_SYNC.json`, release docs, or SDK-to-`omegax-docs` mappings.
- Run `npm run typecheck`, `npm run lint`, and `npm run format:check` before handing off broad or release-sensitive changes.

## Done Means

- No new `legacy` or `v2` compatibility surface exists unless the live protocol requires it.
- Fixtures, parity tests, generated docs mappings, and public docs reflect the current SDK surface.
- Generated outputs remain script-owned.
