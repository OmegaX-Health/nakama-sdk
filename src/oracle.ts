import bs58 from 'bs58';
import nacl from 'tweetnacl';
import { PublicKey } from '@solana/web3.js';

import {
  assertCanonicalJsonValue,
  newId,
  nowIso,
  sha256Hex,
  stableStringify,
  toIsoString,
} from './utils.js';
import type {
  OracleKmsSignerAdapter,
  OracleSigner,
  OutcomeAttestation,
  ProtocolBoundAttestationContext,
  ProtocolBoundOutcomeAttestation,
} from './types.js';
import type { PublicKeyish } from './generated/protocol_types.js';

export type AttestOutcomeParams = {
  userId: string;
  cycleId: string;
  outcomeId: string;
  asOfIso: string;
  payload: Record<string, unknown>;
  signer: OracleSigner;
  submitAttestation?: (
    attestation: OutcomeAttestation,
  ) => Promise<{ txSignature?: string }>;
};

export type AttestOutcomeResult = {
  attestation: OutcomeAttestation;
  txSignature: string | null;
};

export type AttestProtocolOutcomeParams = {
  userId: string;
  cycleId: string;
  outcomeId: string;
  payload: Record<string, unknown>;
  context: Omit<ProtocolBoundAttestationContext, 'issuedAtIso'> & {
    issuedAtIso?: string;
  };
  signer: OracleSigner;
  submitAttestation?: (
    attestation: ProtocolBoundOutcomeAttestation,
  ) => Promise<{ txSignature?: string }>;
};

export type AttestProtocolOutcomeResult = {
  attestation: ProtocolBoundOutcomeAttestation;
  txSignature: string | null;
};

export type VerifyProtocolOracleAttestationParams = {
  nowIso?: string | Date;
  expectedVerifierPublicKeyBase58: PublicKeyish;
  expectedVerifierKeyId?: string;
  expectedNetwork: string;
  expectedProgramId: PublicKeyish;
  expectedHealthPlan: PublicKeyish;
  expectedFundingLine: PublicKeyish;
  expectedClaimCase: PublicKeyish;
  expectedAudience: string;
  expectedNonce?: string;
  expectedPolicySeries?: PublicKeyish | null;
  expectedLiquidityPool?: PublicKeyish | null;
  expectedCapitalClass?: PublicKeyish | null;
  expectedAllocationPosition?: PublicKeyish | null;
  expectedPoolOracleApproval?: PublicKeyish | null;
  expectedPoolOraclePermissionSet?: PublicKeyish | null;
  expectedPoolOraclePolicy?: PublicKeyish | null;
  allowUnexpectedOptionalScope?: boolean;
};

export function createOracleSignerFromEnv(params?: {
  keyIdEnv?: string;
  secretKeyBase58Env?: string;
}): OracleSigner {
  const keyIdEnv = params?.keyIdEnv ?? 'ORACLE_SIGNER_KEY_ID';
  const secretKeyEnv =
    params?.secretKeyBase58Env ?? 'ORACLE_SIGNER_SECRET_KEY_BASE58';
  const keyId = String(process.env[keyIdEnv] || '').trim();
  const secretKeyBase58 = String(process.env[secretKeyEnv] || '').trim();
  if (!keyId) {
    throw new Error(`Missing ${keyIdEnv}`);
  }
  if (!secretKeyBase58) {
    throw new Error(`Missing ${secretKeyEnv}`);
  }

  const secretKeyBytes = bs58.decode(secretKeyBase58);
  if (secretKeyBytes.length !== nacl.sign.secretKeyLength) {
    throw new Error(`Invalid secret key length for ${secretKeyEnv}`);
  }
  const publicKeyBytes = secretKeyBytes.slice(32);
  return {
    keyId,
    publicKeyBase58: bs58.encode(publicKeyBytes),
    sign: async (message) => nacl.sign.detached(message, secretKeyBytes),
  };
}

export function createOracleSignerFromKmsAdapter(
  adapter: OracleKmsSignerAdapter,
): OracleSigner {
  return {
    keyId: adapter.keyId,
    publicKeyBase58: adapter.publicKeyBase58,
    sign: (message) => adapter.signWithKms(message),
  };
}

function canonicalAttestationBody(params: {
  id: string;
  userId: string;
  cycleId: string;
  outcomeId: string;
  asOfIso: string;
  issuedAtIso: string;
  payload: Record<string, unknown>;
  verifierKeyId: string;
  verifierPublicKeyBase58: string;
}) {
  return {
    id: params.id,
    userId: params.userId,
    cycleId: params.cycleId,
    outcomeId: params.outcomeId,
    asOfIso: toIsoString(params.asOfIso),
    issuedAtIso: toIsoString(params.issuedAtIso),
    payload: params.payload,
    verifier: {
      keyId: params.verifierKeyId,
      publicKeyBase58: params.verifierPublicKeyBase58,
      algorithm: 'ed25519' as const,
    },
  };
}

