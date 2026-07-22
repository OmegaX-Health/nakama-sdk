import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ROBINHOOD_USDG_MAINNET_ADDRESS,
  NakamaRobinhoodConfigError,
  validateVirtualsLaunchPlan,
  type VirtualsLaunchPlan,
} from '../src/index.js';

function createValidPlan(): VirtualsLaunchPlan {
  const roles = [
    'virtualToken',
    'bonding',
    'bondingConfig',
    'agentFactory',
    'acp',
  ] as const;
  return {
    schemaVersion: 1,
    network: 'mainnet',
    chainId: 4663,
    caip2: 'eip155:4663',
    launchClass: 'pegasus',
    token: {
      name: 'Nakama',
      symbol: 'NAKAMA',
      totalSupply: 1_000_000_000n,
    },
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
      {
        address: '0xc6911796042b15d7Fa4F6CDe69e245DdCd3d9c31',
        name: 'Virtuals Protocol',
        symbol: 'VIRTUAL',
        decimals: 18,
      },
    ],
    fees: {
      tradingFeeBasisPoints: 100,
      creatorShareBasisPoints: 7000,
      acpShareBasisPoints: 3000,
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
        basisPoints: 9500,
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
        (_role, index) =>
          `0x${(index + 1).toString(16).padStart(64, '0')}` as const,
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
  };
}

test('offline Virtuals launch plan accepts a fully resolved finalized packet', () => {
  const validated = validateVirtualsLaunchPlan(createValidPlan());
  assert.equal(validated.chainId, 4663);
  assert.equal(
    validated.allocations.reduce((sum, item) => sum + item.basisPoints, 0),
    10_000,
  );
  assert.equal(validated.finality.state, 'finalized');
});

test('offline Virtuals launch plan fails closed on product, token, legal, platform, and Malaysia gates', () => {
  for (const gate of Object.keys(createValidPlan().gates) as Array<
    keyof VirtualsLaunchPlan['gates']
  >) {
    const plan = structuredClone(createValidPlan());
    plan.gates[gate] = false;
    assert.throws(
      () => validateVirtualsLaunchPlan(plan),
      NakamaRobinhoodConfigError,
      gate,
    );
  }
  const ownerPlan = structuredClone(createValidPlan());
  ownerPlan.beneficialOwners[0]!.malaysiaNexusResolved = false;
  assert.throws(() => validateVirtualsLaunchPlan(ownerPlan), /Malaysia nexus/);
});

test('offline Virtuals launch plan rejects USDG-as-USDC and incomplete allocations', () => {
  const mislabeled = structuredClone(createValidPlan());
  mislabeled.assets[0]!.name = 'USD Coin';
  mislabeled.assets[0]!.symbol = 'USDC';
  assert.throws(
    () => validateVirtualsLaunchPlan(mislabeled),
    /must never be labeled USDC/,
  );

  const incomplete = structuredClone(createValidPlan());
  incomplete.allocations[0]!.basisPoints = 9000;
  assert.throws(
    () => validateVirtualsLaunchPlan(incomplete),
    /total exactly 10000/,
  );
});

test('offline Virtuals launch plan rejects unknown fee or allocation recipients', () => {
  const feePlan = structuredClone(createValidPlan());
  feePlan.fees.creatorFeeRecipientId = 'unknown';
  assert.throws(() => validateVirtualsLaunchPlan(feePlan), /unknown recipient/);

  const allocationPlan = structuredClone(createValidPlan());
  allocationPlan.allocations[0]!.recipientId = 'unknown';
  assert.throws(
    () => validateVirtualsLaunchPlan(allocationPlan),
    /unknown recipient/,
  );
});

test('offline Virtuals launch packet requires canonical USDG and nonzero unique addresses', () => {
  const missingUsdg = structuredClone(createValidPlan());
  missingUsdg.assets = missingUsdg.assets.slice(1);
  assert.throws(
    () => validateVirtualsLaunchPlan(missingUsdg),
    /must include canonical Robinhood mainnet USDG/,
  );

  const zeroContract = structuredClone(createValidPlan());
  zeroContract.contracts[0]!.address =
    '0x0000000000000000000000000000000000000000';
  assert.throws(
    () => validateVirtualsLaunchPlan(zeroContract),
    /cannot be the zero address/,
  );

  const duplicateContract = structuredClone(createValidPlan());
  duplicateContract.contracts[1]!.address =
    duplicateContract.contracts[0]!.address;
  assert.throws(
    () => validateVirtualsLaunchPlan(duplicateContract),
    /contract address values must be unique/,
  );

  const duplicateAsset = structuredClone(createValidPlan());
  duplicateAsset.assets[1]!.address = duplicateAsset.assets[0]!.address;
  duplicateAsset.assets[1]!.name = 'Global Dollar';
  duplicateAsset.assets[1]!.symbol = 'USDG';
  duplicateAsset.assets[1]!.decimals = 6;
  assert.throws(
    () => validateVirtualsLaunchPlan(duplicateAsset),
    /asset address values must be unique/,
  );

  const duplicateRecipient = structuredClone(createValidPlan());
  duplicateRecipient.recipients[1]!.address =
    duplicateRecipient.recipients[0]!.address;
  assert.throws(
    () => validateVirtualsLaunchPlan(duplicateRecipient),
    /recipient address values must be unique/,
  );
});

test('offline Virtuals launch packet exposes ownership concentration and resolves every owner reference', () => {
  const duplicateAllocation = structuredClone(createValidPlan());
  duplicateAllocation.allocations.push({
    ...duplicateAllocation.allocations[1]!,
    basisPoints: 100,
  });
  duplicateAllocation.allocations[0]!.basisPoints = 9400;
  assert.throws(
    () => validateVirtualsLaunchPlan(duplicateAllocation),
    /combine allocations for the same recipient/,
  );

  const unknownContractOwner = structuredClone(createValidPlan());
  unknownContractOwner.recipients[1]!.beneficialOwnerId = 'unknown-owner';
  assert.throws(
    () => validateVirtualsLaunchPlan(unknownContractOwner),
    /unknown beneficial owner/,
  );
});

test('offline Virtuals launch plan requires simulation code-hash parity and finalized observation', () => {
  const codeMismatch = structuredClone(createValidPlan());
  codeMismatch.simulation.verifiedContractCodeHashes[0] = `0x${'ff'.repeat(32)}`;
  assert.throws(
    () => validateVirtualsLaunchPlan(codeMismatch),
    /code hashes do not exactly match/,
  );

  const notFinal = structuredClone(createValidPlan());
  notFinal.finality.finalizedBlock = 999n;
  assert.throws(
    () => validateVirtualsLaunchPlan(notFinal),
    /must be observed at finalized/,
  );

  const futureContractEvidence = structuredClone(createValidPlan());
  futureContractEvidence.contracts[0]!.verifiedAtBlock = 1_001n;
  assert.throws(
    () => validateVirtualsLaunchPlan(futureContractEvidence),
    /verified after the finalized configuration snapshot/,
  );

  const permissiveTimestamp = structuredClone(createValidPlan());
  permissiveTimestamp.simulation.simulatedAt = '2026-07-23';
  assert.throws(
    () => validateVirtualsLaunchPlan(permissiveTimestamp),
    /must be an ISO timestamp/,
  );

  const reversedTime = structuredClone(createValidPlan());
  reversedTime.finality.observedAt = '2026-07-22T23:59:59.999Z';
  assert.throws(
    () => validateVirtualsLaunchPlan(reversedTime),
    /cannot precede launch simulation/,
  );
});
