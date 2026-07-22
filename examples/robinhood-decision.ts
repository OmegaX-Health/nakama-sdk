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
  reviewer: '0x0000000000000000000000000000000000000001',
  decisionModule: '0x0000000000000000000000000000000000000002',
  message: {
    programId: `0x${'11'.repeat(32)}`,
    requestId: `0x${'22'.repeat(32)}`,
    termsCommitment: `0x${'33'.repeat(32)}`,
    evidenceManifestCommitment: `0x${'44'.repeat(32)}`,
    evidenceVersion: 1,
    reviewRound: NAKAMA_DECISION_REVIEW_ROUND.initial,
    reviewerRole: NAKAMA_DECISION_REVIEWER_ROLE.initialReviewer,
    action: NAKAMA_DECISION_ACTION.approve,
    approvedAmount: 2_500_000n,
    recipientCommitment: `0x${'55'.repeat(32)}`,
    publicReasonCode: `0x${'66'.repeat(32)}`,
    nonce: 7n,
    validUntil: 2_000_000_000n,
  },
});

console.log(
  JSON.stringify(
    {
      ok: true,
      accountId: payload.accountId,
      domain: payload.typedData.domain,
      preview: createNakamaDecisionPreview(payload),
      digest: hashNakamaDecision(payload.typedData),
      replayKey: nakamaDecisionReplayKey(payload.typedData),
      walletMethod: 'eth_signTypedData_v4',
    },
    (_key, value) => (typeof value === 'bigint' ? value.toString() : value),
    2,
  ),
);
