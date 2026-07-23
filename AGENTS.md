# Nakama SDK Agent Rules

## Source Of Truth

- Treat `../nakama-protocol` as the active Ethereum protocol source of truth.
- Keep the SDK aligned to the canonical protocol surface, not archived forks or parallel variants.
- Keep `README.md`, `docs/*.md`, exported symbols, fixtures, and tests aligned with actual SDK behavior.

## Owned Surfaces

- `src/`: authored Ethereum SDK surface plus explicit legacy read/migration subpaths.
- `tests/`: unit behavior, IDL parity, local protocol workspace parity, and fixtures.
- `scripts/`: verification, fixture-sync, and docs-sync helpers used locally and in CI.
- `docs/`: SDK docs plus `OMEGAX_DOCS_SYNC.json` for `omegax-docs` parity.
- `dist/` and `artifacts/`: generated outputs. Do not hand-edit them.

## Naming

- Do not introduce parallel compatibility names unless a versioned wire contract or retained migration boundary requires them.
- Prefer canonical terms such as `policy series`, `policy position`, `claim record`, and `protocol config`.
- When protocol naming changes, update the SDK surface in place instead of adding aliases by default.

## Workflow

- For protocol-facing calldata, readers, generated ABIs, deployment fixtures, or exported callables, update `src/`, tests, fixtures, and user-facing docs together.
- Refresh canonical Ethereum artifacts with `npm run import:ethereum-contract`; use `npm run sync:legacy-solana-idl` only for explicit Solana migration compatibility.
- Validate docs parity through `docs/OMEGAX_DOCS_SYNC.json` instead of leaving release-doc path or version drift behind.

## Review Routing

- Do not request Codex, GitHub Copilot, or other automated code-review bots as a default SDK PR step.
- If an automated review request would create only a usage-limit, quota, or "review unavailable" comment, skip it and report the local validation that actually ran.
- Use CODEOWNERS, branch protection, and `npm-production` environment approval only for the protected release and publish paths where they are required.
- Ask for human review only when branch protection requires it, when a release/publish approval is needed, or when a security/protocol trust-boundary change cannot be validated locally.
- Treat ignored `.superstack/` review artifacts and old one-off audit snapshots as historical context, not active blockers or instructions to request another review.

## Validation

- Run `npm test` for normal SDK validation.
- Run `npm run verify:protocol:local` when Ethereum protocol artifacts, fixtures, or workspace integration changes.
- Run `npm run docs:check` when touching `README.md`, `docs/`, or exported SDK callables mentioned there.
- Run `npm run docs:sync:check` when touching `docs/OMEGAX_DOCS_SYNC.json`, release docs, or SDK-to-`omegax-docs` mappings.
- Run `npm run typecheck`, `npm run lint`, and `npm run format:check` before handing off broad or release-sensitive changes.

## Done Means

- No new `legacy` or `v2` compatibility surface exists unless the live protocol requires it.
- Fixtures, parity tests, generated docs mappings, and public docs reflect the current SDK surface.
- Generated outputs remain script-owned.
