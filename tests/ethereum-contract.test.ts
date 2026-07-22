import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  encodeAbiParameters,
  encodeEventTopics,
  getContractAddress,
  keccak256,
  parseAbiParameters,
  type Address,
  type Hex,
} from 'viem';

import {
  NAKAMA_COVERAGE_PROTOCOL_ARTIFACT_METADATA,
  NAKAMA_ETHEREUM_MAINNET_DEPLOYMENT,
  NAKAMA_POLICY_REGISTRY_ABI,
  NAKAMA_POLICY_REGISTRY_ABI_SHA256,
  NAKAMA_POLICY_REGISTRY_ARTIFACT_METADATA,
  NAKAMA_PROTOCOL_FACTORY_ABI_SHA256,
  NAKAMA_PROTOCOL_FACTORY_ARTIFACT_METADATA,
  NAKAMA_RESERVE_VAULT_ABI_SHA256,
  NAKAMA_RESERVE_VAULT_ARTIFACT_METADATA,
  NakamaEthereumContractError,
  NakamaEthereumReceiptError,
  assertEthereumCreationBytecodeHash,
  createEip1193TransactionSigningPayload,
  createReceiptSubmissionV2,
  decodeEthereumCalldata,
  decodeEthereumEventLogs,
  encodeEthereumCalldata,
  hashEthereumRuntimeBytecodeTemplate,
  inspectErc20,
  normalizeEthereumRuntimeBytecode,
  validateEthereumContractDeployment,
  validateEthereumDeploymentManifest,
  verifyEthereumReceipt,
  verifyEthereumSourcifyDeployment,
  verifyEthereumTransactionIntent,
  NAKAMA_COVERAGE_PROTOCOL_ABI_SHA256,
  type EthereumPublicClient,
} from '../src/index.js';

const DEPLOYER = '0x0000000000000000000000000000000000000030' as Address;
const FACTORY = getContractAddress({ from: DEPLOYER, nonce: 7n });
const REGISTRY = getContractAddress({ from: FACTORY, nonce: 1n });
const CONTRACT = getContractAddress({ from: FACTORY, nonce: 2n });
const TOKEN = '0x0000000000000000000000000000000000000020';
const CLAIMANT = DEPLOYER;
const SPENDER = '0x0000000000000000000000000000000000000040';
const TX_HASH = ('0x' + '11'.repeat(32)) as Hex;
const BLOCK_HASH = ('0x' + '22'.repeat(32)) as Hex;
const CLAIM_ID = ('0x' + '44'.repeat(32)) as Hex;

interface FixtureMetadata {
  creationBytecodeHash: Hex;
  creationBytecodeBytes: number;
  runtimeBytecodeTemplateHash: Hex;
  runtimeBytecodeBytes: number;
  immutableReferences: readonly { start: number; length: number }[];
}

function sourceVerification(address: Address, id: string) {
  return {
    verificationProvider: 'sourcify-v2',
    verificationUrl: 'https://sourcify.dev/server/v2/contract/1/' + address,
    sourceVerifiedAt: '2026-07-19T00:00:00.000Z',
    sourcifyMatchId: id,
    creationMatch: 'exact_match',
    runtimeMatch: 'exact_match',
  } as const;
}

function deployedContract(
  base: object,
  address: Address,
  metadata: FixtureMetadata,
  abiSha256: string,
  id: string,
  runtimeBytecodeHash: Hex,
) {
  return {
    ...base,
    address,
    creationBytecodeHash: metadata.creationBytecodeHash,
    creationBytecodeBytes: metadata.creationBytecodeBytes,
    runtimeBytecodeHash,
    runtimeBytecodeTemplateHash: metadata.runtimeBytecodeTemplateHash,
    runtimeBytecodeBytes: metadata.runtimeBytecodeBytes,
    immutableReferences: metadata.immutableReferences,
    abiSha256,
    verification: sourceVerification(address, id),
  };
}

