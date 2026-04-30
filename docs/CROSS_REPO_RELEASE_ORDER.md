# Cross-Repo Release Order

Use this sequence to publish the canonical OmegaX protocol release train without docs or SDK drift.

## Target versions

- `omegax-protocol`: commit `f343039`
- `omegax-sdk`: `v0.8.4`
- `omegax-docs`: synced to the same canonical surface on `main`

## Local preparation order

1. Finish `omegax-protocol` release prep and local verification.
2. Finish `omegax-docs` protocol and SDK page updates locally.
3. Finish `omegax-sdk` bindings, docs, and parity verification locally.
4. Update `docs/OMEGAX_DOCS_SYNC.json` from the final docs repo commit.

## Push order

1. Push `omegax-protocol` `main`.
2. Push `omegax-docs` `main`.
3. Push `omegax-sdk` `main`.
4. Confirm docs deploy succeeded.
5. Tag and push SDK `v0.8.4`.
6. Confirm npm publish and clean install smoke.
7. Tag and push the matching protocol release marker only after approval.

## Why this order

- The protocol defines the canonical live contract.
- The docs portal becomes public immediately on push to `main`.
- The SDK strict docs-sync gate must point to the exact merged docs commit.
- The protocol should not be treated as publicly published until protocol, SDK, and docs all agree.
