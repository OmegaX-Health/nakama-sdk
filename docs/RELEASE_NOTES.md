# Release Notes — `@omegax/protocol-sdk`

## `0.8.9`

- Hardened `validateSignedClaimTx(...)` so submitted `ClaimIntent` transaction
  bytes can no longer act as their own expected-message proof; claim intake now
  requires the service's trusted `expectedUnsignedTxBase64`.

## `0.8.8`

- Refreshed generated IDL, contract, and type bindings against the current local
  `omegax-protocol` surface at commit `763c7da`, covering 62 instructions, 31
  accounts, and 122 types.
- Reflected the latest allocation guard errors, including inactive liquidity
  pools and inactive or deallocation-only allocation positions.
- Removed the retired commitment-campaign builders, readers, PDA helpers, seed
  constants, and public model constants from the current SDK surface.
- Added checked governance authority accept and cancellation builders for the
  expanded governance-transfer lifecycle.
- Updated reserve asset rail configuration for the current protocol account and
  argument shape, including `maxConfidenceBps`.
- Added direct `buildSettleClaimCaseTx(...)` and selected-asset
  `buildSettleClaimCaseSelectedAssetTx(...)` helpers, plus safe-client parameter
  aliases and preflight-aware safe-client methods.
- Realigned funding-line, member-position, obligation, and settlement builders
  with the latest optional account slots and reserve-asset-rail requirements.
- Fixed the packed `omegax-sdk` CLI entrypoint so installs invoked through
  `node_modules/.bin` run the CLI instead of exiting quietly through symlinked
  bin paths.
- Regenerated TypeDoc markdown and refreshed authored docs, release notes, and
  release coordination material for the `0.8.8` publish train.

## `0.8.7`

- Added the full onboarding DX pass for external app/backend and oracle-service
  builders, including safe-client-first docs, runnable smoke/app/oracle
  examples, and a packed consumer import smoke.
- Exported `@omegax/protocol-sdk/protocol_models` and
  `@omegax/protocol-sdk/transactions` as documented public subpaths.
- Added public typed SDK errors through `@omegax/protocol-sdk/errors`.
- Added named safe-client public types such as `SafeProtocolClient`,
  `SafeProtocolClientOptions`, and safe builder parameter aliases so IDE hover
  output exposes stable SDK concepts instead of anonymous inferred types.
- Added a tracked external consumer dogfood app, generated TypeDoc markdown, and
  a single release verifier script.
- Added the public `omegax-sdk` CLI with `doctor`, `scaffold`, and `examples`,
  plus shipped node-backend, Next.js route, and oracle-worker templates.
- Added curated top-API and error-catalog docs for health app, hospital/backend,
  oracle, and sponsor/capital builder lanes.
- Hardened `npm run docs:check` so docs that mention package subpaths fail if
  `package.json#exports` does not expose them.
- Synced the settlement account surface with the active protocol IDL so
  `settle_obligation` includes the optional `pool_oracle_fee_vault`,
  `pool_oracle_policy`, and `oracle_fee_attestation` slots, and added
  fail-closed SDK checks for partial oracle-fee settlement account scope.
- Fixed the public settle-obligation builder type so settlement outflow accounts
  are required on `buildSettleObligationTx(...)`, not reserve-only builders.
- Expanded `createSafeProtocolClient(...)` across sponsor funding, premium
  payment, LP deposit/redemption, redemption queue processing, and
  fee/treasury/oracle-fee withdrawal flows, with settlement custody preflight
  requiring `recipientOwnerAddress`.
- Added `verifyProtocolOracleAttestation(...)` for settlement-grade oracle
  evidence checks covering signature, expiry, expected protocol context,
  trusted verifier identity, audience, nonce, scoped pool accounts, and
  verifier-side optional-scope shape.
- Removed the SPL/token dev dependency from the localnet smoke by inlining the
  minimal classic-token setup instructions, pinned the transitive Solana RPC
  `uuid` path to `14.0.0`, and removed the now-stale production audit
  allowance so raw and curated npm audits both fail closed.
- Expanded claim-intent replay coverage for tampered signatures, wrong signers,
  malformed base64, v0 transactions, lookup-table mutation, missing fee payer,
  and blockhash-only refresh.
- Pinned gitleaks installation in CI/release secret scans and made CI fail
  closed if the scanner cannot run.

## `0.8.5`

- Refreshed generated IDL, contract, and type bindings against the local `omegax-protocol` surface at commit `2326371`, covering 67 instructions, 35 accounts, and 134 types.
- Added PDA helper coverage for reserve asset rails and the then-current commitment
  account model.
