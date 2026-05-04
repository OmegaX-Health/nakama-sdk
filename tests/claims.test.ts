import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AddressLookupTableAccount,
  Keypair,
  type PublicKey,
  SystemProgram,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';

import {
  CLAIM_INTAKE_APPROVED,
  OBLIGATION_STATUS_RESERVED,
  describeClaimStatus,
  describeObligationStatus,
  normalizeClaimRpcFailure,
  normalizeClaimSimulationFailure,
  serializeSolanaTransactionBase64,
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

test('validateSignedClaimTx enforces claim intent expiry, nonce, and signer binding', () => {
  const payer = Keypair.generate();
  const recipient = Keypair.generate().publicKey;
  const unsignedTx = buildTransferTransaction({
    payer,
    recipient,
    lamports: 1,
  });
  const signedTx = buildTransferTransaction({ payer, recipient, lamports: 1 });
  signedTx.sign(payer);
  const intent = {
    intentId: 'intent-1',
    nonce: 'nonce-1',
    unsignedTxBase64: serializeTransactionBase64(unsignedTx),
    requiredSigner: payer.publicKey.toBase58(),
    expiresAtIso: '2026-05-04T00:10:00.000Z',
    attestationRefs: ['attestation-1'],
  };

  const valid = validateSignedClaimTx({
    signedTxBase64: serializeTransactionBase64(signedTx),
    claimIntent: intent,
    requiredSigner: payer.publicKey.toBase58(),
    expectedIntentId: 'intent-1',
    expectedNonce: 'nonce-1',
    nowIso: '2026-05-04T00:00:00.000Z',
  });
  assert.equal(valid.valid, true);

  const stale = validateSignedClaimTx({
    signedTxBase64: serializeTransactionBase64(signedTx),
    claimIntent: intent,
    requiredSigner: payer.publicKey.toBase58(),
    expectedIntentId: 'intent-1',
    expectedNonce: 'nonce-1',
    nowIso: '2026-05-04T00:11:00.000Z',
  });
  assert.equal(stale.valid, false);
  assert.equal(stale.reason, 'intent_expired');

  const wrongNonce = validateSignedClaimTx({
    signedTxBase64: serializeTransactionBase64(signedTx),
    claimIntent: intent,
    requiredSigner: payer.publicKey.toBase58(),
    expectedIntentId: 'intent-1',
    expectedNonce: 'nonce-2',
    nowIso: '2026-05-04T00:00:00.000Z',
  });
  assert.equal(wrongNonce.valid, false);
  assert.equal(wrongNonce.reason, 'intent_nonce_mismatch');
});

test('validateSignedClaimTx allows blockhash-only refresh unless exact mode is required', () => {
  const payer = Keypair.generate();
  const recipient = Keypair.generate().publicKey;
  const expectedUnsignedTx = buildTransferTransaction({
    payer,
    recipient,
    lamports: 1,
  });
  const refreshedTx = new Transaction({
    feePayer: payer.publicKey,
    recentBlockhash: Keypair.generate().publicKey.toBase58(),
  }).add(
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: recipient,
      lamports: 1,
    }),
  );
  refreshedTx.sign(payer);

  const refreshed = validateSignedClaimTx({
    signedTxBase64: serializeTransactionBase64(refreshedTx),
    expectedUnsignedTxBase64: serializeTransactionBase64(expectedUnsignedTx),
    requiredSigner: payer.publicKey.toBase58(),
  });
  assert.equal(refreshed.valid, true);

  const exact = validateSignedClaimTx({
    signedTxBase64: serializeTransactionBase64(refreshedTx),
    expectedUnsignedTxBase64: serializeTransactionBase64(expectedUnsignedTx),
    requiredSigner: payer.publicKey.toBase58(),
    requireExactMessage: true,
  });
  assert.equal(exact.valid, false);
  assert.equal(exact.reason, 'intent_message_mismatch');
});

