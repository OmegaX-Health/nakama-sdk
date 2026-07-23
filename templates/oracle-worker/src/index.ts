import {
  NAKAMA_DECISION_ACTION,
  NAKAMA_DECISION_REVIEWER_ROLE,
  NAKAMA_DECISION_REVIEW_ROUND,
  createNakamaDecisionPreview,
  createNakamaDecisionSigningPayload,
  hashNakamaDecision,
  nakamaDecisionReplayKey,
} from '@nakama-health/protocol-sdk';

const payload = createNakamaDecisionSigningPayload({
  network: 'mainnet',
  reviewer:
    process.env.REVIEWER_ADDRESS ??
    '0x0000000000000000000000000000000000000001',
  decisionModule:
    process.env.DECISION_MODULE_ADDRESS ??
    '0x0000000000000000000000000000000000000002',
  message: {
    programId: `0x${'11'.repeat(32)}`,
    requestId: `0x${'22'.repeat(32)}`,
    termsCommitment: `0x${'33'.repeat(32)}`,
    evidenceManifestCommitment: `0x${'44'.repeat(32)}`,
    evidenceVersion: 1,
    reviewRound: NAKAMA_DECISION_REVIEW_ROUND.initial,
    reviewerRole: NAKAMA_DECISION_REVIEWER_ROLE.initialReviewer,
    action: NAKAMA_DECISION_ACTION.deny,
    approvedAmount: 0n,
    recipientCommitment: `0x${'00'.repeat(32)}`,
    publicReasonCode: `0x${'55'.repeat(32)}`,
    nonce: 0n,
    validUntil: 2_000_000_000n,
  },
});

console.log(
  JSON.stringify(
    {
      ok: true,
      role: 'human-review-payload-worker',
      chainId: payload.chainId,
      reviewer: payload.accountId,
      preview: createNakamaDecisionPreview(payload),
      digest: hashNakamaDecision(payload.typedData),
      replayKey: nakamaDecisionReplayKey(payload.typedData),
      next: 'Ask the named human reviewer wallet to sign with eth_signTypedData_v4.',
    },
    (_key, value) => (typeof value === 'bigint' ? value.toString() : value),
    2,
  ),
);
