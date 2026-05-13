# Release Guide — `@omegax/protocol-sdk`

This is the maintainer flow for publishing the canonical SDK release.

## Release targets

- Protocol: `omegax-protocol` commit `763c7da`
- Protocol contract hash:
  `f95822562b0c1f1b2d5bddde10f63d98d49dca7135c879011e432d0706735222`
- SDK: `@omegax/protocol-sdk v0.8.10`
- Docs portal: `docs.omegax.health` content synced to the matching SDK surface

## Preconditions

- `package.json` version is final.
- `docs/RELEASE_NOTES.md` is updated for the version being published.
- `docs/OMEGAX_DOCS_SYNC.json` points at the merged docs commit.
- Each docs sync mapping includes a current `sdkDocSha256` content hash.
- Local protocol parity is green against the intended sibling `omegax-protocol` workspace.
- The SDK release tag is annotated, signed, and matches `package.json`.
- SDK commits include `Signed-off-by` trailers because CI enforces DCO.
- GitHub `main` branch protection requires at least one approving review and
  CODEOWNERS review before release tags are cut.
- The `npm-production` environment requires at least two reviewers, prevents
  self-review, and has an `OMEGAX_GOVERNANCE_READ_TOKEN` secret that can read
  repository branch and environment protection settings.
- npm trusted publishing is configured for this repository/package/environment;
  do not add a long-lived `NPM_TOKEN` or `NODE_AUTH_TOKEN` publish path.

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
npm run runtime:check
npm run protocol:artifact:check
npm run examples:check
npm run dogfood:consumer
npm run cli:check
npm run templates:check
npm run dx:smoke
npm run verify:release
npm run security:secrets
npm run security:install-scripts
npm run security:release-governance
npm run security:package
npm run audit:prod
npm run verify:protocol:local
npm run test:protocol:localnet
npm pack --dry-run
```

Use `npm run verify:release:strict` after the docs mirror commit is available.
Use `npm run verify:release:protocol` before tagging or publishing when the
sibling protocol checkout is part of the release decision.
Treat `verify:release:strict` as the canonical aggregate local release gate;
the expanded checklist above is kept for readable audit trails and one-off
reruns.

Production moderate-or-higher dependency advisories are release blockers unless
`npm run audit:prod` identifies a reviewed upstream no-fix advisory path. Current
Solana-chain moderate advisories are allowed only through that script's narrow
documented exception rather than forced transitive overrides.

## GitHub release governance setup

Release governance setup is a live GitHub admin change. The helper defaults to a
dry run and requires explicit reviewer input before it can mutate anything:

```bash
GITHUB_REPOSITORY=OmegaX-Health/omegax-sdk \
OMEGAX_RELEASE_REVIEWERS=marinosabijan,<second-reviewer-login> \
npm run security:release-governance:setup
```

After reviewing the planned branch and environment settings, apply them only with
explicit approval:

```bash
GITHUB_REPOSITORY=OmegaX-Health/omegax-sdk \
OMEGAX_RELEASE_REVIEWERS=marinosabijan,<second-reviewer-login> \
npm run security:release-governance:setup -- --apply
```

Then verify live state:

```bash
GITHUB_REPOSITORY=OmegaX-Health/omegax-sdk \
OMEGAX_REQUIRE_GITHUB_GOVERNANCE=1 \
npm run security:release-governance
```

The second reviewer must already have repository access, and npm trusted
publishing must be configured in npm for the `npm-production` GitHub environment.

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
5. Tag SDK `v0.8.10`.
6. Let the release workflow complete the uncredentialed `verify` job.
7. Approve the protected `npm-production` publish job only after verify is green.
8. Confirm `npm publish` and clean import smoke pass.
9. Tag the matching protocol release marker only after the protocol repo owner approves that public tag.

The publish job has OIDC permission and intentionally does not use `NPM_TOKEN`.
Configure npm trusted publishing for `npm-production`; a token-based publish path
is a release-governance regression unless it goes through a separate explicit
security review.

## Post-publish verification

```bash
npm view @omegax/protocol-sdk version
```

Then run a clean install/import smoke test:

```bash
npm init -y
npm install @omegax/protocol-sdk@0.8.10
node --input-type=module -e "const m = await import('@omegax/protocol-sdk'); console.log(Object.keys(m).length)"
```

The `v0.8.9` package is published. Its release workflow failed after publish in
the clean install/import smoke because npm registry visibility lagged behind the
workflow retry window. Future tags should use the extended post-publish retry
window before treating that smoke as a real package failure.
