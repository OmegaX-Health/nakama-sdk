import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PublicKey } from '@solana/web3.js';

import { NakamaLegacyWriteDisabledError } from '../src/errors.js';

import {
  buildDelegateReviewSessionTx,
  buildInitializeReviewRegistryTx,
  buildOpenReviewSessionTx,
  buildSetReviewOperatorActiveTx,
  buildUpsertReviewOperatorTx,
  buildPrivatePaymentsApiTransaction,
  createMagicBlockConnections,
  buildRecordPrivatePaymentRefTx,
  buildRecordPrivateReviewTx,
  buildCommitAndCloseReviewSessionTx,
  decodePrivateClaimReviewSessionAccount,
  decodePrivateReviewOperatorAccount,
  deriveMagicBlockDelegateAccounts,
  derivePrivateReviewOperatorPda,
  derivePrivateReviewRegistryPda,
  derivePrivateClaimReviewSessionPda,
  isDelegatedAccountOwner,
  MAGICBLOCK_DELEGATION_PROGRAM_ID,
  OMEGAX_PRIVATE_CLAIM_REVIEW_PROGRAM_ID,
} from '../src/magicblock.js';

const payer = new PublicKey('oxhocTdPyENqy9RS13iaq2upoNAovMJHu9PMaBxrK8h');
const reviewer = PublicKey.unique();
const paymentAttestor = PublicKey.unique();
const claimCase = PublicKey.unique();
const healthPlan = PublicKey.unique();
const policySeries = PublicKey.unique();
const hash = '11'.repeat(32);

test('derivePrivateClaimReviewSessionPda is deterministic', () => {
  const a = derivePrivateClaimReviewSessionPda({
    sessionAuthority: payer,
    claimCase,
    sessionId: 'claim-room-demo',
  });
  const b = derivePrivateClaimReviewSessionPda({
    sessionAuthority: payer,
    claimCase,
    sessionId: 'claim-room-demo',
  });
  const c = derivePrivateClaimReviewSessionPda({
    sessionAuthority: payer,
    claimCase,
    sessionId: 'claim-room-other',
  });
  const squatter = derivePrivateClaimReviewSessionPda({
    sessionAuthority: reviewer,
    claimCase,
    sessionId: 'claim-room-demo',
  });
  assert.equal(a.toBase58(), b.toBase58());
  assert.notEqual(a.toBase58(), c.toBase58());
  assert.notEqual(a.toBase58(), squatter.toBase58());
});

test('derive registry and operator PDAs are deterministic', () => {
  assert.equal(
    derivePrivateReviewRegistryPda().toBase58(),
    derivePrivateReviewRegistryPda().toBase58(),
  );
  assert.equal(
    derivePrivateReviewOperatorPda({ reviewerAuthority: reviewer }).toBase58(),
    derivePrivateReviewOperatorPda({ reviewerAuthority: reviewer }).toBase58(),
  );
  assert.notEqual(
    derivePrivateReviewOperatorPda({ reviewerAuthority: reviewer }).toBase58(),
    derivePrivateReviewOperatorPda({ reviewerAuthority: payer }).toBase58(),
  );
});

test('legacy registry/operator write builders fail closed', () => {
  for (const build of [
    () =>
      buildInitializeReviewRegistryTx({
        authority: payer,
        sessionAuthority: payer,
        paymentAttestor,
      }),
    () =>
      buildUpsertReviewOperatorTx({
        authority: payer,
        reviewerAuthority: reviewer,
        reviewBinaryHashHex: hash,
      }),
    () =>
      buildSetReviewOperatorActiveTx({
        authority: payer,
        reviewerAuthority: reviewer,
        active: false,
      }),
  ]) {
    assert.throws(build, NakamaLegacyWriteDisabledError);
  }
});

test('MagicBlock RPC and private-payment network paths fail closed', async () => {
  assert.throws(createMagicBlockConnections, NakamaLegacyWriteDisabledError);
  await assert.rejects(
    buildPrivatePaymentsApiTransaction({
      endpoint: '/v1/spl/transfer',
      body: {},
    }),
    NakamaLegacyWriteDisabledError,
  );
});

test('legacy open-review write builder fails closed', () => {
  assert.throws(
    () =>
      buildOpenReviewSessionTx({
        payer,
        reviewerAuthority: reviewer,
        sessionId: 'claim-room-demo',
        claimCase,
        healthPlan,
        policySeries,
        evidenceRefHashHex: hash,
        decisionSupportHashHex: '22'.repeat(32),
        schemaKeyHashHex: '33'.repeat(32),
        schemaHashHex: '44'.repeat(32),
      }),
    NakamaLegacyWriteDisabledError,
  );
});

test('legacy delegation write builder fails closed', () => {
  assert.throws(
    () =>
      buildDelegateReviewSessionTx({
        payer,
        claimCase,
        sessionId: 'claim-room-demo',
      }),
    NakamaLegacyWriteDisabledError,
  );
});

test('deriveMagicBlockDelegateAccounts mirrors delegation PDA seeds', () => {
  const reviewSession = derivePrivateClaimReviewSessionPda({
    sessionAuthority: payer,
    claimCase,
    sessionId: 'claim-room-demo',
  });
  const accounts = deriveMagicBlockDelegateAccounts({
    delegatedAccount: reviewSession,
  });
  assert.notEqual(accounts.delegateBuffer.toBase58(), reviewSession.toBase58());
  assert.notEqual(
    accounts.delegationRecord.toBase58(),
    reviewSession.toBase58(),
  );
  assert.notEqual(
    accounts.delegationMetadata.toBase58(),
    reviewSession.toBase58(),
  );
});

test('legacy record/payment/commit write builders fail closed', () => {
  for (const build of [
    () =>
      buildRecordPrivateReviewTx({
        reviewer,
        sessionAuthority: payer,
        claimCase,
        sessionId: 'claim-room-demo',
        status: 3,
        reviewResultHashHex: hash,
        reviewArtifactHashHex: '55'.repeat(32),
        reviewBinaryHashHex: '66'.repeat(32),
        teeAttestationDigestHex: '77'.repeat(32),
      }),
    () =>
      buildRecordPrivatePaymentRefTx({
        paymentAttestor,
        sessionAuthority: payer,
        claimCase,
        sessionId: 'claim-room-demo',
        privatePaymentRefHashHex: '88'.repeat(32),
      }),
    () =>
      buildCommitAndCloseReviewSessionTx({
        payer,
        claimCase,
        sessionId: 'claim-room-demo',
      }),
  ]) {
    assert.throws(build, NakamaLegacyWriteDisabledError);
  }
});

test('isDelegatedAccountOwner detects the MagicBlock delegation program', () => {
  assert.equal(isDelegatedAccountOwner(MAGICBLOCK_DELEGATION_PROGRAM_ID), true);
  assert.equal(
    isDelegatedAccountOwner(OMEGAX_PRIVATE_CLAIM_REVIEW_PROGRAM_ID),
    false,
  );
});

test('account decoders reject wrong discriminators', () => {
  assert.throws(
    () =>
      decodePrivateReviewOperatorAccount(PublicKey.unique(), Buffer.alloc(128)),
    /discriminator/,
  );
  assert.throws(
    () =>
      decodePrivateClaimReviewSessionAccount(
        PublicKey.unique(),
        Buffer.alloc(256),
      ),
    /discriminator/,
  );
});
