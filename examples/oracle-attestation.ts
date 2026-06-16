import bs58 from 'bs58';
import nacl from 'tweetnacl';
import { Keypair } from '@solana/web3.js';

import {
  PROTOCOL_PROGRAM_ID,
  attestProtocolOutcome,
  createOracleSignerFromKmsAdapter,
  verifyProtocolOracleAttestation,
} from '@nakama-health/protocol-sdk';

const oracleKeypair = Keypair.generate();
const keyId = 'demo-oracle-key';
const signer = createOracleSignerFromKmsAdapter({
  keyId,
  publicKeyBase58: oracleKeypair.publicKey.toBase58(),
  signWithKms: async (message) =>
    nacl.sign.detached(message, oracleKeypair.secretKey),
});

const healthPlan = Keypair.generate().publicKey;
const fundingLine = Keypair.generate().publicKey;
const claimCase = Keypair.generate().publicKey;
const issuedAtIso = '2026-05-06T00:00:00.000Z';
const expiresAtIso = '2026-05-07T00:00:00.000Z';
const nonce = 'oracle-demo-nonce';

const { attestation } = await attestProtocolOutcome({
  userId: 'member-001',
  cycleId: 'travel-claim-cycle-001',
  outcomeId: 'claim-supported',
  payload: {
    decision: 'support_approve',
    approvedAmountRaw: '150000000',
    evidenceRef: 'ipfs://example-claim-evidence',
  },
  context: {
    network: 'devnet',
    programId: PROTOCOL_PROGRAM_ID,
    healthPlan,
    fundingLine,
    claimCase,
    schemaKeyHashHex: 'ab'.repeat(32),
    audience: 'claim-intake-service',
    nonce,
    issuedAtIso,
    asOfIso: issuedAtIso,
    expiresAtIso,
  },
  signer,
});

const verified = verifyProtocolOracleAttestation(attestation, {
  nowIso: issuedAtIso,
  expectedVerifierPublicKeyBase58: bs58.encode(
    oracleKeypair.publicKey.toBytes(),
  ),
  expectedVerifierKeyId: keyId,
  expectedNetwork: 'devnet',
  expectedProgramId: PROTOCOL_PROGRAM_ID,
  expectedHealthPlan: healthPlan,
  expectedFundingLine: fundingLine,
  expectedClaimCase: claimCase,
  expectedAudience: 'claim-intake-service',
  expectedNonce: nonce,
});

if (!verified) {
  throw new Error('Expected protocol oracle attestation to verify.');
}

console.log(
  JSON.stringify(
    {
      ok: true,
      attestationId: attestation.id,
      verifier: attestation.verifier.keyId,
      digestHex: attestation.digestHex,
      context: attestation.context,
    },
    null,
    2,
  ),
);
