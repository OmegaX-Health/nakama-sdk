import {
  ROBINHOOD_USDG_MAINNET_ADDRESS,
  validateVirtualsLaunchPacketStructure,
  type VirtualsLaunchPlan,
} from '@nakama-health/protocol-sdk';

const roles = [
  'virtualToken',
  'bonding',
  'bondingConfig',
  'agentFactory',
  'acp',
] as const;

const plan = {
  schemaVersion: 1,
  network: 'mainnet',
  chainId: 4663,
  caip2: 'eip155:4663',
  launchClass: 'pegasus',
  token: { name: 'Nakama', symbol: 'NAKAMA', totalSupply: 1_000_000_000n },
  gates: {
    paidProductEvidencePassed: true,
    tokenUtilityGatePassed: true,
    legalReviewPassed: true,
    platformEligibilityResolved: true,
    malaysiaEligibilityResolved: true,
  },
  contracts: roles.map((role, index) => ({
    role,
    address: `0x${(index + 100).toString(16).padStart(40, '0')}`,
    runtimeBytecodeHash: `0x${(index + 1).toString(16).padStart(64, '0')}`,
    verifiedAtBlock: 1_000n,
  })),
  assets: [
    {
      address: ROBINHOOD_USDG_MAINNET_ADDRESS,
      name: 'Global Dollar',
      symbol: 'USDG',
      decimals: 6,
    },
  ],
  fees: {
    tradingFeeBasisPoints: 100,
    creatorShareBasisPoints: 7_000,
    acpShareBasisPoints: 3_000,
    creatorFeeRecipientId: 'founder',
    acpFeeRecipientId: 'acp',
  },
  beneficialOwners: [
    {
      id: 'owner-1',
      displayName: 'Verified founder',
      jurisdiction: 'verified-jurisdiction',
      verified: true,
      platformEligible: true,
      malaysiaNexusResolved: true,
    },
  ],
  recipients: [
    {
      id: 'founder',
      label: 'Founder locked allocation',
      kind: 'beneficial_owner',
      address: '0x00000000000000000000000000000000000000F1',
      beneficialOwnerId: 'owner-1',
      verified: true,
    },
    {
      id: 'liquidity',
      label: 'Verified launch liquidity',
      kind: 'verified_contract',
      address: '0x00000000000000000000000000000000000000F2',
      beneficialOwnerId: null,
      verified: true,
    },
    {
      id: 'acp',
      label: 'Verified ACP receiver',
      kind: 'verified_contract',
      address: '0x00000000000000000000000000000000000000F3',
      beneficialOwnerId: null,
      verified: true,
    },
  ],
  allocations: [
    {
      recipientId: 'liquidity',
      purpose: 'Launch liquidity',
      basisPoints: 9_500,
      locked: true,
      cliffSeconds: 0n,
      vestingSeconds: 315_360_000n,
    },
    {
      recipientId: 'founder',
      purpose: 'Verified ecosystem execution',
      basisPoints: 500,
      locked: true,
      cliffSeconds: 31_536_000n,
      vestingSeconds: 47_304_000n,
    },
  ],
  simulation: {
    passed: true,
    blockNumber: 1_000n,
    blockHash: `0x${'aa'.repeat(32)}`,
    chainId: 4663,
    configCommitment: `0x${'bb'.repeat(32)}`,
    launchPacketCommitment: `0x${'cc'.repeat(32)}`,
    verifiedContractCodeHashes: roles.map(
      (_role, index) => `0x${(index + 1).toString(16).padStart(64, '0')}`,
    ),
    simulatedAt: '2026-07-23T00:00:00.000Z',
  },
  finality: {
    chainHead: 1_010n,
    safeBlock: 1_009n,
    finalizedBlock: 1_008n,
    configReadBlock: 1_000n,
    state: 'finalized',
    observedAt: '2026-07-23T00:01:00.000Z',
  },
} as const satisfies VirtualsLaunchPlan;

const structurallyValid = validateVirtualsLaunchPacketStructure(plan);

console.log(
  JSON.stringify(
    {
      ok: true,
      structuralValidationOnly: true,
      network: structurallyValid.caip2,
      allocationBasisPoints: structurallyValid.allocations.reduce(
        (sum, allocation) => sum + allocation.basisPoints,
        0,
      ),
      warning:
        'Caller-supplied booleans and hashes do not prove legal eligibility, identity, platform approval, or onchain state.',
    },
    null,
    2,
  ),
);
