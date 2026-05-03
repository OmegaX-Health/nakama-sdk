# OmegaX SDK ↔ Canonical Protocol Parity Checklist

This checklist tracks the current public SDK surface against the canonical `omegax-protocol` workspace.

## Canonical instruction builders

- [x] `activate_direct_premium_commitment`
- [x] `activate_treasury_credit_commitment`
- [x] `activate_waterfall_commitment`
- [x] `adjudicate_claim_case`
- [x] `allocate_capital`
- [x] `attach_claim_evidence_ref`
- [x] `attest_claim_case`
- [x] `authorize_claim_recipient`
- [x] `backfill_schema_dependency_ledger`
- [x] `claim_oracle`
- [x] `close_outcome_schema`
- [x] `configure_reserve_asset_rail`
- [x] `create_allocation_position`
- [x] `create_capital_class`
- [x] `create_commitment_campaign`
- [x] `create_commitment_payment_rail`
- [x] `create_domain_asset_vault`
- [x] `create_health_plan`
- [x] `create_liquidity_pool`
- [x] `create_obligation`
- [x] `create_policy_series`
- [x] `create_reserve_domain`
- [x] `deallocate_capital`
- [x] `deposit_commitment`
- [x] `deposit_into_capital_class`
- [x] `fund_sponsor_budget`
- [x] `init_pool_oracle_fee_vault`
- [x] `init_pool_treasury_vault`
- [x] `init_protocol_fee_vault`
- [x] `initialize_protocol_governance`
- [x] `mark_impairment`
- [x] `open_claim_case`
- [x] `open_funding_line`
- [x] `open_member_position`
- [x] `pause_commitment_campaign`
- [x] `process_redemption_queue`
- [x] `publish_reserve_asset_rail_price`
- [x] `record_premium_payment`
- [x] `refund_commitment`
- [x] `register_oracle`
- [x] `register_outcome_schema`
- [x] `release_reserve`
- [x] `request_redemption`
- [x] `reserve_obligation`
- [x] `rotate_protocol_governance_authority`
- [x] `set_pool_oracle`
- [x] `set_pool_oracle_permissions`
- [x] `set_pool_oracle_policy`
- [x] `set_protocol_emergency_pause`
- [x] `settle_obligation`
- [x] `settle_claim_case`
- [x] `update_allocation_caps`
- [x] `update_capital_class_controls`
- [x] `update_health_plan_controls`
- [x] `update_lp_position_credentialing`
- [x] `update_member_eligibility`
- [x] `update_oracle_profile`
- [x] `update_reserve_domain_controls`
- [x] `verify_outcome_schema`
- [x] `version_policy_series`
- [x] `withdraw_pool_oracle_fee_sol`
- [x] `withdraw_pool_oracle_fee_spl`
- [x] `withdraw_pool_treasury_sol`
- [x] `withdraw_pool_treasury_spl`
- [x] `withdraw_protocol_fee_sol`
- [x] `withdraw_protocol_fee_spl`

## Canonical account readers

- [x] `fetchProtocolGovernance`
- [x] `fetchReserveDomain`
- [x] `fetchDomainAssetVault`
- [x] `fetchDomainAssetLedger`
- [x] `fetchReserveAssetRail`
- [x] `fetchCommitmentCampaign`
- [x] `fetchCommitmentPaymentRail`
- [x] `fetchCommitmentLedger`
- [x] `fetchCommitmentPosition`
- [x] `fetchHealthPlan`
- [x] `fetchPlanReserveLedger`
- [x] `fetchPolicySeries`
- [x] `fetchSeriesReserveLedger`
- [x] `fetchMemberPosition`
- [x] `fetchMembershipAnchorSeat`
- [x] `fetchFundingLine`
- [x] `fetchFundingLineLedger`
- [x] `fetchClaimCase`
- [x] `fetchClaimAttestation`
- [x] `fetchObligation`
- [x] `fetchLiquidityPool`
- [x] `fetchCapitalClass`
- [x] `fetchPoolClassLedger`
- [x] `fetchLPPosition`
- [x] `fetchAllocationPosition`
- [x] `fetchAllocationLedger`
- [x] `fetchOracleProfile`
- [x] `fetchPoolOracleApproval`
- [x] `fetchPoolOracleFeeVault`
- [x] `fetchPoolOraclePermissionSet`
- [x] `fetchPoolOraclePolicy`
- [x] `fetchPoolTreasuryVault`
- [x] `fetchProtocolFeeVault`
- [x] `fetchOutcomeSchema`
- [x] `fetchSchemaDependencyLedger`

## Canonical PDA derivations

- [x] `deriveProtocolGovernancePda`
- [x] `deriveReserveDomainPda`
- [x] `deriveDomainAssetVaultPda`
- [x] `deriveDomainAssetVaultTokenAccountPda`
- [x] `deriveDomainAssetLedgerPda`
- [x] `deriveReserveAssetRailPda`
- [x] `deriveProtocolFeeVaultPda`
- [x] `derivePoolTreasuryVaultPda`
- [x] `derivePoolOracleFeeVaultPda`
- [x] `deriveHealthPlanPda`
- [x] `derivePlanReserveLedgerPda`
- [x] `derivePolicySeriesPda`
- [x] `deriveSeriesReserveLedgerPda`
- [x] `deriveMemberPositionPda`
- [x] `deriveMembershipAnchorSeatPda`
- [x] `deriveFundingLinePda`
- [x] `deriveFundingLineLedgerPda`
- [x] `deriveCommitmentCampaignPda`
- [x] `deriveCommitmentPaymentRailPda`
- [x] `deriveCommitmentLedgerPda`
- [x] `deriveCommitmentPositionPda`
- [x] `deriveClaimCasePda`
- [x] `deriveObligationPda`
- [x] `deriveLiquidityPoolPda`
- [x] `deriveCapitalClassPda`
- [x] `derivePoolClassLedgerPda`
- [x] `deriveLpPositionPda`
- [x] `deriveAllocationPositionPda`
- [x] `deriveAllocationLedgerPda`
- [x] `deriveOracleProfilePda`
- [x] `derivePoolOracleApprovalPda`
- [x] `derivePoolOracleFeeVaultPda`
- [x] `derivePoolOraclePolicyPda`
- [x] `derivePoolOraclePermissionSetPda`
- [x] `derivePoolTreasuryVaultPda`
- [x] `deriveProtocolFeeVaultPda`
- [x] `deriveClaimAttestationPda`
- [x] `deriveOutcomeSchemaPda`
- [x] `deriveSchemaDependencyLedgerPda`

## Reserve-model helper parity

- [x] `recomputeReserveBalanceSheet(...)`
- [x] `sumReserveBalanceSheets(...)`
- [x] `buildSponsorReadModel(...)`
- [x] `buildCapitalReadModel(...)`
- [x] `buildMemberReadModel(...)`

## Legacy retirement assertions

- [x] `create_pool` is absent from the canonical surface
- [x] `set_pool_status` is absent from the canonical surface
- [x] `pool_type` is absent from the canonical public SDK
- [x] no legacy pool-first compatibility aliases remain in exports

## Verification gates

- [x] `npm run build`
- [x] `npm run test`
- [x] `tests/idl-parity.test.ts`
- [x] `tests/protocol-contract-parity.test.ts`
- [x] `npm run verify:protocol:local`
