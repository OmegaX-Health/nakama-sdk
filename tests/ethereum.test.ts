import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ETHEREUM_MAINNET_CAIP2,
  ETHEREUM_MAINNET_CHAIN_ID,
  ETHEREUM_MAINNET_CHAIN_ID_HEX,
  ETHEREUM_MAINNET_TRANSACTION_GAS_LIMIT_CAP,
  createAuthorizationSubmissionV2,
  createEip1193TransactionSigningPayload,
  createEthereumPublicClient,
  createReceiptSubmissionV2,
  parseEthereumMainnetCaip10,
  requestSigningPayloadV2,
  requestSigningSubmissionV2,
  toEthereumMainnetCaip10,
  validateAuthorizationSubmissionV2,
  validateReceiptSubmissionV2,
  validateSigningPayloadV2,
  type Eip1193ProviderLike,
  type SigningPayloadV2,
} from '../src/ethereum.js';
import { createClaimRecipientAuthorizationSigningPayload } from '../src/ethereum_oracle.js';
import {
  NakamaEthereumConfigError,
  NakamaEthereumWrongChainError,
} from '../src/errors.js';

const ACCOUNT = '0x0000000000000000000000000000000000000001';
const RECIPIENT = '0x0000000000000000000000000000000000000002';
const CONTRACT = '0x0000000000000000000000000000000000000003';
const TX_HASH = `0x${'ab'.repeat(32)}` as const;
const SIGNATURE = `0x${'cd'.repeat(65)}` as const;

const CANONICAL_V2_WIRE_EXPECTATION = {
  version: 2,
  chainId: 'eip155:1',
  kinds: ['transaction', 'typed_data'],
  transactionRequired: ['from', 'to', 'data', 'value'],
  submissionByKind: {
    transaction: 'ReceiptSubmissionV2',
    typed_data: 'AuthorizationSubmissionV2',
  },
} as const;

function transactionPayload() {
  return createEip1193TransactionSigningPayload({
    from: ACCOUNT,
    to: CONTRACT,
    value: '0x1',
    data: '0x1234',
    maxFeePerGas: '0x2',
    maxPriorityFeePerGas: '0x1',
  });
}

function typedDataPayload() {
  return createClaimRecipientAuthorizationSigningPayload({
    account: ACCOUNT,
    verifyingContract: CONTRACT,
    message: {
      claimId: `0x${'11'.repeat(32)}`,
      recipient: RECIPIENT,
      nonce: 0n,
      deadline: 2_000_000_000n,
    },
  });
}

test('Ethereum mainnet identity uses EIP-155 and CAIP identifiers', () => {
  assert.equal(ETHEREUM_MAINNET_CHAIN_ID, 1);
  assert.equal(ETHEREUM_MAINNET_CHAIN_ID_HEX, '0x1');
  assert.equal(ETHEREUM_MAINNET_CAIP2, CANONICAL_V2_WIRE_EXPECTATION.chainId);

  const caip10 = toEthereumMainnetCaip10(ACCOUNT);
  assert.equal(caip10, `eip155:1:${ACCOUNT}`);
  assert.equal(parseEthereumMainnetCaip10(caip10), ACCOUNT);
  assert.throws(
    () => parseEthereumMainnetCaip10(`eip155:10:${ACCOUNT}`),
    NakamaEthereumWrongChainError,
  );
});

test('Ethereum RPC configuration requires credential-free HTTPS or loopback HTTP', () => {
  assert.equal(
    createEthereumPublicClient({ rpcUrl: 'https://rpc.example.test/path' })
      .chain?.id,
    1,
  );
  assert.equal(
    createEthereumPublicClient({ rpcUrl: 'http://127.0.0.1:8545' }).chain?.id,
    1,
  );
  assert.equal(
    createEthereumPublicClient({ rpcUrl: 'http://[::1]:8545' }).chain?.id,
    1,
  );
  for (const rpcUrl of [
    'http://rpc.example.test',
    'https://user:secret@rpc.example.test',
    'ws://127.0.0.1:8545',
  ]) {
    assert.throws(
      () => createEthereumPublicClient({ rpcUrl }),
      NakamaEthereumConfigError,
    );
  }
});

test('SigningPayloadV2 matches the copied canonical V2 wire shape', () => {
  const transaction = transactionPayload();
  assert.deepEqual(
    {
      version: transaction.version,
      chainId: transaction.chainId,
      kind: transaction.kind,
      accountId: transaction.accountId,
      transactionKeys: Object.keys(transaction.transaction)
        .filter((key) =>
          CANONICAL_V2_WIRE_EXPECTATION.transactionRequired.includes(
            key as never,
          ),
        )
        .sort(),
    },
    {
      version: 2,
      chainId: 'eip155:1',
      kind: 'transaction',
      accountId: `eip155:1:${ACCOUNT}`,
      transactionKeys: ['data', 'from', 'to', 'value'],
    },
  );

  const typedData = typedDataPayload();
  assert.equal(typedData.kind, 'typed_data');
  assert.equal(typedData.chainId, 'eip155:1');
  assert.equal(typedData.accountId, `eip155:1:${ACCOUNT}`);
  assert.equal(typedData.authorizationType, 'claim_recipient');
});