test('validateSignedClaimTx rejects tampered signatures, wrong signer, and malformed input', () => {
  const payer = Keypair.generate();
  const recipient = Keypair.generate().publicKey;
  const unsignedTx = buildTransferTransaction({
    payer,
    recipient,
    lamports: 1,
  });
  const signedTx = buildTransferTransaction({ payer, recipient, lamports: 1 });
  signedTx.sign(payer);
  const signature = signedTx.signatures[0]?.signature;
  assert(signature);
  signature[0] = (signature[0] ?? 0) ^ 1;

  const tampered = validateSignedClaimTx({
    signedTxBase64: serializeTransactionBase64(signedTx),
    expectedUnsignedTxBase64: serializeTransactionBase64(unsignedTx),
    requiredSigner: payer.publicKey.toBase58(),
  });
  assert.equal(tampered.valid, false);
  assert.equal(tampered.reason, 'invalid_required_signature');

  const wrongSigner = validateSignedClaimTx({
    signedTxBase64: serializeTransactionBase64(unsignedTx),
    expectedUnsignedTxBase64: serializeTransactionBase64(unsignedTx),
    requiredSigner: Keypair.generate().publicKey.toBase58(),
  });
  assert.equal(wrongSigner.valid, false);
  assert.equal(wrongSigner.reason, 'required_signer_mismatch');

  const malformed = validateSignedClaimTx({
    signedTxBase64: 'not-base64',
    expectedUnsignedTxBase64: serializeTransactionBase64(unsignedTx),
    requiredSigner: payer.publicKey.toBase58(),
  });
  assert.equal(malformed.valid, false);
  assert.equal(malformed.reason, 'invalid_transaction_base64');
});

test('validateSignedClaimTx handles v0 lookup table intents and detects lookup mutation', () => {
  const payer = Keypair.generate();
  const recipient = Keypair.generate().publicKey;
  const lookupTable = new AddressLookupTableAccount({
    key: Keypair.generate().publicKey,
    state: {
      deactivationSlot: BigInt('18446744073709551615'),
      lastExtendedSlot: 1,
      lastExtendedSlotStartIndex: 0,
      authority: null,
      addresses: [recipient],
    },
  });
  const buildV0 = (recentBlockhash: string, table = lookupTable) => {
    const message = new TransactionMessage({
      payerKey: payer.publicKey,
      recentBlockhash,
      instructions: [
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: recipient,
          lamports: 1,
        }),
      ],
    }).compileToV0Message([table]);
    return new VersionedTransaction(message);
  };

  const expectedUnsignedTx = buildV0(RECENT_BLOCKHASH);
  const refreshedTx = buildV0(Keypair.generate().publicKey.toBase58());
  refreshedTx.sign([payer]);

  const refreshed = validateSignedClaimTx({
    signedTxBase64: serializeSolanaTransactionBase64(refreshedTx),
    expectedUnsignedTxBase64:
      serializeSolanaTransactionBase64(expectedUnsignedTx),
    requiredSigner: payer.publicKey.toBase58(),
  });
  assert.equal(refreshed.valid, true);

  const changedLookupTable = new AddressLookupTableAccount({
    key: Keypair.generate().publicKey,
    state: {
      ...lookupTable.state,
      addresses: [recipient],
    },
  });
  const mutatedExpected = validateSignedClaimTx({
    signedTxBase64: serializeSolanaTransactionBase64(refreshedTx),
    expectedUnsignedTxBase64: serializeSolanaTransactionBase64(
      buildV0(RECENT_BLOCKHASH, changedLookupTable),
    ),
    requiredSigner: payer.publicKey.toBase58(),
  });
  assert.equal(mutatedExpected.valid, false);
  assert.equal(mutatedExpected.reason, 'intent_message_mismatch');
});

test('validateSignedClaimTx rejects transactions with no required signer', () => {
  const signerlessV0 = Buffer.concat([
    Buffer.from([0, 0x80, 0, 0, 0, 0]),
    Buffer.alloc(32),
    Buffer.from([0, 0]),
  ]).toString('base64');

  const result = validateSignedClaimTx({
    signedTxBase64: signerlessV0,
    expectedUnsignedTxBase64: signerlessV0,
    requiredSigner: Keypair.generate().publicKey.toBase58(),
  });
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'missing_fee_payer');
});