function deployedManifest() {
  const base = NAKAMA_ETHEREUM_MAINNET_DEPLOYMENT;
  return {
    ...base,
    status: 'deployed',
    deployer: DEPLOYER,
    deploymentTransaction: TX_HASH,
    deploymentBlock: 100,
    deploymentBlockHash: BLOCK_HASH,
    confirmations: 12,
    sourceCommit: 'ab'.repeat(20),
    protocolArtifactSha256:
      NAKAMA_PROTOCOL_FACTORY_ARTIFACT_METADATA.sourceArtifactSha256,
    liveContracts: {
      factory: deployedContract(
        base.liveContracts.factory,
        FACTORY,
        NAKAMA_PROTOCOL_FACTORY_ARTIFACT_METADATA,
        NAKAMA_PROTOCOL_FACTORY_ABI_SHA256,
        'factory-match',
        ('0x' + '51'.repeat(32)) as Hex,
      ),
      policyRegistry: deployedContract(
        base.liveContracts.policyRegistry,
        REGISTRY,
        NAKAMA_POLICY_REGISTRY_ARTIFACT_METADATA,
        NAKAMA_POLICY_REGISTRY_ABI_SHA256,
        'registry-match',
        ('0x' + '52'.repeat(32)) as Hex,
      ),
      protocol: deployedContract(
        base.liveContracts.protocol,
        CONTRACT,
        NAKAMA_COVERAGE_PROTOCOL_ARTIFACT_METADATA,
        NAKAMA_COVERAGE_PROTOCOL_ABI_SHA256,
        'protocol-match',
        ('0x' + '53'.repeat(32)) as Hex,
      ),
    },
    contractTemplates: {
      reserveVault: {
        ...base.contractTemplates.reserveVault,
        creationBytecodeHash:
          NAKAMA_RESERVE_VAULT_ARTIFACT_METADATA.creationBytecodeHash,
        creationBytecodeBytes:
          NAKAMA_RESERVE_VAULT_ARTIFACT_METADATA.creationBytecodeBytes,
        runtimeBytecodeTemplateHash:
          NAKAMA_RESERVE_VAULT_ARTIFACT_METADATA.runtimeBytecodeTemplateHash,
        runtimeBytecodeBytes:
          NAKAMA_RESERVE_VAULT_ARTIFACT_METADATA.runtimeBytecodeBytes,
        immutableReferences:
          NAKAMA_RESERVE_VAULT_ARTIFACT_METADATA.immutableReferences,
        abiSha256: NAKAMA_RESERVE_VAULT_ABI_SHA256,
      },
    },
    verified: true,
    auditStatus: 'audited',
    auditReportSha256: 'cd'.repeat(32),
    releaseApprovalSha256: 'de'.repeat(32),
    verificationEvidenceSha256: 'ef'.repeat(32),
  } as const;
}

test('generated schema-v3 deployment stays fail-closed until a real deployment exists', () => {
  const manifest = validateEthereumDeploymentManifest(
    NAKAMA_ETHEREUM_MAINNET_DEPLOYMENT,
  );
  assert.equal(manifest.status, 'unconfigured');
  assert.equal(manifest.liveContracts.factory.address, null);
  assert.equal(manifest.liveContracts.policyRegistry.address, null);
  assert.equal(manifest.liveContracts.protocol.address, null);
  assert.equal('address' in manifest.contractTemplates.reserveVault, false);

  assert.throws(
    () =>
      validateEthereumDeploymentManifest({
        ...NAKAMA_ETHEREUM_MAINNET_DEPLOYMENT,
        unexpectedField: true,
      }),
    /canonical schema/,
  );
  assert.throws(
    () =>
      validateEthereumDeploymentManifest({
        ...NAKAMA_ETHEREUM_MAINNET_DEPLOYMENT,
        contractTemplates: {
          reserveVault: {
            ...NAKAMA_ETHEREUM_MAINNET_DEPLOYMENT.contractTemplates
              .reserveVault,
            saltDerivation: 'keccak256(abi.encode(assetToken,domainId))',
          },
        },
      }),
    /not canonical/,
  );
  assert.throws(
    () =>
      validateEthereumDeploymentManifest(NAKAMA_ETHEREUM_MAINNET_DEPLOYMENT, {
        requireDeployed: true,
      }),
    NakamaEthereumContractError,
  );
});