function normalizeProtocolContext(
  context: AttestProtocolOutcomeParams['context'],
  issuedAtIso: string,
): ProtocolBoundAttestationContext {
  const normalized: ProtocolBoundAttestationContext = {
    network: context.network.trim(),
    programId: normalizePubkeyString(context.programId, 'programId'),
    healthPlan: normalizePubkeyString(context.healthPlan, 'healthPlan'),
    fundingLine: normalizePubkeyString(context.fundingLine, 'fundingLine'),
    claimCase: normalizePubkeyString(context.claimCase, 'claimCase'),
    policySeries: normalizeOptionalPubkeyString(
      context.policySeries,
      'policySeries',
    ),
    liquidityPool: normalizeOptionalPubkeyString(
      context.liquidityPool,
      'liquidityPool',
    ),
    capitalClass: normalizeOptionalPubkeyString(
      context.capitalClass,
      'capitalClass',
    ),
    allocationPosition: normalizeOptionalPubkeyString(
      context.allocationPosition,
      'allocationPosition',
    ),
    poolOracleApproval: normalizeOptionalPubkeyString(
      context.poolOracleApproval,
      'poolOracleApproval',
    ),
    poolOraclePermissionSet: normalizeOptionalPubkeyString(
      context.poolOraclePermissionSet,
      'poolOraclePermissionSet',
    ),
    poolOraclePolicy: normalizeOptionalPubkeyString(
      context.poolOraclePolicy,
      'poolOraclePolicy',
    ),
    schemaKeyHashHex: context.schemaKeyHashHex.trim().toLowerCase(),
    audience: context.audience.trim(),
    nonce: context.nonce.trim(),
    issuedAtIso: toIsoString(context.issuedAtIso ?? issuedAtIso),
    asOfIso: toIsoString(context.asOfIso),
    expiresAtIso: toIsoString(context.expiresAtIso),
  };

  for (const [key, value] of Object.entries(normalized)) {
    if (typeof value === 'string' && value.length === 0) {
      throw new Error(`protocol attestation context ${key} is required`);
    }
  }
  if (!/^[0-9a-f]{64}$/.test(normalized.schemaKeyHashHex)) {
    throw new Error(
      'protocol attestation context schemaKeyHashHex must be a 32-byte hex string',
    );
  }
  if (
    Date.parse(normalized.expiresAtIso) <= Date.parse(normalized.issuedAtIso)
  ) {
    throw new Error('protocol attestation expiry must be after issuance');
  }

  return normalized;
}

function normalizePubkeyString(value: PublicKeyish, label: string): string {
  try {
    return new PublicKey(value).toBase58();
  } catch {
    throw new Error(
      `protocol attestation context ${label} must be a valid Solana public key`,
    );
  }
}

function normalizeOptionalPubkeyString(
  value: PublicKeyish | null | undefined,
  label: string,
): string | null {
  if (value === null || value === undefined || String(value).trim() === '') {
    return null;
  }
  return normalizePubkeyString(value, label);
}

function assertPoolScopeIsComplete(
  context: ProtocolBoundAttestationContext,
): void {
  const values = [
    context.liquidityPool,
    context.capitalClass,
    context.allocationPosition,
    context.poolOracleApproval,
    context.poolOraclePermissionSet,
    context.poolOraclePolicy,
  ];
  const present = values.filter((value) => value && value.length > 0).length;
  if (present > 0 && present !== values.length) {
    throw new Error(
      'protocol attestation pool scope must include liquidity pool, capital class, allocation position, oracle approval, permission set, and policy together',
    );
  }
}

function assertProtocolContextShape(
  context: ProtocolBoundAttestationContext,
): void {
  if (typeof context.network !== 'string' || context.network.trim() === '') {
    throw new Error('protocol attestation context network is required');
  }
  normalizePubkeyString(context.programId, 'programId');
  normalizePubkeyString(context.healthPlan, 'healthPlan');
  normalizePubkeyString(context.fundingLine, 'fundingLine');
  normalizePubkeyString(context.claimCase, 'claimCase');
  normalizeOptionalPubkeyString(context.policySeries, 'policySeries');
  normalizeOptionalPubkeyString(context.liquidityPool, 'liquidityPool');
  normalizeOptionalPubkeyString(context.capitalClass, 'capitalClass');
  normalizeOptionalPubkeyString(
    context.allocationPosition,
    'allocationPosition',
  );
  normalizeOptionalPubkeyString(
    context.poolOracleApproval,
    'poolOracleApproval',
  );
  normalizeOptionalPubkeyString(
    context.poolOraclePermissionSet,
    'poolOraclePermissionSet',
  );
  normalizeOptionalPubkeyString(context.poolOraclePolicy, 'poolOraclePolicy');
  if (
    typeof context.schemaKeyHashHex !== 'string' ||
    !/^[0-9a-f]{64}$/.test(context.schemaKeyHashHex.trim().toLowerCase())
  ) {
    throw new Error(
      'protocol attestation context schemaKeyHashHex must be a 32-byte hex string',
    );
  }
  if (typeof context.audience !== 'string' || context.audience.trim() === '') {
    throw new Error('protocol attestation context audience is required');
  }
  if (typeof context.nonce !== 'string' || context.nonce.trim() === '') {
    throw new Error('protocol attestation context nonce is required');
  }
  assertPoolScopeIsComplete(context);
}

