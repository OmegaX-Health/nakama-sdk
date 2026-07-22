import assert from 'node:assert/strict';
import test from 'node:test';

import { keccak256 } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import {
  NAKAMA_DECISION_ACTION,
  NAKAMA_DECISION_EIP712_TYPES,
  NAKAMA_DECISION_REVIEWER_ROLE,
  NAKAMA_DECISION_REVIEW_ROUND,
  ROBINHOOD_MAINNET_CAIP2,
  ROBINHOOD_MAINNET_CHAIN_ID,
  ROBINHOOD_PAUSE_SCOPE,
  ROBINHOOD_TESTNET_CHAIN_ID,
  ROBINHOOD_USDG_MAINNET_ADDRESS,
  ROBINHOOD_USDG,
  NakamaRobinhoodAssetError,
  NakamaRobinhoodWrongChainError,
  assertActionAllowedBySmartAccountPolicy,
  assertPreparedAction,
  assertRobinhoodProviderChain,
  assertSimulatedRobinhoodAction,
  assertRobinhoodWriteStateSafe,
  assessRobinhoodFinality,
  createNakamaDecisionPreview,
  createNakamaDecisionSigningPayload,
  createNakamaDecisionTypedData,
  createRobinhoodActionBuilder,
  createRobinhoodPublicClient,
  createRobinhoodOfflineCacheRecord,
  createRobinhoodPaymasterClient,
  createRobinhoodSmartAccountLifecycleClient,
  createRobinhoodSmartAccountClient,
  createRobinhoodSubmittedTransaction,
  hashNakamaDecision,
  hashPreparedRobinhoodAction,
  hashRobinhoodPaymasterPolicy,
  nakamaDecisionReplayKey,
  parseRobinhoodCaip10,
  parseRobinhoodUsdg,
  toRobinhoodCaip10,
  requestNakamaDecisionSignature,
  readRobinhoodEconomicFinality,
  readRobinhoodOfflineCache,
  collectRobinhoodIndexerPages,
  invalidateRobinhoodOfflineCacheAfterReorg,
  toViemDecisionTypedData,
  validateRobinhoodSmartAccountPolicy,
  validateRobinhoodPaymasterPolicy,
  verifyRobinhoodSmartAccountRuntime,
  verifyNakamaDecision,
  type PreparedRobinhoodAction,
  type RobinhoodL1BatchReader,
  type RobinhoodReceiptReader,
  type RobinhoodPaymasterPolicy,
  type RobinhoodPaymasterQuote,
  type RobinhoodSmartAccountPolicy,
  type RobinhoodSmartAccountLifecycleState,
  type RobinhoodSmartAccountRuntimeManifest,
  type RobinhoodPublicClient,
} from '../src/index.js';

import {
  TEST_ACCOUNT,
  TEST_BLOCK_HASH,
  TEST_COMMITMENT,
  TEST_PROGRAM_ID,
  TEST_TX_HASH,
  createReadyRobinhoodFixture,
} from './support/robinhood-fixtures.js';
import { sealTrustedRobinhoodSubmission } from '../src/robinhood/submission-integrity.js';

const DECISION_MODULE = '0x00000000000000000000000000000000000000D1' as const;
const REQUEST_ID = `0x${'66'.repeat(32)}` as const;
const PRIVATE_KEY = `0x${'77'.repeat(32)}` as const;
const TEST_CALLDATA = '0x12345678' as const;
const TEST_CALLDATA_HASH = keccak256(TEST_CALLDATA);

test('Robinhood chain identity is explicit and never defaults to chain 1', () => {
  assert.equal(ROBINHOOD_MAINNET_CHAIN_ID, 4663);
  assert.equal(ROBINHOOD_TESTNET_CHAIN_ID, 46630);
  assert.equal(ROBINHOOD_MAINNET_CAIP2, 'eip155:4663');
  assert.equal(
    createRobinhoodPublicClient({
      network: 'mainnet',
      rpcUrl: 'https://rpc.example.test',
    }).chain?.id,
    4663,
  );
  assert.equal(
    createRobinhoodPublicClient({
      network: 'testnet',
      rpcUrl: 'http://127.0.0.1:8545',
    }).chain?.id,
    46630,
  );
  const accountId = toRobinhoodCaip10('mainnet', TEST_ACCOUNT);
  assert.equal(accountId, `eip155:4663:${TEST_ACCOUNT}`);
  assert.equal(
    parseRobinhoodCaip10({ network: 'mainnet', accountId }),
    TEST_ACCOUNT,
  );
  assert.throws(
    () =>
      parseRobinhoodCaip10({
        network: 'testnet',
        accountId,
      }),
    NakamaRobinhoodWrongChainError,
  );
});

test('provider assertion checks the selected Robinhood network without switching it', async () => {
  const methods: string[] = [];
  await assertRobinhoodProviderChain({
    network: 'mainnet',
    provider: {
      async request({ method }) {
        methods.push(method);
        return '0x1237';
      },
    },
  });
  assert.deepEqual(methods, ['eth_chainId']);
  await assert.rejects(
    assertRobinhoodProviderChain({
      network: 'mainnet',
      provider: {
        async request() {
          return '0x1';
        },
      },
    }),
    NakamaRobinhoodWrongChainError,
  );
});

test('USDG amounts carry exact chain, address, symbol, and decimals', () => {
  const amount = parseRobinhoodUsdg('123.456789', 'mainnet');
  assert.equal(amount.units, 123_456_789n);
  assert.equal(amount.asset.address, ROBINHOOD_USDG_MAINNET_ADDRESS);
  assert.equal(amount.asset.symbol, 'USDG');
  assert.equal(amount.asset.decimals, 6);
  assert.throws(
    () => parseRobinhoodUsdg('1', 'testnet'),
    NakamaRobinhoodAssetError,
  );
  assert.throws(
    () => parseRobinhoodUsdg('1.0000001', 'mainnet'),
    NakamaRobinhoodAssetError,
  );
  assert.throws(
    () =>
      parseRobinhoodUsdg('1', 'mainnet', {
        ...ROBINHOOD_USDG.mainnet,
        address: '0x00000000000000000000000000000000000000f9',
      }),
    /canonical USDG contract address/,
  );
  assert.throws(() => {
    (ROBINHOOD_USDG.mainnet as { address: string }).address =
      '0x00000000000000000000000000000000000000f9';
  }, TypeError);
  assert.throws(() => {
    (ROBINHOOD_PAUSE_SCOPE as { newRequests: number }).newRequests = 5;
  }, TypeError);
  assert.equal(ROBINHOOD_PAUSE_SCOPE.newRequests, 2);
});

