import nacl from 'tweetnacl';
import { PublicKey } from '@solana/web3.js';

import type {
  ClaimFailureCode,
  ClaimFailureDetail,
  ValidateSignedClaimTxParams,
  ValidateSignedClaimTxReason,
  ValidateSignedClaimTxResult,
} from './types.js';
import {
  decodeSolanaTransaction,
  solanaTransactionFirstSignature,
  solanaTransactionIntentMessageBytes,
  solanaTransactionMessageBytes,
  solanaTransactionRequiredSigner,
  solanaTransactionSignerSignature,
} from './transactions.js';
export {
  CLAIM_INTAKE_APPROVED,
  CLAIM_INTAKE_CLOSED,
  CLAIM_INTAKE_DENIED,
  CLAIM_INTAKE_OPEN,
  CLAIM_INTAKE_SETTLED,
  CLAIM_INTAKE_UNDER_REVIEW,
  OBLIGATION_STATUS_CANCELED,
  OBLIGATION_STATUS_CLAIMABLE_PAYABLE,
  OBLIGATION_STATUS_IMPAIRED,
  OBLIGATION_STATUS_PROPOSED,
  OBLIGATION_STATUS_RECOVERED,
  OBLIGATION_STATUS_RESERVED,
  OBLIGATION_STATUS_SETTLED,
  describeClaimStatus,
  describeObligationStatus,
} from './protocol_models.js';

function collapseFailureText(params: { err: unknown; logs: string[] }): string {
  const errorText =
    params.err instanceof Error ? params.err.message : String(params.err ?? '');
  return [errorText, ...params.logs].join(' ').toLowerCase();
}

function toFailure(
  code: ClaimFailureCode,
  reason: string,
  logs: string[] = [],
  retryable = false,
): ClaimFailureDetail {
  return {
    code,
    message: reason,
    reason,
    logs,
    retryable,
  };
}

function bytesEqual(left: Uint8Array, right: Uint8Array): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function parsedExpiryMillis(value: string): number | null {
  const expiresAtMillis = Date.parse(value);
  return Number.isFinite(expiresAtMillis) ? expiresAtMillis : null;
}

function currentMillis(value?: string | Date): number {
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return Date.now();
}

export function validateSignedClaimTx(
  params: ValidateSignedClaimTxParams,
): ValidateSignedClaimTxResult {
  let tx;
  try {
    tx = decodeSolanaTransaction(params.signedTxBase64);
  } catch {
    return {
      valid: false,
      txSignature: null,
      reason: 'invalid_transaction_base64',
      signer: null,
    };
  }

  const intent = params.claimIntent;
  if (intent) {
    const intentId = intent.intentId.trim();
    const nonce = intent.nonce.trim();
    const requiredSigner = intent.requiredSigner.trim();
    const expiresAtMillis = parsedExpiryMillis(intent.expiresAtIso);
    const nowMillis = currentMillis(params.nowIso);

    if (
      !intentId ||
      (params.expectedIntentId !== undefined &&
        intentId !== params.expectedIntentId.trim())
    ) {
      return {
        valid: false,
        txSignature: solanaTransactionFirstSignature(tx),
        reason: 'intent_id_mismatch',
        signer: solanaTransactionRequiredSigner(tx),
      };
    }
    if (
      !nonce ||
      (params.expectedNonce !== undefined &&
        nonce !== params.expectedNonce.trim())
    ) {
      return {
        valid: false,
        txSignature: solanaTransactionFirstSignature(tx),
        reason: 'intent_nonce_mismatch',
        signer: solanaTransactionRequiredSigner(tx),
      };
    }
    if (
      !requiredSigner ||
      (params.requiredSigner !== undefined &&
        requiredSigner !== params.requiredSigner.trim())
    ) {
      return {
        valid: false,
        txSignature: solanaTransactionFirstSignature(tx),
        reason: 'required_signer_mismatch',
        signer: solanaTransactionRequiredSigner(tx),
      };
    }
    if (expiresAtMillis === null || expiresAtMillis <= nowMillis) {
      return {
        valid: false,
        txSignature: solanaTransactionFirstSignature(tx),
        reason: 'intent_expired',
        signer: solanaTransactionRequiredSigner(tx),
      };
    }
  }

  const expectedUnsignedTxBase64 = (
    params.expectedUnsignedTxBase64 ??
    intent?.unsignedTxBase64 ??
    ''
  ).trim();
  if (!expectedUnsignedTxBase64) {
    return {
      valid: false,
      txSignature: solanaTransactionFirstSignature(tx),
      reason: 'intent_message_mismatch',
      signer: solanaTransactionRequiredSigner(tx),
    };
  }

  try {
    const expectedUnsignedTx = decodeSolanaTransaction(
      expectedUnsignedTxBase64,
    );
    const signedMessageBytes = solanaTransactionMessageBytes(tx);
    const expectedMessageBytes =
      solanaTransactionMessageBytes(expectedUnsignedTx);
    if (!bytesEqual(signedMessageBytes, expectedMessageBytes)) {
      if (
        params.requireExactMessage ||
        params.allowBlockhashRefresh === false
      ) {
        return {
          valid: false,
          txSignature: solanaTransactionFirstSignature(tx),
          reason: 'intent_message_mismatch',
          signer: solanaTransactionRequiredSigner(tx),
        };
      }
      const signedIntentBytes = solanaTransactionIntentMessageBytes(tx);
      const expectedIntentBytes =
        solanaTransactionIntentMessageBytes(expectedUnsignedTx);
      if (!bytesEqual(signedIntentBytes, expectedIntentBytes)) {
        return {
          valid: false,
          txSignature: solanaTransactionFirstSignature(tx),
          reason: 'intent_message_mismatch',
          signer: solanaTransactionRequiredSigner(tx),
        };
      }
    }
  } catch {
    return {
      valid: false,
      txSignature: solanaTransactionFirstSignature(tx),
      reason: 'intent_message_mismatch',
      signer: solanaTransactionRequiredSigner(tx),
    };
  }

  const expectedSigner = (
    params.requiredSigner ??
    intent?.requiredSigner ??
    ''
  ).trim();
  const signer = solanaTransactionRequiredSigner(tx);
  if (!signer) {
    return {
      valid: false,
      txSignature: null,
      reason: 'missing_fee_payer',
      signer: null,
    };
  }
  if (!expectedSigner) {
    return {
      valid: false,
      txSignature: solanaTransactionFirstSignature(tx),
      reason: 'required_signer_mismatch',
      signer,
    };
  }
  if (signer !== expectedSigner) {
    return {
      valid: false,
      txSignature: solanaTransactionFirstSignature(tx),
      reason: 'required_signer_mismatch',
      signer,
    };
  }

  const requiredSignature = solanaTransactionSignerSignature(
    tx,
    expectedSigner,
  );
  if (!requiredSignature) {
    return {
      valid: false,
      txSignature: solanaTransactionFirstSignature(tx),
      reason: 'missing_required_signature',
      signer,
    };
  }

  const ok = nacl.sign.detached.verify(
    solanaTransactionMessageBytes(tx),
    requiredSignature,
    new PublicKey(expectedSigner).toBytes(),
  );
  if (!ok) {
    return {
      valid: false,
      txSignature: solanaTransactionFirstSignature(tx),
      reason: 'invalid_required_signature',
      signer,
    };
  }

  return {
    valid: true,
    txSignature: solanaTransactionFirstSignature(tx),
    reason: null,
    signer,
  };
}

