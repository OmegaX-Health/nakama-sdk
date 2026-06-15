import test from 'node:test';
import assert from 'node:assert/strict';
import { BorshCoder } from '@coral-xyz/anchor';
import { Keypair, type Transaction } from '@solana/web3.js';

import idl from '../src/generated/omegax_protocol.idl.json' with { type: 'json' };
import {
  PROTOCOL_INSTRUCTION_ACCOUNTS,
  PROTOCOL_PROGRAM_ID,
  type ProtocolInstructionName,
} from '../src/generated/protocol_contract.js';
import {
  buildAdjudicateClaimCaseTx,
  buildAuthorizeClaimRecipientTx,
  buildCreateDomainAssetVaultTx,
  buildCreateHealthPlanTx,
  buildCreateObligationTx,
  buildCreatePolicySeriesTx,
  buildCreateReserveDomainTx,
  buildDepositReserveCapitalTx,
  buildFundSponsorBudgetTx,
  buildOpenClaimCaseTx,
  buildOpenFundingLineTx,
  buildRecordPremiumPaymentTx,
  buildRecordReserveEarningsTx,
  buildReleaseReserveTx,
  buildReserveObligationTx,
  buildReturnReserveCapitalTx,
  buildSettleClaimCaseTx,
  buildSettleObligationTx,
  buildUpdateHealthPlanControlsTx,
  buildUpdateReserveDomainControlsTx,
  buildVersionPolicySeriesTx,
} from '../src/protocol.js';

// A correct, deployed-surface-aligned builder must emit exactly the accounts the
// on-chain program expects, in order, with the right signer/writable flags, and
// must encode args the program coder can decode. This suite proves that for all
// 21 instructions by reconciling each built instruction against the generated
// contract (PROTOCOL_INSTRUCTION_ACCOUNTS) — the single source of truth synced
// from the program IDL. Every optional account is supplied so each position is a
// real account whose flags must match the contract exactly.

const BLOCKHASH = '11111111111111111111111111111111';
const HASH = 'a1'.repeat(32);
const coder = new BorshCoder(idl as never);
const k = () => Keypair.generate().publicKey;

// Fixed actors/inputs reused across builders.
const authority = k();
const reserveDomain = k();
const healthPlan = k();
const fundingLine = k();
const policySeries = k();
const currentPolicySeries = k();
const claimCase = k();
const obligation = k();
const assetMint = k();
const sourceTokenAccount = k();
const vaultTokenAccount = k();
const recipientTokenAccount = k();
const contributor = k();
const recipient = k();

function assertInstruction(
  name: ProtocolInstructionName,
  tx: Transaction,
): void {
  const ix = tx.instructions[0];
  assert.ok(ix, `${name}: produced an instruction`);
  assert.equal(
    ix.programId.toBase58(),
    PROTOCOL_PROGRAM_ID,
    `${name}: program id`,
  );
  const spec = PROTOCOL_INSTRUCTION_ACCOUNTS[name];
  assert.equal(
    ix.keys.length,
    spec.length,
    `${name}: account count (got ${ix.keys.length}, contract ${spec.length})`,
  );
  spec.forEach((acct, i) => {
    const key = ix.keys[i];
    assert.equal(
      key.isSigner,
      acct.signer,
      `${name}[${i}] ${acct.name}: signer flag`,
    );
    assert.equal(
      key.isWritable,
      acct.writable,
      `${name}[${i}] ${acct.name}: writable flag`,
    );
  });
  // Data must decode against the program coder (discriminator + args round-trip).
  const decoded = coder.instruction.decode(ix.data);
  assert.ok(decoded, `${name}: instruction data decodes`);
  assert.equal(decoded?.name, name, `${name}: decoded instruction name`);
}

