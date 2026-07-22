# SDK ↔ `omegax-docs` Sync Workflow

This workflow keeps `@nakama-health/protocol-sdk` and `docs.nakama.health` on the same public surface.

## Ownership model

- `nakama-sdk` is the source of truth for versioned package behavior and examples.
- `omegax-docs` is the public documentation portal and product-facing explanation layer.
- Every SDK release needs a matching portal sync record in `docs/OMEGAX_DOCS_SYNC.json`.

## Files that must stay aligned

- `README.md`
- `docs/GETTING_STARTED.md`
- `docs/WORKFLOWS.md`
- `docs/RECIPES.md`
- `docs/TOP_APIS.md`
- `docs/ERROR_CATALOG.md`
- `docs/API_REFERENCE.md`
- `docs/RELEASE_NOTES.md`
- `docs/TROUBLESHOOTING.md`
- `docs/OMEGAX_DOCS_SYNC.json`

Portal targets:

- `website/docs/sdk/overview.mdx`
- `website/docs/sdk/getting-started.md`
- `website/docs/sdk/workflows.md`
- `website/docs/sdk/recipes.md`
- `website/docs/sdk/top-apis.md`
- `website/docs/sdk/error-catalog.md`
- `website/docs/sdk/api-reference.md`
- `website/docs/sdk/release-notes.md`
- `website/docs/sdk/troubleshooting.md`

## Update flow

1. Update SDK docs in this repo.
2. Run:

```bash
npm run docs:check
npm run docs:sync:check
```

3. Update the mapped pages in `omegax-docs`.
4. Merge the `omegax-docs` change.
5. Refresh the sync manifest:

```bash
npm run docs:sync:update -- --docs-repo=../omegax-docs --synced-by=<maintainer>
```

6. Run:

```bash
npm run docs:sync:check:strict
```

7. Only tag and publish once strict sync passes.

## Strict sync requirements

`docs/OMEGAX_DOCS_SYNC.json` must contain:

- `sdkVersion` equal to `package.json`
- the canonical `omegax-docs` repo URL
- a merged docs commit SHA
- an ISO-8601 `syncedAt`
- a non-placeholder `syncedBy`
- a non-empty page mapping list
