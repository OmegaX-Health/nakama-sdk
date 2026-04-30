import test from 'node:test';
import assert from 'node:assert/strict';
import BN from 'bn.js';
import { BorshCoder } from '@coral-xyz/anchor';
import { Keypair, PublicKey } from '@solana/web3.js';

import idl from '../src/generated/omegax_protocol.idl.json' with { type: 'json' };
import {
  buildAttestClaimCaseTx,
  buildCreateDomainAssetVaultTx,
  buildOpenMemberPositionTx,
  buildProtocolInstruction,
  CLAIM_INTAKE_APPROVED,
  CAPITAL_CLASS_RESTRICTION_WRAPPER_ONLY,
  FUNDING_LINE_TYPE_SPONSOR_BUDGET,
  OBLIGATION_STATUS_SETTLED,
  SERIES_MODE_PROTECTION,
  SERIES_MODE_REWARD,
  buildCapitalReadModel,
  buildMemberReadModel,
  buildSponsorReadModel,
  createProtocolClient,
  decodeProtocolAccount,
  deriveClaimAttestationPda,
  deriveAllocationPositionPda,
  deriveDomainAssetVaultTokenAccountPda,
  deriveHealthPlanPda,
  deriveLiquidityPoolPda,
  deriveMemberPositionPda,
  deriveMembershipAnchorSeatPda,
  deriveOracleProfilePda,
  derivePoolOracleFeeVaultPda,
  deriveOutcomeSchemaPda,
  derivePoolOraclePolicyPda,
  derivePoolTreasuryVaultPda,
  deriveProtocolFeeVaultPda,
  deriveProtocolGovernancePda,
  deriveReserveDomainPda,
  getProgramId,
  listProtocolAccountNames,
  listProtocolInstructionNames,
  recomputeReserveBalanceSheet,
} from '../src/index.js';
import { createAccountReaderConnectionStub } from './support/protocol-account-reader.js';

const CODER = new BorshCoder(idl as never);
const ZERO = new PublicKey('11111111111111111111111111111111');

test('canonical surface listings expose the new instruction and account model', () => {
  const instructionNames = listProtocolInstructionNames();
  const accountNames = listProtocolAccountNames();

  assert(instructionNames.includes('create_reserve_domain'));
  assert(instructionNames.includes('create_health_plan'));
  assert(instructionNames.includes('create_liquidity_pool'));
  assert(!instructionNames.includes('create_pool' as never));

  assert(accountNames.includes('ReserveDomain'));
  assert(accountNames.includes('HealthPlan'));
  assert(accountNames.includes('LiquidityPool'));
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

test('buildAttestClaimCaseTx includes the schema-bound outcome schema account', () => {
  const oracle = Keypair.generate().publicKey;
  const claimCaseAddress = Keypair.generate().publicKey;
  const schemaKeyHashHex = '12'.repeat(32);
  const tx = buildAttestClaimCaseTx({
    oracle,
    claimCaseAddress,
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
    deriveOracleProfilePda({ oracle }).toBase58(),
  );
  assert.equal(keys[2]?.pubkey.toBase58(), claimCaseAddress.toBase58());
  assert.equal(
    keys[3]?.pubkey.toBase58(),
    deriveOutcomeSchemaPda({ schemaKeyHashHex }).toBase58(),
  );
  assert.equal(
    keys[4]?.pubkey.toBase58(),
    deriveClaimAttestationPda({
      claimCase: claimCaseAddress,
      oracle,
    }).toBase58(),
  );
});

test('buildAttestClaimCaseTx rejects unsupported attestation decisions before submission', () => {
  const oracle = Keypair.generate().publicKey;
  const claimCaseAddress = Keypair.generate().publicKey;

  assert.throws(
    () =>
      buildAttestClaimCaseTx({
        oracle,
        claimCaseAddress,
        recentBlockhash: '11111111111111111111111111111111',
        decision: 99,
        attestationHashHex: '34'.repeat(32),
        attestationRefHashHex: '56'.repeat(32),
        schemaKeyHashHex: '12'.repeat(32),
      }),
    /claim attestation decision must be one of 0/,
  );
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
  const inviteAuthority = keys[6];
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
    keys[3]?.pubkey.toBase58(),
    deriveMemberPositionPda({
      healthPlan: healthPlanAddress,
      wallet,
      programId,
    }).toBase58(),
  );
  assert.equal(
    keys[4]?.pubkey.toBase58(),
    deriveMembershipAnchorSeatPda({
      healthPlan: healthPlanAddress,
      anchorRef: anchorRefAddress,
      programId,
    }).toBase58(),
  );
  for (const index of [5, 6]) {
    assert.equal(keys[index]?.pubkey.toBase58(), programId.toBase58());
    assert.equal(keys[index]?.isSigner, false);
    assert.equal(keys[index]?.isWritable, false);
  }
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
