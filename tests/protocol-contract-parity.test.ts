import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PROTOCOL_PDA_SEEDS,
  PROTOCOL_PROGRAM_ID,
} from '../src/generated/protocol_contract.js';
import {
  createProtocolClient,
  listProtocolAccountNames,
  listProtocolInstructionNames,
} from '../src/protocol.js';
import * as protocolSeeds from '../src/protocol_seeds.js';
import { createConnection } from '../src/rpc.js';

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
  reserve_asset_rail: 'deriveReserveAssetRailPda',
  protocol_fee_vault: 'deriveProtocolFeeVaultPda',
  pool_treasury_vault: 'derivePoolTreasuryVaultPda',
  pool_oracle_fee_vault: 'derivePoolOracleFeeVaultPda',
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
  outcome_schema: 'deriveOutcomeSchemaPda',
  schema_dependency_ledger: 'deriveSchemaDependencyLedgerPda',
  claim_attestation: 'deriveClaimAttestationPda',
};

test('every retained legacy instruction has fail-closed builder entrypoints', () => {
  const client = createProtocolClient(
    createConnection('http://127.0.0.1:8899', 'confirmed'),
    PROTOCOL_PROGRAM_ID,
  ) as Record<string, unknown>;

  const missing = listProtocolInstructionNames().flatMap((instructionName) => {
    const builderBase = instructionToBuilderBase(instructionName);
    return [`build${builderBase}Instruction`, `build${builderBase}Tx`].filter(
      (methodName) => typeof client[methodName] !== 'function',
    );
  });

  assert.deepEqual(missing, []);
});

test('every retained legacy account has a read entrypoint', () => {
  const client = createProtocolClient(
    createConnection('http://127.0.0.1:8899', 'confirmed'),
    PROTOCOL_PROGRAM_ID,
  ) as Record<string, unknown>;

  const missing = listProtocolAccountNames().filter((accountName) => {
    const methodName =
      accountName === 'ProtocolGovernance'
        ? 'fetchProtocolGovernance'
        : `fetch${accountName}`;
    return typeof client[methodName] !== 'function';
  });

  assert.deepEqual(missing, []);
});

test('every retained legacy PDA schema has a migration derivation helper', () => {
  const missingMappings = Object.keys(PROTOCOL_PDA_SEEDS)
    .sort()
    .filter((seedName) => !(seedName in pdaSeedFunctionMap));

  assert.deepEqual(missingMappings, []);

  for (const functionName of Object.values(pdaSeedFunctionMap)) {
    assert.equal(
      typeof (protocolSeeds as Record<string, unknown>)[functionName],
      'function',
      `missing SDK derivation helper ${functionName}`,
    );
  }
});