test('runtime bytecode template hashing zeroes validated immutable ranges', () => {
  const bytecode = '0x1122334455' as Hex;
  const immutableReferences = [
    { start: 3, length: 1 },
    { start: 1, length: 2 },
  ];
  const normalized = normalizeEthereumRuntimeBytecode({
    bytecode,
    immutableReferences,
  });
  assert.equal(normalized, '0x1100000055');
  assert.equal(
    hashEthereumRuntimeBytecodeTemplate({ bytecode, immutableReferences }),
    keccak256(normalized),
  );
  assert.throws(
    () =>
      normalizeEthereumRuntimeBytecode({
        bytecode,
        immutableReferences: [
          { start: 1, length: 2 },
          { start: 2, length: 2 },
        ],
      }),
    /non-overlapping/,
  );
  assert.throws(
    () =>
      normalizeEthereumRuntimeBytecode({
        bytecode,
        immutableReferences: [{ start: 5, length: 1 }],
      }),
    /in-bounds/,
  );
});

test('creation bytecode integrity compares transaction input with an approved hash', () => {
  const syntheticCreationBytecode = '0x60006000' as Hex;
  const expectedCreationBytecodeHash = keccak256(syntheticCreationBytecode);
  assert.equal(
    assertEthereumCreationBytecodeHash({
      creationBytecode: syntheticCreationBytecode,
      expectedCreationBytecodeHash,
    }),
    expectedCreationBytecodeHash,
  );
  assert.throws(
    () =>
      assertEthereumCreationBytecodeHash({
        creationBytecode: '0x6001',
        expectedCreationBytecodeHash,
      }),
    /does not match the approved hash/,
  );
});