test('decision payload exactly mirrors the protocol EIP-712 schema and preview', async () => {
  const account = privateKeyToAccount(PRIVATE_KEY);
  const message = {
    programId: TEST_PROGRAM_ID,
    requestId: REQUEST_ID,
    termsCommitment: TEST_COMMITMENT,
    evidenceManifestCommitment: `0x${'88'.repeat(32)}` as const,
    evidenceVersion: 2,
    reviewRound: NAKAMA_DECISION_REVIEW_ROUND.initial,
    reviewerRole: NAKAMA_DECISION_REVIEWER_ROLE.initialReviewer,
    action: NAKAMA_DECISION_ACTION.approve,
    approvedAmount: 1_500_000n,
    recipientCommitment: `0x${'99'.repeat(32)}` as const,
    publicReasonCode: `0x${'aa'.repeat(32)}` as const,
    nonce: 4n,
    validUntil: 2_000_000_000n,
  };
  const payload = createNakamaDecisionSigningPayload({
    network: 'mainnet',
    reviewer: account.address,
    decisionModule: DECISION_MODULE,
    message,
  });
  assert.deepEqual(
    payload.typedData.types.EIP712Domain.map(
      ({ name, type }) => `${name}:${type}`,
    ),
    [
      'name:string',
      'version:string',
      'chainId:uint256',
      'verifyingContract:address',
    ],
  );
  assert.deepEqual(
    payload.typedData.types.Decision.map(({ name, type }) => `${name}:${type}`),
    [
      'programId:bytes32',
      'requestId:bytes32',
      'termsCommitment:bytes32',
      'evidenceManifestCommitment:bytes32',
      'evidenceVersion:uint32',
      'reviewRound:uint8',
      'reviewerRole:uint8',
      'action:uint8',
      'approvedAmount:uint256',
      'recipientCommitment:bytes32',
      'publicReasonCode:bytes32',
      'nonce:uint256',
      'validUntil:uint64',
    ],
  );
  const preview = createNakamaDecisionPreview(payload);
  assert.equal(preview.approvedAmountBaseUnits, '1500000');
  assert.equal(preview.requestId, REQUEST_ID);

  const digest = hashNakamaDecision(payload.typedData);
  assert.equal(
    digest,
    '0x5efd1447d65b2e1738ce9bd045ddebb1b0257f4bcf95833992d37c8d3c38e295',
  );
  const signature = await account.signTypedData(
    toViemDecisionTypedData(payload.typedData),
  );
  const verified = await verifyNakamaDecision({
    network: 'mainnet',
    typedData: payload.typedData,
    signature,
    expectedSigner: account.address,
    expectedDecisionModule: DECISION_MODULE,
    expectedNonce: 4n,
    now: 1_999_999_999n,
  });
  assert.equal(verified.signer, account.address);
  assert.match(verified.digest, /^0x[0-9a-f]{64}$/);

  let walletTypedData = '';
  await requestNakamaDecisionSignature(
    {
      async request({ method, params }) {
        if (method === 'eth_chainId') return '0x1237';
        walletTypedData = String(params?.[1]);
        return '0x1234';
      },
    },
    payload,
  );
  const serialized = JSON.parse(walletTypedData) as {
    types: { EIP712Domain: readonly { name: string; type: string }[] };
    message: { approvedAmount: string };
  };
  assert.deepEqual(
    serialized.types.EIP712Domain,
    payload.typedData.types.EIP712Domain,
  );
  assert.equal(serialized.message.approvedAmount, '1500000');

  assert.throws(() => {
    (
      NAKAMA_DECISION_EIP712_TYPES.Decision[0] as {
        name: string;
        type: string;
      }
    ).type = 'address';
  }, TypeError);
  assert.equal(
    hashNakamaDecision(payload.typedData),
    '0x5efd1447d65b2e1738ce9bd045ddebb1b0257f4bcf95833992d37c8d3c38e295',
  );

  await assert.rejects(
    verifyNakamaDecision({
      network: 'mainnet',
      typedData: payload.typedData,
      signature,
      expectedSigner: account.address,
      expectedDecisionModule: DECISION_MODULE,
      expectedNonce: 5n,
      now: 1_999_999_999n,
    }),
    /nonce does not match/,
  );
  await assert.rejects(
    verifyNakamaDecision({
      network: 'mainnet',
      typedData: payload.typedData,
      signature,
      expectedSigner: account.address,
      expectedDecisionModule: DECISION_MODULE,
      expectedNonce: 4n,
      now: 2_000_000_001n,
    }),
    /expired/,
  );
});

test('decision normalization mirrors Solidity validity and round-role rules', () => {
  const base = {
    programId: TEST_PROGRAM_ID,
    requestId: REQUEST_ID,
    termsCommitment: TEST_COMMITMENT,
    evidenceManifestCommitment: `0x${'88'.repeat(32)}` as const,
    evidenceVersion: 1,
    reviewRound: NAKAMA_DECISION_REVIEW_ROUND.initial,
    reviewerRole: NAKAMA_DECISION_REVIEWER_ROLE.initialReviewer,
    action: NAKAMA_DECISION_ACTION.approve,
    approvedAmount: 1n,
    recipientCommitment: `0x${'99'.repeat(32)}` as const,
    publicReasonCode: `0x${'aa'.repeat(32)}` as const,
    nonce: 0n,
    validUntil: 2_000_000_000n,
  };
  const make = (message: typeof base) =>
    createNakamaDecisionTypedData({
      network: 'mainnet',
      decisionModule: DECISION_MODULE,
      message,
    });
  const zero = `0x${'00'.repeat(32)}` as const;

  assert.throws(
    () => make({ ...base, evidenceVersion: 0 }),
    /greater than zero/,
  );
  assert.throws(
    () =>
      make({
        ...base,
        reviewerRole: NAKAMA_DECISION_REVIEWER_ROLE.appealReviewer,
      }),
    /must match/,
  );
  for (const field of [
    'requestId',
    'evidenceManifestCommitment',
    'publicReasonCode',
  ] as const) {
    assert.throws(() => make({ ...base, [field]: zero }), /cannot be zero/);
  }
  assert.throws(() => make({ ...base, approvedAmount: 0n }), /positive amount/);
  assert.throws(
    () => make({ ...base, recipientCommitment: zero }),
    /nonzero recipient/,
  );
  assert.throws(
    () =>
      make({
        ...base,
        action: NAKAMA_DECISION_ACTION.deny,
      }),
    /Non-approve decisions require zero/,
  );
  assert.doesNotThrow(() =>
    make({
      ...base,
      action: NAKAMA_DECISION_ACTION.deny,
      approvedAmount: 0n,
      recipientCommitment: zero,
    }),
  );
});

