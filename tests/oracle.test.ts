import test from 'node:test';
import assert from 'node:assert/strict';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import nacl from 'tweetnacl';

import {
  attestOutcome,
  attestProtocolOutcome,
  PROTOCOL_PROGRAM_ID,
  verifyOracleAttestation,
  verifyProtocolOracleAttestation,
  type OracleSigner,
} from '../src/index.js';

function createTestSigner(): OracleSigner {
  const keypair = nacl.sign.keyPair();
  return {
    keyId: 'test-oracle',
    publicKeyBase58: bs58.encode(keypair.publicKey),
    sign: async (message) => nacl.sign.detached(message, keypair.secretKey),
  };
}

function protocolContext() {
  return {
    network: 'devnet',
    programId: PROTOCOL_PROGRAM_ID,
    healthPlan: Keypair.generate().publicKey.toBase58(),
    fundingLine: Keypair.generate().publicKey.toBase58(),
    claimCase: Keypair.generate().publicKey.toBase58(),
    schemaKeyHashHex: 'ab'.repeat(32),
    audience: 'omegax-protocol-claim-settlement',
    nonce: 'nonce-1',
    issuedAtIso: '2026-05-04T00:00:00.000Z',
    asOfIso: '2026-05-04T00:00:00.000Z',
    expiresAtIso: '2026-05-04T00:10:00.000Z',
  };
}

test('protocol-bound oracle attestations include settlement domain and verify locally', async () => {
  const signer = createTestSigner();
  const context = protocolContext();
  const { attestation } = await attestProtocolOutcome({
    userId: 'member-1',
    cycleId: 'cycle-1',
    outcomeId: 'claim-approved',
    payload: { decision: 'approve', amountRaw: '1000' },
    context,
    signer,
  });

  assert.equal(attestation.context.network, 'devnet');
  assert.equal(
    attestation.context.audience,
    'omegax-protocol-claim-settlement',
  );
  assert.equal(attestation.verifier.publicKeyBase58, signer.publicKeyBase58);
  assert.equal(verifyOracleAttestation(attestation), true);
  assert.equal(
    verifyProtocolOracleAttestation(attestation, {
      nowIso: '2026-05-04T00:05:00.000Z',
      expectedNetwork: context.network,
      expectedProgramId: context.programId,
      expectedHealthPlan: context.healthPlan,
      expectedFundingLine: context.fundingLine,
      expectedClaimCase: context.claimCase,
      expectedAudience: context.audience,
      expectedNonce: context.nonce,
    }),
    true,
  );
  assert.equal(
    verifyProtocolOracleAttestation(attestation, {
      nowIso: '2026-05-04T00:11:00.000Z',
      expectedNetwork: context.network,
      expectedProgramId: context.programId,
      expectedHealthPlan: context.healthPlan,
      expectedFundingLine: context.fundingLine,
      expectedClaimCase: context.claimCase,
      expectedAudience: context.audience,
      expectedNonce: context.nonce,
    }),
    false,
  );

  const tampered = {
    ...attestation,
    context: { ...attestation.context, nonce: 'nonce-2' },
  };
  assert.equal(verifyOracleAttestation(tampered), false);
});

test('oracle attestations reject unserializable payloads and bad signer output', async () => {
  const signer = createTestSigner();
  await assert.rejects(
    () =>
      attestOutcome({
        userId: 'member-1',
        cycleId: 'cycle-1',
        outcomeId: 'steps',
        asOfIso: '2026-05-04T00:00:00.000Z',
        payload: { value: Number.NaN },
        signer,
      }),
    /NaN/,
  );

  const cyclic: Record<string, unknown> = {};
  cyclic.self = cyclic;
  await assert.rejects(
    () =>
      attestOutcome({
        userId: 'member-1',
        cycleId: 'cycle-1',
        outcomeId: 'cycle',
        asOfIso: '2026-05-04T00:00:00.000Z',
        payload: cyclic,
        signer,
      }),
    /cyclic/,
  );

  await assert.rejects(
    () =>
      attestOutcome({
        userId: 'member-1',
        cycleId: 'cycle-1',
        outcomeId: 'bad-signature',
        asOfIso: '2026-05-04T00:00:00.000Z',
        payload: { ok: true },
        signer: {
          ...signer,
          sign: async () => new Uint8Array(63),
        },
      }),
    /64 bytes/,
  );

  await assert.rejects(
    () =>
      attestProtocolOutcome({
        userId: 'member-1',
        cycleId: 'cycle-1',
        outcomeId: 'numeric-payload',
        payload: { amount: 1000 },
        context: protocolContext(),
        signer,
      }),
    /JSON numbers/,
  );
});

test('protocol-bound oracle attestations reject partial pool scopes', async () => {
  await assert.rejects(
    () =>
      attestProtocolOutcome({
        userId: 'member-1',
        cycleId: 'cycle-1',
        outcomeId: 'claim-approved',
        payload: { decision: 'approve' },
        context: {
          ...protocolContext(),
          liquidityPool: Keypair.generate().publicKey.toBase58(),
        },
        signer: createTestSigner(),
      }),
    /pool scope/,
  );
});