export function mapValidationReasonToClaimFailure(
  reason: ValidateSignedClaimTxReason | null,
): ClaimFailureCode | null {
  if (!reason) return null;
  if (reason === 'intent_expired') return 'intent_expired';
  if (reason === 'intent_id_mismatch') return 'intent_id_mismatch';
  if (reason === 'intent_nonce_mismatch') return 'intent_nonce_mismatch';
  if (reason === 'intent_message_mismatch') return 'intent_message_mismatch';
  if (reason === 'required_signer_mismatch') return 'required_signer_mismatch';
  return 'unknown';
}

export function normalizeClaimSimulationFailure(params: {
  err: unknown;
  logs?: string[] | null;
}): ClaimFailureDetail {
  const logs = params.logs ?? [];
  const text = collapseFailureText({ err: params.err, logs });

  if (/claim intake pause|claim intake paused/.test(text)) {
    return toFailure(
      'claim_intake_paused',
      'Claim intake is paused for the current scope.',
      logs,
      true,
    );
  }
  if (/protocol emergency pause|protocol paused|operational pause/.test(text)) {
    return toFailure(
      'protocol_paused',
      'Protocol controls currently block the claim flow.',
      logs,
      true,
    );
  }
  if (/not eligible|eligibility|member position/.test(text)) {
    return toFailure(
      'not_eligible',
      'The member position is not currently eligible for this claim or payout.',
      logs,
      false,
    );
  }
  if (
    /insufficient|funding line|reserve exhausted|budget exhausted/.test(text)
  ) {
    return toFailure(
      'funding_exhausted',
      'The applicable funding line does not have enough free capital.',
      logs,
      false,
    );
  }
  if (/allocation freeze|deallocation only/.test(text)) {
    return toFailure(
      'allocation_frozen',
      'Capital allocation controls currently freeze this surface.',
      logs,
      true,
    );
  }
  if (/queue only|redemption queue/.test(text)) {
    return toFailure(
      'queue_only',
      'The current capital surface is operating in queue-only mode.',
      logs,
      true,
    );
  }
  if (
    /claim state|obligation state|already settled|already closed/.test(text)
  ) {
    return toFailure(
      'invalid_claim_state',
      'The claim or obligation is not in a state that allows this action.',
      logs,
      false,
    );
  }

  if (
    /insufficientpoolliquidity|insufficient funds|insufficient lamports/.test(
      text,
    )
  ) {
    return toFailure(
      'simulation_failed_insufficient_funds',
      'Pool does not have sufficient liquidity for this claim.',
      logs,
      false,
    );
  }

  if (/poolnotactive|pool is not active/.test(text)) {
    return toFailure(
      'simulation_failed_pool_paused',
      'Pool is paused or not active for claims.',
      logs,
      false,
    );
  }

  if (/membershipnotactive|membership member mismatch|membership/.test(text)) {
    return toFailure(
      'simulation_failed_membership_invalid',
      'Membership is not active for this pool.',
      logs,
      false,
    );
  }

  return toFailure(
    'simulation_failed_unknown',
    'Simulation failed for an unclassified claim or obligation reason.',
    logs,
    false,
  );
}

export function normalizeClaimRpcFailure(error: unknown): ClaimFailureDetail {
  const message = error instanceof Error ? error.message : String(error ?? '');
  const normalized = message.toLowerCase();

  if (/timed out|timeout|deadline exceeded/.test(normalized)) {
    return toFailure(
      'rpc_timeout',
      'RPC confirmation timed out before the claim transaction reached a terminal state.',
      [],
      true,
    );
  }

  if (
    /fetch failed|network|socket|econnreset|service unavailable/.test(
      normalized,
    )
  ) {
    return toFailure(
      'network_error',
      'A network or RPC transport failure interrupted the claim flow.',
      [],
      true,
    );
  }

  return toFailure(
    'rpc_rejected',
    'RPC submission failed for an unclassified reason.',
    [],
    false,
  );
}