test('decision replay keys separate initial and appeal rounds and mutable envelopes never reach the wallet', async () => {
  const base = {
    programId: TEST_PROGRAM_ID,
    requestId: REQUEST_ID,
    termsCommitment: TEST_COMMITMENT,
    evidenceManifestCommitment: `0x${'88'.repeat(32)}` as const,
    evidenceVersion: 1,
    action: NAKAMA_DECISION_ACTION.deny,
    approvedAmount: 0n,
    recipientCommitment: `0x${'00'.repeat(32)}` as const,
    publicReasonCode: `0x${'aa'.repeat(32)}` as const,
    nonce: 0n,
    validUntil: 2_000_000_000n,
  };
  const initial = createNakamaDecisionSigningPayload({
    network: 'mainnet',
    reviewer: TEST_ACCOUNT,
    decisionModule: DECISION_MODULE,
    message: {
      ...base,
      reviewRound: NAKAMA_DECISION_REVIEW_ROUND.initial,
      reviewerRole: NAKAMA_DECISION_REVIEWER_ROLE.initialReviewer,
    },
  });
  const appeal = createNakamaDecisionSigningPayload({
    network: 'mainnet',
    reviewer: TEST_ACCOUNT,
    decisionModule: DECISION_MODULE,
    message: {
      ...base,
      reviewRound: NAKAMA_DECISION_REVIEW_ROUND.appeal,
      reviewerRole: NAKAMA_DECISION_REVIEWER_ROLE.appealReviewer,
    },
  });
  assert.notEqual(
    nakamaDecisionReplayKey(initial.typedData),
    nakamaDecisionReplayKey(appeal.typedData),
  );

  const mutable = structuredClone(initial);
  mutable.chainId = 1;
  let providerCalls = 0;
  await assert.rejects(
    requestNakamaDecisionSignature(
      {
        async request() {
          providerCalls += 1;
          return '0x1237';
        },
      },
      mutable,
    ),
    /envelope is not canonical/,
  );
  assert.equal(providerCalls, 0);
});

test('receipt assessment distinguishes soft confirmation, L1 posting, finality, and reorgs', () => {
  const transaction = createRobinhoodSubmittedTransaction({
    network: 'mainnet',
    hash: TEST_TX_HASH,
    from: TEST_ACCOUNT,
    to: DECISION_MODULE,
    intentId: 'intent-receipt-1',
    submittedAt: '2026-07-23T00:00:00.000Z',
    actionCommitment: TEST_COMMITMENT,
    calldataHash: TEST_CALLDATA_HASH,
    value: 0n,
  });
  const receipt = {
    transactionHash: TEST_TX_HASH,
    blockNumber: 100n,
    blockHash: TEST_BLOCK_HASH,
    status: 'success' as const,
    from: TEST_ACCOUNT,
    to: DECISION_MODULE,
  };
  assert.equal(
    assessRobinhoodFinality({
      transaction,
      receipt,
      chainHead: 100n,
      canonicalBlockHash: TEST_BLOCK_HASH,
    }).status,
    'soft_confirmed',
  );
  assert.equal(
    assessRobinhoodFinality({
      transaction,
      receipt,
      chainHead: 101n,
      canonicalBlockHash: TEST_BLOCK_HASH,
      l1Posted: true,
    }).status,
    'l1_posted',
  );
  assert.equal(
    assessRobinhoodFinality({
      transaction,
      receipt,
      chainHead: 110n,
      safeBlock: 105n,
      canonicalBlockHash: TEST_BLOCK_HASH,
      finalizedBlock: 100n,
    }).status,
    'finalized',
  );
  assert.equal(
    assessRobinhoodFinality({
      transaction,
      receipt,
      chainHead: 110n,
      canonicalBlockHash: `0x${'ff'.repeat(32)}`,
    }).status,
    'reorged',
  );
});

test('single-provider receipt assessment never finalizes without canonical block proof and rejects malformed receipts', () => {
  const transaction = createRobinhoodSubmittedTransaction({
    network: 'mainnet',
    hash: TEST_TX_HASH,
    from: TEST_ACCOUNT,
    to: DECISION_MODULE,
    intentId: 'intent-receipt-safety',
    submittedAt: '2026-07-23T00:00:00.000Z',
    actionCommitment: TEST_COMMITMENT,
    calldataHash: TEST_CALLDATA_HASH,
    value: 0n,
  });
  const receipt = {
    transactionHash: TEST_TX_HASH.toUpperCase().replace(
      '0X',
      '0x',
    ) as `0x${string}`,
    blockNumber: 100n,
    blockHash: TEST_BLOCK_HASH,
    status: 'success' as const,
    from: TEST_ACCOUNT,
    to: DECISION_MODULE,
  };
  const withoutCanonical = assessRobinhoodFinality({
    transaction,
    receipt,
    chainHead: 110n,
    safeBlock: 105n,
    finalizedBlock: 100n,
    canonicalBlockHash: null,
  });
  assert.equal(withoutCanonical.status, 'submitted');
  assert.equal(withoutCanonical.economicFinal, false);
  assert.equal(withoutCanonical.assurance, 'single_provider_display');

  assert.throws(
    () =>
      assessRobinhoodFinality({
        transaction,
        receipt: { ...receipt, to: TEST_ACCOUNT },
        chainHead: 100n,
        canonicalBlockHash: TEST_BLOCK_HASH,
      }),
    /destination does not match/,
  );
  assert.throws(
    () =>
      createRobinhoodSubmittedTransaction({
        network: 'mainnet',
        hash: TEST_TX_HASH,
        from: '0x0000000000000000000000000000000000000000',
        to: DECISION_MODULE,
        intentId: 'bad-address',
        submittedAt: '2026-07-23',
      }),
    /zero address|canonical UTC ISO/,
  );
});

