import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  decodeFunctionData,
  encodeAbiParameters,
  encodeErrorResult,
  encodeEventTopics,
  keccak256,
  parseAbi,
  parseAbiParameters,
  type Address,
  type PublicClient,
} from 'viem';

import {
  NAKAMA_DECISION_ACTION,
  NAKAMA_DECISION_REVIEWER_ROLE,
  NAKAMA_DECISION_REVIEW_ROUND,
  ROBINHOOD_AGENT_AUTHORIZATION_FAILURE_CODE,
  ROBINHOOD_ECONOMIC_ACTIVITY_KIND,
  ROBINHOOD_EVENT_NAMES,
  NakamaRobinhoodArtifactError,
  assertRobinhoodDeploymentReady,
  createNakamaEligibilityRevocationTypedData,
  createNakamaEligibilityTypedData,
  createRobinhoodActionBuilder,
  createRobinhoodReadClient,
  createRobinhoodRecordBlockedAttemptCall,
  createRobinhoodSponsorFundingBatch,
  createRobinhoodSubmittedTransactionFromSubmission,
  decodeRobinhoodAgentAuthorizationFailure,
  decodeRobinhoodEconomicActivity,
  decodeRobinhoodError,
  decodeRobinhoodFactoryConfigurationError,
  getGeneratedRobinhoodArtifactBundle,
  getRobinhoodContractArtifact,
  hashNakamaEligibilityAuthorization,
  hashNakamaEligibilityRevocation,
  hashPreparedRobinhoodAction,
  loadRobinhoodDeploymentManifest,
  parseRobinhoodUsdg,
  requestRobinhoodAction,
  simulateRobinhoodAction,
  validateRobinhoodArtifactBundle,
  validateRobinhoodDeploymentManifest,
  verifyRobinhoodDeploymentRuntime,
} from '../src/index.js';

import {
  TEST_ACCOUNT,
  TEST_BLOCK_HASH,
  TEST_COMMITMENT,
  TEST_PROGRAM_ID,
  TEST_SUITE_ID,
  TEST_TX_HASH,
  createReadyRobinhoodFixture,
  installTrustedRobinhoodManifestForTest,
  testRoleAddress,
} from './support/robinhood-fixtures.js';

test('checked-in deployment manifests validate and remain fail-closed', async () => {
  const mainnet = loadRobinhoodDeploymentManifest(
    await readFile('deployments/robinhood-mainnet.json', 'utf8'),
    'mainnet',
  );
  const testnet = loadRobinhoodDeploymentManifest(
    await readFile('deployments/robinhood-testnet.json', 'utf8'),
    'testnet',
  );
  const bundle = getGeneratedRobinhoodArtifactBundle();
  assert.equal(mainnet.status, 'unconfigured');
  assert.equal(testnet.status, 'unconfigured');
  assert.equal(mainnet.chainId, 4663);
  assert.equal(testnet.chainId, 46630);
  assert.throws(
    () => assertRobinhoodDeploymentReady(mainnet, bundle),
    NakamaRobinhoodArtifactError,
  );
});

test('ready artifact bundles require exact nonzero committed source provenance', () => {
  const canonical = getGeneratedRobinhoodArtifactBundle();
  assert.equal(canonical.status, 'ready');
  assert.equal(canonical.schemaVersion, 2);
  assert.equal(canonical.protocolSuiteMajor, 2);
  assert.equal(canonical.economicEventSchemaVersion, 2);
  assert.equal(
    canonical.sourceCommit,
    '6392e2c774b66252b62245ffee18c18b3803b9be',
  );
  assert.equal(
    canonical.sourceArtifactSha256,
    '3e66c8340badccb9e413414e7dada7e80c3a8d46560d439153a799a9be5e2f1b',
  );
  assert.match(canonical.sourceCommit ?? '', /^[0-9a-f]{40}$/);
  for (const sourceCommit of [null, 'abc123', 'A'.repeat(40), '0'.repeat(40)]) {
    assert.throws(
      () =>
        validateRobinhoodArtifactBundle({
          ...structuredClone(canonical),
          sourceCommit,
        }),
      /sourceCommit must be a nonzero full lowercase Git commit SHA/,
    );
  }
  for (const [field, value] of [
    ['schemaVersion', 1],
    ['protocolSuiteMajor', 1],
    ['economicEventSchemaVersion', 1],
  ] as const) {
    assert.throws(
      () =>
        validateRobinhoodArtifactBundle({
          ...structuredClone(canonical),
          [field]: value,
        }),
      /identity is invalid|require protocol suite major 2/,
    );
  }
});

test('deployment manifest rejects chain substitution, unknown fields, and USDG mislabeling', async () => {
  const source = JSON.parse(
    await readFile('deployments/robinhood-mainnet.json', 'utf8'),
  ) as Record<string, unknown>;
  assert.throws(
    () =>
      validateRobinhoodDeploymentManifest({
        ...source,
        chainId: 1,
        caip2: 'eip155:1',
      }),
    /chain identity/,
  );
  assert.throws(
    () => validateRobinhoodDeploymentManifest({ ...source, surprise: true }),
    /fields do not match schema/,
  );
  assert.throws(
    () =>
      validateRobinhoodDeploymentManifest({
        ...source,
        settlementAsset: {
          ...(source.settlementAsset as Record<string, unknown>),
          name: 'USD Coin',
          symbol: 'USDC',
        },
      }),
    /Global Dollar/,
  );
});

test('deployed manifests reject zero or duplicate role addresses and unverified settlement assets', () => {
  const { manifest } = createReadyRobinhoodFixture();
  const zeroAddress = structuredClone(manifest);
  zeroAddress.contracts.program!.address =
    '0x0000000000000000000000000000000000000000';
  assert.throws(
    () => validateRobinhoodDeploymentManifest(zeroAddress),
    /cannot be the zero address/,
  );

  const duplicate = structuredClone(manifest);
  duplicate.contracts.vault!.address = duplicate.contracts.program!.address;
  assert.throws(
    () => validateRobinhoodDeploymentManifest(duplicate),
    /unique address/,
  );

  const unverifiedAsset = structuredClone(manifest);
  unverifiedAsset.settlementAsset.status = 'unconfigured';
  unverifiedAsset.settlementAsset.address = null;
  assert.throws(
    () => validateRobinhoodDeploymentManifest(unverifiedAsset),
    /requires a verified settlement asset/,
  );
});

