import test from 'node:test';
import assert from 'node:assert/strict';
import { Connection, Keypair } from '@solana/web3.js';

import { NakamaLegacyWriteDisabledError } from '../src/errors.js';
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
  buildProtocolInstruction,
  buildProtocolTransaction,
  createProtocolClient,
  createSafeProtocolClient,
} from '../src/protocol.js';

// The legacy builder signatures stay available on the explicit Solana migration
// subpath, but every construction path must fail before producing signable data.

const BLOCKHASH = '11111111111111111111111111111111';
const HASH = 'a1'.repeat(32);
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

const cases: Array<[ProtocolInstructionName, () => unknown]> = [
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

test('all 21 legacy Solana convenience builders fail closed', () => {
  const covered = new Set<string>();
  for (const [name, build] of cases) {
    assert.throws(build, NakamaLegacyWriteDisabledError, name);
    covered.add(name);
  }
  const expected = Object.keys(PROTOCOL_INSTRUCTION_ACCOUNTS).sort();
  assert.deepEqual([...covered].sort(), expected, 'all instructions covered');
});

test('low-level and generated-client legacy write builders fail closed', () => {
  assert.throws(
    () => buildProtocolInstruction({} as never),
    NakamaLegacyWriteDisabledError,
  );
  assert.throws(
    () => buildProtocolTransaction({} as never),
    NakamaLegacyWriteDisabledError,
  );

  const connection = new Connection('http://127.0.0.1:8899');
  const raw = createProtocolClient(connection, PROTOCOL_PROGRAM_ID);
  assert.throws(
    () => raw.buildInstruction({} as never),
    NakamaLegacyWriteDisabledError,
  );
  assert.throws(
    () => raw.buildCreateReserveDomainTx({} as never),
    NakamaLegacyWriteDisabledError,
  );
});

test('safe-client legacy write methods fail before any RPC preflight', async () => {
  const safe = createSafeProtocolClient(
    new Connection('http://127.0.0.1:8899'),
  );
  await assert.rejects(
    safe.buildFundSponsorBudgetTx({} as never),
    NakamaLegacyWriteDisabledError,
  );
  await assert.rejects(
    safe.buildRecordPremiumPaymentTx({} as never),
    NakamaLegacyWriteDisabledError,
  );
  assert.throws(
    () => safe.buildOpenClaimCaseTx({} as never),
    NakamaLegacyWriteDisabledError,
  );
  assert.throws(
    () => safe.buildReserveObligationTx({} as never),
    NakamaLegacyWriteDisabledError,
  );
  assert.throws(
    () => safe.buildReleaseReserveTx({} as never),
    NakamaLegacyWriteDisabledError,
  );
  await assert.rejects(
    safe.buildSettleObligationTx({} as never),
    NakamaLegacyWriteDisabledError,
  );
  await assert.rejects(
    safe.buildSettleClaimCaseTx({} as never),
    NakamaLegacyWriteDisabledError,
  );
});