test('economic finality requires sealed input-bound submission, two agreeing L2 providers, and two agreeing L1 providers', async () => {
  const transaction = sealTrustedRobinhoodSubmission(
    createRobinhoodSubmittedTransaction({
      network: 'mainnet',
      hash: TEST_TX_HASH,
      from: TEST_ACCOUNT,
      to: DECISION_MODULE,
      intentId: 'intent-economic-finality',
      submittedAt: '2026-07-23T00:00:00.000Z',
      actionCommitment: TEST_COMMITMENT,
      calldataHash: TEST_CALLDATA_HASH,
      value: 0n,
    }),
  );
  const receipt = {
    transactionHash: TEST_TX_HASH,
    blockNumber: 100n,
    blockHash: TEST_BLOCK_HASH,
    status: 'success' as const,
    from: TEST_ACCOUNT,
    to: DECISION_MODULE,
  };
  const reader = (
    id: string,
    overrideHash = TEST_BLOCK_HASH,
    input = TEST_CALLDATA,
  ): RobinhoodReceiptReader => ({
    identity: {
      providerId: `l2-${id}`,
      endpointOrigin: `https://l2-${id}.example.test`,
      operator: `L2 Operator ${id}`,
    },
    async getTransaction() {
      return {
        hash: TEST_TX_HASH,
        chainId: 4663,
        from: TEST_ACCOUNT,
        to: DECISION_MODULE,
        input,
        value: 0n,
      };
    },
    async getReceipt() {
      return overrideHash === TEST_BLOCK_HASH
        ? receipt
        : { ...receipt, blockHash: overrideHash };
    },
    async getBlockNumber() {
      return 110n;
    },
    async getBlockHash() {
      return overrideHash;
    },
    async getSafeBlockNumber() {
      return 105n;
    },
    async getFinalizedBlockNumber() {
      return 100n;
    },
  });
  const l1Batch = {
    l2TransactionHash: TEST_TX_HASH,
    l2BlockNumber: 100n,
    l2BlockHash: TEST_BLOCK_HASH,
    l1BatchTransactionHash: `0x${'ab'.repeat(32)}` as const,
    l1BlockNumber: 1_000n,
    l1Finalized: true,
    observedAt: '2026-07-23T00:02:00.000Z',
  };
  const l1Reader = (id: string, batch = l1Batch): RobinhoodL1BatchReader => ({
    identity: {
      providerId: `l1-${id}`,
      endpointOrigin: `https://l1-${id}.example.test`,
      operator: `L1 Operator ${id}`,
    },
    async getBatchEvidence() {
      return batch;
    },
  });
  const primary = reader('primary');
  const secondary = reader('secondary');
  const economic = await readRobinhoodEconomicFinality({
    primaryReader: primary,
    secondaryReader: secondary,
    primaryL1BatchReader: l1Reader('primary'),
    secondaryL1BatchReader: l1Reader('secondary'),
    transaction,
  });
  assert.equal(economic.economicFinal, true);
  assert.equal(economic.assurance, 'dual_provider_economic');

  await assert.rejects(
    readRobinhoodEconomicFinality({
      primaryReader: reader('unsealed-primary'),
      secondaryReader: reader('unsealed-secondary'),
      primaryL1BatchReader: l1Reader('unsealed-primary'),
      secondaryL1BatchReader: l1Reader('unsealed-secondary'),
      transaction: structuredClone(transaction),
    }),
    /sealed transaction returned by the wallet submission path/,
  );
  await assert.rejects(
    readRobinhoodEconomicFinality({
      primaryReader: reader('input-primary', TEST_BLOCK_HASH, '0x12345679'),
      secondaryReader: reader('input-secondary'),
      primaryL1BatchReader: l1Reader('input-primary'),
      secondaryL1BatchReader: l1Reader('input-secondary'),
      transaction,
    }),
    /does not match the sealed action submission/,
  );

  await assert.rejects(
    readRobinhoodEconomicFinality({
      primaryReader: reader('primary-divergent'),
      secondaryReader: reader('secondary-divergent', `0x${'ff'.repeat(32)}`),
      primaryL1BatchReader: l1Reader('primary-divergent'),
      secondaryL1BatchReader: l1Reader('secondary-divergent'),
      transaction,
    }),
    /divergent receipts/,
  );
  await assert.rejects(
    readRobinhoodEconomicFinality({
      primaryReader: reader('primary-l1-conflict'),
      secondaryReader: reader('secondary-l1-conflict'),
      primaryL1BatchReader: l1Reader('primary-l1-conflict', {
        ...l1Batch,
        l2BlockHash: `0x${'ee'.repeat(32)}` as const,
      }),
      secondaryL1BatchReader: l1Reader('secondary-l1-conflict', {
        ...l1Batch,
        l2BlockHash: `0x${'ee'.repeat(32)}` as const,
      }),
      transaction,
    }),
    /conflicts with the agreed L2 receipt/,
  );
  await assert.rejects(
    readRobinhoodEconomicFinality({
      primaryReader: reader('primary-l1-divergent'),
      secondaryReader: reader('secondary-l1-divergent'),
      primaryL1BatchReader: l1Reader('primary-l1-divergent'),
      secondaryL1BatchReader: l1Reader('secondary-l1-divergent', {
        ...l1Batch,
        l1BlockNumber: 1_001n,
      }),
      transaction,
    }),
    /divergent batch evidence/,
  );
  await assert.rejects(
    readRobinhoodEconomicFinality({
      primaryReader: reader('same-operator-a'),
      secondaryReader: {
        ...reader('same-operator-b'),
        identity: {
          providerId: 'l2-different',
          endpointOrigin: 'https://l2-different.example.test',
          operator: 'L2 Operator same-operator-a',
        },
      },
      primaryL1BatchReader: l1Reader('same-operator-a'),
      secondaryL1BatchReader: l1Reader('same-operator-b'),
      transaction,
    }),
    /independent provider, endpoint, and operator identities/,
  );
});

