# Cross-Repo Release Order

Use this sequence to publish the canonical Nakama protocol release train without docs or SDK drift.

## Target versions

- `nakama-protocol`: schema-v3 protocol artifact SHA-256
  `c894cb59f3bd83c4f55ea93a4896ba5b1b54a49965c6801ab06b506b716093e1`
- `nakama-sdk`: `v0.9.0`
- `omegax-docs`: synced to the same canonical surface on `main`

## Local preparation order

1. Finish `nakama-protocol` release prep and its four-contract artifact
   verification.
2. Finish `omegax-docs` protocol and SDK page updates locally.
3. Import all four ABIs and metadata records into `nakama-sdk`, then finish
   schema-v3 manifest, docs, package, and parity verification locally.
4. Update `docs/OMEGAX_DOCS_SYNC.json` from the final docs repo commit.

## Push order

1. Push `nakama-protocol` `main`.
2. Push `omegax-docs` `main`.
3. Push `nakama-sdk` `main`.
4. Confirm docs deploy succeeded.
5. Tag and push SDK `v0.9.0` only after the Robinhood artifact, runtime
   provenance, package gates, and external release approvals all pass.
6. Confirm npm publish and clean install smoke.
7. Tag and push the matching protocol release marker only after approval.

## Why this order

- The protocol defines the canonical factory, policy registry, core, and
  ReserveVault template.
- The docs portal becomes public immediately on push to `main`.
- The SDK strict docs-sync gate must point to the exact merged docs commit.
- The protocol should not be treated as publicly published until protocol, SDK, and docs all agree.
- Later protocol repo commits may update docs without changing the SDK target.
  The SDK target changes when the protocol artifact, any standalone ABI, or the
  deployment schema changes.
