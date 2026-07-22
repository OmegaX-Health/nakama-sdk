import {
  NAKAMA_DECISION_ACTION,
  NAKAMA_DECISION_REVIEWER_ROLE,
  NAKAMA_DECISION_REVIEW_ROUND,
  ROBINHOOD_MAINNET_CAIP2,
  ROBINHOOD_MAINNET_CHAIN_ID,
  NakamaRobinhoodAddressError,
  createNakamaDecisionSigningPayload,
  getGeneratedRobinhoodArtifactBundle,
  hashNakamaDecision,
  validateRobinhoodDeploymentManifest,
} from '@nakama-health/protocol-sdk';
import {
  normalizeRobinhoodAddress,
  toRobinhoodCaip10,
} from '@nakama-health/protocol-sdk/robinhood';

const bundle = getGeneratedRobinhoodArtifactBundle();
const deployment = validateRobinhoodDeploymentManifest(
  bundle.deployments.mainnet,
  'mainnet',
);
const reviewer = '0x0000000000000000000000000000000000000001';
const signingPayload = createNakamaDecisionSigningPayload({
  network: 'mainnet',
  reviewer,
  decisionModule: '0x0000000000000000000000000000000000000002',
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

let typedErrorBranchWorked = false;
try {
  normalizeRobinhoodAddress('not-a-robinhood-address');
} catch (error) {
  typedErrorBranchWorked =
    error instanceof NakamaRobinhoodAddressError &&
    error.code === 'NAKAMA_ROBINHOOD_ADDRESS_ERROR';
}
if (!typedErrorBranchWorked) {
  throw new Error('Expected invalid address failure to use a typed error.');
}

console.log(
  JSON.stringify(
    {
      ok: true,
      packageImport: '@nakama-health/protocol-sdk',
      chainId: ROBINHOOD_MAINNET_CHAIN_ID,
      caip2: ROBINHOOD_MAINNET_CAIP2,
      reviewer: toRobinhoodCaip10('mainnet', reviewer),
      artifactStatus: bundle.status,
      artifactSha256: bundle.sourceArtifactSha256,
      contractCount: Object.keys(bundle.contracts).length,
      deploymentStatus: deployment.status,
      writesEnabled: false,
      typedErrorBranchWorked,
      decisionDigest: hashNakamaDecision(signingPayload.typedData),
    },
    null,
    2,
  ),
);