function assertNoJsonNumbers(value: unknown, label: string): void {
  if (value === null) return;
  if (typeof value === 'number') {
    throw new Error(
      `${label} must encode settlement numbers as strings, not JSON numbers`,
    );
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) =>
      assertNoJsonNumbers(entry, `${label}[${index}]`),
    );
    return;
  }
  if (typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([key, entry]) =>
      assertNoJsonNumbers(entry, `${label}.${key}`),
    );
  }
}

function publicKeyBytes(publicKeyBase58: string): Uint8Array {
  const bytes = bs58.decode(publicKeyBase58);
  if (bytes.length !== nacl.sign.publicKeyLength) {
    throw new Error('oracle signer public key must be 32 bytes');
  }
  return bytes;
}

function verifySignatureOrThrow(params: {
  message: Uint8Array;
  signature: Uint8Array;
  publicKeyBase58: string;
}): void {
  if (params.signature.length !== nacl.sign.signatureLength) {
    throw new Error('oracle attestation signature must be 64 bytes');
  }
  const ok = nacl.sign.detached.verify(
    params.message,
    params.signature,
    publicKeyBytes(params.publicKeyBase58),
  );
  if (!ok) {
    throw new Error('oracle attestation signature verification failed');
  }
}

function signCanonicalAttestation(params: {
  body: Record<string, unknown>;
  signer: OracleSigner;
}): Promise<{ signature: Uint8Array; digestHex: string }> {
  assertCanonicalJsonValue(params.body, 'oracle attestation body');
  const canonical = stableStringify(params.body);
  const message = new TextEncoder().encode(canonical);
  return params.signer.sign(message).then((signature) => {
    verifySignatureOrThrow({
      message,
      signature,
      publicKeyBase58: params.signer.publicKeyBase58,
    });
    return {
      signature,
      digestHex: sha256Hex(message),
    };
  });
}

export function verifyOracleAttestation(
  attestation: OutcomeAttestation | ProtocolBoundOutcomeAttestation,
): boolean {
  try {
    const {
      signatureBase64,
      digestHex: expectedDigestHex,
      ...body
    } = attestation;
    assertCanonicalJsonValue(body, 'oracle attestation body');
    const message = new TextEncoder().encode(stableStringify(body));
    if (sha256Hex(message) !== expectedDigestHex) return false;
    verifySignatureOrThrow({
      message,
      signature: Uint8Array.from(Buffer.from(signatureBase64, 'base64')),
      publicKeyBase58: attestation.verifier.publicKeyBase58,
    });
    return true;
  } catch {
    return false;
  }
}

function parseTimeMillis(value: string | Date | undefined): number {
  const parsed =
    value instanceof Date ? value.getTime() : Date.parse(value ?? '');
  return Number.isFinite(parsed) ? parsed : Date.now();
}

function contextEqualsPubkey(
  actual: string | null | undefined,
  expected: PublicKeyish | null | undefined,
  label: string,
  allowUnexpectedOptionalScope: boolean,
): boolean {
  if (expected === undefined) {
    return (
      allowUnexpectedOptionalScope || actual === null || actual === undefined
    );
  }
  if (expected === null) return actual === null || actual === undefined;
  return actual === normalizePubkeyString(expected, label);
}

