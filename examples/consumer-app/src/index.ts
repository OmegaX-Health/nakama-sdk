import bs58 from 'bs58';
import nacl from 'tweetnacl';
import { Keypair } from '@solana/web3.js';

import {
  PROTOCOL_PROGRAM_ID,
  createConnection,
  createSafeProtocolClient,
  getOmegaXNetworkInfo,
} from '@nakama-health/protocol-sdk';
import { OmegaXProgramMismatchError } from '@nakama-health/protocol-sdk/errors';
import {
  attestProtocolOutcome,
  createOracleSignerFromKmsAdapter,
  verifyProtocolOracleAttestation,
} from '@nakama-health/protocol-sdk/oracle';
import {
  listProtocolAccountNames,
  listProtocolInstructionNames,
} from '@nakama-health/protocol-sdk/protocol';
import {
  deriveHealthPlanPda,
  deriveReserveDomainPda,
} from '@nakama-health/protocol-sdk/protocol_seeds';

const networkInfo = getOmegaXNetworkInfo('devnet');
const connection = createConnection({
  network: 'devnet',
  rpcUrl: process.env.SOLANA_RPC_URL ?? networkInfo.defaultRpcUrl,
  commitment: 'confirmed',
});
const protocol = createSafeProtocolClient(connection, {
  programId: PROTOCOL_PROGRAM_ID,
});

const reserveDomain = deriveReserveDomainPda({
  domainId: 'dogfood-domain',
  programId: protocol.getProgramId(),
});
const healthPlan = deriveHealthPlanPda({
  reserveDomain,
  planId: 'dogfood-plan',
  programId: protocol.getProgramId(),
});
const instructionNames = listProtocolInstructionNames();
const accountNames = listProtocolAccountNames();

if (instructionNames.length === 0 || accountNames.length === 0) {
  throw new Error('Expected protocol instructions and accounts to be listed.');
}

let typedErrorBranchWorked = false;
try {
  createSafeProtocolClient(connection, {
    programId: Keypair.generate().publicKey,
  });
} catch (error) {
  typedErrorBranchWorked =
    error instanceof OmegaXProgramMismatchError &&
    error.code === 'OMEGAX_PROGRAM_MISMATCH';
}

if (!typedErrorBranchWorked) {
  throw new Error('Expected custom program ID failure to use typed errors.');
}

const oracleKeypair = Keypair.generate();
const signer = createOracleSignerFromKmsAdapter({
  keyId: 'dogfood-oracle',
  publicKeyBase58: oracleKeypair.publicKey.toBase58(),
  signWithKms: async (message) =>
    nacl.sign.detached(message, oracleKeypair.secretKey),
});
const fundingLine = Keypair.generate().publicKey;
const claimCase = Keypair.generate().publicKey;
const issuedAtIso = '2026-05-06T00:00:00.000Z';

const { attestation } = await attestProtocolOutcome({
  userId: 'member-dogfood',
  cycleId: 'cycle-dogfood',
  outcomeId: 'claim-supported',
  payload: {
    decision: 'support_approve',
    approvedAmountRaw: '150000000',
  },
  context: {
    network: networkInfo.network,
    programId: PROTOCOL_PROGRAM_ID,
    healthPlan: healthPlan.toBase58(),
    fundingLine: fundingLine.toBase58(),
    claimCase: claimCase.toBase58(),
    schemaKeyHashHex: 'ab'.repeat(32),
    audience: 'dogfood-consumer-app',
    nonce: 'dogfood-nonce',
    issuedAtIso,
    asOfIso: issuedAtIso,
    expiresAtIso: '2026-05-07T00:00:00.000Z',
  },
  signer,
});

const attestationVerified = verifyProtocolOracleAttestation(attestation, {
  nowIso: issuedAtIso,
  expectedVerifierPublicKeyBase58: bs58.encode(
    oracleKeypair.publicKey.toBytes(),
  ),
  expectedVerifierKeyId: 'dogfood-oracle',
  expectedNetwork: networkInfo.network,
  expectedProgramId: PROTOCOL_PROGRAM_ID,
  expectedHealthPlan: healthPlan,
  expectedFundingLine: fundingLine,
  expectedClaimCase: claimCase,
  expectedAudience: 'dogfood-consumer-app',
  expectedNonce: 'dogfood-nonce',
});

if (!attestationVerified) {
  throw new Error('Expected dogfood oracle attestation to verify.');
}

console.log(
  JSON.stringify(
    {
      ok: true,
      packageImport: '@nakama-health/protocol-sdk',
      network: networkInfo.network,
      programId: protocol.getProgramId().toBase58(),
      reserveDomain: reserveDomain.toBase58(),
      healthPlan: healthPlan.toBase58(),
      instructions: instructionNames.length,
      accounts: accountNames.length,
      typedErrorBranchWorked,
      attestationId: attestation.id,
    },
    null,
    2,
  ),
);