test('ABI-dependent builders reject a self-asserted bundle that differs from generated canonical ABIs', () => {
  const { manifest, bundle, runtime } = createReadyRobinhoodFixture();
  const fakeBundle = structuredClone(bundle);
  fakeBundle.contracts.program!.abi = [];
  assert.throws(
    () =>
      createRobinhoodActionBuilder({
        manifest,
        bundle: fakeBundle,
        runtime,
        programId: TEST_PROGRAM_ID,
      }),
    /does not match the generated canonical bundle/,
  );

  const substitutedProvenance = structuredClone(bundle);
  substitutedProvenance.sourceCommit = 'd'.repeat(40);
  assert.throws(
    () =>
      createRobinhoodActionBuilder({
        manifest,
        bundle: substitutedProvenance,
        runtime,
        programId: TEST_PROGRAM_ID,
      }),
    /generated canonical artifact bundle/,
  );
});

test('generated artifact bundle and nested ABIs cannot be poisoned by consumers', () => {
  const bundle = getGeneratedRobinhoodArtifactBundle();
  const originalLength = bundle.contracts.program!.abi.length;
  assert.equal(Object.isFrozen(bundle), true);
  assert.equal(Object.isFrozen(bundle.contracts.program!.abi), true);
  assert.throws(() => {
    (bundle.contracts.program!.abi as unknown[]).push({ type: 'function' });
  }, TypeError);
  assert.equal(
    getGeneratedRobinhoodArtifactBundle().contracts.program!.abi.length,
    originalLength,
  );
});

test('contract operations reject caller-substituted deployment evidence and program IDs', () => {
  const { manifest, bundle, runtime } = createReadyRobinhoodFixture();
  const substitutedManifest = structuredClone(manifest);
  substitutedManifest.contracts.vault!.address =
    '0x00000000000000000000000000000000000000f8';
  const substitutedBundle = {
    ...bundle,
    deployments: { ...bundle.deployments, mainnet: substitutedManifest },
  };
  assert.throws(
    () =>
      createRobinhoodActionBuilder({
        manifest: substitutedManifest,
        bundle: substitutedBundle,
        runtime,
        programId: TEST_PROGRAM_ID,
      }),
    /does not match the generated canonical bundle/,
  );
  assert.throws(
    () =>
      createRobinhoodActionBuilder({
        manifest,
        bundle,
        runtime,
        programId: `0x${'98'.repeat(32)}`,
      }),
    /does not match the operation target/,
  );
  assert.throws(
    () =>
      createRobinhoodActionBuilder({
        manifest,
        bundle,
        runtime: { ...runtime, contracts: {} } as typeof runtime,
        programId: TEST_PROGRAM_ID,
      }),
    /does not match the operation target/,
  );
});

test('action builder snapshots canonical manifest and ABI inputs', () => {
  const fixture = createReadyRobinhoodFixture();
  const manifest = structuredClone(fixture.manifest);
  const bundle = structuredClone(fixture.bundle);
  const builder = createRobinhoodActionBuilder({
    manifest,
    bundle,
    runtime: fixture.runtime,
    programId: TEST_PROGRAM_ID,
  });
  const canonicalProgram = fixture.manifest.contracts.program!.address;
  manifest.contracts.program!.address =
    '0x0000000000000000000000000000000000000999';
  (bundle.contracts.program!.abi as unknown[]).splice(0);

  const action = builder.openEnrollment({
    account: TEST_ACCOUNT,
    intentId: 'intent-snapshot-1',
    preparedAt: '2026-07-23T00:00:00.000Z',
    expiresAt: '2026-07-23T00:05:00.000Z',
  });
  assert.equal(action.target, canonicalProgram);
  assert.equal(
    decodeFunctionData({
      abi: getRobinhoodContractArtifact(fixture.bundle, 'program').abi,
      data: action.data,
    }).functionName,
    'openEnrollment',
  );
});

test('typed event-name set exactly covers every imported Robinhood ABI event', () => {
  const bundle = getGeneratedRobinhoodArtifactBundle();
  const names = new Set<string>();
  for (const artifact of Object.values(bundle.contracts)) {
    for (const item of artifact.abi) {
      if (item.type === 'event') names.add(item.name);
    }
  }
  assert.deepEqual([...names].sort(), [...ROBINHOOD_EVENT_NAMES].sort());
});

