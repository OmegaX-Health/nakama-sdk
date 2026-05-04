# Release Notes — `@omegax/protocol-sdk`

## Unreleased

## `0.8.5`

- Refreshed generated IDL, contract, and type bindings against the local `omegax-protocol` surface at commit `2326371`, covering 67 instructions, 35 accounts, and 134 types.
- Added PDA helpers for `deriveReserveAssetRailPda(...)`, `deriveCommitmentCampaignPda(...)`, `deriveCommitmentPaymentRailPda(...)`, `deriveCommitmentLedgerPda(...)`, and `deriveCommitmentPositionPda(...)`.
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
