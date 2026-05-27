# Script Taxonomy

The scripts in this directory are a mix of read-only checks, generated-artifact
refreshers, local smoke tests, and release governance helpers. Use this page to
pick the smallest safe command for the change in front of you.

## Read-Only Local Checks

These commands should not mutate tracked files or external services:

- `npm test`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run docs:check`
- `npm run docs:api:check`
- `npm run docs:sync:check`
- `npm run docs:sync:check:strict`
- `npm run runtime:check`
- `npm run protocol:artifact:check`
- `npm run cli:check`
- `npm run release:state`
- `npm run verify:release`
- `npm run verify:release:strict`
- `npm run security:secrets`
- `npm run security:install-scripts`
- `npm run security:release-governance`
- `npm run security:package`
- `npm run audit:prod`

## Tracked-Artifact Refreshers

These commands can update tracked files and should be followed by a git diff
review:

- `npm run generate:protocol-bindings`
- `npm run sync:idl-fixture`
- `npm run docs:api:generate`
- `npm run docs:sync:update`

## Local Build And Smoke Commands

These commands can create `dist/`, tarballs, temp directories, package installs,
or local network artifacts:

- `npm run build`
- `npm pack --dry-run`
- `npm run examples:check`
- `npm run dogfood:consumer`
- `npm run templates:check`
- `npm run dx:smoke`
- `npm run verify:protocol:local`
- `npm run test:protocol:localnet`

## External Or Live Checks

These commands may read GitHub, npm, or sibling repositories. They should remain
read-only unless their own help text says otherwise:

- `npm run release:state`
- `npm run security:release-governance:live`
- `npm run verify:protocol:local`
- `npm run docs:sync:update`

## Mutating Live Setup

These commands can change external configuration only when explicit apply flags
and maintainer-controlled environment variables are provided:

- `npm run security:release-governance:setup`

## Ownership Rules

- Generated protocol files belong to `npm run generate:protocol-bindings`.
- Generated API docs belong to `npm run docs:api:generate`.
- `docs/OMEGAX_DOCS_SYNC.json` belongs to `npm run docs:sync:update` once the
  matching `omegax-docs` commit exists.
- Template package manifests should keep their tracked
  `@omegax/protocol-sdk` dependency on the current root SDK version policy.