test('smart-account policy binds network, account, program, action, target, selector, value, time, and onchain enforcement', async () => {
  const { manifest, bundle, runtime } = createReadyRobinhoodFixture();
  const builder = createRobinhoodActionBuilder({
    manifest,
    bundle,
    runtime,
    programId: TEST_PROGRAM_ID,
  });
  const action = builder.escalateNoQuorum({
    account: TEST_ACCOUNT,
    intentId: 'intent-policy-1',
    requestId: REQUEST_ID,
    preparedAt: '2026-07-23T00:00:00.000Z',
    expiresAt: '2026-07-23T00:10:00.000Z',
  });
  const policy: RobinhoodSmartAccountPolicy = {
    version: 1,
    network: 'mainnet',
    account: TEST_ACCOUNT,
    programId: TEST_PROGRAM_ID,
    allowedActions: ['escalate_no_quorum'],
    allowedCalls: [
      {
        target: action.target,
        selectors: [action.selector],
        maximumNativeValue: 0n,
      },
    ],
    validAfter: 1_784_764_800n,
    validUntil: 1_784_768_400n,
    maximumCallsPerWindow: 3,
    windowSeconds: 300,
    maximumGasPerAction: 500_000n,
  };
  assert.doesNotThrow(() =>
    assertActionAllowedBySmartAccountPolicy({
      action,
      policy,
      manifest,
      bundle,
      runtime,
      now: 1_784_764_900n,
    }),
  );
  assert.throws(
    () =>
      assertActionAllowedBySmartAccountPolicy({
        action: { ...action, value: 1n },
        policy,
        manifest,
        bundle,
        runtime,
        now: 1_784_764_900n,
      }),
    /exact frozen action returned by createRobinhoodActionBuilder/,
  );

  assert.throws(
    () =>
      assertActionAllowedBySmartAccountPolicy({
        action: { ...action, action: 'expire_membership' },
        policy: { ...policy, allowedActions: ['expire_membership'] },
        manifest,
        bundle,
        runtime,
        now: 1_784_764_900n,
      }),
    /exact frozen action returned by createRobinhoodActionBuilder/,
  );

  for (const interactiveAction of [
    'approve_usdg',
    'open_request',
    'cancel_membership',
    'execute_initial_decision',
    'settle_obligation',
    'close_program',
    'pause_scope',
    'grant_agent_authorization',
  ] as const) {
    assert.throws(
      () =>
        validateRobinhoodSmartAccountPolicy({
          ...policy,
          allowedActions: [interactiveAction],
        }),
      /cannot authorize calls whose economic or privilege-bearing calldata is not enforced onchain/,
    );
  }

  assert.throws(
    () =>
      validateRobinhoodSmartAccountPolicy({
        ...policy,
        allowedCalls: [
          ...policy.allowedCalls,
          {
            target: action.target,
            selectors: [action.selector],
            maximumNativeValue: 0n,
          },
        ],
      }),
    /pairs must be unique/,
  );
  assert.throws(
    () =>
      validateRobinhoodSmartAccountPolicy({
        ...policy,
        windowSeconds: 86_401,
      }),
    /rate and gas caps/,
  );

  const liveNow = Date.now();
  const liveAction = builder.escalateNoQuorum({
    account: TEST_ACCOUNT,
    intentId: 'intent-policy-live',
    requestId: REQUEST_ID,
    preparedAt: new Date(liveNow - 1_000).toISOString(),
    expiresAt: new Date(liveNow + 5 * 60_000).toISOString(),
  });
  const livePolicy = {
    ...policy,
    validAfter: BigInt(Math.floor(liveNow / 1_000) - 60),
    validUntil: BigInt(Math.floor(liveNow / 1_000) + 3_600),
  };
  const smartAccountBytecode = '0x6001600055' as const;
  const moduleBytecodes = {
    factory: '0x6002600055',
    entryPoint: '0x6003600055',
    validationModule: '0x6004600055',
    recoveryModule: '0x6005600055',
    passkeyValidator: '0x6006600055',
  } as const;
  const moduleAddresses = {
    factory: '0x0000000000000000000000000000000000000101',
    entryPoint: '0x0000000000000000000000000000000000000102',
    validationModule: '0x0000000000000000000000000000000000000103',
    recoveryModule: '0x0000000000000000000000000000000000000104',
    passkeyValidator: '0x0000000000000000000000000000000000000105',
  } as const;
  const smartAccountManifest: RobinhoodSmartAccountRuntimeManifest = {
    schemaVersion: 1,
    providerId: 'reference-aa',
    network: 'mainnet',
    account: TEST_ACCOUNT,
    accountRuntimeBytecodeHash: keccak256(smartAccountBytecode),
    modules: Object.fromEntries(
      Object.entries(moduleAddresses).map(([role, address]) => [
        role,
        {
          address,
          runtimeBytecodeHash: keccak256(
            moduleBytecodes[role as keyof typeof moduleBytecodes],
          ),
        },
      ]),
    ) as RobinhoodSmartAccountRuntimeManifest['modules'],
  };
  const bytecodeByAddress = new Map<string, `0x${string}`>([
    [TEST_ACCOUNT.toLowerCase(), smartAccountBytecode],
    ...Object.entries(moduleAddresses).map(
      ([role, address]) =>
        [
          address.toLowerCase(),
          moduleBytecodes[role as keyof typeof moduleBytecodes],
        ] as [string, `0x${string}`],
    ),
  ]);
  const smartAccountRuntime = await verifyRobinhoodSmartAccountRuntime({
    manifest: smartAccountManifest,
    client: {
      async getChainId() {
        return ROBINHOOD_MAINNET_CHAIN_ID;
      },
      async getBlockNumber() {
        return 100n;
      },
      async getBlock() {
        return { hash: TEST_BLOCK_HASH };
      },
      async getBytecode({ address }: { address: string }) {
        return bytecodeByAddress.get(address.toLowerCase());
      },
    } as unknown as RobinhoodPublicClient,
  });
  const smartAccount = createRobinhoodSmartAccountClient({
    policy: livePolicy,
    manifest,
    bundle,
    runtime,
    smartAccountRuntime,
    adapter: {
      providerId: 'reference-aa',
      network: 'mainnet',
      account: TEST_ACCOUNT,
      async simulate() {
        return {
          success: true,
          blockNumber: 100n,
          gasEstimate: 100_000n,
          returnData: '0x',
        };
      },
      async submit(input) {
        return {
          kind: 'user_operation',
          providerId: 'reference-aa',
          network: 'mainnet',
          chainId: ROBINHOOD_MAINNET_CHAIN_ID,
          caip2: ROBINHOOD_MAINNET_CAIP2,
          intentId: input.action.intentId,
          accountId: input.action.accountId,
          userOperationHash: `0x${'ab'.repeat(32)}`,
          entryPoint: moduleAddresses.entryPoint,
          actionCommitment: input.actionCommitment,
          submittedAt: new Date().toISOString(),
        };
      },
    },
  });
  const userOperation = await smartAccount.submit(liveAction);
  assert.equal(userOperation.kind, 'user_operation');
  assert.equal(userOperation.providerId, 'reference-aa');
  assert.equal(
    userOperation.actionCommitment,
    hashPreparedRobinhoodAction(liveAction),
  );
  assert.equal(userOperation.entryPoint, moduleAddresses.entryPoint);

  await assert.rejects(
    verifyRobinhoodSmartAccountRuntime({
      manifest: {
        ...smartAccountManifest,
        accountRuntimeBytecodeHash: `0x${'ff'.repeat(32)}`,
      },
      client: {
        async getChainId() {
          return ROBINHOOD_MAINNET_CHAIN_ID;
        },
        async getBlockNumber() {
          return 100n;
        },
        async getBlock() {
          return { hash: TEST_BLOCK_HASH };
        },
        async getBytecode({ address }: { address: string }) {
          return bytecodeByAddress.get(address.toLowerCase());
        },
      } as unknown as RobinhoodPublicClient,
    }),
    /bytecode does not match/,
  );
});