test('canonical EconomicActivity decoder discriminates and reconstructs all nine ledger kinds', () => {
  const { manifest, bundle } = createReadyRobinhoodFixture();
  const vaultAbi = getRobinhoodContractArtifact(bundle, 'vault').abi;
  const kinds = [
    [ROBINHOOD_ECONOMIC_ACTIVITY_KIND.sponsorFunding, 'sponsor_funding'],
    [
      ROBINHOOD_ECONOMIC_ACTIVITY_KIND.memberLiabilityAdded,
      'member_liability_added',
    ],
    [
      ROBINHOOD_ECONOMIC_ACTIVITY_KIND.memberLiabilityReleased,
      'member_liability_released',
    ],
    [
      ROBINHOOD_ECONOMIC_ACTIVITY_KIND.pendingReservationAdded,
      'pending_reservation_added',
    ],
    [
      ROBINHOOD_ECONOMIC_ACTIVITY_KIND.pendingReservationCleared,
      'pending_reservation_cleared',
    ],
    [
      ROBINHOOD_ECONOMIC_ACTIVITY_KIND.obligationApproved,
      'obligation_approved',
    ],
    [ROBINHOOD_ECONOMIC_ACTIVITY_KIND.obligationSettled, 'obligation_settled'],
    [
      ROBINHOOD_ECONOMIC_ACTIVITY_KIND.sponsorRefundMatured,
      'sponsor_refund_matured',
    ],
    [
      ROBINHOOD_ECONOMIC_ACTIVITY_KIND.sponsorRefundClaimed,
      'sponsor_refund_claimed',
    ],
  ] as const;
  const nonIndexed = parseAbiParameters(
    'bytes32 relatedId,address asset,address actor,address beneficiary,int256 amount,uint256 sponsorFunded,uint256 settled,uint256 sponsorRefunded,uint256 maximumRemainingMemberLiability,uint256 pendingRequestReservation,uint256 approvedUnpaidObligations,uint256 maturedRefunds,uint256 trackedAssets,uint256 encumberedAssets',
  );
  const createLog = (kind: number, trackedOffset = 0n) => {
    const activityId = `0x${kind.toString(16).padStart(64, '0')}` as const;
    return {
      address: manifest.contracts.vault!.address,
      topics: encodeEventTopics({
        abi: vaultAbi,
        eventName: 'EconomicActivity',
        args: { programId: TEST_PROGRAM_ID, activityId, kind },
      } as never),
      data: encodeAbiParameters(nonIndexed, [
        TEST_COMMITMENT,
        manifest.settlementAsset.address!,
        TEST_ACCOUNT,
        TEST_ACCOUNT,
        kind % 2 === 0 ? -BigInt(kind) : BigInt(kind),
        1_000n + BigInt(kind),
        100n,
        50n,
        400n,
        100n,
        200n,
        100n,
        850n + BigInt(kind) + trackedOffset,
        700n,
      ]),
      blockNumber: 103n,
      blockHash: TEST_BLOCK_HASH,
      transactionHash: TEST_TX_HASH,
      logIndex: kind,
    } as const;
  };

  for (const [kindCode, kind] of kinds) {
    const decoded = decodeRobinhoodEconomicActivity({
      log: createLog(kindCode),
      manifest,
      bundle,
    });
    assert.equal(decoded.schemaVersion, 2);
    assert.equal(decoded.role, 'vault');
    assert.equal(decoded.eventName, 'EconomicActivity');
    assert.equal(decoded.kindCode, kindCode);
    assert.equal(decoded.kind, kind);
    assert.equal(decoded.programId, TEST_PROGRAM_ID);
    assert.equal(decoded.relatedId, TEST_COMMITMENT);
    assert.equal(decoded.actor, TEST_ACCOUNT);
    assert.equal(decoded.accounting.sponsorFunded, 1_000n + BigInt(kindCode));
    assert.equal(decoded.accounting.trackedAssets, 850n + BigInt(kindCode));
    assert.equal(decoded.accounting.encumberedAssets, 700n);
  }

  assert.throws(
    () =>
      decodeRobinhoodEconomicActivity({
        log: createLog(0),
        manifest,
        bundle,
      }),
    /Unknown economic activity kind 0/,
  );
  assert.throws(
    () =>
      decodeRobinhoodEconomicActivity({
        log: createLog(1, 1n),
        manifest,
        bundle,
      }),
    /canonical vault identities/,
  );
});

test('blocked-attempt helper exposes adapter-only calldata and canonical failure reasons', () => {
  const { manifest, bundle, runtime } = createReadyRobinhoodFixture();
  const adapter = '0x00000000000000000000000000000000000000F1' as Address;
  const authorizationId = `0x${'71'.repeat(32)}` as const;
  const selector = '0x12345678' as const;
  const call = createRobinhoodRecordBlockedAttemptCall({
    manifest,
    bundle,
    runtime,
    programId: TEST_PROGRAM_ID,
    adapter,
    authorizationId,
    principal: TEST_ACCOUNT,
    selector,
    nativeValue: 1n,
    assetAmount: 2n,
  });
  assert.equal(call.requiredCaller.toLowerCase(), adapter.toLowerCase());
  assert.equal(
    call.registry,
    manifest.contracts.agentAuthorizationRegistry!.address,
  );
  assert.equal('action' in call, false);
  const decoded = decodeFunctionData({
    abi: getRobinhoodContractArtifact(bundle, 'agentAuthorizationRegistry').abi,
    data: call.data,
  });
  assert.equal(decoded.functionName, 'recordBlockedAttempt');
  assert.deepEqual(decoded.args, [
    authorizationId,
    TEST_ACCOUNT,
    selector,
    1n,
    2n,
  ]);
  assert.equal(
    decodeRobinhoodAgentAuthorizationFailure(
      ROBINHOOD_AGENT_AUTHORIZATION_FAILURE_CODE.authorizationNotActive,
    ),
    'authorization_not_active',
  );
  assert.equal(
    decodeRobinhoodAgentAuthorizationFailure(
      ROBINHOOD_AGENT_AUTHORIZATION_FAILURE_CODE.actionLimitExceeded,
    ),
    'action_limit_exceeded',
  );
  assert.equal(
    decodeRobinhoodAgentAuthorizationFailure(
      ROBINHOOD_AGENT_AUTHORIZATION_FAILURE_CODE.periodLimitExceeded,
    ),
    'period_limit_exceeded',
  );
  assert.equal(
    decodeRobinhoodAgentAuthorizationFailure(
      ROBINHOOD_AGENT_AUTHORIZATION_FAILURE_CODE.authorized,
    ),
    'authorized',
  );
  assert.throws(
    () =>
      createRobinhoodRecordBlockedAttemptCall({
        manifest,
        bundle,
        runtime,
        programId: TEST_PROGRAM_ID,
        adapter,
        authorizationId,
        principal: TEST_ACCOUNT,
        selector: '0x1234',
        nativeValue: 0n,
        assetAmount: 0n,
      }),
    /exactly four bytes/,
  );
  assert.throws(
    () =>
      createRobinhoodRecordBlockedAttemptCall({
        manifest,
        bundle,
        runtime,
        programId: TEST_PROGRAM_ID,
        adapter: manifest.contracts.vault!.address,
        authorizationId,
        principal: TEST_ACCOUNT,
        selector,
        nativeValue: 0n,
        assetAmount: 0n,
      }),
    /external reviewed adapter/,
  );
});