test('schema-v3 validation binds three live contracts, the vault template, and three Sourcify records', async () => {
  const manifest = deployedManifest();
  const validated = validateEthereumDeploymentManifest(manifest);
  assert.equal(validated.status, 'deployed');
  assert.equal(validated.liveContracts.factory.address, FACTORY);
  assert.equal(validated.liveContracts.policyRegistry.address, REGISTRY);
  assert.equal(validated.liveContracts.protocol.address, CONTRACT);
  assert.equal('address' in validated.contractTemplates.reserveVault, false);

  assert.throws(
    () =>
      validateEthereumDeploymentManifest({
        ...manifest,
        liveContracts: {
          ...manifest.liveContracts,
          policyRegistry: {
            ...manifest.liveContracts.policyRegistry,
            runtimeBytecodeTemplateHash: ('0x' + '88'.repeat(32)) as Hex,
          },
        },
      }),
    /does not match the generated protocol artifact/,
  );
  assert.throws(
    () =>
      validateEthereumDeploymentManifest({
        ...manifest,
        contractTemplates: {
          reserveVault: {
            ...manifest.contractTemplates.reserveVault,
            address: SPENDER,
          },
        },
      }),
    /canonical schema/,
  );

  const requestedUrls: string[] = [];
  const fetchImpl = (async (input: string | URL | Request) => {
    const url = String(input);
    requestedUrls.push(url);
    const contract = Object.values(manifest.liveContracts).find(
      (candidate) => candidate.verification.verificationUrl === url,
    );
    return new Response(
      JSON.stringify({
        chainId: '1',
        address: contract?.address,
        creationMatch: 'exact_match',
        runtimeMatch: 'exact_match',
        verifiedAt: contract?.verification.sourceVerifiedAt,
        matchId: contract?.verification.sourcifyMatchId,
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  }) as typeof fetch;
  const verified = await verifyEthereumSourcifyDeployment(manifest, fetchImpl);
  assert.equal(verified.liveContracts.policyRegistry.address, REGISTRY);
  assert.deepEqual(
    requestedUrls.sort(),
    Object.values(manifest.liveContracts)
      .map((contract) => contract.verification.verificationUrl)
      .sort(),
  );

  await assert.rejects(
    validateEthereumContractDeployment({
      client: {
        async getChainId() {
          return 10;
        },
      } as unknown as EthereumPublicClient,
      manifest,
    }),
    /expected Ethereum mainnet/,
  );
});

test(
  'deployment verification binds the factory receipt, CREATE children, deploymentFactory, cross-getters, live code, and Sourcify',
  {
    skip: !existsSync(
      '../nakama-protocol/artifacts/hardhat/contracts/NakamaProtocolFactory.sol/NakamaProtocolFactory.json',
    ),
  },
  async () => {
    const artifactNames = [
      'NakamaProtocolFactory',
      'NakamaPolicyRegistry',
      'NakamaCoverageProtocol',
    ] as const;
    const artifacts = Object.fromEntries(
      await Promise.all(
        artifactNames.map(async (name) => [
          name,
          JSON.parse(
            await readFile(
              '../nakama-protocol/artifacts/hardhat/contracts/' +
                name +
                '.sol/' +
                name +
                '.json',
              'utf8',
            ),
          ) as { bytecode: Hex; deployedBytecode: Hex },
        ]),
      ),
    ) as Record<
      (typeof artifactNames)[number],
      { bytecode: Hex; deployedBytecode: Hex }
    >;
    const base = deployedManifest();
    const manifest = {
      ...base,
      liveContracts: {
        factory: {
          ...base.liveContracts.factory,
          runtimeBytecodeHash: keccak256(
            artifacts.NakamaProtocolFactory.deployedBytecode,
          ),
        },
        policyRegistry: {
          ...base.liveContracts.policyRegistry,
          runtimeBytecodeHash: keccak256(
            artifacts.NakamaPolicyRegistry.deployedBytecode,
          ),
        },
        protocol: {
          ...base.liveContracts.protocol,
          runtimeBytecodeHash: keccak256(
            artifacts.NakamaCoverageProtocol.deployedBytecode,
          ),
        },
      },
    };
    const bytecodeByAddress = new Map([
      [FACTORY, artifacts.NakamaProtocolFactory.deployedBytecode],
      [REGISTRY, artifacts.NakamaPolicyRegistry.deployedBytecode],
      [CONTRACT, artifacts.NakamaCoverageProtocol.deployedBytecode],
    ]);
    const receipt = {
      status: 'success',
      contractAddress: FACTORY,
      blockNumber: 100n,
      blockHash: BLOCK_HASH,
    };
    const transaction = {
      hash: TX_HASH,
      from: DEPLOYER,
      to: null,
      nonce: 7,
      input: artifacts.NakamaProtocolFactory.bytecode,
      blockNumber: 100n,
      blockHash: BLOCK_HASH,
    };
    const client = {
      async getChainId() {
        return 1;
      },
      async getTransactionReceipt() {
        return receipt;
      },
      async getTransaction() {
        return transaction;
      },
      async getBlock(args: { blockTag?: string }) {
        return args.blockTag === 'safe'
          ? { number: 111n, hash: ('0x' + '77'.repeat(32)) as Hex }
          : { number: 100n, hash: BLOCK_HASH };
      },
      async getBlockNumber() {
        return 111n;
      },
      async getBytecode(args: { address: Address }) {
        return bytecodeByAddress.get(args.address);
      },
      async readContract(args: { address: Address; functionName: string }) {
        if (args.address === FACTORY && args.functionName === 'policyRegistry')
          return REGISTRY;
        if (args.address === FACTORY && args.functionName === 'protocol')
          return CONTRACT;
        if (args.address === REGISTRY && args.functionName === 'core')
          return CONTRACT;
        if (args.address === CONTRACT && args.functionName === 'policyRegistry')
          return REGISTRY;
        if (
          args.address === CONTRACT &&
          args.functionName === 'deploymentFactory'
        )
          return FACTORY;
        throw new Error('unexpected getter');
      },
    } as unknown as EthereumPublicClient;
    const sourcifyFetch = (async (input: string | URL | Request) => {
      const url = String(input);
      const contract = Object.values(manifest.liveContracts).find(
        (candidate) => candidate.verification.verificationUrl === url,
      );
      return new Response(
        JSON.stringify({
          chainId: '1',
          address: contract?.address,
          creationMatch: 'exact_match',
          runtimeMatch: 'exact_match',
          verifiedAt: contract?.verification.sourceVerifiedAt,
          matchId: contract?.verification.sourcifyMatchId,
        }),
        { status: 200 },
      );
    }) as typeof fetch;

    const verified = await validateEthereumContractDeployment({
      client,
      manifest,
      fetchImpl: sourcifyFetch,
    });
    assert.equal(verified.liveContracts.protocol.address, CONTRACT);

    await assert.rejects(
      validateEthereumContractDeployment({
        client: {
          ...client,
          async getBlock(args: { blockTag?: string }) {
            if (args.blockTag === 'finalized') {
              return { number: 99n, hash: ('0x' + '76'.repeat(32)) as Hex };
            }
            return client.getBlock(args as never);
          },
        } as EthereumPublicClient,
        manifest,
        fetchImpl: sourcifyFetch,
      }),
      /finalized head/,
    );

    const shiftedRegistry = SPENDER as Address;
    await assert.rejects(
      validateEthereumContractDeployment({
        client,
        manifest: {
          ...manifest,
          liveContracts: {
            ...manifest.liveContracts,
            policyRegistry: {
              ...manifest.liveContracts.policyRegistry,
              address: shiftedRegistry,
              verification: sourceVerification(
                shiftedRegistry,
                'shifted-registry',
              ),
            },
          },
        },
        fetchImpl: sourcifyFetch,
      }),
      /CREATE nonce one registry/,
    );

    await assert.rejects(
      validateEthereumContractDeployment({
        client: {
          ...client,
          async readContract(args: { address: Address; functionName: string }) {
            if (
              args.address === FACTORY &&
              args.functionName === 'policyRegistry'
            )
              return SPENDER;
            return client.readContract(args as never);
          },
        } as EthereumPublicClient,
        manifest,
        fetchImpl: sourcifyFetch,
      }),
      /cross-getters are not mutually bound/,
    );

    await assert.rejects(
      validateEthereumContractDeployment({
        client: {
          ...client,
          async readContract(args: { address: Address; functionName: string }) {
            if (
              args.address === CONTRACT &&
              args.functionName === 'deploymentFactory'
            )
              return SPENDER;
            return client.readContract(args as never);
          },
        } as EthereumPublicClient,
        manifest,
        fetchImpl: sourcifyFetch,
      }),
      /deploymentFactory\/cross-getters are not mutually bound/,
    );
  },
);

test('ABI helpers encode calldata and decode contract events', () => {
  const signature = `0x${'aa'.repeat(65)}` as Hex;
  const calldata = encodeEthereumCalldata({
    abi: NAKAMA_POLICY_REGISTRY_ABI,
    functionName: 'authorizeClaimRecipient',
    args: [CLAIM_ID, TOKEN, 1_100n, signature],
  });
  const decoded = decodeEthereumCalldata({
    abi: NAKAMA_POLICY_REGISTRY_ABI,
    data: calldata,
  });
  assert.equal(decoded.functionName, 'authorizeClaimRecipient');

  const topics = encodeEventTopics({
    abi: NAKAMA_POLICY_REGISTRY_ABI,
    eventName: 'ClaimRecipientAuthorized',
    args: {
      claimId: CLAIM_ID,
      claimant: CLAIMANT,
      recipient: TOKEN,
    },
  });
  const data = encodeAbiParameters(parseAbiParameters('uint256 nonce'), [7n]);
  const events = decodeEthereumEventLogs({
    abi: NAKAMA_POLICY_REGISTRY_ABI,
    eventName: 'ClaimRecipientAuthorized',
    logs: [{ data, topics }],
  });
  assert.equal(events.length, 1);
  assert.equal(events[0]?.eventName, 'ClaimRecipientAuthorized');
  assert.deepEqual(events[0]?.args, {
    claimId: CLAIM_ID,
    claimant: CLAIMANT,
    recipient: TOKEN,
    nonce: 7n,
  });
});

test('ERC-20 inspection checks contract code, decimals, balance, and allowance', async () => {
  const values: Record<string, unknown> = {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    totalSupply: 1_000_000n,
    balanceOf: 500n,
    allowance: 200n,
  };
  const client = {
    async getChainId() {
      return 1;
    },
    async getBytecode() {
      return '0x6000';
    },
    async readContract(args: { functionName: string }) {
      return values[args.functionName];
    },
  } as unknown as EthereumPublicClient;

  const result = await inspectErc20(client, {
    token: TOKEN,
    owner: CLAIMANT,
    spender: SPENDER,
    expectedDecimals: 6,
    expectedSymbol: 'USDC',
    minimumBalance: 400n,
    minimumAllowance: 100n,
  });
  assert.equal(result.symbol, 'USDC');
  assert.equal(result.balance, 500n);
  assert.equal(result.allowance, 200n);

  await assert.rejects(
    inspectErc20(client, {
      token: TOKEN,
      expectedDecimals: 18,
    }),
    NakamaEthereumContractError,
  );
});

test('receipt verification requires confirmations, canonical block hash, and safe head', async () => {
  const receipt = {
    status: 'success',
    blockNumber: 100n,
    blockHash: BLOCK_HASH,
  };
  const client = {
    async getChainId() {
      return 1;
    },
    async getTransactionReceipt() {
      return receipt;
    },
    async getBlock(args: { blockTag?: string }) {
      return args.blockTag === 'safe'
        ? { number: 110n, hash: `0x${'77'.repeat(32)}` }
        : { number: 100n, hash: BLOCK_HASH };
    },
    async getBlockNumber() {
      return 110n;
    },
  } as unknown as EthereumPublicClient;

  const verified = await verifyEthereumReceipt(client, {
    hash: TX_HASH,
    minimumConfirmations: 11,
  });
  assert.equal(verified.confirmations, 11);
  assert.equal(verified.safe, true);

  await assert.rejects(
    verifyEthereumReceipt(
      {
        ...client,
        async getBlock(args: { blockTag?: string }) {
          return args.blockTag === 'safe'
            ? { number: 110n, hash: BLOCK_HASH }
            : { number: 100n, hash: `0x${'ff'.repeat(32)}` };
        },
      } as EthereumPublicClient,
      { hash: TX_HASH, minimumConfirmations: 11 },
    ),
    NakamaEthereumReceiptError,
  );
});

test('transaction-intent verification rejects cross-intent replay and binds receipt fields', async () => {
  const signingPayload = createEip1193TransactionSigningPayload({
    from: CLAIMANT,
    to: CONTRACT,
    data: '0x1234',
    value: '0x5',
  });
  const submission = createReceiptSubmissionV2({
    intentId: 'claim-intent-1',
    payload: signingPayload,
    txHash: TX_HASH,
  });
  const receipt = {
    status: 'success',
    blockNumber: 100n,
    blockHash: BLOCK_HASH,
  };
  const transaction = {
    hash: TX_HASH,
    from: CLAIMANT,
    to: CONTRACT,
    input: '0x1234',
    value: 5n,
  };
  const client = {
    async getChainId() {
      return 1;
    },
    async getTransaction() {
      return transaction;
    },
    async getTransactionReceipt() {
      return receipt;
    },
    async getBlock(args: { blockTag?: string }) {
      return args.blockTag === 'safe'
        ? { number: 111n, hash: `0x${'77'.repeat(32)}` }
        : { number: 100n, hash: BLOCK_HASH };
    },
    async getBlockNumber() {
      return 111n;
    },
  } as unknown as EthereumPublicClient;

  const verified = await verifyEthereumTransactionIntent(client, {
    submission,
    expectedIntentId: 'claim-intent-1',
    signingPayload,
    minimumConfirmations: 12,
  });
  assert.equal(verified.transaction.hash, TX_HASH);
  assert.equal(verified.transaction.value, 5n);

  for (const changed of [
    { hash: `0x${'99'.repeat(32)}` as Hex },
    { from: SPENDER },
    { to: TOKEN },
    { input: '0x5678' as Hex },
    { value: 6n },
    { to: null },
  ]) {
    await assert.rejects(
      verifyEthereumTransactionIntent(
        {
          ...client,
          async getTransaction() {
            return { ...transaction, ...changed };
          },
        } as EthereumPublicClient,
        {
          submission,
          expectedIntentId: 'claim-intent-1',
          signingPayload,
          minimumConfirmations: 12,
        },
      ),
      NakamaEthereumContractError,
    );
  }

  await assert.rejects(
    verifyEthereumTransactionIntent(client, {
      submission,
      expectedIntentId: 'claim-intent-2',
      signingPayload,
      minimumConfirmations: 12,
    }),
    /does not match the trusted transaction intent/,
  );

  await assert.rejects(
    verifyEthereumTransactionIntent(
      {
        ...client,
        async getBlock(args: { blockTag?: string }) {
          return args.blockTag === 'safe'
            ? { number: 111n, hash: BLOCK_HASH }
            : { number: 100n, hash: `0x${'ff'.repeat(32)}` };
        },
      } as EthereumPublicClient,
      {
        submission,
        expectedIntentId: 'claim-intent-1',
        signingPayload,
        minimumConfirmations: 12,
      },
    ),
    NakamaEthereumReceiptError,
  );
});