test('smart-account lifecycle enforces creation, passkey enrollment, signer rotation, and recovery readback', async () => {
  const commitments = {
    owner1: `0x${'11'.repeat(32)}` as const,
    owner2: `0x${'12'.repeat(32)}` as const,
    owner3: `0x${'13'.repeat(32)}` as const,
    recovery: `0x${'21'.repeat(32)}` as const,
    recoveryAuthorization: `0x${'22'.repeat(32)}` as const,
    passkey1: `0x${'31'.repeat(32)}` as const,
    passkey2: `0x${'32'.repeat(32)}` as const,
    passkey3: `0x${'33'.repeat(32)}` as const,
    approval: `0x${'41'.repeat(32)}` as const,
  };
  let state: RobinhoodSmartAccountLifecycleState = {
    providerId: 'reference-aa',
    network: 'mainnet',
    account: TEST_ACCOUNT,
    status: 'counterfactual',
    revision: 0,
    ownerSignerCommitment: commitments.owner1,
    recoveryCommitment: commitments.recovery,
    passkeyCredentialCommitments: [],
    recoveryEpoch: 0,
  };
  let lastRequestCommitment = '';
  const lifecycle = createRobinhoodSmartAccountLifecycleClient({
    adapter: {
      providerId: 'reference-aa',
      network: 'mainnet',
      account: TEST_ACCOUNT,
      async readState() {
        return state;
      },
      async execute(request) {
        assert.equal(request.expectedRevision, state.revision);
        assert.match(request.requestCommitment, /^0x[0-9a-f]{64}$/);
        assert.notEqual(request.requestCommitment, lastRequestCommitment);
        lastRequestCommitment = request.requestCommitment;
        switch (request.action.kind) {
          case 'create_account':
            state = {
              ...state,
              status: 'active',
              revision: state.revision + 1,
              ownerSignerCommitment: request.action.ownerSignerCommitment,
              recoveryCommitment: request.action.recoveryCommitment,
              passkeyCredentialCommitments: [
                request.action.initialPasskeyCredentialCommitment,
              ],
            };
            break;
          case 'enroll_passkey':
            state = {
              ...state,
              revision: state.revision + 1,
              passkeyCredentialCommitments: [
                ...state.passkeyCredentialCommitments,
                request.action.passkeyCredentialCommitment,
              ],
            };
            break;
          case 'rotate_signer':
            state = {
              ...state,
              revision: state.revision + 1,
              ownerSignerCommitment: request.action.nextOwnerSignerCommitment,
            };
            break;
          case 'recover_account':
            state = {
              ...state,
              status: 'active',
              revision: state.revision + 1,
              ownerSignerCommitment: request.action.nextOwnerSignerCommitment,
              passkeyCredentialCommitments: [
                request.action.nextPasskeyCredentialCommitment,
              ],
              recoveryEpoch: state.recoveryEpoch + 1,
            };
            break;
        }
        return state;
      },
    },
  });
  const now = Math.floor(Date.now() / 1_000);
  const baseRequest = (requestId: string, expectedRevision: number) => ({
    version: 1 as const,
    requestId,
    network: 'mainnet' as const,
    account: TEST_ACCOUNT,
    expectedRevision,
    humanApprovalCommitment: commitments.approval,
    preparedAt: new Date((now - 1) * 1_000).toISOString(),
    expiresAt: new Date((now + 300) * 1_000).toISOString(),
  });
  await lifecycle.execute(
    {
      ...baseRequest('lifecycle:create:1', 0),
      action: {
        kind: 'create_account',
        ownerSignerCommitment: commitments.owner1,
        recoveryCommitment: commitments.recovery,
        initialPasskeyCredentialCommitment: commitments.passkey1,
      },
    },
    { now },
  );
  await lifecycle.execute(
    {
      ...baseRequest('lifecycle:passkey:2', 1),
      action: {
        kind: 'enroll_passkey',
        passkeyCredentialCommitment: commitments.passkey2,
      },
    },
    { now },
  );
  await lifecycle.execute(
    {
      ...baseRequest('lifecycle:signer:3', 2),
      action: {
        kind: 'rotate_signer',
        nextOwnerSignerCommitment: commitments.owner2,
      },
    },
    { now },
  );
  const recovered = await lifecycle.execute(
    {
      ...baseRequest('lifecycle:recover:4', 3),
      action: {
        kind: 'recover_account',
        nextOwnerSignerCommitment: commitments.owner3,
        nextPasskeyCredentialCommitment: commitments.passkey3,
        recoveryAuthorizationCommitment: commitments.recoveryAuthorization,
      },
    },
    { now },
  );
  assert.equal(recovered.revision, 4);
  assert.equal(recovered.recoveryEpoch, 1);
  assert.equal(recovered.ownerSignerCommitment, commitments.owner3);
  assert.deepEqual(recovered.passkeyCredentialCommitments, [
    commitments.passkey3,
  ]);

  await assert.rejects(
    lifecycle.execute(
      {
        ...baseRequest('lifecycle:stale:5', 3),
        action: {
          kind: 'rotate_signer',
          nextOwnerSignerCommitment: commitments.owner1,
        },
      },
      { now },
    ),
    /lost its revision race/,
  );
});

