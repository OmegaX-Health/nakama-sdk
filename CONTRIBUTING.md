# Contributing to `@nakama-health/protocol-sdk`

Thanks for helping improve the Nakama SDK.

## Development setup

- Node.js `>=20`
- npm `>=10`

```bash
npm ci
npm run build
npm test
```

## Common scripts

- `npm run build` — compile TypeScript to `dist/`
- `npm test` — run unit + parity tests
- `npm run docs:check` — verify documented SDK callables exist in source
- `npm run docs:sync:check` — verify SDK docs sync manifest against current version/mappings
- `npm run docs:sync:update -- --docs-repo=../omegax-docs --synced-by=<you>` — update sync metadata after docs merge
- `npm run sync:idl-fixture` — refresh `tests/fixtures/omegax_protocol.idl.json`

## Protocol parity workflow

The strict parity test is self-contained via `tests/fixtures/omegax_protocol.idl.json`.

To validate against a local protocol checkout directly:

```bash
OMEGAX_PROTOCOL_IDL_PATH=/path/to/omegax_protocol.json npm test
```

When protocol accounts/instructions change:

1. Update protocol code/IDL in `omegax-protocol`.
2. Run `npm run sync:idl-fixture` in this repo.
3. Update SDK builders/readers and tests.
4. Ensure `npm run build` and `npm test` pass.
5. If the oracle service consumes the changed SDK surface, run `npm run sdk:refresh` and `npm run sdk:check` in `protocol-oracle-service`.
6. Only update Flutter if the service DTO or app-facing behavior changed.

## Pull requests

- Keep changes focused and minimal.
- Add or update tests for behavior changes.
- Do not commit secrets or private keys.
- Update docs when public API behavior changes.
- Sign every commit with DCO sign-off via `git commit -s` so each commit message includes `Signed-off-by: Your Name <you@example.com>`.

## Licensing and contribution terms

- This repository is licensed under Apache-2.0.
- Contributions are accepted on an inbound=outbound basis: by submitting a contribution, you agree that your contribution is licensed under the repository's Apache-2.0 license.
- Contributors retain copyright in their own work unless they explicitly assign it elsewhere.
- We do not currently require a separate CLA for this repository.
- Public notices and repository metadata may describe this project as maintained by `OMEGAX HEALTH FZCO and contributors`.

## Release expectations

Before a release tag:

```bash
npm ci
npm run build
npm test
npm run docs:check
npm run docs:sync:check:strict
npm pack --dry-run
npm audit --omit=dev
```
