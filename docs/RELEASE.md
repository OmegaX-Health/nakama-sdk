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
- GitHub `main` branch protection requires strict status checks, does not allow
  force pushes, and does not allow branch deletion.
- The `npm-production` environment requires at least two reviewers and prevents
  self-review.
- A repository Actions secret named `OMEGAX_GOVERNANCE_READ_TOKEN` is available
  to the unprotected `verify` job and can read repository branch and environment
  protection settings.
- Stale repository, organization, or environment secrets named `NPM_TOKEN` or
  `NODE_AUTH_TOKEN` have been removed before tagging. Publishing uses trusted
  publishing/OIDC instead of a long-lived npm token.
- npm trusted publishing is configured for this repository/package/environment;
  do not add a long-lived `NPM_TOKEN` or `NODE_AUTH_TOKEN` publish path.
- The release workflow keeps `verify` and `publish` split: `verify` runs the
  live governance gate with `OMEGAX_GOVERNANCE_READ_TOKEN`, and `publish`
  depends on `verify`, uses `npm-production`, requests `id-token: write`, runs
  `security:release-tag`, and publishes with provenance.

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
npm run release:state
npm run verify:release
npm run security:secrets
npm run security:install-scripts
npm run security:release-governance
npm run security:release-governance:live
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
`npm run security:release-governance` is the local static workflow check when
GitHub credentials are absent. `npm run security:release-governance:live` is the
authoritative live GitHub branch/environment/secret check. It uses
`OMEGAX_GOVERNANCE_TOKEN` or `GITHUB_TOKEN` when either is set, otherwise it
falls back to the local authenticated `gh` CLI token without printing it. Use
`npm run security:release-governance:live -- --json` when an automation needs
structured `failures` and `warnings` instead of stderr scraping.
`npm run release:state` is the read-only public release truth report: it compares
`package.json`, local git ahead/behind state, npm registry versions, remote tags,
and visible GitHub releases without mutating any external service. Use
`npm run release:state -- --json` when an automation needs structured evidence,
or `npm run release:state -- --fail-on-blockers` when local ahead/behind drift
should fail the command. External probes time out after 15 seconds by default;
set `OMEGAX_RELEASE_STATE_TIMEOUT_MS` only when an unusually slow local network
needs a larger read-only window.

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

The setup helper preserves existing required status checks, GitHub App-bound
checks, branch push restrictions, branch safety flags, pull-request review
dismissal/bypass allowances, and environment deployment branch policy while
adding the required review and protected publish gates. Review the dry-run JSON
before applying.

Then verify live state:

```bash
GITHUB_REPOSITORY=OmegaX-Health/omegax-sdk \
OMEGAX_REQUIRE_GITHUB_GOVERNANCE=1 \
npm run security:release-governance
```

Or use the packaged live gate:

```bash
npm run security:release-governance:live
```

The second reviewer must already have write, maintain, or admin access to this
repository, and npm trusted publishing must be configured in npm for the
`npm-production` GitHub environment. Reviewer lists must use real independent
GitHub users or teams; code-owner alias accounts, automation identities, and
duplicate reviewer entries do not satisfy the second-reviewer requirement. If an
alias account needs to be rejected during setup, pass it through
`OMEGAX_RELEASE_EXCLUDED_REVIEWERS`. Reviewer teams must have at least one
visible non-excluded member, so the token used for setup must be allowed to read
team membership; empty teams or teams made only of excluded code-owner aliases
fail the dry run.

The governance token is used in the release workflow's `verify` job before the
protected `npm-production` publish job starts, so configure it as a repository
Actions secret. An environment-only secret on `npm-production` will not be
visible to `verify`, and an organization secret is harder to audit from the
repo-level release gate.

Before tagging, confirm the release no longer has legacy npm publish tokens:

```bash
gh secret list --repo OmegaX-Health/omegax-sdk
gh secret list --org OmegaX-Health -a actions
gh secret list --repo OmegaX-Health/omegax-sdk --env npm-production
```

The release governance checker audits organization Actions secrets when the
token has org-secret visibility; otherwise it warns and treats org-secret review
as a human security checklist item.

If `NPM_TOKEN` or `NODE_AUTH_TOKEN` exists, remove it only after explicit
security approval:

```bash
gh secret delete NPM_TOKEN --repo OmegaX-Health/omegax-sdk
gh secret delete NODE_AUTH_TOKEN --repo OmegaX-Health/omegax-sdk
```

Remove organization or environment scoped npm tokens through the matching
GitHub UI or `gh secret delete` scope only after the same explicit approval.

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
npm run release:state
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