test('provider-neutral paymaster quotes bind exact action, gas, rate, and expiry without enabling submission', async () => {
  const { manifest, bundle, runtime } = createReadyRobinhoodFixture();
  const builder = createRobinhoodActionBuilder({
    manifest,
    bundle,
    runtime,
    programId: TEST_PROGRAM_ID,
  });
  const now = 1_784_764_900n;
  const action = builder.escalateNoQuorum({
    account: TEST_ACCOUNT,
    intentId: 'intent-paymaster-1',
    requestId: REQUEST_ID,
    preparedAt: '2026-07-23T00:00:00.000Z',
    expiresAt: '2026-07-23T00:10:00.000Z',
  });
  const policy: RobinhoodPaymasterPolicy = {
    version: 1,
    network: 'mainnet',
    sponsor: '0x00000000000000000000000000000000000000B1',
    account: TEST_ACCOUNT,
    programId: TEST_PROGRAM_ID,
    allowedActions: ['escalate_no_quorum'],
    allowedCalls: [
      {
        target: action.target,
        selectors: [action.selector],
        maximumNativeValue: 0n,
      },
    ],
    validAfter: now - 60n,
    validUntil: now + 3_600n,
    maximumSponsoredCallsPerWindow: 3,
    windowSeconds: 300,
    maximumSponsoredGasPerAction: 500_000n,
  };
  const quoteClient = (overrides: Partial<RobinhoodPaymasterQuote> = {}) =>
    createRobinhoodPaymasterClient({
      policy,
      manifest,
      bundle,
      runtime,
      adapter: {
        providerId: 'provider-neutral-test',
        network: 'mainnet',
        async quote({ actionCommitment, policyCommitment }) {
          return {
            version: 1,
            providerId: 'provider-neutral-test',
            network: 'mainnet',
            chainId: 4663,
            policyCommitment,
            sponsor: policy.sponsor,
            account: policy.account,
            programId: policy.programId,
            actionCommitment,
            target: action.target,
            selector: action.selector,
            value: action.value,
            validAfter: now - 10n,
            validUntil: now + 60n,
            maximumGas: 250_000n,
            windowStartedAt: now - 30n,
            callsSponsoredInWindow: 2,
            paymasterData: '0x1234',
            ...overrides,
          };
        },
      },
    });

  const quote = await quoteClient().quote(action, { now });
  assert.equal(quote.actionCommitment, hashPreparedRobinhoodAction(action));
  assert.equal(quote.policyCommitment, hashRobinhoodPaymasterPolicy(policy));
  assert.equal(quote.callsSponsoredInWindow, 2);
  assert.equal(Object.isFrozen(quote), true);

  await assert.rejects(
    quoteClient({ policyCommitment: `0x${'98'.repeat(32)}` }).quote(action, {
      now,
    }),
    /does not match the exact prepared action/,
  );
  await assert.rejects(
    quoteClient({ actionCommitment: `0x${'99'.repeat(32)}` }).quote(action, {
      now,
    }),
    /does not match the exact prepared action/,
  );
  await assert.rejects(
    quoteClient({ callsSponsoredInWindow: 3 }).quote(action, { now }),
    /exceeds its gas, rate, payload, or validity policy/,
  );
  await assert.rejects(
    quoteClient({ paymasterData: '0x' }).quote(action, { now }),
    /exceeds its gas, rate, payload, or validity policy/,
  );
  assert.throws(
    () =>
      validateRobinhoodPaymasterPolicy({
        ...policy,
        maximumSponsoredCallsPerWindow: 0,
      }),
    /rate and gas caps/,
  );
});

test('prepared and simulated actions enforce canonical time, identity, uint, and commitment bounds', () => {
  const action: PreparedRobinhoodAction = {
    version: 1,
    network: 'mainnet',
    chainId: 4663,
    caip2: 'eip155:4663',
    intentId: 'intent-validation-1',
    action: 'open_request',
    accountId: toRobinhoodCaip10('mainnet', TEST_ACCOUNT),
    programId: TEST_PROGRAM_ID,
    target: DECISION_MODULE,
    selector: '0x12345678',
    data: '0x12345678',
    value: 0n,
    explanation: 'Open one request.',
    expectedStateChanges: [],
    preparedAt: '2026-07-23T00:00:00.000Z',
    expiresAt: '2026-07-23T00:05:00.000Z',
  };
  assert.doesNotThrow(() => assertPreparedAction(action, 1_784_764_900n));
  assert.throws(
    () =>
      assertPreparedAction(
        { ...action, preparedAt: '2026-07-23' },
        1_784_764_900n,
      ),
    /canonical UTC ISO/,
  );
  assert.throws(
    () =>
      assertPreparedAction(
        { ...action, programId: `0x${'00'.repeat(32)}` },
        1_784_764_900n,
      ),
    /programId cannot be zero/,
  );
  assert.throws(
    () =>
      assertPreparedAction({ ...action, value: 1n << 256n }, 1_784_764_900n),
    /native value cannot be negative/,
  );
  const simulated = {
    action,
    simulation: {
      success: true,
      blockNumber: 100n,
      gasEstimate: 100_000n,
      returnData: '0x' as const,
    },
    simulatedAt: '2026-07-23T00:01:00.000Z',
    actionCommitment: hashPreparedRobinhoodAction(action),
  };
  assert.doesNotThrow(() =>
    assertSimulatedRobinhoodAction(simulated, {
      now: 1_784_764_890n,
      maximumAgeSeconds: 120,
    }),
  );
  assert.throws(
    () =>
      assertSimulatedRobinhoodAction(
        {
          ...simulated,
          action: { ...action, intentId: 'mutated' },
        },
        { now: 1_784_764_890n },
      ),
    /commitment does not match/,
  );
});