test('factory role and suite-version errors decode to stable typed identities', () => {
  const bundle = getGeneratedRobinhoodArtifactBundle();
  const factoryAbi = getRobinhoodContractArtifact(bundle, 'factory').abi;
  const invalidRole = decodeRobinhoodFactoryConfigurationError(
    encodeErrorResult({
      abi: factoryAbi,
      errorName: 'InvalidRole',
      args: [6, TEST_ACCOUNT],
    } as never),
    bundle,
  );
  assert.equal(invalidRole?.errorName, 'InvalidRole');
  if (invalidRole?.errorName !== 'InvalidRole') assert.fail('InvalidRole');
  assert.equal(invalidRole.roleIndex, 6);
  assert.equal(invalidRole.factoryRole, 'eligibility_attestor');
  assert.equal(invalidRole.address, TEST_ACCOUNT);

  const duplicateRole = decodeRobinhoodFactoryConfigurationError(
    encodeErrorResult({
      abi: factoryAbi,
      errorName: 'DuplicateRole',
      args: [0, 1, TEST_ACCOUNT],
    } as never),
    bundle,
  );
  assert.equal(duplicateRole?.errorName, 'DuplicateRole');
  if (duplicateRole?.errorName !== 'DuplicateRole')
    assert.fail('DuplicateRole');
  assert.equal(duplicateRole.firstRole, 'sponsor');
  assert.equal(duplicateRole.secondRole, 'operator');

  const wrongSuite = decodeRobinhoodFactoryConfigurationError(
    encodeErrorResult({
      abi: factoryAbi,
      errorName: 'IncompatibleSuiteVersion',
      args: [2, 1],
    } as never),
    bundle,
  );
  assert.equal(wrongSuite?.errorName, 'IncompatibleSuiteVersion');
  if (wrongSuite?.errorName !== 'IncompatibleSuiteVersion') {
    assert.fail('IncompatibleSuiteVersion');
  }
  assert.equal(wrongSuite.expectedMajor, 2);
  assert.equal(wrongSuite.actualMajor, 1);
});

test('eligibility revocation helper and action bind the exact digest while allowing a relayer', () => {
  const { manifest, bundle, runtime } = createReadyRobinhoodFixture();
  const membershipRegistry = manifest.contracts.membershipRegistry!.address;
  const eligibility = {
    programId: TEST_PROGRAM_ID,
    memberCommitment: `0x${'41'.repeat(32)}` as const,
    account: '0x00000000000000000000000000000000000000F7' as const,
    termsCommitment: `0x${'42'.repeat(32)}` as const,
    privacyCommitment: `0x${'43'.repeat(32)}` as const,
    nonce: 7n,
    validUntil: 1n,
  };
  const eligibilityTypedData = createNakamaEligibilityTypedData({
    network: manifest.network,
    membershipRegistry,
    message: eligibility,
  });
  const authorizationDigest =
    hashNakamaEligibilityAuthorization(eligibilityTypedData);
  const revocation = {
    programId: TEST_PROGRAM_ID,
    authorizationDigest,
    nonce: 3n,
    validUntil: 1_784_765_400n,
  };
  const revocationTypedData = createNakamaEligibilityRevocationTypedData({
    network: manifest.network,
    membershipRegistry,
    message: revocation,
  });
  assert.equal(eligibilityTypedData.domain.chainId, 4663);
  assert.equal(revocationTypedData.primaryType, 'EligibilityRevocation');
  assert.match(hashNakamaEligibilityRevocation(revocationTypedData), /^0x/);

  const builder = createRobinhoodActionBuilder({
    manifest,
    bundle,
    runtime,
    programId: TEST_PROGRAM_ID,
  });
  const context = {
    account: TEST_ACCOUNT,
    intentId: 'intent-eligibility-revocation-1',
    preparedAt: '2026-07-23T00:00:00.000Z',
    expiresAt: '2026-07-23T00:05:00.000Z',
  };
  const action = builder.revokeEligibilityAuthorization({
    ...context,
    eligibility,
    revocation,
    signature: '0x1234',
  });
  assert.equal(action.action, 'revoke_eligibility_authorization');
  assert.equal(action.accountId, `eip155:4663:${TEST_ACCOUNT}`);
  assert.equal(
    decodeFunctionData({
      abi: getRobinhoodContractArtifact(bundle, 'membershipRegistry').abi,
      data: action.data,
    }).functionName,
    'revokeEligibilityAuthorization',
  );
  assert.match(action.explanation, /relayer receives no eligibility authority/);

  assert.throws(
    () =>
      builder.revokeEligibilityAuthorization({
        ...context,
        intentId: 'intent-eligibility-revocation-substitution',
        eligibility,
        revocation: {
          ...revocation,
          authorizationDigest: `0x${'99'.repeat(32)}`,
        },
        signature: '0x1234',
      }),
    /bind the exact eligibility digest/,
  );
  assert.throws(
    () =>
      builder.revokeEligibilityAuthorization({
        ...context,
        intentId: 'intent-eligibility-revocation-expired',
        eligibility,
        revocation: { ...revocation, validUntil: 1n },
        signature: '0x1234',
      }),
    /must remain valid at preparation time/,
  );
});