const cases: Array<[ProtocolInstructionName, () => Transaction]> = [
  [
    'create_reserve_domain',
    () =>
      buildCreateReserveDomainTx({
        authority,
        recentBlockhash: BLOCKHASH,
        domainId: 'domain-1',
        displayName: 'Domain One',
        settlementMode: 0,
        legalStructureHashHex: HASH,
        complianceBaselineHashHex: HASH,
        allowedRailMask: 1,
        pauseFlags: 0,
      }),
  ],
  [
    'create_domain_asset_vault',
    () =>
      buildCreateDomainAssetVaultTx({
        authority,
        reserveDomainAddress: reserveDomain,
        assetMint,
        recentBlockhash: BLOCKHASH,
      }),
  ],
  [
    'create_health_plan',
    () =>
      buildCreateHealthPlanTx({
        planAdmin: authority,
        reserveDomainAddress: reserveDomain,
        recentBlockhash: BLOCKHASH,
        planId: 'plan-1',
        displayName: 'Plan One',
        organizationRef: 'org-1',
        metadataUri: 'ipfs://plan',
        sponsor: k(),
        sponsorOperator: k(),
        claimsOperator: k(),
        oracleAuthority: k(),
        allowedRailMask: 1,
        defaultFundingPriority: 0,
        oraclePolicyHashHex: HASH,
        schemaBindingHashHex: HASH,
        complianceBaselineHashHex: HASH,
        pauseFlags: 0,
      }),
  ],
  [
    'create_policy_series',
    () =>
      buildCreatePolicySeriesTx({
        authority,
        healthPlanAddress: healthPlan,
        assetMint,
        recentBlockhash: BLOCKHASH,
        seriesId: 'series-1',
        displayName: 'Series One',
        metadataUri: 'ipfs://series',
        mode: 0,
        status: 0,
        adjudicationMode: 0,
        termsHashHex: HASH,
        pricingHashHex: HASH,
        payoutHashHex: HASH,
        reserveModelHashHex: HASH,
        comparabilityHashHex: HASH,
        policyOverridesHashHex: HASH,
        cycleSeconds: 2592000n,
        termsVersion: 1,
      }),
  ],
  [
    'version_policy_series',
    () =>
      buildVersionPolicySeriesTx({
        authority,
        healthPlanAddress: healthPlan,
        currentPolicySeriesAddress: currentPolicySeries,
        recentBlockhash: BLOCKHASH,
        seriesId: 'series-2',
        displayName: 'Series Two',
        metadataUri: 'ipfs://series2',
        status: 0,
        adjudicationMode: 0,
        termsHashHex: HASH,
        pricingHashHex: HASH,
        payoutHashHex: HASH,
        reserveModelHashHex: HASH,
        comparabilityHashHex: HASH,
        policyOverridesHashHex: HASH,
        cycleSeconds: 2592000n,
      }),
  ],
  [
    'update_health_plan_controls',
    () =>
      buildUpdateHealthPlanControlsTx({
        authority,
        healthPlanAddress: healthPlan,
        recentBlockhash: BLOCKHASH,
        sponsorOperator: k(),
        claimsOperator: k(),
        oracleAuthority: k(),
        allowedRailMask: 1,
        defaultFundingPriority: 0,
        oraclePolicyHashHex: HASH,
        schemaBindingHashHex: HASH,
        complianceBaselineHashHex: HASH,
        pauseFlags: 0,
        active: true,
        reasonHashHex: HASH,
      }),
  ],
  [
    'update_reserve_domain_controls',
    () =>
      buildUpdateReserveDomainControlsTx({
        authority,
        reserveDomainAddress: reserveDomain,
        recentBlockhash: BLOCKHASH,
        allowedRailMask: 1,
        pauseFlags: 0,
        active: true,
        reasonHashHex: HASH,
      }),
  ],
  [
    'open_funding_line',
    () =>
      buildOpenFundingLineTx({
        authority,
        healthPlanAddress: healthPlan,
        reserveDomainAddress: reserveDomain,
        assetMint,
        recentBlockhash: BLOCKHASH,
        lineId: 'line-1',
        policySeriesAddress: policySeries,
        lineType: 0,
        fundingPriority: 0,
        committedAmount: 1000n,
        capsHashHex: HASH,
      }),
  ],
  [
    'deposit_reserve_capital',
    () =>
      buildDepositReserveCapitalTx({
        contributor,
        healthPlanAddress: healthPlan,
        reserveDomainAddress: reserveDomain,
        fundingLineAddress: fundingLine,
        assetMint,
        sourceTokenAccountAddress: sourceTokenAccount,
        vaultTokenAccountAddress: vaultTokenAccount,
        recentBlockhash: BLOCKHASH,
        amount: 500n,
        termsHashHex: HASH,
      }),
  ],
  [
    'fund_sponsor_budget',
    () =>
      buildFundSponsorBudgetTx({
        authority,
        healthPlanAddress: healthPlan,
        reserveDomainAddress: reserveDomain,
        fundingLineAddress: fundingLine,
        assetMint,
        sourceTokenAccountAddress: sourceTokenAccount,
        vaultTokenAccountAddress: vaultTokenAccount,
        recentBlockhash: BLOCKHASH,
        amount: 500n,
      }),
  ],
  [
    'record_premium_payment',
    () =>
      buildRecordPremiumPaymentTx({
        authority,
        healthPlanAddress: healthPlan,
        reserveDomainAddress: reserveDomain,
        fundingLineAddress: fundingLine,
        assetMint,
        sourceTokenAccountAddress: sourceTokenAccount,
        vaultTokenAccountAddress: vaultTokenAccount,
        recentBlockhash: BLOCKHASH,
        amount: 500n,
      }),
  ],
  [
    'record_reserve_earnings',
    () =>
      buildRecordReserveEarningsTx({
        authority,
        healthPlanAddress: healthPlan,
        reserveDomainAddress: reserveDomain,
        fundingLineAddress: fundingLine,
        assetMint,
        sourceTokenAccountAddress: sourceTokenAccount,
        vaultTokenAccountAddress: vaultTokenAccount,
        recentBlockhash: BLOCKHASH,
        amount: 500n,
        earningsRefHashHex: HASH,
      }),
  ],
  [
    'return_reserve_capital',
    () =>
      buildReturnReserveCapitalTx({
        authority,
        contributorAddress: contributor,
        healthPlanAddress: healthPlan,
        reserveDomainAddress: reserveDomain,
        fundingLineAddress: fundingLine,
        assetMint,
        vaultTokenAccountAddress: vaultTokenAccount,
        recipientTokenAccountAddress: recipientTokenAccount,
        recentBlockhash: BLOCKHASH,
        amount: 500n,
        reasonHashHex: HASH,
      }),
  ],
  [
    'create_obligation',
    () =>
      buildCreateObligationTx({
        authority,
        healthPlanAddress: healthPlan,
        reserveDomainAddress: reserveDomain,
        fundingLineAddress: fundingLine,
        assetMint,
        recentBlockhash: BLOCKHASH,
        obligationId: 'oblig-1',
        policySeriesAddress: policySeries,
        memberWalletAddress: k(),
        beneficiaryAddress: k(),
        claimCaseAddress: claimCase,
        deliveryMode: 0,
        amount: 500n,
        creationReasonHashHex: HASH,
      }),
  ],
  [
    'reserve_obligation',
    () =>
      buildReserveObligationTx({
        authority,
        healthPlanAddress: healthPlan,
        reserveDomainAddress: reserveDomain,
        fundingLineAddress: fundingLine,
        assetMint,
        obligationAddress: obligation,
        recentBlockhash: BLOCKHASH,
        amount: 500n,
        claimCaseAddress: claimCase,
      }),
  ],
  [
    'release_reserve',
    () =>
      buildReleaseReserveTx({
        authority,
        healthPlanAddress: healthPlan,
        reserveDomainAddress: reserveDomain,
        fundingLineAddress: fundingLine,
        assetMint,
        obligationAddress: obligation,
        recentBlockhash: BLOCKHASH,
        amount: 500n,
        claimCaseAddress: claimCase,
      }),
  ],
  [
    'settle_obligation',
    () =>
      buildSettleObligationTx({
        authority,
        healthPlanAddress: healthPlan,
        reserveDomainAddress: reserveDomain,
        fundingLineAddress: fundingLine,
        assetMint,
        obligationAddress: obligation,
        recentBlockhash: BLOCKHASH,
        nextStatus: 1,
        amount: 500n,
        settlementReasonHashHex: HASH,
        claimCaseAddress: claimCase,
        memberPositionAddress: k(),
        vaultTokenAccountAddress: vaultTokenAccount,
        recipientTokenAccountAddress: recipientTokenAccount,
      }),
  ],
  [
    'open_claim_case',
    () =>
      buildOpenClaimCaseTx({
        authority,
        healthPlanAddress: healthPlan,
        fundingLineAddress: fundingLine,
        recentBlockhash: BLOCKHASH,
        claimId: 'claim-1',
        policySeriesAddress: policySeries,
        claimantAddress: recipient,
        evidenceRefHashHex: HASH,
      }),
  ],
  [
    'authorize_claim_recipient',
    () =>
      buildAuthorizeClaimRecipientTx({
        authority,
        claimCaseAddress: claimCase,
        recentBlockhash: BLOCKHASH,
        delegateRecipient: recipient,
      }),
  ],
  [
    'adjudicate_claim_case',
    () =>
      buildAdjudicateClaimCaseTx({
        authority,
        healthPlanAddress: healthPlan,
        claimCaseAddress: claimCase,
        recentBlockhash: BLOCKHASH,
        reviewState: 1,
        approvedAmount: 500n,
        deniedAmount: 0n,
        reserveAmount: 0n,
        evidenceRefHashHex: HASH,
        decisionSupportHashHex: HASH,
        obligationAddress: obligation,
      }),
  ],
  [
    'settle_claim_case',
    () =>
      buildSettleClaimCaseTx({
        authority,
        healthPlanAddress: healthPlan,
        reserveDomainAddress: reserveDomain,
        fundingLineAddress: fundingLine,
        assetMint,
        claimCaseAddress: claimCase,
        recentBlockhash: BLOCKHASH,
        amount: 500n,
        obligationAddress: obligation,
        memberPositionAddress: k(),
        vaultTokenAccountAddress: vaultTokenAccount,
        recipientTokenAccountAddress: recipientTokenAccount,
      }),
  ],
];

