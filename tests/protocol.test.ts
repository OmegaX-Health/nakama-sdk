import test from 'node:test';
import assert from 'node:assert/strict';
import BN from 'bn.js';
import { BorshCoder } from '@coral-xyz/anchor';
import {
  Keypair,
  PublicKey,
  SystemProgram,
  type AccountInfo,
  type Commitment,
  type Connection,
} from '@solana/web3.js';

import idl from '../src/generated/omegax_protocol.idl.json' with { type: 'json' };
import {
  buildAcceptProtocolGovernanceAuthorityTx,
  buildAttestClaimCaseTx,
  buildCancelProtocolGovernanceAuthorityTransferTx,
  buildConfigureReserveAssetRailTx,
  buildCreateDomainAssetVaultTx,
  buildCreateObligationTx,
  buildCreatePolicySeriesTx,
  buildDepositIntoCapitalClassTx,
  buildFundSponsorBudgetTx,
  buildInitializeProtocolGovernanceTx,
  buildInitializeSeriesReserveLedgerTx,
  buildMarkImpairmentTx,
  buildOpenClaimCaseTx,
  buildOpenFundingLineTx,
  buildOpenMemberPositionTx,
  buildPublishReserveAssetRailPriceTx,
  buildProtocolInstruction,
  buildRegisterOracleTx,
  buildReserveObligationTx,
  buildRequestRedemptionTx,
  buildProcessRedemptionQueueTx,
  buildRecordPremiumPaymentTx,
  buildSettleClaimCaseSelectedAssetTx,
  buildSettleClaimCaseTx,
  buildSettleObligationTx,
  buildUpdateLpPositionCredentialingTx,
  buildWithdrawPoolOracleFeeSplTx,
  buildWithdrawPoolOracleFeeSolTx,
  buildWithdrawPoolTreasurySplTx,
  buildWithdrawPoolTreasurySolTx,
  buildWithdrawProtocolFeeSplTx,
  buildWithdrawProtocolFeeSolTx,
  CLAIM_ATTESTATION_DECISION_SUPPORT_APPROVE,
  CLAIM_INTAKE_APPROVED,
  CAPITAL_CLASS_RESTRICTION_WRAPPER_ONLY,
  FUNDING_LINE_TYPE_SPONSOR_BUDGET,
  MEMBERSHIP_MODE_INVITE_ONLY,
  NATIVE_SOL_MINT,
  OBLIGATION_STATUS_SETTLED,
  POOL_ORACLE_PERMISSION_ATTEST_CLAIM,
  RESERVE_ASSET_ROLE_VOLATILE_COLLATERAL,
  RESERVE_ORACLE_SOURCE_GOVERNANCE_ATTESTED,
  SCHEMA_FAMILY_CLAIMS_CODING,
  SCHEMA_VISIBILITY_PUBLIC,
  SERIES_MODE_PROTECTION,
  SERIES_MODE_REWARD,
  buildCapitalReadModel,
  buildMemberReadModel,
  buildSponsorReadModel,
  createProtocolClient,
  createSafeProtocolClient,
  decodeProtocolAccount,
  deriveClaimCasePda,
  deriveClaimAttestationPda,
  deriveAllocationLedgerPda,
  deriveAllocationPositionPda,
  deriveDomainAssetLedgerPda,
  deriveDomainAssetVaultPda,
  deriveFundingLineLedgerPda,
  deriveFundingLinePda,
  deriveDomainAssetVaultTokenAccountPda,
  deriveHealthPlanPda,
  deriveLiquidityPoolPda,
  deriveLpPositionPda,
  deriveMemberPositionPda,
  deriveMembershipAnchorSeatPda,
  deriveOracleProfilePda,
  derivePoolOracleFeeVaultPda,
  deriveOutcomeSchemaPda,
  derivePoolOraclePolicyPda,
  derivePoolClassLedgerPda,
  derivePoolTreasuryVaultPda,
  deriveProtocolFeeVaultPda,
  deriveProtocolGovernancePda,
  deriveObligationPda,
  derivePlanReserveLedgerPda,
  derivePolicySeriesPda,
  deriveReserveAssetRailPda,
  deriveReserveDomainPda,
  deriveSeriesReserveLedgerPda,
  getProgramId,
  listProtocolAccountNames,
  listProtocolInstructionNames,
  recomputeReserveBalanceSheet,
} from '../src/index.js';
import { createAccountReaderConnectionStub } from './support/protocol-account-reader.js';

const CODER = new BorshCoder(idl as never);
const ZERO = new PublicKey('11111111111111111111111111111111');
const SPL_TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
);

function createTokenAccountData(params: {
  mint: PublicKey;
  owner: PublicKey;
}): Buffer {
  const data = Buffer.alloc(72);
  params.mint.toBuffer().copy(data, 0);
  params.owner.toBuffer().copy(data, 32);
  return data;
}

function createTokenAccountInfo(params: {
  mint: PublicKey;
  owner: PublicKey;
}): AccountInfo<Buffer> {
  return {
    data: createTokenAccountData(params),
    executable: false,
    lamports: 0,
    owner: SPL_TOKEN_PROGRAM_ID,
    rentEpoch: 0,
  };
}

function createTokenAccountConnectionStub(
  accounts: ReadonlyMap<string, AccountInfo<Buffer>>,
): Connection {
  return {
    async getAccountInfo(pubkey: PublicKey, commitment?: Commitment) {
      void commitment;
      return accounts.get(pubkey.toBase58()) ?? null;
    },
  } as unknown as Connection;
}

test('canonical surface listings expose the new instruction and account model', () => {
  const instructionNames = listProtocolInstructionNames();
  const accountNames = listProtocolAccountNames();

  assert(instructionNames.includes('create_reserve_domain'));
  assert(instructionNames.includes('create_health_plan'));
  assert(instructionNames.includes('configure_reserve_asset_rail'));
  assert(instructionNames.includes('accept_protocol_governance_authority'));
  assert(
    instructionNames.includes('cancel_protocol_governance_authority_transfer'),
  );
  assert(instructionNames.includes('settle_claim_case_selected_asset'));
  assert(instructionNames.includes('create_liquidity_pool'));
  assert(!instructionNames.includes('create_pool' as never));
  assert(!instructionNames.includes('create_commitment_campaign' as never));

  assert(accountNames.includes('ReserveDomain'));
  assert(accountNames.includes('HealthPlan'));
  assert(accountNames.includes('ReserveAssetRail'));
  assert(accountNames.includes('LiquidityPool'));
  assert(!accountNames.includes('CommitmentCampaign' as never));
});