test('typed action builder encodes exact approval, funding, request, and pause actions', () => {
  const { manifest, bundle, runtime } = createReadyRobinhoodFixture();
  const builder = createRobinhoodActionBuilder({
    manifest,
    bundle,
    runtime,
    programId: TEST_PROGRAM_ID,
  });
  const context = {
    account: TEST_ACCOUNT,
    intentId: 'intent-action-1',
    preparedAt: '2026-07-23T00:00:00.000Z',
    expiresAt: '2026-07-23T00:05:00.000Z',
  };
  const amount = parseRobinhoodUsdg('100', 'mainnet');
  const approval = builder.approveExactUsdg({ ...context, amount });
  assert.equal(approval.action, 'approve_usdg');
  assert.equal(
    approval.target.toLowerCase(),
    amount.asset.address.toLowerCase(),
  );
  assert.equal(
    decodeFunctionData({
      abi: parseAbi([
        'function approve(address spender,uint256 amount) returns (bool)',
      ]),
      data: approval.data,
    }).functionName,
    'approve',
  );

  const funding = builder.fundProgram({
    ...context,
    intentId: 'intent-action-2',
    amount,
    fundingReference: TEST_COMMITMENT,
  });
  const decodedFunding = decodeFunctionData({
    abi: parseAbi(['function fund(uint256 amount,bytes32 fundingReference)']),
    data: funding.data,
  });
  assert.equal(decodedFunding.functionName, 'fund');
  assert.deepEqual(decodedFunding.args, [100_000_000n, TEST_COMMITMENT]);
  const sponsorBatch = createRobinhoodSponsorFundingBatch({
    approval,
    funding,
    manifest,
    bundle,
    runtime,
    now: 1_784_764_900n,
  });
  assert.equal(sponsorBatch.amount, 100_000_000n);
  assert.deepEqual(
    sponsorBatch.actions.map((action) => action.action),
    ['approve_usdg', 'fund_program'],
  );
  assert.notEqual(sponsorBatch.batchCommitment, `0x${'00'.repeat(32)}`);
  assert.throws(
    () =>
      createRobinhoodSponsorFundingBatch({
        approval,
        funding: builder.fundProgram({
          ...context,
          intentId: 'intent-action-mismatched-funding',
          amount: parseRobinhoodUsdg('99', 'mainnet'),
          fundingReference: TEST_COMMITMENT,
        }),
        manifest,
        bundle,
        runtime,
        now: 1_784_764_900n,
      }),
    /same exact positive finite USDG amount/,
  );

  const request = builder.openRequest({
    ...context,
    intentId: 'intent-action-3',
    membershipId: `0x${'61'.repeat(32)}`,
    evidenceManifestCommitment: `0x${'62'.repeat(32)}`,
    recipientCommitment: `0x${'63'.repeat(32)}`,
    requestedAmount: parseRobinhoodUsdg('25', 'mainnet'),
  });
  assert.equal(request.action, 'open_request');
  assert.match(request.explanation, /public-safe commitments/);

  const pause = builder.pauseScope({
    ...context,
    intentId: 'intent-action-4',
    scope: 'new_requests',
    incidentId: `0x${'64'.repeat(32)}`,
    reasonCode: `0x${'65'.repeat(32)}`,
    reviewRequiredAt: 1_784_768_400n,
  });
  const decodedPause = decodeFunctionData({
    abi: parseAbi([
      'function pause(uint8 scope,bytes32 incidentId,bytes32 reasonCode,uint64 reviewRequiredAt)',
    ]),
    data: pause.data,
  });
  assert.equal(decodedPause.args?.[0], 2);

  const timeout = builder.escalateInformationTimeout({
    ...context,
    intentId: 'intent-action-5',
    requestId: `0x${'66'.repeat(32)}`,
  });
  assert.equal(
    decodeFunctionData({
      abi: getRobinhoodContractArtifact(bundle, 'requestManager').abi,
      data: timeout.data,
    }).functionName,
    'escalateInformationTimeout',
  );
  assert.match(timeout.explanation, /preserving its pending reserve/);
});

test('action builders reject semantic structs that contradict protocol constraints', () => {
  const { manifest, bundle, runtime } = createReadyRobinhoodFixture();
  const builder = createRobinhoodActionBuilder({
    manifest,
    bundle,
    runtime,
    programId: TEST_PROGRAM_ID,
  });
  const context = {
    account: TEST_ACCOUNT,
    intentId: 'intent-semantic-1',
    preparedAt: '2026-07-23T00:00:00.000Z',
    expiresAt: '2026-07-23T00:05:00.000Z',
  };
  const eligibility = {
    programId: TEST_PROGRAM_ID,
    memberCommitment: `0x${'71'.repeat(32)}` as const,
    account: TEST_ACCOUNT,
    termsCommitment: `0x${'72'.repeat(32)}` as const,
    privacyCommitment: `0x${'73'.repeat(32)}` as const,
    nonce: 0n,
    validUntil: 1_784_765_400n,
  };
  assert.throws(
    () =>
      builder.activateMembership({
        ...context,
        eligibility: {
          ...eligibility,
          account: '0x00000000000000000000000000000000000000F9',
        },
        signature: '0x1234',
      }),
    /bind the action program and account/,
  );

  const zero = `0x${'00'.repeat(32)}` as const;
  assert.throws(
    () =>
      builder.executeInitialDecision({
        ...context,
        decision: {
          programId: TEST_PROGRAM_ID,
          requestId: `0x${'74'.repeat(32)}`,
          termsCommitment: TEST_COMMITMENT,
          evidenceManifestCommitment: `0x${'75'.repeat(32)}`,
          evidenceVersion: 1,
          reviewRound: NAKAMA_DECISION_REVIEW_ROUND.initial,
          reviewerRole: NAKAMA_DECISION_REVIEWER_ROLE.initialReviewer,
          action: NAKAMA_DECISION_ACTION.approve,
          approvedAmount: 0n,
          recipientCommitment: zero,
          publicReasonCode: `0x${'76'.repeat(32)}`,
          nonce: 0n,
          validUntil: 1_784_765_400n,
        },
        payoutRecipient: TEST_ACCOUNT,
        recipientSalt: TEST_COMMITMENT,
        signature: '0x1234',
      }),
    /positive amount/,
  );

  const agentAuthorization = {
    principal: TEST_ACCOUNT,
    target: '0x00000000000000000000000000000000000000F9' as const,
    selector: '0x12345678' as const,
    maxNativeValue: 0n,
    asset: '0x0000000000000000000000000000000000000000' as const,
    maxAssetAmountPerAction: 0n,
    periodAssetLimit: 0n,
    periodSeconds: 300n,
    issuedAt: 1_784_764_800n,
    expiresAt: 1_784_765_400n,
    maxCallsPerPeriod: 3,
    nonce: 0n,
    purposeCommitment: TEST_COMMITMENT,
  };
  assert.doesNotThrow(() =>
    builder.grantAgentAuthorization({
      ...context,
      authorization: agentAuthorization,
    }),
  );
  assert.throws(
    () =>
      builder.grantAgentAuthorization({
        ...context,
        authorization: { ...agentAuthorization, maxNativeValue: 1n },
      }),
    /strictly non-economic/,
  );
  assert.throws(
    () =>
      builder.pauseScope({
        ...context,
        scope: 'new_requests',
        incidentId: TEST_COMMITMENT,
        reasonCode: `0x${'77'.repeat(32)}`,
        reviewRequiredAt: 1_785_369_601n,
      }),
    /within seven days/,
  );
  assert.throws(
    () =>
      builder.claimMaturedRefund({
        ...context,
        recipient: '0x0000000000000000000000000000000000000000',
      }),
    /zero address/,
  );
});