test('all 21 builders emit contract-aligned accounts and decodable data', () => {
  const covered = new Set<string>();
  for (const [name, build] of cases) {
    assertInstruction(name, build());
    covered.add(name);
  }
  // Guard: the suite must cover exactly the deployed instruction surface.
  const expected = Object.keys(PROTOCOL_INSTRUCTION_ACCOUNTS).sort();
  assert.deepEqual([...covered].sort(), expected, 'all instructions covered');
});

test('optional accounts collapse to a non-writable program-id placeholder when omitted', () => {
  // open_funding_line: omit the optional policy_series; it must become a
  // program-id placeholder (non-signer, non-writable), not a missing account.
  const tx = buildOpenFundingLineTx({
    authority,
    healthPlanAddress: healthPlan,
    reserveDomainAddress: reserveDomain,
    assetMint,
    recentBlockhash: BLOCKHASH,
    lineId: 'line-2',
    lineType: 0,
    fundingPriority: 0,
    committedAmount: 1000n,
    capsHashHex: HASH,
  });
  const spec = PROTOCOL_INSTRUCTION_ACCOUNTS.open_funding_line;
  const ix = tx.instructions[0];
  assert.equal(
    ix.keys.length,
    spec.length,
    'account count unchanged when optional omitted',
  );
  const idx = spec.findIndex((a) => a.name === 'policy_series');
  assert.equal(
    ix.keys[idx].pubkey.toBase58(),
    PROTOCOL_PROGRAM_ID,
    'omitted optional → program id placeholder',
  );
  assert.equal(ix.keys[idx].isWritable, false, 'placeholder is non-writable');
  assert.equal(ix.keys[idx].isSigner, false, 'placeholder is non-signer');
});
