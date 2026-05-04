import test from 'node:test';
import assert from 'node:assert/strict';
import {
  Keypair,
  type PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';

import {
  CLAIM_INTAKE_APPROVED,
  OBLIGATION_STATUS_RESERVED,
  describeClaimStatus,
  describeObligationStatus,
  normalizeClaimRpcFailure,
  normalizeClaimSimulationFailure,
  validateSignedClaimTx,
} from '../src/index.js';

const RECENT_BLOCKHASH = '11111111111111111111111111111111';

function serializeTransactionBase64(transaction: Transaction): string {
  return transaction
    .serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    })
    .toString('base64');
}

function buildTransferTransaction(params: {
  payer: ReturnType<typeof Keypair.generate>;
  recipient?: PublicKey;
  lamports: number;
}): Transaction {
  const recipient = params.recipient ?? Keypair.generate().publicKey;
  return new Transaction({
    feePayer: params.payer.publicKey,
    recentBlockhash: RECENT_BLOCKHASH,
  }).add(
    SystemProgram.transfer({
      fromPubkey: params.payer.publicKey,
      toPubkey: recipient,
      lamports: params.lamports,
    }),
  );
}

test('normalizeClaimSimulationFailure maps scoped protocol pause errors', () => {
  const failure = normalizeClaimSimulationFailure({
    err: new Error('Protocol emergency pause is active'),
    logs: ['Program log: protocol paused'],
  });

  assert.equal(failure.code, 'protocol_paused');
  assert.equal(failure.retryable, true);
});

test('normalizeClaimSimulationFailure maps exhausted funding lines', () => {
  const failure = normalizeClaimSimulationFailure({
    err: 'budget exhausted',
    logs: ['Program log: funding line reserve exhausted'],
  });

  assert.equal(failure.code, 'funding_exhausted');
  assert.equal(failure.retryable, false);
});

test('normalizeClaimRpcFailure maps timeout and transport failures', () => {
  assert.equal(
    normalizeClaimRpcFailure(new Error('request timed out')).code,
    'rpc_timeout',
  );
  assert.equal(
    normalizeClaimRpcFailure(new Error('fetch failed: socket hang up')).code,
    'network_error',
  );
});

test('claim and obligation status descriptors follow the canonical model', () => {
  assert.equal(describeClaimStatus(CLAIM_INTAKE_APPROVED), 'approved');
  assert.equal(
    describeObligationStatus(OBLIGATION_STATUS_RESERVED),
    'reserved',
  );
});

test('validateSignedClaimTx requires the signed transaction to match the expected intent', () => {
  const payer = Keypair.generate();
  const recipient = Keypair.generate().publicKey;
  const unsignedTx = buildTransferTransaction({
    payer,
    recipient,
    lamports: 1,
  });
  const signedTx = buildTransferTransaction({ payer, recipient, lamports: 1 });
  signedTx.sign(payer);

  const result = validateSignedClaimTx({
    signedTxBase64: serializeTransactionBase64(signedTx),
    expectedUnsignedTxBase64: serializeTransactionBase64(unsignedTx),
    requiredSigner: payer.publicKey.toBase58(),
  });

  assert.equal(result.valid, true);
  assert.equal(result.reason, null);
  assert.equal(result.signer, payer.publicKey.toBase58());
});

test('validateSignedClaimTx fails closed when expected intent is missing or different', () => {
  const payer = Keypair.generate();
  const signedTx = buildTransferTransaction({ payer, lamports: 1 });
  signedTx.sign(payer);

  const missingIntent = validateSignedClaimTx({
    signedTxBase64: serializeTransactionBase64(signedTx),
    expectedUnsignedTxBase64: '',
    requiredSigner: payer.publicKey.toBase58(),
  });

  assert.equal(missingIntent.valid, false);
  assert.equal(missingIntent.reason, 'intent_message_mismatch');

  const differentUnsignedTx = buildTransferTransaction({ payer, lamports: 2 });
  const mismatchedIntent = validateSignedClaimTx({
    signedTxBase64: serializeTransactionBase64(signedTx),
    expectedUnsignedTxBase64: serializeTransactionBase64(differentUnsignedTx),
    requiredSigner: payer.publicKey.toBase58(),
  });

  assert.equal(mismatchedIntent.valid, false);
  assert.equal(mismatchedIntent.reason, 'intent_message_mismatch');
});