test('simulation is pinned to Robinhood chain and carries decoded contract failures', async () => {
  const { manifest, bundle, runtime } = createReadyRobinhoodFixture();
  const builder = createRobinhoodActionBuilder({
    manifest,
    bundle,
    runtime,
    programId: TEST_PROGRAM_ID,
  });
  const action = builder.markProgramReviewed({
    account: TEST_ACCOUNT,
    intentId: 'intent-simulate-1',
  });
  const successfulClient = {
    async getChainId() {
      return 4663;
    },
    async getBlockNumber() {
      return 101n;
    },
    async call() {
      return { data: '0x' };
    },
    async estimateGas() {
      return 88_000n;
    },
  } as unknown as PublicClient;
  const simulated = await simulateRobinhoodAction({
    client: successfulClient,
    bundle,
    action,
  });
  assert.equal(simulated.simulation.success, true);
  assert.equal(simulated.simulation.blockNumber, 101n);
  assert.equal(simulated.simulation.gasEstimate, 88_000n);

  const programAbi = parseAbi([
    'error InvalidState(uint8 expected,uint8 actual)',
  ]);
  const errorData = encodeErrorResult({
    abi: programAbi,
    errorName: 'InvalidState',
    args: [1, 0],
  });
  const withErrorAbi = {
    ...bundle,
    contracts: {
      ...bundle.contracts,
      program: { ...bundle.contracts.program!, abi: programAbi },
    },
  };
  const failedClient = {
    async getChainId() {
      return 4663;
    },
    async getBlockNumber() {
      return 102n;
    },
    async call() {
      throw { data: errorData };
    },
    async estimateGas() {
      throw { data: errorData };
    },
  } as unknown as PublicClient;
  const failed = await simulateRobinhoodAction({
    client: failedClient,
    bundle: withErrorAbi,
    action,
  });
  assert.equal(failed.simulation.success, false);
  assert.equal(failed.simulation.decodedError?.name, 'InvalidState');
  assert.equal(decodeRobinhoodError(errorData, withErrorAbi)?.role, 'program');
});

test('EOA submission rebinds canonical target/function and reruns the exact simulation', async () => {
  const { manifest, bundle, runtime } = createReadyRobinhoodFixture();
  const builder = createRobinhoodActionBuilder({
    manifest,
    bundle,
    runtime,
    programId: TEST_PROGRAM_ID,
  });
  const action = builder.markProgramReviewed({
    account: TEST_ACCOUNT,
    intentId: 'intent-submit-1',
  });
  let simulationCalls = 0;
  const client = {
    async getChainId() {
      return 4663;
    },
    async getBlockNumber() {
      return 101n;
    },
    async call() {
      simulationCalls += 1;
      return { data: '0x' };
    },
    async estimateGas() {
      return 88_000n;
    },
  } as unknown as PublicClient;
  const simulated = await simulateRobinhoodAction({ client, bundle, action });
  const providerMethods: string[] = [];
  const provider = {
    async request({ method }: { method: string }) {
      providerMethods.push(method);
      if (method === 'eth_chainId') return '0x1237';
      return TEST_TX_HASH;
    },
  };
  const submission = await requestRobinhoodAction(provider, simulated, {
    client,
    manifest,
    bundle,
    runtime,
  });
  assert.equal(submission.txHash, TEST_TX_HASH);
  assert.equal(submission.actionCommitment, simulated.actionCommitment);
  assert.equal(submission.calldataHash, keccak256(action.data));
  assert.equal(submission.value, 0n);
  assert.equal(
    createRobinhoodSubmittedTransactionFromSubmission(submission).hash,
    TEST_TX_HASH,
  );
  assert.equal(simulationCalls, 2);
  assert.deepEqual(providerMethods, ['eth_chainId', 'eth_sendTransaction']);

  const wrongAction = {
    ...action,
    action: 'open_enrollment' as const,
  };
  const fabricated = {
    ...simulated,
    action: wrongAction,
    actionCommitment: hashPreparedRobinhoodAction(wrongAction),
    simulatedAt: new Date().toISOString(),
  };
  await assert.rejects(
    requestRobinhoodAction(provider, fabricated, {
      client,
      manifest,
      bundle,
      runtime,
    }),
    /exact frozen action returned by createRobinhoodActionBuilder/,
  );

  const approval = builder.approveExactUsdg({
    account: TEST_ACCOUNT,
    intentId: 'intent-malicious-approval',
    amount: parseRobinhoodUsdg('100', 'mainnet'),
  });
  const maliciousApproval = {
    ...approval,
    data: `0x095ea7b3${'0'.repeat(24)}${'f9'.padStart(40, '0')}${'f'.repeat(64)}` as const,
  };
  const maliciousSimulated = {
    action: maliciousApproval,
    simulation: simulated.simulation,
    simulatedAt: new Date().toISOString(),
    actionCommitment: hashPreparedRobinhoodAction(maliciousApproval),
  };
  await assert.rejects(
    requestRobinhoodAction(provider, maliciousSimulated, {
      client,
      manifest,
      bundle,
      runtime,
    }),
    /exact frozen action returned by createRobinhoodActionBuilder/,
  );

  await assert.rejects(
    requestRobinhoodAction(
      provider,
      { ...simulated, simulatedAt: '2026-01-01T00:00:00.000Z' },
      { client, manifest, bundle, runtime },
    ),
    /simulation is stale/,
  );
});

