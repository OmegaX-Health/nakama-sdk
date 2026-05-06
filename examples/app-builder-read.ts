import {
  CLAIM_INTAKE_APPROVED,
  ELIGIBILITY_ELIGIBLE,
  OBLIGATION_DELIVERY_MODE_PAYABLE,
  OBLIGATION_STATUS_SETTLED,
  buildMemberReadModel,
  describeClaimStatus,
  describeEligibilityStatus,
  type ClaimCaseSnapshot,
  type MemberPositionSnapshot,
  type ObligationSnapshot,
} from '@omegax/protocol-sdk';

const wallet = '6wZcQdrgL7tM8mYw2h9D6ukgK7GvJ8Fi8dK21DqAq7zC';
const memberPosition = '7jYwFJgxW26mJmPM6zDoGcYyygyc2XqPq7T9AfvEwU1C';
const healthPlan = '3tkxQ2eZtJQv7xvVbqM8wpwwKv7qE9LzLXhDq6evR8fN';
const policySeries = '5a6qLCGQ2zt6NqHnbDM4bQ1NVNRkHWnL3fPrXp7waX3e';
const reserveDomain = '2B3S7dFxWApMa6pcS9k5TF75DWn7PPfryC3a3xAv2qE9';
const assetMint = 'So11111111111111111111111111111111111111112';
const fundingLine = '9Y8UN8GdXg3oXW8nWVYo5jKfAVz4eSKr97vKPAHdZ7yJ';
const claimCase = '8PiEsgfDwsrAXf2sq6wQHTgZbUnBvW8G4k3dgXtD73Lr';

const memberPositions: MemberPositionSnapshot[] = [
  {
    address: memberPosition,
    wallet,
    healthPlan,
    policySeries,
    eligibilityStatus: ELIGIBILITY_ELIGIBLE,
    delegatedRights: ['claim_review_updates'],
    active: true,
  },
];

const obligations: ObligationSnapshot[] = [
  {
    address: 'EU9vFGLFq8g8E3dPgz7o3mqXxigq8fw4eNn6uUbJSrjE',
    reserveDomain,
    assetMint,
    healthPlan,
    policySeries,
    memberWallet: wallet,
    beneficiary: wallet,
    fundingLine,
    claimCase,
    obligationId: 'claim-payout-001',
    status: OBLIGATION_STATUS_SETTLED,
    deliveryMode: OBLIGATION_DELIVERY_MODE_PAYABLE,
    principalAmount: '150000000',
    payableAmount: '0',
    settledAmount: '150000000',
  },
];

const claimCases: ClaimCaseSnapshot[] = [
  {
    address: claimCase,
    reserveDomain,
    healthPlan,
    policySeries,
    fundingLine,
    memberPosition,
    claimant: wallet,
    claimId: 'travel-claim-001',
    intakeStatus: CLAIM_INTAKE_APPROVED,
    approvedAmount: '150000000',
    paidAmount: '150000000',
  },
];

const memberReadModel = buildMemberReadModel({
  wallet,
  memberPositions,
  obligations,
  claimCases,
});

const participation = memberReadModel.planParticipations[0];
if (!participation) {
  throw new Error('Expected member participation.');
}

console.log(
  JSON.stringify(
    {
      wallet: memberReadModel.wallet,
      eligibility: describeEligibilityStatus(ELIGIBILITY_ELIGIBLE),
      claimStatus: describeClaimStatus(CLAIM_INTAKE_APPROVED),
      plans: memberReadModel.planParticipations.length,
      payoutHistoryRaw: participation.payoutHistory.toString(),
      claimStatusCounts: participation.claimStatusCounts,
    },
    null,
    2,
  ),
);