test('EIP-1193 transaction payload enforces the EIP-7825 gas ceiling', () => {
  assert.equal(ETHEREUM_MAINNET_TRANSACTION_GAS_LIMIT_CAP, 0x1000000n);

  const atLimit = createEip1193TransactionSigningPayload({
    from: ACCOUNT,
    to: CONTRACT,
    value: '0x0',
    data: '0x',
    gas: '0x1000000',
  });
  assert.equal(atLimit.transaction.gas, '0x1000000');

  assert.throws(
    () =>
      createEip1193TransactionSigningPayload({
        from: ACCOUNT,
        to: CONTRACT,
        value: '0x0',
        data: '0x',
        gas: '0x1000001',
      }),
    (error: unknown) =>
      error instanceof NakamaEthereumConfigError &&
      error.code === 'NAKAMA_ETHEREUM_CONFIG_ERROR' &&
      error.details?.eip === 7825,
  );
});

test('SigningPayloadV2 rejects wrong CAIP, account mismatch, and mixed branches', () => {
  const payload = transactionPayload();
  assert.throws(
    () =>
      validateSigningPayloadV2({
        ...payload,
        chainId: 'eip155:10',
      }),
    NakamaEthereumWrongChainError,
  );
  assert.throws(
    () =>
      validateSigningPayloadV2({
        ...payload,
        accountId: toEthereumMainnetCaip10(RECIPIENT),
      }),
    /from must match/,
  );
  assert.throws(
    () =>
      validateSigningPayloadV2({
        ...payload,
        typedData: typedDataPayload().typedData,
      }),
    /only the transaction branch/,
  );
  assert.throws(
    () =>
      validateSigningPayloadV2({
        ...typedDataPayload(),
        transaction: payload.transaction,
      }),
    /no transaction branch/,
  );
});

test('SigningPayloadV2 validates and signs the canonical serialized claim-recipient typed data', async () => {
  const serialized = JSON.parse(
    JSON.stringify(typedDataPayload(), (_key, value) =>
      typeof value === 'bigint' ? value.toString(10) : value,
    ),
  ) as Record<string, unknown>;
  const checked = validateSigningPayloadV2(serialized);

  assert.equal(checked.kind, 'typed_data');
  assert.equal(checked.typedData.primaryType, 'ClaimRecipient');
  assert.deepEqual(checked.typedData.types, {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ],
    ClaimRecipient: [
      { name: 'claimId', type: 'bytes32' },
      { name: 'recipient', type: 'address' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  });
  assert.deepEqual(checked.typedData.message, {
    claimId: `0x${'11'.repeat(32)}`,
    recipient: RECIPIENT,
    nonce: 0n,
    deadline: 2_000_000_000n,
  });

  const requests: Array<{
    method: string;
    params?: readonly unknown[] | Record<string, unknown>;
  }> = [];
  const provider: Eip1193ProviderLike = {
    async request(request) {
      requests.push(request);
      return request.method === 'eth_chainId' ? '0x1' : SIGNATURE;
    },
  };
  assert.equal(
    await requestSigningPayloadV2(
      provider,
      serialized as unknown as SigningPayloadV2,
    ),
    SIGNATURE,
  );
  assert.deepEqual(
    requests.map(({ method }) => method),
    ['eth_chainId', 'eth_signTypedData_v4'],
  );
  const walletTypedData = JSON.parse(
    (requests[1]?.params as readonly unknown[])[1] as string,
  ) as { primaryType: string; message: Record<string, unknown> };
  assert.equal(walletTypedData.primaryType, 'ClaimRecipient');
  assert.deepEqual(
    (
      walletTypedData as {
        types: { EIP712Domain: readonly Record<string, unknown>[] };
      }
    ).types.EIP712Domain,
    checked.typedData.types.EIP712Domain,
  );
  assert.equal(walletTypedData.message.nonce, '0');
  assert.equal(walletTypedData.message.deadline, '2000000000');
});

test('SigningPayloadV2 rejects unrelated claim-recipient data before opening the wallet', async () => {
  const canonical = typedDataPayload();
  let providerRequestCount = 0;
  const provider: Eip1193ProviderLike = {
    async request() {
      providerRequestCount += 1;
      throw new Error('wallet must not be called');
    },
  };
  const unrelatedPayloads = [
    {
      ...canonical,
      typedData: {
        ...canonical.typedData,
        primaryType: 'Permit',
      },
    },
    {
      ...canonical,
      typedData: {
        ...canonical.typedData,
        types: {
          Permit: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' },
          ],
        },
      },
    },
    {
      ...canonical,
      typedData: {
        ...canonical.typedData,
        message: {
          owner: ACCOUNT,
          spender: RECIPIENT,
        },
      },
    },
  ];

  for (const payload of unrelatedPayloads) {
    assert.throws(
      () => validateSigningPayloadV2(payload),
      NakamaEthereumConfigError,
    );
    await assert.rejects(
      requestSigningPayloadV2(provider, payload as SigningPayloadV2),
      NakamaEthereumConfigError,
    );
  }
  assert.equal(providerRequestCount, 0);
});