test('read client exposes named program concepts with direct-chain finality context', async () => {
  const { manifest, bundle, runtime } = createReadyRobinhoodFixture();
  const mutableManifest = structuredClone(manifest);
  const mutableBundle = structuredClone(bundle);
  const values: Record<string, unknown> = {
    programId: TEST_PROGRAM_ID,
    suiteId: TEST_SUITE_ID,
    sponsorLegalEntityCommitment: TEST_COMMITMENT,
    metadataCommitment: TEST_COMMITMENT,
    termsCommitment: TEST_COMMITMENT,
    privacyCommitment: TEST_COMMITMENT,
    operationsCommitment: TEST_COMMITMENT,
    activationChecklistCommitment: TEST_COMMITMENT,
    fundingAsset: manifest.settlementAsset.address,
    vault: testRoleAddress('vault'),
    membershipRegistry: testRoleAddress('membershipRegistry'),
    claimManager: testRoleAddress('requestManager'),
    decisionModule: testRoleAddress('decisionModule'),
    settlementModule: testRoleAddress('settlementModule'),
    enrollmentOpensAt: 1000n,
    activeAt: 2000n,
    runoffAt: 3000n,
    closesAt: 4000n,
    appealWindow: 100n,
    initialDecisionWindow: 200n,
    appealDecisionWindow: 300n,
    perMemberCap: 1_000_000n,
    aggregateCap: 50_000_000n,
    maxMembers: 50,
    state: 2,
    accounting: {
      maximumRemainingMemberLiability: 1_000_000n,
      pendingRequestReservation: 250_000n,
      approvedUnpaidObligations: 500_000n,
      maturedRefunds: 100_000n,
    },
    actualAssets: 5_000_000n,
    freeLiquidity: 3_400_000n,
    reconciled: true,
    membership: {
      memberCommitment: TEST_COMMITMENT,
      activatedAt: 1_000n,
      expiresAt: 2_000n,
      state: 3,
    },
    memberRemaining: 0n,
    request: {
      membershipId: `0x${'81'.repeat(32)}`,
      evidenceManifestCommitment: `0x${'82'.repeat(32)}`,
      recipientCommitment: `0x${'83'.repeat(32)}`,
      publicReasonCode: `0x${'00'.repeat(32)}`,
      requestedAmount: 1_000_000n,
      approvedAmount: 0n,
      openedAt: 1_000n,
      decisionDeadline: 1_100n,
      appealDeadline: 0n,
      evidenceVersion: 1,
      currentRound: 1,
      state: 1,
    },
    obligationAmount: 0n,
    pauseRecord: {
      incidentId: TEST_COMMITMENT,
      reasonCode: `0x${'84'.repeat(32)}`,
      openedAt: 1_000n,
      reviewRequiredAt: 1_200n,
      active: true,
    },
    authorizationFailure:
      ROBINHOOD_AGENT_AUTHORIZATION_FAILURE_CODE.periodLimitExceeded,
  };
  const observedReads: Array<{
    address: Address;
    abiLength: number;
    functionName: string;
  }> = [];
  const client = {
    async getChainId() {
      return 4663;
    },
    async getBlockNumber() {
      return 105n;
    },
    async getBlock({
      blockNumber,
      blockTag,
    }: {
      blockNumber?: bigint;
      blockTag?: string;
    }) {
      if (blockTag === 'safe') return { number: 104n, hash: TEST_BLOCK_HASH };
      if (blockTag === 'finalized')
        return { number: 103n, hash: TEST_BLOCK_HASH };
      return { number: blockNumber ?? 105n, hash: TEST_BLOCK_HASH };
    },
    async readContract({
      address,
      abi,
      functionName,
    }: {
      address: Address;
      abi: readonly unknown[];
      functionName: string;
    }) {
      observedReads.push({ address, abiLength: abi.length, functionName });
      return values[functionName];
    },
  } as unknown as PublicClient;
  const readClient = createRobinhoodReadClient({
    client,
    manifest: mutableManifest,
    bundle: mutableBundle,
    runtime,
    programId: TEST_PROGRAM_ID,
  });
  const canonicalVault = manifest.contracts.vault!.address;
  const attackerAddress =
    '0x0000000000000000000000000000000000000999' as Address;
  mutableManifest.contracts.vault!.address = attackerAddress;
  (mutableBundle.contracts.vault!.abi as unknown[]).splice(0);
  const accounting = await readClient.readAccounting();
  assert.equal(accounting.value.vault, canonicalVault);
  const program = await readClient.readProgram();
  assert.equal(program.value.state, 'funded');
  assert.equal(program.value.perMemberCap.units, 1_000_000n);
  assert.equal(program.context.chainId, 4663);
  assert.equal(program.context.reconciliation, 'direct_chain_only');
  assert.equal(program.context.finalizedBlock, 103n);
  const membership = await readClient.readMembership(`0x${'85'.repeat(32)}`);
  assert.equal(membership.value.state, 'cancelled');
  assert.equal(membership.value.remainingBenefit.units, 0n);
  assert.equal('benefitConsumed' in membership.value, false);
  const obligation = await readClient.readObligation(`0x${'86'.repeat(32)}`);
  assert.equal(obligation.value.state, 'none');
  values.request = {
    ...(values.request as Record<string, unknown>),
    approvedAmount: 750_000n,
    state: 8,
  };
  const settled = await readClient.readObligation(`0x${'87'.repeat(32)}`);
  assert.equal(settled.value.state, 'settled');
  assert.equal(settled.value.amount.units, 750_000n);
  const pause = await readClient.readPause('new_requests');
  assert.equal(pause.value.reviewRequiredAt, 1_200n);
  assert.equal('expiresAt' in pause.value, false);
  const authorizationFailure = await readClient.readAgentAuthorizationFailure({
    authorizationId: `0x${'88'.repeat(32)}`,
    principal: TEST_ACCOUNT,
    target: '0x00000000000000000000000000000000000000F1',
    selector: '0x12345678',
    nativeValue: 0n,
    assetAmount: 0n,
  });
  assert.equal(authorizationFailure.value.failure, 'period_limit_exceeded');
  assert.equal(
    authorizationFailure.value.reasonCode,
    ROBINHOOD_AGENT_AUTHORIZATION_FAILURE_CODE.periodLimitExceeded,
  );
  const accountingReads = observedReads.filter((read) =>
    ['accounting', 'actualAssets', 'freeLiquidity', 'reconciled'].includes(
      read.functionName,
    ),
  );
  assert.equal(accountingReads.length, 4);
  assert.equal(
    accountingReads.every(
      (read) => read.address === canonicalVault && read.abiLength > 0,
    ),
    true,
  );
  assert.equal(
    observedReads.some((read) => read.address === attackerAddress),
    false,
  );
});

