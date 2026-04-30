import test from 'node:test';
import assert from 'node:assert/strict';

import * as sdk from '../src/index.js';

function instructionToBuilderBase(name: string): string {
  return name
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');
}

const pdaSeedFunctionMap: Record<string, string> = {
  protocol_governance: 'deriveProtocolGovernancePda',
  reserve_domain: 'deriveReserveDomainPda',
  domain_asset_vault: 'deriveDomainAssetVaultPda',
  domain_asset_vault_token: 'deriveDomainAssetVaultTokenAccountPda',
  domain_asset_ledger: 'deriveDomainAssetLedgerPda',
  health_plan: 'deriveHealthPlanPda',
  plan_reserve_ledger: 'derivePlanReserveLedgerPda',
  policy_series: 'derivePolicySeriesPda',
  series_reserve_ledger: 'deriveSeriesReserveLedgerPda',
  member_position: 'deriveMemberPositionPda',
  membership_anchor_seat: 'deriveMembershipAnchorSeatPda',
  funding_line: 'deriveFundingLinePda',
  funding_line_ledger: 'deriveFundingLineLedgerPda',
  claim_case: 'deriveClaimCasePda',
  obligation: 'deriveObligationPda',
  liquidity_pool: 'deriveLiquidityPoolPda',
  capital_class: 'deriveCapitalClassPda',
  pool_class_ledger: 'derivePoolClassLedgerPda',
  lp_position: 'deriveLpPositionPda',
  allocation_position: 'deriveAllocationPositionPda',
  allocation_ledger: 'deriveAllocationLedgerPda',
  oracle_profile: 'deriveOracleProfilePda',
  pool_oracle_approval: 'derivePoolOracleApprovalPda',
  pool_oracle_policy: 'derivePoolOraclePolicyPda',
  pool_oracle_permission_set: 'derivePoolOraclePermissionSetPda',
  protocol_fee_vault: 'deriveProtocolFeeVaultPda',
  pool_treasury_vault: 'derivePoolTreasuryVaultPda',
  pool_oracle_fee_vault: 'derivePoolOracleFeeVaultPda',
  outcome_schema: 'deriveOutcomeSchemaPda',
  schema_dependency_ledger: 'deriveSchemaDependencyLedgerPda',
  claim_attestation: 'deriveClaimAttestationPda',
};

test('every canonical instruction has transaction and instruction builders', () => {
  const client = sdk.createProtocolClient(
    sdk.createConnection('http://127.0.0.1:8899', 'confirmed'),
    sdk.PROTOCOL_PROGRAM_ID,
  ) as Record<string, unknown>;

  const missing = sdk
    .listProtocolInstructionNames()
    .flatMap((instructionName) => {
      const builderBase = instructionToBuilderBase(instructionName);
      return [`build${builderBase}Instruction`, `build${builderBase}Tx`].filter(
        (methodName) => typeof client[methodName] !== 'function',
      );
    });

  assert.deepEqual(missing, []);
});

test('every canonical account has a reader entrypoint', () => {
  const client = sdk.createProtocolClient(
    sdk.createConnection('http://127.0.0.1:8899', 'confirmed'),
    sdk.PROTOCOL_PROGRAM_ID,
  ) as Record<string, unknown>;

  const missing = sdk.listProtocolAccountNames().filter((accountName) => {
    const methodName =
      accountName === 'ProtocolGovernance'
        ? 'fetchProtocolGovernance'
        : `fetch${accountName}`;
    return typeof client[methodName] !== 'function';
  });

  assert.deepEqual(missing, []);
});

test('every canonical PDA seed schema is covered by an SDK derivation helper', () => {
  const missingMappings = Object.keys(sdk.PROTOCOL_PDA_SEEDS)
    .sort()
    .filter((seedName) => !(seedName in pdaSeedFunctionMap));

  assert.deepEqual(missingMappings, []);

  for (const functionName of Object.values(pdaSeedFunctionMap)) {
    assert.equal(
      typeof (sdk as Record<string, unknown>)[functionName],
      'function',
      `missing SDK derivation helper ${functionName}`,
    );
  }
});