test('EIP-1193 request maps canonical transaction payload and verifies wallet chain', async () => {
  const requests: Array<{ method: string; params?: unknown }> = [];
  const provider: Eip1193ProviderLike = {
    async request({ method, params }) {
      requests.push({ method, params });
      if (method === 'eth_chainId') return '0x1';
      if (method === 'eth_sendTransaction') return TX_HASH;
      throw new Error(`unexpected ${method}`);
    },
  };
  const payload = transactionPayload();

  assert.equal(await requestSigningPayloadV2(provider, payload), TX_HASH);
  assert.deepEqual(
    requests.map((request) => request.method),
    ['eth_chainId', 'eth_sendTransaction'],
  );
  const walletTransaction = (
    requests[1]?.params as Array<Record<string, unknown>>
  )[0];
  assert.equal(walletTransaction?.chainId, '0x1');
  assert.equal(walletTransaction?.from, ACCOUNT);
  assert.equal(walletTransaction?.to, CONTRACT);
  assert.equal(walletTransaction?.data, '0x1234');
  assert.equal(walletTransaction?.value, '0x1');

  const wrongChain: Eip1193ProviderLike = {
    async request() {
      return '0xa';
    },
  };
  await assert.rejects(
    requestSigningPayloadV2(wrongChain, payload),
    NakamaEthereumWrongChainError,
  );
});

test('V2 submissions preserve kind and reject signature/transaction confusion', async () => {
  const transaction = transactionPayload();
  const typedData = typedDataPayload();
  const receipt = createReceiptSubmissionV2({
    intentId: 'intent-1',
    payload: transaction,
    txHash: TX_HASH,
  });
  const authorization = createAuthorizationSubmissionV2({
    intentId: 'intent-2',
    payload: typedData,
    signature: SIGNATURE,
  });
  assert.equal(receipt.kind, 'transaction');
  assert.equal(authorization.kind, 'typed_data');
  assert.throws(
    () =>
      createReceiptSubmissionV2({
        intentId: 'intent-3',
        payload: typedData,
        txHash: TX_HASH,
      }),
    /transaction signing payload/,
  );
  assert.throws(
    () =>
      createAuthorizationSubmissionV2({
        intentId: 'intent-4',
        payload: transaction,
        signature: SIGNATURE,
      }),
    /typed_data signing payload/,
  );
  assert.throws(
    () => validateReceiptSubmissionV2({ ...receipt, signature: SIGNATURE }),
    /no signature/,
  );
  assert.throws(
    () =>
      validateAuthorizationSubmissionV2({ ...authorization, txHash: TX_HASH }),
    /no transaction hash/,
  );
  assert.equal(
    createAuthorizationSubmissionV2({
      intentId: 'intent-5',
      payload: typedData,
      signature: TX_HASH,
    }).signature,
    TX_HASH,
  );

  const provider: Eip1193ProviderLike = {
    async request({ method }) {
      if (method === 'eth_chainId') return '0x1';
      if (method === 'eth_signTypedData_v4') return SIGNATURE;
      throw new Error(`unexpected ${method}`);
    },
  };
  assert.deepEqual(
    await requestSigningSubmissionV2(provider, typedData, 'intent-6'),
    {
      version: 2,
      intentId: 'intent-6',
      chainId: 'eip155:1',
      accountId: `eip155:1:${ACCOUNT}`,
      kind: 'typed_data',
      authorizationType: 'claim_recipient',
      signature: SIGNATURE,
    },
  );

  const thirtyTwoByteContractSignature: Eip1193ProviderLike = {
    async request({ method }) {
      return method === 'eth_chainId' ? '0x1' : TX_HASH;
    },
  };
  assert.equal(
    await requestSigningPayloadV2(thirtyTwoByteContractSignature, typedData),
    TX_HASH,
  );
});

test('canonical kind-to-submission mapping remains copied into SDK tests', () => {
  const mapping: Record<SigningPayloadV2['kind'], string> = {
    transaction: 'ReceiptSubmissionV2',
    typed_data: 'AuthorizationSubmissionV2',
  };
  assert.deepEqual(mapping, CANONICAL_V2_WIRE_EXPECTATION.submissionByKind);
});