test('offline cache rejects malformed or stale timestamps and can never authorize writes', () => {
  const cachedAt = new Date('2026-07-23T00:00:00.000Z');
  const record = createRobinhoodOfflineCacheRecord({
    key: 'program:test',
    ttlSeconds: 60,
    cachedAt,
    read: {
      value: { state: 'funded' },
      context: {
        network: 'mainnet',
        chainId: 4663,
        caip2: 'eip155:4663',
        blockNumber: 100n,
        blockHash: TEST_BLOCK_HASH,
        chainHead: 105n,
        safeBlock: 104n,
        finalizedBlock: 103n,
        confirmations: 6,
        reconciliation: 'direct_chain_only',
        observedAt: '2026-07-23T00:00:00.000Z',
      },
    },
  });
  const cached = readRobinhoodOfflineCache(
    record,
    new Date('2026-07-23T00:00:30.000Z'),
  );
  assert.equal(cached?.context.reconciliation, 'offline_cache');
  assert.throws(
    () => assertRobinhoodWriteStateSafe(cached!.context),
    /Unsafe write disabled/,
  );
  assert.equal(
    readRobinhoodOfflineCache(
      { ...record, expiresAt: 'not-a-date' },
      new Date('2026-07-23T00:00:30.000Z'),
    ),
    null,
  );
  assert.equal(
    readRobinhoodOfflineCache(record, new Date('2026-07-23T00:01:00.000Z')),
    null,
  );
  assert.equal(
    readRobinhoodOfflineCache(
      { ...record, cachedAt: '2026-07-23T00:00:45.000Z' },
      new Date('2026-07-23T00:00:30.000Z'),
    ),
    null,
  );
  assert.equal(
    readRobinhoodOfflineCache(
      {
        ...record,
        context: { ...record.context, chainId: 1 as 4663 },
      },
      new Date('2026-07-23T00:00:30.000Z'),
    ),
    null,
  );
});

test('public indexer pagination bounds retries, rejects cursor loops, and preserves one block snapshot', async () => {
  const page = {
    scope: 'public_protocol_state' as const,
    network: 'mainnet' as const,
    chainId: 4663 as const,
    caip2: 'eip155:4663' as const,
    indexedBlock: 100n,
    indexedBlockHash: TEST_BLOCK_HASH,
    chainHead: 105n,
    safeBlock: 104n,
    finalizedBlock: 103n,
    confirmations: 6,
    reconciliation: 'indexer_behind' as const,
    observedAt: '2026-07-23T00:00:00.000Z',
  };
  let attempts = 0;
  const result = await collectRobinhoodIndexerPages({
    query: { programId: TEST_PROGRAM_ID },
    pageSize: 1,
    maximumRetriesPerPage: 1,
    waitBeforeRetry: async () => undefined,
    adapter: {
      providerId: 'public-indexer-test',
      network: 'mainnet',
      scope: 'public_protocol_state',
      isRetryable(error) {
        return error instanceof Error && error.message === 'transient';
      },
      async queryPage({ cursor }) {
        attempts += 1;
        if (attempts === 1) throw new Error('transient');
        return cursor == null
          ? { ...page, items: ['first'], nextCursor: 'cursor-2' }
          : { ...page, items: ['second'], nextCursor: null };
      },
    },
  });
  assert.deepEqual(result.items, ['first', 'second']);
  assert.equal(result.retries, 1);
  assert.equal(result.pages.length, 2);

  await assert.rejects(
    collectRobinhoodIndexerPages({
      query: {},
      pageSize: 1,
      maximumRetriesPerPage: 0,
      adapter: {
        providerId: 'oversized-page-test',
        network: 'mainnet',
        scope: 'public_protocol_state',
        async queryPage() {
          return { ...page, items: ['first', 'second'], nextCursor: null };
        },
      },
    }),
    /more items than requested page size/,
  );

  await assert.rejects(
    collectRobinhoodIndexerPages({
      query: {},
      maximumRetriesPerPage: 0,
      adapter: {
        providerId: 'cursor-loop-test',
        network: 'mainnet',
        scope: 'public_protocol_state',
        async queryPage() {
          return { ...page, items: [], nextCursor: 'same-cursor' };
        },
      },
    }),
    /cursor repeated/,
  );

  let pageNumber = 0;
  await assert.rejects(
    collectRobinhoodIndexerPages({
      query: {},
      maximumRetriesPerPage: 0,
      adapter: {
        providerId: 'snapshot-change-test',
        network: 'mainnet',
        scope: 'public_protocol_state',
        async queryPage() {
          pageNumber += 1;
          return pageNumber === 1
            ? { ...page, items: [], nextCursor: 'next' }
            : {
                ...page,
                indexedBlockHash: `0x${'99'.repeat(32)}` as const,
                items: [],
                nextCursor: null,
              };
        },
      },
    }),
    /snapshot changed during pagination/,
  );
});

test('offline cache invalidates conservatively at and after a detected reorg', () => {
  const record = createRobinhoodOfflineCacheRecord({
    key: 'program:reorg-test',
    ttlSeconds: 60,
    cachedAt: new Date('2026-07-23T00:00:00.000Z'),
    read: {
      value: { state: 'funded' },
      context: {
        network: 'mainnet',
        chainId: 4663,
        caip2: 'eip155:4663',
        blockNumber: 100n,
        blockHash: TEST_BLOCK_HASH,
        chainHead: 105n,
        safeBlock: 104n,
        finalizedBlock: 103n,
        confirmations: 6,
        reconciliation: 'direct_chain_only',
        observedAt: '2026-07-23T00:00:00.000Z',
      },
    },
  });
  assert.equal(
    invalidateRobinhoodOfflineCacheAfterReorg(record, {
      reorgedBlock: 100n,
      canonicalBlockHash: TEST_BLOCK_HASH,
    }),
    record,
  );
  assert.equal(
    invalidateRobinhoodOfflineCacheAfterReorg(record, {
      reorgedBlock: 100n,
      canonicalBlockHash: `0x${'99'.repeat(32)}`,
    }),
    null,
  );
  assert.equal(
    invalidateRobinhoodOfflineCacheAfterReorg(record, {
      reorgedBlock: 99n,
    }),
    null,
  );
  assert.equal(
    invalidateRobinhoodOfflineCacheAfterReorg(record, {
      reorgedBlock: 101n,
    }),
    record,
  );
});
