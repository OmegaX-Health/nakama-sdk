import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PublicKey, SystemProgram } from '@solana/web3.js';

import {
  buildDelegateReviewSessionTx,
  buildInitializeReviewRegistryTx,
  buildOpenReviewSessionTx,
  buildSetReviewOperatorActiveTx,
  buildUpsertReviewOperatorTx,
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
  PRIVATE_REVIEW_STATUS_APPROVED,
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

test('registry/operator builders include authority-gated account metas', () => {
  const init = buildInitializeReviewRegistryTx({
    authority: payer,
    sessionAuthority: payer,
    paymentAttestor,
  });
  const upsert = buildUpsertReviewOperatorTx({
    authority: payer,
    reviewerAuthority: reviewer,
    reviewBinaryHashHex: hash,
  });
  const active = buildSetReviewOperatorActiveTx({
    authority: payer,
    reviewerAuthority: reviewer,
    active: false,
  });
  assert.equal(init.instructions[0]?.keys[0]?.isSigner, true);
  assert.equal(init.instructions[0]?.keys[1]?.isWritable, true);
  assert.equal(upsert.instructions[0]?.keys[1]?.isWritable, true);
  assert.equal(upsert.instructions[0]?.keys[2]?.isWritable, true);
  assert.equal(active.instructions[0]?.keys[2]?.isWritable, true);
});

test('buildOpenReviewSessionTx creates a base-layer open-session instruction', () => {
  const tx = buildOpenReviewSessionTx({
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
  });
  assert.equal(tx.feePayer?.toBase58(), payer.toBase58());
  assert.equal(tx.instructions.length, 1);
  assert.equal(
    tx.instructions[0]?.programId.toBase58(),
    OMEGAX_PRIVATE_CLAIM_REVIEW_PROGRAM_ID,
  );
  assert.equal(tx.instructions[0]?.keys[0]?.isSigner, true);
  assert.equal(
    tx.instructions[0]?.keys[1]?.pubkey.toBase58(),
    derivePrivateReviewRegistryPda().toBase58(),
  );
  assert.equal(
    tx.instructions[0]?.keys[2]?.pubkey.toBase58(),
    derivePrivateReviewOperatorPda({ reviewerAuthority: reviewer }).toBase58(),
  );
  assert.equal(
    tx.instructions[0]?.keys[4]?.pubkey.toBase58(),
    SystemProgram.programId.toBase58(),
  );
});

test('buildDelegateReviewSessionTx includes MagicBlock delegation accounts', () => {
  const tx = buildDelegateReviewSessionTx({
    payer,
    claimCase,
    sessionId: 'claim-room-demo',
  });
  const keys =
    tx.instructions[0]?.keys.map((meta) => meta.pubkey.toBase58()) ?? [];
  assert.ok(keys.includes(MAGICBLOCK_DELEGATION_PROGRAM_ID));
  assert.ok(keys.includes(SystemProgram.programId.toBase58()));
  assert.equal(tx.instructions[0]?.keys[0]?.isSigner, true);
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

test('record/commit helper builders target the adjunct program', () => {
  const recordReview = buildRecordPrivateReviewTx({
    reviewer,
    sessionAuthority: payer,
    claimCase,
    sessionId: 'claim-room-demo',
    status: PRIVATE_REVIEW_STATUS_APPROVED,
    reviewResultHashHex: hash,
    reviewArtifactHashHex: '55'.repeat(32),
    reviewBinaryHashHex: '66'.repeat(32),
    teeAttestationDigestHex: '77'.repeat(32),
  });
  const payment = buildRecordPrivatePaymentRefTx({
    paymentAttestor,
    sessionAuthority: payer,
    claimCase,
    sessionId: 'claim-room-demo',
    privatePaymentRefHashHex: '88'.repeat(32),
  });
  const commit = buildCommitAndCloseReviewSessionTx({
    payer,
    claimCase,
    sessionId: 'claim-room-demo',
  });
  for (const tx of [recordReview, payment, commit]) {
    assert.equal(
      tx.instructions[0]?.programId.toBase58(),
      OMEGAX_PRIVATE_CLAIM_REVIEW_PROGRAM_ID,
    );
  }
  assert.equal(recordReview.instructions[0]?.keys[1]?.isWritable, false);
  assert.equal(recordReview.instructions[0]?.keys[2]?.isWritable, false);
  assert.equal(
    payment.instructions[0]?.keys[0]?.pubkey.toBase58(),
    paymentAttestor.toBase58(),
  );
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
