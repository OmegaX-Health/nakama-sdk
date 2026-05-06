import bs58 from 'bs58';
import nacl from 'tweetnacl';
import { Keypair } from '@solana/web3.js';

import {
  PROTOCOL_PROGRAM_ID,
  attestProtocolOutcome,
  createOracleSignerFromKmsAdapter,
  verifyProtocolOracleAttestation,
} from '@omegax/protocol-sdk';

const oracleKeypair = Keypair.generate();
const signer = createOracleSignerFromKmsAdapter({
  keyId: process.env.ORACLE_SIGNER_KEY_ID ?? 'dev-oracle-key',
  publicKeyBase58: oracleKeypair.publicKey.toBase58(),
  signWithKms: async (message) =>
    nacl.sign.detached(message, oracleKeypair.secretKey),
});

const issuedAtIso = '2026-05-06T00:00:00.000Z';
const healthPlan = Keypair.generate().publicKey;
const fundingLine = Keypair.generate().publicKey;
const claimCase = Keypair.generate().publicKey;

const { attestation } = await attestProtocolOutcome({
  userId: 'member-001',
  cycleId: 'claim-cycle-001',
  outcomeId: 'claim-supported',
  payload: {
    decision: 'support_approve',
    approvedAmountRaw: '150000000',
  },
  context: {
    network: 'devnet',
    programId: PROTOCOL_PROGRAM_ID,
    healthPlan: healthPlan.toBase58(),
    fundingLine: fundingLine.toBase58(),
    claimCase: claimCase.toBase58(),
    schemaKeyHashHex: 'ab'.repeat(32),
    audience: 'claim-intake-service',
    nonce: 'oracle-worker-smoke',
    issuedAtIso,
    asOfIso: issuedAtIso,
    expiresAtIso: '2026-05-07T00:00:00.000Z',
  },
  signer,
});

const verified = verifyProtocolOracleAttestation(attestation, {
  nowIso: issuedAtIso,
  expectedVerifierPublicKeyBase58: bs58.encode(
    oracleKeypair.publicKey.toBytes(),
  ),
  expectedVerifierKeyId: signer.keyId,
  expectedNetwork: 'devnet',
  expectedProgramId: PROTOCOL_PROGRAM_ID,
  expectedHealthPlan: healthPlan,
  expectedFundingLine: fundingLine,
  expectedClaimCase: claimCase,
  expectedAudience: 'claim-intake-service',
  expectedNonce: 'oracle-worker-smoke',
});

if (!verified) {
  throw new Error('Expected oracle worker attestation to verify.');
}

console.log(
  JSON.stringify(
    {
      ok: true,
      role: 'oracle-worker',
      attestationId: attestation.id,
      digestHex: attestation.digestHex,
    },
    null,
    2,
  ),
);