export function verifyProtocolOracleAttestation(
  attestation: ProtocolBoundOutcomeAttestation,
  params: VerifyProtocolOracleAttestationParams,
): boolean {
  try {
    if (!verifyOracleAttestation(attestation)) return false;
    if (
      normalizePubkeyString(
        attestation.verifier.publicKeyBase58,
        'verifierPublicKeyBase58',
      ) !==
      normalizePubkeyString(
        params.expectedVerifierPublicKeyBase58,
        'expectedVerifierPublicKeyBase58',
      )
    ) {
      return false;
    }
    if (
      params.expectedVerifierKeyId !== undefined &&
      attestation.verifier.keyId !== params.expectedVerifierKeyId.trim()
    ) {
      return false;
    }
    const context = attestation.context;
    assertProtocolContextShape(context);
    const nowMillis = parseTimeMillis(params.nowIso);
    if (Date.parse(context.expiresAtIso) <= nowMillis) return false;
    const allowUnexpectedOptionalScope =
      params.allowUnexpectedOptionalScope === true;
    if (context.network !== params.expectedNetwork.trim()) return false;
    if (
      context.programId !==
      normalizePubkeyString(params.expectedProgramId, 'programId')
    ) {
      return false;
    }
    if (
      context.healthPlan !==
      normalizePubkeyString(params.expectedHealthPlan, 'healthPlan')
    ) {
      return false;
    }
    if (
      context.fundingLine !==
      normalizePubkeyString(params.expectedFundingLine, 'fundingLine')
    ) {
      return false;
    }
    if (
      context.claimCase !==
      normalizePubkeyString(params.expectedClaimCase, 'claimCase')
    ) {
      return false;
    }
    if (context.audience !== params.expectedAudience.trim()) return false;
    if (
      params.expectedNonce !== undefined &&
      context.nonce !== params.expectedNonce.trim()
    ) {
      return false;
    }
    return (
      contextEqualsPubkey(
        context.policySeries,
        params.expectedPolicySeries,
        'policySeries',
        allowUnexpectedOptionalScope,
      ) &&
      contextEqualsPubkey(
        context.liquidityPool,
        params.expectedLiquidityPool,
        'liquidityPool',
        allowUnexpectedOptionalScope,
      ) &&
      contextEqualsPubkey(
        context.capitalClass,
        params.expectedCapitalClass,
        'capitalClass',
        allowUnexpectedOptionalScope,
      ) &&
      contextEqualsPubkey(
        context.allocationPosition,
        params.expectedAllocationPosition,
        'allocationPosition',
        allowUnexpectedOptionalScope,
      ) &&
      contextEqualsPubkey(
        context.poolOracleApproval,
        params.expectedPoolOracleApproval,
        'poolOracleApproval',
        allowUnexpectedOptionalScope,
      ) &&
      contextEqualsPubkey(
        context.poolOraclePermissionSet,
        params.expectedPoolOraclePermissionSet,
        'poolOraclePermissionSet',
        allowUnexpectedOptionalScope,
      ) &&
      contextEqualsPubkey(
        context.poolOraclePolicy,
        params.expectedPoolOraclePolicy,
        'poolOraclePolicy',
        allowUnexpectedOptionalScope,
      )
    );
  } catch {
    return false;
  }
}

export async function attestOutcome(
  params: AttestOutcomeParams,
): Promise<AttestOutcomeResult> {
  const id = newId('att');
  const issuedAtIso = nowIso();
  const body = canonicalAttestationBody({
    id,
    userId: params.userId,
    cycleId: params.cycleId,
    outcomeId: params.outcomeId,
    asOfIso: params.asOfIso,
    issuedAtIso,
    payload: params.payload,
    verifierKeyId: params.signer.keyId,
    verifierPublicKeyBase58: params.signer.publicKeyBase58,
  });
  const { signature, digestHex } = await signCanonicalAttestation({
    body,
    signer: params.signer,
  });
  const attestation: OutcomeAttestation = {
    ...body,
    signatureBase64: Buffer.from(signature).toString('base64'),
    digestHex,
  };

  let txSignature: string | null = null;
  if (params.submitAttestation) {
    const result = await params.submitAttestation(attestation);
    txSignature =
      typeof result?.txSignature === 'string' ? result.txSignature : null;
  }

  return {
    attestation,
    txSignature,
  };
}

export async function attestProtocolOutcome(
  params: AttestProtocolOutcomeParams,
): Promise<AttestProtocolOutcomeResult> {
  const id = newId('att');
  const issuedAtIso = nowIso();
  const context = normalizeProtocolContext(params.context, issuedAtIso);
  assertPoolScopeIsComplete(context);
  assertNoJsonNumbers(params.payload, 'protocol attestation payload');
  const body = {
    ...canonicalAttestationBody({
      id,
      userId: params.userId,
      cycleId: params.cycleId,
      outcomeId: params.outcomeId,
      asOfIso: context.asOfIso,
      issuedAtIso: context.issuedAtIso,
      payload: params.payload,
      verifierKeyId: params.signer.keyId,
      verifierPublicKeyBase58: params.signer.publicKeyBase58,
    }),
    context,
  };
  const { signature, digestHex } = await signCanonicalAttestation({
    body,
    signer: params.signer,
  });
  const attestation: ProtocolBoundOutcomeAttestation = {
    ...body,
    signatureBase64: Buffer.from(signature).toString('base64'),
    digestHex,
  };

  let txSignature: string | null = null;
  if (params.submitAttestation) {
    const result = await params.submitAttestation(attestation);
    txSignature =
      typeof result?.txSignature === 'string' ? result.txSignature : null;
  }

  return {
    attestation,
    txSignature,
  };
}