test('runtime verification pins finalized code and rejects a mismatched suite graph', async () => {
  const fixture = createReadyRobinhoodFixture();
  const runtimeHash = keccak256('0x6000');
  const manifest = structuredClone(fixture.manifest);
  for (const contract of Object.values(manifest.contracts)) {
    contract.runtimeBytecodeHash = runtimeHash;
  }
  installTrustedRobinhoodManifestForTest(manifest);
  const bundle = getGeneratedRobinhoodArtifactBundle();
  const addressByRole = Object.fromEntries(
    Object.entries(manifest.contracts).map(([role, contract]) => [
      role,
      contract.address,
    ]),
  ) as Record<string, Address>;
  const roleByAddress = new Map(
    Object.entries(addressByRole).map(([role, address]) => [
      address.toLowerCase(),
      role,
    ]),
  );
  const addressField: Record<string, Address> = {
    assetRegistry: addressByRole.assetRegistry!,
    templateRegistry: addressByRole.templateRegistry!,
    poolRegistry: addressByRole.poolRegistry!,
    factory: addressByRole.factory!,
    deploymentFactory: addressByRole.factory!,
    program: addressByRole.program!,
    fundingAsset: manifest.settlementAsset.address!,
    expectedFundingAsset: manifest.settlementAsset.address!,
    asset: manifest.settlementAsset.address!,
    vault: addressByRole.vault!,
    membershipRegistry: addressByRole.membershipRegistry!,
    claimManager: addressByRole.requestManager!,
    decisionModule: addressByRole.decisionModule!,
    settlementModule: addressByRole.settlementModule!,
    agentAuthorizationRegistry: addressByRole.agentAuthorizationRegistry!,
    safetyGuardian: addressByRole.safetyGuardian!,
  };
  const templateSuiteCalls: unknown[][] = [];
  const makeClient = (badProgramVault = false, suiteMajor = 2) =>
    ({
      async getChainId() {
        return 4663;
      },
      async getBlockNumber() {
        return 105n;
      },
      async getBlock({
        blockTag,
        blockNumber,
      }: {
        blockTag?: string;
        blockNumber?: bigint;
      }) {
        if (blockTag === 'safe') return { number: 104n, hash: TEST_BLOCK_HASH };
        if (blockTag === 'finalized') {
          return { number: 103n, hash: TEST_BLOCK_HASH };
        }
        return { number: blockNumber, hash: TEST_BLOCK_HASH };
      },
      async getBytecode() {
        return '0x6000';
      },
      async readContract({
        address,
        functionName,
        args,
      }: {
        address: Address;
        functionName: string;
        args?: readonly unknown[];
      }) {
        if (
          address.toLowerCase() ===
          manifest.settlementAsset.address!.toLowerCase()
        ) {
          if (functionName === 'name') return 'Global Dollar';
          if (functionName === 'symbol') return 'USDG';
          if (functionName === 'decimals') return 6;
        }
        const role = roleByAddress.get(address.toLowerCase());
        if (functionName === 'programId') return TEST_PROGRAM_ID;
        if (role === 'program' && functionName === 'suiteId')
          return TEST_SUITE_ID;
        if (role === 'poolRegistry' && functionName === 'suiteOf') {
          return TEST_SUITE_ID;
        }
        if (role === 'poolRegistry' && functionName === 'getDeployment') {
          return {
            programId: TEST_PROGRAM_ID,
            program: addressByRole.program,
            vault: addressByRole.vault,
            membershipRegistry: addressByRole.membershipRegistry,
            decisionModule: addressByRole.decisionModule,
            claimManager: addressByRole.requestManager,
            settlementModule: addressByRole.settlementModule,
            agentAuthorizationRegistry:
              addressByRole.agentAuthorizationRegistry,
            safetyGuardian: addressByRole.safetyGuardian,
          };
        }
        if (role === 'factory' && functionName === 'deploymentCodeCommitment') {
          return bundle.deploymentCodeCommitment;
        }
        if (functionName === 'requireActiveAsset') {
          return {};
        }
        if (functionName === 'requireActiveSuite') {
          templateSuiteCalls.push([...(args ?? [])]);
          return {
            factory: addressByRole.factory,
            deploymentCodeCommitment: bundle.deploymentCodeCommitment,
            templateCommitment: TEST_COMMITMENT,
            reviewCommitment: TEST_COMMITMENT,
            registeredAt: 1n,
            major: suiteMajor,
            minor: 0,
            patch: 0,
            status: 1,
          };
        }
        if (role === 'program' && functionName === 'vault' && badProgramVault) {
          return TEST_ACCOUNT;
        }
        const result = addressField[functionName];
        if (result != null) return result;
        throw new Error(`Unexpected runtime read ${role}.${functionName}`);
      },
    }) as unknown as PublicClient;

  const verified = await verifyRobinhoodDeploymentRuntime({
    client: makeClient(),
    manifest,
    bundle,
  });
  assert.equal(verified.checkedAtBlock, 103n);
  assert.equal(verified.checkedAtBlockHash, TEST_BLOCK_HASH);
  assert.equal(verified.programId, TEST_PROGRAM_ID);
  assert.equal(verified.settlementAsset.symbol, 'USDG');
  assert.deepEqual(templateSuiteCalls[0], [
    TEST_SUITE_ID,
    addressByRole.factory,
  ]);

  await assert.rejects(
    verifyRobinhoodDeploymentRuntime({
      client: makeClient(true),
      manifest,
      bundle,
    }),
    /program.vault does not match the deployment graph/,
  );
  await assert.rejects(
    verifyRobinhoodDeploymentRuntime({
      client: makeClient(false, 1),
      manifest,
      bundle,
    }),
    /suite is not the active canonical factory release/,
  );
});