test('PDA helpers match manual derivation under canonical seeds', () => {
  const programId = getProgramId();
  const reserveDomain = deriveReserveDomainPda({
    domainId: 'open-usdc-domain',
  });
  const healthPlan = deriveHealthPlanPda({
    reserveDomain,
    planId: 'nexus-seeker-rewards',
  });
  const liquidityPool = deriveLiquidityPoolPda({
    reserveDomain,
    poolId: 'omega-health-income',
  });
  const assetMint = Keypair.generate().publicKey;
  const domainAssetVaultToken = deriveDomainAssetVaultTokenAccountPda({
    reserveDomain,
    assetMint,
  });
  const reserveAssetRail = deriveReserveAssetRailPda({
    reserveDomain,
    assetMint,
  });
  const protocolFeeVault = deriveProtocolFeeVaultPda({
    reserveDomain,
    assetMint,
  });
  const poolTreasuryVault = derivePoolTreasuryVaultPda({
    liquidityPool,
    assetMint,
  });
  const poolOracleFeeVault = derivePoolOracleFeeVaultPda({
    liquidityPool,
    oracle: Keypair.generate().publicKey,
    assetMint,
  });
  const anchorRef = Keypair.generate().publicKey;
  const membershipAnchorSeat = deriveMembershipAnchorSeatPda({
    healthPlan,
    anchorRef,
  });
  const oracleProfile = deriveOracleProfilePda({
    oracle: Keypair.generate().publicKey,
  });
  const poolOraclePolicy = derivePoolOraclePolicyPda({
    liquidityPool,
  });
  const outcomeSchema = deriveOutcomeSchemaPda({
    schemaKeyHashHex:
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  });
  const allocation = deriveAllocationPositionPda({
    capitalClass: Keypair.generate().publicKey,
    fundingLine: Keypair.generate().publicKey,
  });

  const [manualGovernance] = PublicKey.findProgramAddressSync(
    [Buffer.from('protocol_governance')],
    programId,
  );
  const [manualDomain] = PublicKey.findProgramAddressSync(
    [Buffer.from('reserve_domain'), Buffer.from('open-usdc-domain')],
    programId,
  );

  assert.equal(
    deriveProtocolGovernancePda().toBase58(),
    manualGovernance.toBase58(),
  );
  assert.equal(reserveDomain.toBase58(), manualDomain.toBase58());
  assert.match(healthPlan.toBase58(), /^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
  assert.match(liquidityPool.toBase58(), /^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
  assert.match(
    domainAssetVaultToken.toBase58(),
    /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  );
  assert.match(reserveAssetRail.toBase58(), /^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
  assert.match(protocolFeeVault.toBase58(), /^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
  assert.match(poolTreasuryVault.toBase58(), /^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
  assert.match(poolOracleFeeVault.toBase58(), /^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
  assert.match(
    membershipAnchorSeat.toBase58(),
    /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  );
  assert.match(oracleProfile.toBase58(), /^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
  assert.match(poolOraclePolicy.toBase58(), /^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
  assert.match(outcomeSchema.toBase58(), /^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
  assert.match(allocation.toBase58(), /^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
});

test('decodeProtocolAccount normalizes pubkeys and bigints for canonical readers', async () => {
  const governanceAddress = deriveProtocolGovernancePda().toBase58();
  const encoded = await CODER.accounts.encode('ProtocolGovernance', {
    governance_authority: ZERO,
    protocol_fee_bps: 25,
    emergency_pause: false,
    audit_nonce: new BN(7),
    bump: 255,
  });

  const decoded = decodeProtocolAccount<{
    governance_authority: string;
    protocol_fee_bps: number;
    emergency_pause: boolean;
    audit_nonce: bigint;
    bump: number;
  }>('ProtocolGovernance', encoded);

  assert.equal(decoded.governance_authority, ZERO.toBase58());
  assert.equal(decoded.protocol_fee_bps, 25);
  assert.equal(decoded.audit_nonce, 7n);

  const client = createProtocolClient(
    createAccountReaderConnectionStub(
      new Map([[governanceAddress, Buffer.from(encoded)]]),
      getProgramId(),
    ),
    getProgramId().toBase58(),
  );
  const fetched = await client.fetchProtocolGovernance();

  assert(fetched);
  assert.equal(
    (fetched as { governance_authority: string }).governance_authority,
    ZERO.toBase58(),
  );
});

test('protocol readers reject decoded accounts owned by another program', async () => {
  const governanceAddress = deriveProtocolGovernancePda().toBase58();
  const encoded = await CODER.accounts.encode('ProtocolGovernance', {
    governance_authority: ZERO,
    protocol_fee_bps: 25,
    emergency_pause: false,
    audit_nonce: new BN(7),
    bump: 255,
  });

  const client = createProtocolClient(
    createAccountReaderConnectionStub(
      new Map([[governanceAddress, Buffer.from(encoded)]]),
    ),
    getProgramId().toBase58(),
  );

  await assert.rejects(
    () => client.fetchProtocolGovernance(),
    /not OmegaX Protocol program/,
  );
});

test('buildAttestClaimCaseTx includes the schema-bound outcome schema account', () => {
  const oracle = Keypair.generate().publicKey;
  const healthPlanAddress = Keypair.generate().publicKey;
  const claimCaseAddress = Keypair.generate().publicKey;
  const fundingLineAddress = Keypair.generate().publicKey;
  const schemaKeyHashHex = '12'.repeat(32);
  const tx = buildAttestClaimCaseTx({
    oracle,
    healthPlanAddress,
    claimCaseAddress,
    fundingLineAddress,
    recentBlockhash: '11111111111111111111111111111111',
    decision: 0,
    attestationHashHex: '34'.repeat(32),
    attestationRefHashHex: '56'.repeat(32),
    schemaKeyHashHex,
  });

  assert.equal(tx.instructions.length, 1);
  const keys = tx.instructions[0]?.keys ?? [];
  assert.equal(keys[0]?.pubkey.toBase58(), oracle.toBase58());
  assert.equal(
    keys[1]?.pubkey.toBase58(),
    deriveProtocolGovernancePda().toBase58(),
  );
  assert.equal(keys[2]?.pubkey.toBase58(), healthPlanAddress.toBase58());
  assert.equal(
    keys[3]?.pubkey.toBase58(),
    deriveOracleProfilePda({ oracle }).toBase58(),
  );
  assert.equal(keys[4]?.pubkey.toBase58(), claimCaseAddress.toBase58());
  assert.equal(keys[4]?.isWritable, true);
  assert.equal(keys[5]?.pubkey.toBase58(), fundingLineAddress.toBase58());
  assert.equal(
    keys[6]?.pubkey.toBase58(),
    deriveOutcomeSchemaPda({ schemaKeyHashHex }).toBase58(),
  );
  for (const index of [7, 8, 9, 10, 11, 12]) {
    assert.equal(keys[index]?.pubkey.toBase58(), getProgramId().toBase58());
    assert.equal(keys[index]?.isSigner, false);
    assert.equal(keys[index]?.isWritable, false);
  }
  assert.equal(
    keys[13]?.pubkey.toBase58(),
    deriveClaimAttestationPda({
      claimCase: claimCaseAddress,
      oracle,
    }).toBase58(),
  );
});

test('buildAttestClaimCaseTx rejects unsupported attestation decisions before submission', () => {
  const oracle = Keypair.generate().publicKey;
  const healthPlanAddress = Keypair.generate().publicKey;
  const claimCaseAddress = Keypair.generate().publicKey;
  const fundingLineAddress = Keypair.generate().publicKey;

  assert.throws(
    () =>
      buildAttestClaimCaseTx({
        oracle,
        healthPlanAddress,
        claimCaseAddress,
        fundingLineAddress,
        recentBlockhash: '11111111111111111111111111111111',
        decision: 99,
        attestationHashHex: '34'.repeat(32),
        attestationRefHashHex: '56'.repeat(32),
        schemaKeyHashHex: '12'.repeat(32),
      }),
    /claim attestation decision must be one of 0/,
  );
});

test('buildOpenClaimCaseTx includes protocol governance and derived claim case account order', () => {
  const authority = Keypair.generate().publicKey;
  const healthPlanAddress = Keypair.generate().publicKey;
  const memberPositionAddress = Keypair.generate().publicKey;
  const fundingLineAddress = Keypair.generate().publicKey;
  const claimantAddress = Keypair.generate().publicKey;
  const claimId = 'claim-001';

  const tx = buildOpenClaimCaseTx({
    authority,
    healthPlanAddress,
    memberPositionAddress,
    fundingLineAddress,
    claimantAddress,
    claimId,
    recentBlockhash: '11111111111111111111111111111111',
  });

  const keys = tx.instructions[0]?.keys ?? [];
  assert.equal(keys[0]?.pubkey.toBase58(), authority.toBase58());
  assert.equal(
    keys[1]?.pubkey.toBase58(),
    deriveProtocolGovernancePda().toBase58(),
  );
  assert.equal(keys[2]?.pubkey.toBase58(), healthPlanAddress.toBase58());
  assert.equal(keys[3]?.pubkey.toBase58(), memberPositionAddress.toBase58());
  assert.equal(keys[4]?.pubkey.toBase58(), fundingLineAddress.toBase58());
  assert.equal(
    keys[5]?.pubkey.toBase58(),
    deriveClaimCasePda({ healthPlan: healthPlanAddress, claimId }).toBase58(),
  );
  assert.equal(keys[5]?.isWritable, true);
});

test('protocol model constants expose reserve rail, membership, oracle, and schema values', () => {
  assert.equal(RESERVE_ASSET_ROLE_VOLATILE_COLLATERAL, 2);
  assert.equal(RESERVE_ORACLE_SOURCE_GOVERNANCE_ATTESTED, 3);
  assert.equal(MEMBERSHIP_MODE_INVITE_ONLY, 2);
  assert.equal(CLAIM_ATTESTATION_DECISION_SUPPORT_APPROVE, 0);
  assert.equal(POOL_ORACLE_PERMISSION_ATTEST_CLAIM, 1);
  assert.equal(SCHEMA_FAMILY_CLAIMS_CODING, 2);
  assert.equal(SCHEMA_VISIBILITY_PUBLIC, 0);
  assert.equal(NATIVE_SOL_MINT, 'So11111111111111111111111111111111111111112');
});

test('buildProtocolInstruction uses the selected programId for omitted optional accounts', () => {
  const customProgramId = Keypair.generate().publicKey;
  const authority = Keypair.generate().publicKey;

  const ix = buildProtocolInstruction({
    instructionName: 'create_obligation',
    programId: customProgramId,
    args: {
      obligation_id: 'obligation-1',
      asset_mint: ZERO,
      policy_series: ZERO,
      member_wallet: ZERO,
      beneficiary: ZERO,
      claim_case: ZERO,
      liquidity_pool: ZERO,
      capital_class: ZERO,
      allocation_position: ZERO,
      delivery_mode: 0,
      amount: 1n,
      creation_reason_hash: Array.from(new Uint8Array(32)),
    },
    accounts: {
      authority,
      protocol_governance: Keypair.generate().publicKey,
      health_plan: Keypair.generate().publicKey,
      domain_asset_ledger: Keypair.generate().publicKey,
      funding_line: Keypair.generate().publicKey,
      funding_line_ledger: Keypair.generate().publicKey,
      plan_reserve_ledger: Keypair.generate().publicKey,
      obligation: Keypair.generate().publicKey,
      system_program: Keypair.generate().publicKey,
    },
  });

  assert.equal(ix.programId.toBase58(), customProgramId.toBase58());
  for (const index of [7, 8, 9]) {
    assert.equal(ix.keys[index]?.pubkey.toBase58(), customProgramId.toBase58());
    assert.equal(ix.keys[index]?.isSigner, false);
    assert.equal(ix.keys[index]?.isWritable, false);
  }
});

test('production builders reject custom program IDs without an unsafe flag', () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousUnsafeFlag =
    process.env.OMEGAX_SDK_UNSAFE_ALLOW_CUSTOM_PROGRAM_ID;
  process.env.NODE_ENV = 'production';
  delete process.env.OMEGAX_SDK_UNSAFE_ALLOW_CUSTOM_PROGRAM_ID;

  try {
    assert.throws(
      () =>
        buildProtocolInstruction({
          instructionName: 'create_reserve_domain',
          programId: Keypair.generate().publicKey,
          args: {
            domain_id: 'domain-1',
            display_name: 'Domain',
            domain_admin: Keypair.generate().publicKey,
            settlement_mode: 0,
            legal_structure_hash: Array.from(new Uint8Array(32)),
            compliance_baseline_hash: Array.from(new Uint8Array(32)),
            allowed_rail_mask: 0,
            pause_flags: 0,
          },
          accounts: {
            authority: Keypair.generate().publicKey,
            protocol_governance: deriveProtocolGovernancePda(),
            reserve_domain: deriveReserveDomainPda({ domainId: 'domain-1' }),
            system_program: ZERO,
          },
        }),
      /custom programId/,
    );
  } finally {
    if (previousNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = previousNodeEnv;
    }
    if (previousUnsafeFlag === undefined) {
      delete process.env.OMEGAX_SDK_UNSAFE_ALLOW_CUSTOM_PROGRAM_ID;
    } else {
      process.env.OMEGAX_SDK_UNSAFE_ALLOW_CUSTOM_PROGRAM_ID =
        previousUnsafeFlag;
    }
  }
});

test('raw protocol builders reject permissive numeric and fixed-array coercion', () => {
  const validAccounts = {
    authority: Keypair.generate().publicKey,
    protocol_governance: deriveProtocolGovernancePda(),
    reserve_domain: deriveReserveDomainPda({ domainId: 'domain-1' }),
    system_program: ZERO,
  };
  const validArgs = {
    domain_id: 'domain-1',
    display_name: 'Domain',
    domain_admin: Keypair.generate().publicKey,
    settlement_mode: 0,
    legal_structure_hash: Array.from(new Uint8Array(32)),
    compliance_baseline_hash: Array.from(new Uint8Array(32)),
    allowed_rail_mask: 0,
    pause_flags: 0,
  };

  assert.throws(
    () =>
      buildProtocolInstruction({
        instructionName: 'create_reserve_domain',
        args: { ...validArgs, settlement_mode: -1 },
        accounts: validAccounts,
      }),
    /unsigned 8-bit range/,
  );
  assert.throws(
    () =>
      buildProtocolInstruction({
        instructionName: 'create_reserve_domain',
        args: { ...validArgs, pause_flags: 1.5 },
        accounts: validAccounts,
      }),
    /safe integer/,
  );
  assert.throws(
    () =>
      buildProtocolInstruction({
        instructionName: 'create_reserve_domain',
        args: { ...validArgs, legal_structure_hash: [1, 2, 3] },
        accounts: validAccounts,
      }),
    /fixed array of length 32/,
  );
});

test('convenience builders fail closed on privileged and partial account scopes', () => {
  const authority = Keypair.generate().publicKey;
  const assetMint = Keypair.generate().publicKey;

  assert.throws(
    () =>
      buildOpenClaimCaseTx({
        authority,
        healthPlanAddress: Keypair.generate().publicKey,
        memberPositionAddress: Keypair.generate().publicKey,
        fundingLineAddress: Keypair.generate().publicKey,
        claimId: 'claim-operator',
        recentBlockhash: '11111111111111111111111111111111',
      }),
    /claimantAddress or memberWalletAddress is required/,
  );
  assert.throws(
    () =>
      buildRegisterOracleTx({
        admin: Keypair.generate().publicKey,
        oracle: Keypair.generate().publicKey,
        recentBlockhash: '11111111111111111111111111111111',
        oracleType: 1,
        displayName: 'Oracle',
        legalName: 'Oracle LLC',
        websiteUrl: 'https://example.com',
        appUrl: 'https://example.com/app',
        logoUri: 'https://example.com/logo.png',
        webhookUrl: 'https://example.com/hook',
        supportedSchemaKeyHashesHex: ['ab'.repeat(32)],
      }),
    /admin and oracle to match/,
  );
  assert.throws(
    () =>
      buildReserveObligationTx({
        authority,
        healthPlanAddress: Keypair.generate().publicKey,
        reserveDomainAddress: Keypair.generate().publicKey,
        fundingLineAddress: Keypair.generate().publicKey,
        assetMint,
        obligationAddress: Keypair.generate().publicKey,
        recentBlockhash: '11111111111111111111111111111111',
        amount: 1n,
        capitalClassAddress: Keypair.generate().publicKey,
      }),
    /LP allocation account scope/,
  );
  assert.throws(
    () =>
      buildSettleObligationTx({
        authority,
        healthPlanAddress: Keypair.generate().publicKey,
        reserveDomainAddress: Keypair.generate().publicKey,
        fundingLineAddress: Keypair.generate().publicKey,
        assetMint,
        obligationAddress: Keypair.generate().publicKey,
        recentBlockhash: '11111111111111111111111111111111',
        nextStatus: OBLIGATION_STATUS_SETTLED,
        amount: 1n,
      } as Parameters<typeof buildSettleObligationTx>[0]),
    /settle_obligation requires memberPositionAddress/,
  );
  assert.throws(
    () =>
      buildSettleObligationTx({
        authority,
        healthPlanAddress: Keypair.generate().publicKey,
        reserveDomainAddress: Keypair.generate().publicKey,
        fundingLineAddress: Keypair.generate().publicKey,
        assetMint,
        obligationAddress: Keypair.generate().publicKey,
        recentBlockhash: '11111111111111111111111111111111',
        nextStatus: OBLIGATION_STATUS_SETTLED,
        amount: 1n,
        memberPositionAddress: Keypair.generate().publicKey,
        vaultTokenAccountAddress: Keypair.generate().publicKey,
        recipientTokenAccountAddress: Keypair.generate().publicKey,
        tokenProgramId: SPL_TOKEN_PROGRAM_ID,
        poolOracleFeeVaultAddress: Keypair.generate().publicKey,
      }),
    /settlement oracle fee account scope/,
  );
});

test('buildSettleObligationTx includes oracle-fee optional account slots', () => {
  const authority = Keypair.generate().publicKey;
  const healthPlanAddress = Keypair.generate().publicKey;
  const reserveDomainAddress = Keypair.generate().publicKey;
  const fundingLineAddress = Keypair.generate().publicKey;
  const assetMint = Keypair.generate().publicKey;
  const obligationAddress = Keypair.generate().publicKey;
  const memberPositionAddress = Keypair.generate().publicKey;
  const vaultTokenAccountAddress = Keypair.generate().publicKey;
  const recipientTokenAccountAddress = Keypair.generate().publicKey;
  const claimCaseAddress = Keypair.generate().publicKey;
  const poolOracleFeeVaultAddress = Keypair.generate().publicKey;
  const poolOraclePolicyAddress = Keypair.generate().publicKey;
  const oracleFeeAttestationAddress = Keypair.generate().publicKey;
  const recentBlockhash = '11111111111111111111111111111111';
  const baseParams = {
    authority,
    healthPlanAddress,
    reserveDomainAddress,
    fundingLineAddress,
    assetMint,
    obligationAddress,
    recentBlockhash,
    nextStatus: OBLIGATION_STATUS_SETTLED,
    amount: 1n,
    memberPositionAddress,
    vaultTokenAccountAddress,
    recipientTokenAccountAddress,
    tokenProgramId: SPL_TOKEN_PROGRAM_ID,
  };

  const noFeeKeys =
    buildSettleObligationTx(baseParams).instructions[0]?.keys ?? [];
  assert.equal(noFeeKeys.length, 23);
  assert.equal(noFeeKeys[20]?.pubkey.toBase58(), getProgramId().toBase58());
  assert.equal(noFeeKeys[20]?.isWritable, false);
  assert.equal(noFeeKeys[21]?.pubkey.toBase58(), getProgramId().toBase58());
  assert.equal(noFeeKeys[22]?.pubkey.toBase58(), getProgramId().toBase58());

  const feeKeys =
    buildSettleObligationTx({
      ...baseParams,
      claimCaseAddress,
      poolOracleFeeVaultAddress,
      poolOraclePolicyAddress,
      oracleFeeAttestationAddress,
    }).instructions[0]?.keys ?? [];
  assert.equal(feeKeys.length, 23);
  assert.equal(
    feeKeys[20]?.pubkey.toBase58(),
    poolOracleFeeVaultAddress.toBase58(),
  );
  assert.equal(feeKeys[20]?.isWritable, true);
  assert.equal(
    feeKeys[21]?.pubkey.toBase58(),
    poolOraclePolicyAddress.toBase58(),
  );
  assert.equal(feeKeys[21]?.isWritable, false);
  assert.equal(
    feeKeys[22]?.pubkey.toBase58(),
    oracleFeeAttestationAddress.toBase58(),
  );
  assert.equal(feeKeys[21]?.isWritable, false);
});

test('money-moving safe builders derive custody and fee vault accounts', () => {
  const authority = Keypair.generate().publicKey;
  const reserveDomainAddress = Keypair.generate().publicKey;
  const healthPlanAddress = Keypair.generate().publicKey;
  const fundingLineAddress = Keypair.generate().publicKey;
  const assetMint = Keypair.generate().publicKey;
  const liquidityPoolAddress = Keypair.generate().publicKey;
  const capitalClassAddress = Keypair.generate().publicKey;
  const sourceTokenAccountAddress = Keypair.generate().publicKey;
  const recipientTokenAccountAddress = Keypair.generate().publicKey;
  const oracleAddress = Keypair.generate().publicKey;
  const recentBlockhash = '11111111111111111111111111111111';

  const sponsorTx = buildFundSponsorBudgetTx({
    authority,
    healthPlanAddress,
    reserveDomainAddress,
    fundingLineAddress,
    assetMint,
    sourceTokenAccountAddress,
    recentBlockhash,
    amount: 1n,
  });
  let keys = sponsorTx.instructions[0]?.keys ?? [];
  assert.equal(
    keys[3]?.pubkey.toBase58(),
    deriveDomainAssetVaultPda({
      reserveDomain: reserveDomainAddress,
      assetMint,
    }).toBase58(),
  );
  assert.equal(
    keys[4]?.pubkey.toBase58(),
    deriveDomainAssetLedgerPda({
      reserveDomain: reserveDomainAddress,
      assetMint,
    }).toBase58(),
  );
  assert.equal(
    keys[11]?.pubkey.toBase58(),
    deriveDomainAssetVaultTokenAccountPda({
      reserveDomain: reserveDomainAddress,
      assetMint,
    }).toBase58(),
  );

  const premiumTx = buildRecordPremiumPaymentTx({
    authority,
    healthPlanAddress,
    reserveDomainAddress,
    fundingLineAddress,
    assetMint,
    sourceTokenAccountAddress,
    recentBlockhash,
    amount: 1n,
  });
  keys = premiumTx.instructions[0]?.keys ?? [];
  assert.equal(
    keys[9]?.pubkey.toBase58(),
    deriveProtocolFeeVaultPda({
      reserveDomain: reserveDomainAddress,
      assetMint,
    }).toBase58(),
  );

  const lpDepositTx = buildDepositIntoCapitalClassTx({
    owner: authority,
    reserveDomainAddress,
    liquidityPoolAddress,
    capitalClassAddress,
    assetMint,
    sourceTokenAccountAddress,
    recentBlockhash,
    amount: 1n,
    shares: 1n,
  });
  keys = lpDepositTx.instructions[0]?.keys ?? [];
  assert.equal(
    keys[6]?.pubkey.toBase58(),
    derivePoolClassLedgerPda({
      capitalClass: capitalClassAddress,
      assetMint,
    }).toBase58(),
  );
  assert.equal(
    keys[7]?.pubkey.toBase58(),
    deriveLpPositionPda({
      capitalClass: capitalClassAddress,
      owner: authority,
    }).toBase58(),
  );
  assert.equal(
    keys[8]?.pubkey.toBase58(),
    derivePoolTreasuryVaultPda({
      liquidityPool: liquidityPoolAddress,
      assetMint,
    }).toBase58(),
  );

  const requestTx = buildRequestRedemptionTx({
    owner: authority,
    reserveDomainAddress,
    liquidityPoolAddress,
    capitalClassAddress,
    assetMint,
    recentBlockhash,
    shares: 1n,
  });
  keys = requestTx.instructions[0]?.keys ?? [];
  assert.equal(
    keys[6]?.pubkey.toBase58(),
    deriveLpPositionPda({
      capitalClass: capitalClassAddress,
      owner: authority,
    }).toBase58(),
  );

  const processTx = buildProcessRedemptionQueueTx({
    authority,
    reserveDomainAddress,
    liquidityPoolAddress,
    capitalClassAddress,
    lpOwnerAddress: authority,
    assetMint,
    recipientTokenAccountAddress,
    recentBlockhash,
    shares: 1n,
  });
  keys = processTx.instructions[0]?.keys ?? [];
  assert.equal(
    keys[8]?.pubkey.toBase58(),
    derivePoolTreasuryVaultPda({
      liquidityPool: liquidityPoolAddress,
      assetMint,
    }).toBase58(),
  );

  const protocolFeeTx = buildWithdrawProtocolFeeSplTx({
    authority,
    reserveDomainAddress,
    assetMint,
    recipientTokenAccountAddress,
    recentBlockhash,
    amount: 1n,
  });
  keys = protocolFeeTx.instructions[0]?.keys ?? [];
  assert.equal(
    keys[3]?.pubkey.toBase58(),
    deriveProtocolFeeVaultPda({
      reserveDomain: reserveDomainAddress,
      assetMint,
    }).toBase58(),
  );

  const poolTreasuryTx = buildWithdrawPoolTreasurySplTx({
    authority,
    reserveDomainAddress,
    liquidityPoolAddress,
    assetMint,
    recipientTokenAccountAddress,
    recentBlockhash,
    amount: 1n,
  });
  keys = poolTreasuryTx.instructions[0]?.keys ?? [];
  assert.equal(
    keys[3]?.pubkey.toBase58(),
    derivePoolTreasuryVaultPda({
      liquidityPool: liquidityPoolAddress,
      assetMint,
    }).toBase58(),
  );

  const oracleFeeTx = buildWithdrawPoolOracleFeeSplTx({
    authority,
    reserveDomainAddress,
    liquidityPoolAddress,
    oracleAddress,
    assetMint,
    recipientTokenAccountAddress,
    recentBlockhash,
    amount: 1n,
  });
  keys = oracleFeeTx.instructions[0]?.keys ?? [];
  assert.equal(
    keys[4]?.pubkey.toBase58(),
    derivePoolOracleFeeVaultPda({
      liquidityPool: liquidityPoolAddress,
      oracle: oracleAddress,
      assetMint,
    }).toBase58(),
  );

  assert.equal(
    buildWithdrawProtocolFeeSolTx({
      authority,
      reserveDomainAddress,
      recipient: authority,
      recentBlockhash,
      amount: 1n,
    }).instructions.length,
    1,
  );
  assert.equal(
    buildWithdrawPoolTreasurySolTx({
      authority,
      liquidityPoolAddress,
      recipient: authority,
      recentBlockhash,
      amount: 1n,
    }).instructions.length,
    1,
  );
  assert.equal(
    buildWithdrawPoolOracleFeeSolTx({
      authority,
      liquidityPoolAddress,
      oracleAddress,
      recipient: authority,
      recentBlockhash,
      amount: 1n,
    }).instructions.length,
    1,
  );
});

test('safe client exposes guarded wrappers for canonical money-moving flows', () => {
  const safe = createSafeProtocolClient(
    createAccountReaderConnectionStub(new Map(), getProgramId()),
  );
  assert.equal(typeof safe.buildFundSponsorBudgetTx, 'function');
  assert.equal(typeof safe.buildRecordPremiumPaymentTx, 'function');
  assert.equal(typeof safe.buildDepositIntoCapitalClassTx, 'function');
  assert.equal(typeof safe.buildRequestRedemptionTx, 'function');
  assert.equal(typeof safe.buildProcessRedemptionQueueTx, 'function');
  assert.equal(typeof safe.buildWithdrawProtocolFeeSplTx, 'function');
  assert.equal(typeof safe.buildWithdrawProtocolFeeSolTx, 'function');
  assert.equal(typeof safe.buildWithdrawPoolTreasurySplTx, 'function');
  assert.equal(typeof safe.buildWithdrawPoolTreasurySolTx, 'function');
  assert.equal(typeof safe.buildWithdrawPoolOracleFeeSplTx, 'function');
  assert.equal(typeof safe.buildWithdrawPoolOracleFeeSolTx, 'function');
});

test('safe settlement builder preflights custody token accounts', async () => {
  const authority = Keypair.generate().publicKey;
  const reserveDomainAddress = Keypair.generate().publicKey;
  const healthPlanAddress = Keypair.generate().publicKey;
  const fundingLineAddress = Keypair.generate().publicKey;
  const assetMint = Keypair.generate().publicKey;
  const obligationAddress = Keypair.generate().publicKey;
  const memberPositionAddress = Keypair.generate().publicKey;
  const vaultTokenAccountAddress = Keypair.generate().publicKey;
  const recipientTokenAccountAddress = Keypair.generate().publicKey;
  const recipientOwnerAddress = Keypair.generate().publicKey;
  const domainAssetVault = deriveDomainAssetVaultPda({
    reserveDomain: reserveDomainAddress,
    assetMint,
  });
  const recentBlockhash = '11111111111111111111111111111111';
  const validAccounts = new Map<string, AccountInfo<Buffer>>([
    [
      vaultTokenAccountAddress.toBase58(),
      createTokenAccountInfo({
        mint: assetMint,
        owner: domainAssetVault,
      }),
    ],
    [
      recipientTokenAccountAddress.toBase58(),
      createTokenAccountInfo({
        mint: assetMint,
        owner: recipientOwnerAddress,
      }),
    ],
  ]);
  const params = {
    authority,
    healthPlanAddress,
    reserveDomainAddress,
    fundingLineAddress,
    assetMint,
    obligationAddress,
    recentBlockhash,
    nextStatus: OBLIGATION_STATUS_SETTLED,
    amount: 1n,
    memberPositionAddress,
    vaultTokenAccountAddress,
    recipientTokenAccountAddress,
    tokenProgramId: SPL_TOKEN_PROGRAM_ID,
    recipientOwnerAddress,
  };

  await assert.rejects(
    () =>
      createSafeProtocolClient(
        createTokenAccountConnectionStub(
          new Map([
            ...validAccounts,
            [
              recipientTokenAccountAddress.toBase58(),
              createTokenAccountInfo({
                mint: assetMint,
                owner: Keypair.generate().publicKey,
              }),
            ],
          ]),
        ),
      ).buildSettleObligationTx(params),
    /settlement recipient token account owner mismatch/,
  );

  await assert.rejects(
    () =>
      createSafeProtocolClient(
        createTokenAccountConnectionStub(
          new Map([
            ...validAccounts,
            [
              recipientTokenAccountAddress.toBase58(),
              createTokenAccountInfo({
                mint: Keypair.generate().publicKey,
                owner: recipientOwnerAddress,
              }),
            ],
          ]),
        ),
      ).buildSettleObligationTx(params),
    /settlement recipient token account mint mismatch/,
  );

  const tx = await createSafeProtocolClient(
    createTokenAccountConnectionStub(validAccounts),
  ).buildSettleObligationTx(params);
  assert.equal(tx.instructions.length, 1);
});

test('buildOpenMemberPositionTx keeps invite authority as an optional signer', () => {
  const wallet = Keypair.generate().publicKey;
  const healthPlanAddress = Keypair.generate().publicKey;
  const inviteAuthorityAddress = Keypair.generate().publicKey;

  const tx = buildOpenMemberPositionTx({
    wallet,
    healthPlanAddress,
    recentBlockhash: '11111111111111111111111111111111',
    eligibilityStatus: 1,
    delegatedRightsMask: 0,
    proofMode: 2,
    tokenGateAmountSnapshot: 0n,
    inviteIdHashHex: '78'.repeat(32),
    inviteExpiresAt: 1n,
    inviteAuthorityAddress,
  });

  const keys = tx.instructions[0]?.keys ?? [];
  const inviteAuthority = keys[7];
  assert.equal(
    inviteAuthority?.pubkey.toBase58(),
    inviteAuthorityAddress.toBase58(),
  );
  assert.equal(inviteAuthority?.isSigner, true);
  assert.equal(inviteAuthority?.isWritable, false);
});

test('buildOpenMemberPositionTx derives member anchor accounts with the selected program id', () => {
  const wallet = Keypair.generate().publicKey;
  const healthPlanAddress = Keypair.generate().publicKey;
  const anchorRefAddress = Keypair.generate().publicKey;
  const programId = Keypair.generate().publicKey;

  const tx = buildOpenMemberPositionTx({
    wallet,
    healthPlanAddress,
    anchorRefAddress,
    programId,
    recentBlockhash: '11111111111111111111111111111111',
    eligibilityStatus: 1,
    delegatedRightsMask: 0,
    proofMode: 2,
    tokenGateAmountSnapshot: 0n,
    inviteExpiresAt: 1n,
  });

  const keys = tx.instructions[0]?.keys ?? [];
  assert.equal(tx.instructions[0]?.programId.toBase58(), programId.toBase58());
  assert.equal(
    keys[1]?.pubkey.toBase58(),
    deriveProtocolGovernancePda(programId).toBase58(),
  );
  assert.equal(
    keys[4]?.pubkey.toBase58(),
    deriveMemberPositionPda({
      healthPlan: healthPlanAddress,
      wallet,
      programId,
    }).toBase58(),
  );
  assert.equal(
    keys[5]?.pubkey.toBase58(),
    deriveMembershipAnchorSeatPda({
      healthPlan: healthPlanAddress,
      anchorRef: anchorRefAddress,
      programId,
    }).toBase58(),
  );
  for (const index of [3, 6, 7]) {
    assert.equal(keys[index]?.pubkey.toBase58(), programId.toBase58());
    assert.equal(keys[index]?.isSigner, false);
    assert.equal(keys[index]?.isWritable, false);
  }
});

test('policy and funding builders derive PDAs with the selected program id', () => {
  const authority = Keypair.generate().publicKey;
  const healthPlanAddress = Keypair.generate().publicKey;
  const reserveDomainAddress = Keypair.generate().publicKey;
  const assetMint = Keypair.generate().publicKey;
  const programId = Keypair.generate().publicKey;
  const recentBlockhash = '11111111111111111111111111111111';
  const seriesId = 'custom-series';
  const lineId = 'custom-line';
  const policySeries = derivePolicySeriesPda({
    healthPlan: healthPlanAddress,
    seriesId,
    programId,
  });
  const fundingLine = deriveFundingLinePda({
    healthPlan: healthPlanAddress,
    lineId,
    programId,
  });

  const policyTx = buildCreatePolicySeriesTx({
    authority,
    healthPlanAddress,
    assetMint,
    recentBlockhash,
    seriesId,
    displayName: 'Custom Series',
    metadataUri: 'ipfs://custom-series',
    mode: SERIES_MODE_PROTECTION,
    status: 1,
    adjudicationMode: 0,
    cycleSeconds: 30n,
    termsVersion: 1,
    programId,
  });
  const policyKeys = policyTx.instructions[0]?.keys ?? [];
  assert.equal(
    policyTx.instructions[0]?.programId.toBase58(),
    programId.toBase58(),
  );
  assert.equal(
    policyKeys[1]?.pubkey.toBase58(),
    deriveProtocolGovernancePda(programId).toBase58(),
  );
  assert.equal(policyKeys[3]?.pubkey.toBase58(), policySeries.toBase58());
  assert.equal(
    policyKeys[4]?.pubkey.toBase58(),
    deriveSeriesReserveLedgerPda({
      policySeries,
      assetMint,
      programId,
    }).toBase58(),
  );

  const fundingTx = buildOpenFundingLineTx({
    authority,
    healthPlanAddress,
    reserveDomainAddress,
    assetMint,
    recentBlockhash,
    lineId,
    policySeriesAddress: policySeries,
    lineType: FUNDING_LINE_TYPE_SPONSOR_BUDGET,
    fundingPriority: 1,
    committedAmount: 100n,
    programId,
  });
  const fundingKeys = fundingTx.instructions[0]?.keys ?? [];
  assert.equal(
    fundingTx.instructions[0]?.programId.toBase58(),
    programId.toBase58(),
  );
  assert.equal(
    fundingKeys[1]?.pubkey.toBase58(),
    deriveProtocolGovernancePda(programId).toBase58(),
  );
  assert.equal(
    fundingKeys[3]?.pubkey.toBase58(),
    deriveDomainAssetVaultPda({
      reserveDomain: reserveDomainAddress,
      assetMint,
      programId,
    }).toBase58(),
  );
  assert.equal(
    fundingKeys[4]?.pubkey.toBase58(),
    deriveDomainAssetLedgerPda({
      reserveDomain: reserveDomainAddress,
      assetMint,
      programId,
    }).toBase58(),
  );
  assert.equal(fundingKeys[5]?.pubkey.toBase58(), fundingLine.toBase58());
  assert.equal(
    fundingKeys[6]?.pubkey.toBase58(),
    deriveFundingLineLedgerPda({
      fundingLine,
      assetMint,
      programId,
    }).toBase58(),
  );
  assert.equal(
    fundingKeys[7]?.pubkey.toBase58(),
    derivePlanReserveLedgerPda({
      healthPlan: healthPlanAddress,
      assetMint,
      programId,
    }).toBase58(),
  );
  assert.equal(fundingKeys[8]?.pubkey.toBase58(), policySeries.toBase58());
  assert.equal(
    fundingKeys[9]?.pubkey.toBase58(),
    deriveSeriesReserveLedgerPda({
      policySeries,
      assetMint,
      programId,
    }).toBase58(),
  );
});

test('obligation, impairment, and LP builders derive PDAs with the selected program id', () => {
  const authority = Keypair.generate().publicKey;
  const healthPlanAddress = Keypair.generate().publicKey;
  const reserveDomainAddress = Keypair.generate().publicKey;
  const fundingLineAddress = Keypair.generate().publicKey;
  const assetMint = Keypair.generate().publicKey;
  const poolAssetMint = Keypair.generate().publicKey;
  const policySeriesAddress = Keypair.generate().publicKey;
  const capitalClassAddress = Keypair.generate().publicKey;
  const allocationPositionAddress = Keypair.generate().publicKey;
  const ownerAddress = Keypair.generate().publicKey;
  const poolAddress = Keypair.generate().publicKey;
  const programId = Keypair.generate().publicKey;
  const recentBlockhash = '11111111111111111111111111111111';
  const obligationId = 'custom-obligation';

  const obligationTx = buildCreateObligationTx({
    authority,
    healthPlanAddress,
    reserveDomainAddress,
    fundingLineAddress,
    assetMint,
    recentBlockhash,
    obligationId,
    policySeriesAddress,
    capitalClassAddress,
    allocationPositionAddress,
    poolAssetMint,
    deliveryMode: 0,
    amount: 50n,
    programId,
  });
  const obligationKeys = obligationTx.instructions[0]?.keys ?? [];
  assert.equal(
    obligationKeys[1]?.pubkey.toBase58(),
    deriveProtocolGovernancePda(programId).toBase58(),
  );
  assert.equal(
    obligationKeys[3]?.pubkey.toBase58(),
    deriveDomainAssetLedgerPda({
      reserveDomain: reserveDomainAddress,
      assetMint,
      programId,
    }).toBase58(),
  );
  assert.equal(
    obligationKeys[6]?.pubkey.toBase58(),
    derivePlanReserveLedgerPda({
      healthPlan: healthPlanAddress,
      assetMint,
      programId,
    }).toBase58(),
  );
  assert.equal(
    obligationKeys[10]?.pubkey.toBase58(),
    derivePoolClassLedgerPda({
      capitalClass: capitalClassAddress,
      assetMint: poolAssetMint,
      programId,
    }).toBase58(),
  );
  assert.equal(
    obligationKeys[12]?.pubkey.toBase58(),
    deriveAllocationLedgerPda({
      allocationPosition: allocationPositionAddress,
      assetMint,
      programId,
    }).toBase58(),
  );
  assert.equal(
    obligationKeys[13]?.pubkey.toBase58(),
    deriveObligationPda({
      fundingLine: fundingLineAddress,
      obligationId,
      programId,
    }).toBase58(),
  );

  const impairmentTx = buildMarkImpairmentTx({
    authority,
    healthPlanAddress,
    reserveDomainAddress,
    fundingLineAddress,
    assetMint,
    recentBlockhash,
    amount: 5n,
    policySeriesAddress,
    capitalClassAddress,
    allocationPositionAddress,
    poolAssetMint,
    programId,
  });
  const impairmentKeys = impairmentTx.instructions[0]?.keys ?? [];
  assert.equal(
    impairmentKeys[1]?.pubkey.toBase58(),
    deriveProtocolGovernancePda(programId).toBase58(),
  );
  assert.equal(
    impairmentKeys[10]?.pubkey.toBase58(),
    deriveAllocationLedgerPda({
      allocationPosition: allocationPositionAddress,
      assetMint,
      programId,
    }).toBase58(),
  );

  const lpTx = buildUpdateLpPositionCredentialingTx({
    authority,
    poolAddress,
    capitalClassAddress,
    ownerAddress,
    recentBlockhash,
    credentialed: true,
    programId,
  });
  const lpKeys = lpTx.instructions[0]?.keys ?? [];
  assert.equal(
    lpKeys[1]?.pubkey.toBase58(),
    deriveProtocolGovernancePda(programId).toBase58(),
  );
  assert.equal(
    lpKeys[4]?.pubkey.toBase58(),
    deriveLpPositionPda({
      capitalClass: capitalClassAddress,
      owner: ownerAddress,
      programId,
    }).toBase58(),
  );
});

test('buildCreateDomainAssetVaultTx derives the protocol-owned vault token account', () => {
  const authority = Keypair.generate().publicKey;
  const reserveDomainAddress = Keypair.generate().publicKey;
  const assetMint = Keypair.generate().publicKey;
  const vaultTokenAccountAddress = deriveDomainAssetVaultTokenAccountPda({
    reserveDomain: reserveDomainAddress,
    assetMint,
  });

  const tx = buildCreateDomainAssetVaultTx({
    authority,
    reserveDomainAddress,
    assetMint,
    recentBlockhash: '11111111111111111111111111111111',
  });

  assert.equal(tx.instructions.length, 1);
  assert.equal(tx.feePayer?.toBase58(), authority.toBase58());
  assert.equal(tx.instructions[0]?.data.byteLength, 40);
  assert.equal(
    tx.instructions[0]?.keys[6]?.pubkey.toBase58(),
    vaultTokenAccountAddress.toBase58(),
  );
  assert.equal(tx.instructions[0]?.keys[6]?.isWritable, true);

  const explicitTx = buildCreateDomainAssetVaultTx({
    authority,
    reserveDomainAddress,
    assetMint,
    vaultTokenAccountAddress,
    recentBlockhash: '11111111111111111111111111111111',
  });
  assert.equal(
    explicitTx.instructions[0]?.keys[6]?.pubkey.toBase58(),
    vaultTokenAccountAddress.toBase58(),
  );

  const staleOverrideTx = buildCreateDomainAssetVaultTx({
    authority,
    reserveDomainAddress,
    assetMint,
    vaultTokenAccountAddress: Keypair.generate().publicKey,
    recentBlockhash: '11111111111111111111111111111111',
  });
  assert.equal(
    staleOverrideTx.instructions[0]?.keys[6]?.pubkey.toBase58(),
    vaultTokenAccountAddress.toBase58(),
  );
});

test('reserve rail, governance, and claim settlement builders derive canonical accounts', () => {
  assert.equal(typeof buildPublishReserveAssetRailPriceTx, 'function');
  assert.equal(typeof buildInitializeSeriesReserveLedgerTx, 'function');
  assert.equal(typeof buildSettleClaimCaseTx, 'function');
  assert.equal(typeof buildSettleClaimCaseSelectedAssetTx, 'function');
  assert.equal(typeof buildAcceptProtocolGovernanceAuthorityTx, 'function');
  assert.equal(
    typeof buildCancelProtocolGovernanceAuthorityTransferTx,
    'function',
  );

  const authority = Keypair.generate().publicKey;
  const pendingAuthority = Keypair.generate().publicKey;
  const reserveDomainAddress = Keypair.generate().publicKey;
  const healthPlanAddress = Keypair.generate().publicKey;
  const fundingLineAddress = Keypair.generate().publicKey;
  const policySeriesAddress = Keypair.generate().publicKey;
  const claimAssetMint = Keypair.generate().publicKey;
  const payoutAssetMint = Keypair.generate().publicKey;
  const claimCaseAddress = Keypair.generate().publicKey;
  const memberPositionAddress = Keypair.generate().publicKey;
  const obligationAddress = Keypair.generate().publicKey;
  const vaultTokenAccountAddress = Keypair.generate().publicKey;
  const payoutVaultTokenAccountAddress = Keypair.generate().publicKey;
  const recipientTokenAccountAddress = Keypair.generate().publicKey;
  const recentBlockhash = '11111111111111111111111111111111';

  const initializeTx = buildInitializeProtocolGovernanceTx({
    governanceAuthority: authority,
    protocolFeeBps: 25,
    emergencyPaused: false,
    recentBlockhash,
  });
  assert.equal(
    initializeTx.instructions[0]?.keys[2]?.pubkey.toBase58(),
    getProgramId().toBase58(),
  );
  assert.equal(
    initializeTx.instructions[0]?.keys[4]?.pubkey.toBase58(),
    SystemProgram.programId.toBase58(),
  );

  const acceptTx = buildAcceptProtocolGovernanceAuthorityTx({
    pendingAuthority,
    recentBlockhash,
  });
  assert.equal(
    acceptTx.instructions[0]?.keys[0]?.pubkey.toBase58(),
    pendingAuthority.toBase58(),
  );
  assert.equal(acceptTx.instructions[0]?.keys[1]?.isWritable, true);

  const cancelTx = buildCancelProtocolGovernanceAuthorityTransferTx({
    authority,
    recentBlockhash,
  });
  assert.equal(
    cancelTx.instructions[0]?.keys[0]?.pubkey.toBase58(),
    authority.toBase58(),
  );
  assert.equal(cancelTx.instructions[0]?.keys[1]?.isWritable, true);

  const claimRail = deriveReserveAssetRailPda({
    reserveDomain: reserveDomainAddress,
    assetMint: claimAssetMint,
  });
  const payoutRail = deriveReserveAssetRailPda({
    reserveDomain: reserveDomainAddress,
    assetMint: payoutAssetMint,
  });

  const configureTx = buildConfigureReserveAssetRailTx({
    authority,
    reserveDomainAddress,
    assetMint: claimAssetMint,
    assetSymbol: 'USDC',
    role: 0,
    payoutPriority: 1,
    oracleSource: 3,
    maxStalenessSeconds: 300n,
    maxConfidenceBps: 100,
    haircutBps: 0,
    maxExposureBps: 10_000,
    depositEnabled: true,
    payoutEnabled: true,
    capacityEnabled: true,
    active: true,
    recentBlockhash,
  });
  assert.equal(
    configureTx.instructions[0]?.keys[3]?.pubkey.toBase58(),
    claimRail.toBase58(),
  );

  const seriesLedgerTx = buildInitializeSeriesReserveLedgerTx({
    authority,
    healthPlanAddress,
    policySeriesAddress,
    assetMint: claimAssetMint,
    recentBlockhash,
  });
  assert.equal(
    seriesLedgerTx.instructions[0]?.keys[4]?.pubkey.toBase58(),
    deriveSeriesReserveLedgerPda({
      policySeries: policySeriesAddress,
      assetMint: claimAssetMint,
    }).toBase58(),
  );

  const settleTx = buildSettleClaimCaseTx({
    authority,
    reserveDomainAddress,
    healthPlanAddress,
    fundingLineAddress,
    assetMint: claimAssetMint,
    claimCaseAddress,
    memberPositionAddress,
    obligationAddress,
    policySeriesAddress,
    vaultTokenAccountAddress,
    recipientTokenAccountAddress,
    tokenProgramId: SPL_TOKEN_PROGRAM_ID,
    amount: 1_000n,
    recentBlockhash,
  });
  assert.equal(
    settleTx.instructions[0]?.keys[3]?.pubkey.toBase58(),
    claimRail.toBase58(),
  );
  assert.equal(
    settleTx.instructions[0]?.keys[13]?.pubkey.toBase58(),
    claimCaseAddress.toBase58(),
  );
  assert.equal(
    settleTx.instructions[0]?.keys[15]?.pubkey.toBase58(),
    deriveProtocolFeeVaultPda({
      reserveDomain: reserveDomainAddress,
      assetMint: claimAssetMint,
    }).toBase58(),
  );
  assert.equal(
    settleTx.instructions[0]?.keys[19]?.pubkey.toBase58(),
    memberPositionAddress.toBase58(),
  );

  const selectedAssetTx = buildSettleClaimCaseSelectedAssetTx({
    authority,
    reserveDomainAddress,
    healthPlanAddress,
    claimCaseAddress,
    memberPositionAddress,
    claimAssetMint,
    payoutAssetMint,
    payoutFundingLineAddress: fundingLineAddress,
    payoutVaultTokenAccountAddress,
    recipientTokenAccountAddress,
    tokenProgramId: SPL_TOKEN_PROGRAM_ID,
    policySeriesAddress,
    claimCreditAmount: 1_000n,
    payoutAmount: 990n,
    maxOverpayBps: 50,
    recentBlockhash,
  });
  assert.equal(
    selectedAssetTx.instructions[0]?.keys[3]?.pubkey.toBase58(),
    claimRail.toBase58(),
  );
  assert.equal(
    selectedAssetTx.instructions[0]?.keys[4]?.pubkey.toBase58(),
    payoutRail.toBase58(),
  );
  assert.equal(
    selectedAssetTx.instructions[0]?.keys[10]?.pubkey.toBase58(),
    deriveSeriesReserveLedgerPda({
      policySeries: policySeriesAddress,
      assetMint: payoutAssetMint,
    }).toBase58(),
  );
  assert.equal(
    selectedAssetTx.instructions[0]?.keys[15]?.pubkey.toBase58(),
    payoutVaultTokenAccountAddress.toBase58(),
  );
});

test('reserve and read-model helpers stay aligned with the canonical economic story', () => {
  const healthPlanAddress = Keypair.generate().publicKey.toBase58();
  const rewardSeriesAddress = Keypair.generate().publicKey.toBase58();
  const protectionSeriesAddress = Keypair.generate().publicKey.toBase58();
  const fundingLineAddress = Keypair.generate().publicKey.toBase58();
  const poolAddress = Keypair.generate().publicKey.toBase58();
  const openClassAddress = Keypair.generate().publicKey.toBase58();
  const wrapperClassAddress = Keypair.generate().publicKey.toBase58();
  const memberPositionAddress = Keypair.generate().publicKey.toBase58();
  const wallet = Keypair.generate().publicKey.toBase58();

  const sponsor = buildSponsorReadModel({
    healthPlan: {
      address: healthPlanAddress,
      reserveDomain: Keypair.generate().publicKey.toBase58(),
      planId: 'nexus-seeker-rewards',
      displayName: 'Nexus Seeker Rewards',
      sponsorLabel: 'OmegaX',
      planAdmin: wallet,
      sponsorOperator: wallet,
      claimsOperator: wallet,
      membershipModel: 'invite',
      active: true,
    },
    policySeries: [
      {
        address: rewardSeriesAddress,
        healthPlan: healthPlanAddress,
        seriesId: 'seeker-reward-series',
        displayName: 'Rewards',
        mode: SERIES_MODE_REWARD,
        status: 1,
        assetMint: ZERO.toBase58(),
        termsVersion: '1',
        comparabilityKey: 'reward-v1',
      },
      {
        address: protectionSeriesAddress,
        healthPlan: healthPlanAddress,
        seriesId: 'protection-series',
        displayName: 'Protection',
        mode: SERIES_MODE_PROTECTION,
        status: 1,
        assetMint: ZERO.toBase58(),
        termsVersion: '1',
        comparabilityKey: 'protect-v1',
      },
    ],
    fundingLines: [
      {
        address: fundingLineAddress,
        reserveDomain: ZERO.toBase58(),
        healthPlan: healthPlanAddress,
        assetMint: ZERO.toBase58(),
        lineId: 'sponsor-budget',
        displayName: 'Sponsor budget',
        lineType: FUNDING_LINE_TYPE_SPONSOR_BUDGET,
        fundingPriority: 1,
        fundedAmount: 1_000_000n,
        spentAmount: 125_000n,
        status: 0,
        sheet: { funded: 1_000_000n, reserved: 100_000n, settled: 25_000n },
      },
    ],
    obligations: [
      {
        address: Keypair.generate().publicKey.toBase58(),
        reserveDomain: ZERO.toBase58(),
        assetMint: ZERO.toBase58(),
        healthPlan: healthPlanAddress,
        policySeries: rewardSeriesAddress,
        fundingLine: fundingLineAddress,
        obligationId: 'reward-1',
        status: OBLIGATION_STATUS_SETTLED,
        deliveryMode: 0,
        principalAmount: 50_000n,
        settledAmount: 50_000n,
      },
    ],
    claimCases: [
      {
        address: Keypair.generate().publicKey.toBase58(),
        reserveDomain: ZERO.toBase58(),
        healthPlan: healthPlanAddress,
        policySeries: protectionSeriesAddress,
        fundingLine: fundingLineAddress,
        memberPosition: memberPositionAddress,
        claimant: wallet,
        claimId: 'claim-1',
        intakeStatus: CLAIM_INTAKE_APPROVED,
        approvedAmount: 25_000n,
      },
    ],
    planLedger: { funded: 1_000_000n, reserved: 100_000n, claimable: 25_000n },
  });

  assert.equal(sponsor.fundedSponsorBudget, 1_000_000n);
  assert.equal(sponsor.paidRewards, 50_000n);
  assert.equal(sponsor.claimCounts.approved, 1);

  const capital = buildCapitalReadModel({
    liquidityPool: {
      address: poolAddress,
      reserveDomain: ZERO.toBase58(),
      poolId: 'omega-health-income',
      displayName: 'Omega Health Income',
      depositAssetMint: ZERO.toBase58(),
      strategyThesis: 'health reserves',
      redemptionPolicy: 1,
      totalValueLocked: 750_000n,
      active: true,
    },
    capitalClasses: [
      {
        address: openClassAddress,
        liquidityPool: poolAddress,
        classId: 'open-usdc-class',
        displayName: 'Open',
        priority: 1,
        restrictionMode: 0,
        totalShares: 500_000n,
        navAssets: 500_000n,
        allocatedAssets: 220_000n,
        pendingRedemptions: 25_000n,
        active: true,
      },
      {
        address: wrapperClassAddress,
        liquidityPool: poolAddress,
        classId: 'wrapper-class',
        displayName: 'Wrapper',
        priority: 2,
        restrictionMode: CAPITAL_CLASS_RESTRICTION_WRAPPER_ONLY,
        totalShares: 250_000n,
        navAssets: 250_000n,
        allocatedAssets: 100_000n,
        pendingRedemptions: 0n,
        queueOnlyRedemptions: true,
        active: true,
      },
    ],
    classLedgers: [
      {
        address: Keypair.generate().publicKey.toBase58(),
        capitalClass: openClassAddress,
        assetMint: ZERO.toBase58(),
        totalShares: 500_000n,
        realizedYieldAmount: 15_000n,
        sheet: {
          funded: 500_000n,
          allocated: 220_000n,
          reserved: 80_000n,
          pending_redemption: 25_000n,
        },
      },
      {
        address: Keypair.generate().publicKey.toBase58(),
        capitalClass: wrapperClassAddress,
        assetMint: ZERO.toBase58(),
        totalShares: 250_000n,
        realizedYieldAmount: 5_000n,
        sheet: { funded: 250_000n, allocated: 100_000n, reserved: 30_000n },
      },
    ],
    allocations: [
      {
        address: Keypair.generate().publicKey.toBase58(),
        reserveDomain: ZERO.toBase58(),
        liquidityPool: poolAddress,
        capitalClass: openClassAddress,
        healthPlan: healthPlanAddress,
        policySeries: protectionSeriesAddress,
        fundingLine: fundingLineAddress,
        capAmount: 300_000n,
        weightBps: 8000,
        allocatedAmount: 220_000n,
        reservedCapacity: 80_000n,
        active: true,
      },
    ],
  });

  assert.equal(capital.totalNav, 750_000n);
  assert.equal(capital.classes[0]?.realizedYield, 15_000n);
  assert.equal(capital.classes[1]?.restriction, 'wrapper_only');

  const member = buildMemberReadModel({
    wallet,
    memberPositions: [
      {
        address: memberPositionAddress,
        wallet,
        healthPlan: healthPlanAddress,
        policySeries: rewardSeriesAddress,
        eligibilityStatus: 1,
        delegatedRights: ['claim'],
        active: true,
      },
    ],
    obligations: [
      {
        address: Keypair.generate().publicKey.toBase58(),
        reserveDomain: ZERO.toBase58(),
        assetMint: ZERO.toBase58(),
        healthPlan: healthPlanAddress,
        policySeries: rewardSeriesAddress,
        memberWallet: wallet,
        fundingLine: fundingLineAddress,
        obligationId: 'reward-claimable',
        status: 2,
        deliveryMode: 0,
        principalAmount: 10_000n,
        claimableAmount: 10_000n,
      },
    ],
    claimCases: [
      {
        address: Keypair.generate().publicKey.toBase58(),
        reserveDomain: ZERO.toBase58(),
        healthPlan: healthPlanAddress,
        policySeries: rewardSeriesAddress,
        fundingLine: fundingLineAddress,
        memberPosition: memberPositionAddress,
        claimant: wallet,
        claimId: 'reward-claim',
        intakeStatus: CLAIM_INTAKE_APPROVED,
        approvedAmount: 10_000n,
      },
    ],
  });

  assert.equal(member.planParticipations[0]?.claimableRewards, 10_000n);
  assert.equal(member.planParticipations[0]?.claimStatusCounts.approved, 1);
  assert.equal(
    recomputeReserveBalanceSheet({ funded: 100n, reserved: 10n }).free,
    90n,
  );
});
