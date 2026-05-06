# Release Guide — `@omegax/protocol-sdk`

This is the maintainer flow for publishing the canonical SDK release.

## Release targets

- Protocol: `omegax-protocol` commit `2326371`
- SDK: `@omegax/protocol-sdk v0.8.6`
- Docs portal: `docs.omegax.health` content synced to the matching SDK surface

## Preconditions

- `package.json` version is final.
- `docs/RELEASE_NOTES.md` is updated for the version being published.
- `docs/OMEGAX_DOCS_SYNC.json` points at the merged docs commit.
- Each docs sync mapping includes a current `sdkDocSha256` content hash.
- Local protocol parity is green against the intended sibling `omegax-protocol` workspace.
- SDK commits include `Signed-off-by` trailers because CI enforces DCO.

## Local release checks

```bash
npm ci
npm run typecheck
npm run lint
npm run format:check
npm run build
npm test
npm run docs:api:check
npm run docs:check
npm run docs:sync:check:strict
npm run examples:check
npm run dogfood:consumer
npm run cli:check
npm run templates:check
npm run dx:smoke
npm run verify:release
npm run security:secrets
npm run security:install-scripts
npm run security:package
npm run audit:prod
npm run verify:protocol:local
npm run test:protocol:localnet
npm pack --dry-run
```

Use `npm run verify:release:strict` after the docs mirror commit is available.
Use `npm run verify:release:protocol` before tagging or publishing when the
sibling protocol checkout is part of the release decision.

Production moderate-or-higher dependency advisories are release blockers unless
`npm run audit:prod` identifies a reviewed upstream no-fix advisory path. Current
Solana-chain moderate advisories are allowed only through that script's narrow
documented exception rather than forced transitive overrides.

## Protocol binding refresh

Whenever the protocol IDL or contract artifact changes:

```bash
npm run generate:protocol-bindings
```

Commit regenerated artifacts with the source change. Do not hand-edit generated protocol bindings.

## Release publish order

1. Finalize and push `omegax-protocol` `main`.
2. Finalize and push `omegax-docs` `main`.
3. Update `docs/OMEGAX_DOCS_SYNC.json` with the merged docs commit.
4. Finalize and push `omegax-sdk` `main`.
5. Tag SDK `v0.8.6`.
6. Let the release workflow complete the uncredentialed `verify` job.
7. Approve the protected `npm-production` publish job only after verify is green.
8. Confirm `npm publish` and clean import smoke pass.
9. Tag the matching protocol release marker only after the protocol repo owner approves that public tag.

The publish job is the only job with npm credentials and OIDC. Prefer npm trusted publishing for `npm-production`; if token publishing is still required, use a granular npm automation token scoped only to this package.

## Post-publish verification

```bash
npm view @omegax/protocol-sdk version
```

Then run a clean install/import smoke test:

```bash
npm init -y
npm install @omegax/protocol-sdk@0.8.6
node --input-type=module -e "const m = await import('@omegax/protocol-sdk'); console.log(Object.keys(m).length)"
```