- Added `buildInitializeSeriesReserveLedgerTx(...)` for initializing extra-asset series reserve accounting.
- Exported canonical commitment, reserve asset role/source, membership mode/gate/proof, claim-attestation decision, pool-oracle permission, oracle type, schema family/visibility, and native SOL mint constants from the root package and protocol-model module.
- Updated `buildAttestClaimCaseTx(...)` for the expanded local protocol account list, including `protocol_governance`, `health_plan`, `funding_line`, optional pool oracle scope accounts, writable `claim_case`, and the current `ClaimAttestation` fields.
- Added `createSafeProtocolClient(...)`, canonical program ID enforcement with an explicit unsafe override for dev/test usage, SPL custody preflights, stricter raw argument encoding, and fail-closed optional account scope checks.
- Hardened `validateSignedClaimTx(...)` with claim-intent IDs, nonces, expiry, signer binding, blockhash-only refresh support, and exact-message mode for operator flows.
- Added protocol-bound oracle attestations with local Ed25519 verification and rejection of non-canonical JSON payloads, partial pool scopes, and malformed signer output.
- Split release verification from npm publish, added secret and install-script checks, package manifest allowlisting, signed tag checks, npm preflight, and post-publish clean install/import smoke.
- Kept SDK docs and docs-portal mappings on the release-ready `0.8.5` target without publishing, pushing, or deploying.

## `0.8.4`

- Refreshed generated IDL, contract, and type bindings against the current post-fee-vault `omegax-protocol` surface at commit `f343039`.
- Folded in the security PRs that bind protocol-client builders to the configured program id, keep domain vault custody protocol-controlled, derive membership-anchor seats from pubkey bytes, and use the selected program id for omitted optional accounts.
- Updated `buildCreateDomainAssetVaultTx(...)` so it derives the canonical `domain_asset_vault_token` PDA inline; stale `vaultTokenAccountAddress` inputs no longer redirect custody.
- Added PDA helpers for `deriveDomainAssetVaultTokenAccountPda(...)`, `deriveProtocolFeeVaultPda(...)`, `derivePoolTreasuryVaultPda(...)`, and `derivePoolOracleFeeVaultPda(...)`.
- Reflected the new fee-vault lifecycle, pool-treasury deposit/redemption fee accounting, and protocol-owned SPL rail setup in the SDK localnet smoke.
- Hardened `simulateSignedTx(...)` so signature-verification downgrades fail closed by default and require explicit `allowSigVerifyFallback: true`.
- Added simulation metadata fields so integrations can reject unverified preflight results before claim or intake processing.
- Updated the local protocol verification harness to clone the classic SPL Token program into the validator before token CPI smoke tests.
- Restored a production moderate-audit CI gate with a narrow allowance for the current no-fix Solana-chain `uuid` advisory path.

## `0.8.3`

- Refreshed generated IDL, contract, and type bindings against `omegax-protocol v0.3.1`.
- Updated reserve-domain bootstrap ergonomics so `buildCreateDomainAssetVaultTx(...)` requires a concrete vault token account instead of allowing a zero placeholder.
- Reflected the new custody-aware inflow surface: sponsor funding, premium payments, and LP capital deposits require source token account, vault token account, mint, and token program accounts.
- Reflected the redemption hardening: `request_redemption` and `process_redemption_queue` take shares only, while asset payout is derived on-chain from NAV and queued redemption state.

## `0.8.2`

- Fixed `buildOpenMemberPositionTx(...)` so invite-only enrollment keeps `inviteAuthorityAddress` as an optional signer account, matching the canonical `open_member_position` contract.
- Added regression coverage for invite-authority account metas so token/invite-gated member builders do not silently degrade back to open-member posture.
- Kept the package on the devnet-first public release track while preserving the current `omegax-protocol v0.3.0` contract target.

## `0.8.1`

- Refreshed generated IDL, contract, and type bindings against the latest public `omegax-protocol v0.3.0` surface.
- Updated SDK parity for the linked protection-claim and obligation-settlement hardening, including the newer obligation lifecycle account metadata and tighter claim linkage invariants.
- Kept the package on the devnet-first public release track while preserving the current `omegax-protocol v0.3.0` contract target.

## `0.8.0`

- Added first-class SDK coverage for the current oracle and schema registry surface, including canonical builders and generated contract parity for oracle profiles, pool oracle controls, outcome schemas, and schema dependency ledgers.
- Exported the new `@omegax/protocol-sdk/oracle` module for attestation workflows, including `createOracleSignerFromEnv(...)`, `createOracleSignerFromKmsAdapter(...)`, and `attestOutcome(...)`.
- Added `buildAttestClaimCaseTx(...)` plus the supporting generated bindings and PDA helpers so oracle services can anchor schema-bound claim-case attestations on-chain without dropping to custom instruction packing.
- Refreshed protocol bindings, PDA helpers, and parity tests so the SDK matches the latest canonical `omegax-protocol` `main` surface and passes the local protocol verification gate.
- Kept the package on the devnet-first public release track while preserving the current `omegax-protocol v0.3.0` contract target.

## `0.7.0`

- Shipped the canonical health-capital-markets SDK surface for governance, reserve domains, health plans, claims, obligations, capital classes, allocations, and reserve-aware read models.
- Removed stale pool-first compatibility assumptions from the public SDK surface and docs.
