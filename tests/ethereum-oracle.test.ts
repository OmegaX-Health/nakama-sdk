import assert from 'node:assert/strict';
import test from 'node:test';
import type { Address, Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import {
  InMemoryClaimRecipientReplayGuard,
  createClaimRecipientAuthorizationSigningPayload,
  createClaimRecipientAuthorizationTypedData,
  verifyAndConsumeClaimRecipientAuthorization,
  verifyClaimRecipientAuthorization,
  type ClaimRecipientAuthorizationMessage,
  type ClaimRecipientAuthorizationTypedData,
} from '../src/ethereum_oracle.js';
import type { EthereumPublicClient } from '../src/ethereum.js';
import {
  NakamaEthereumAttestationError,
  NakamaEthereumReplayError,
} from '../src/errors.js';

const CLAIMANT = privateKeyToAccount(`0x${'01'.padStart(64, '0')}` as Hex);
const CONTRACT = '0x0000000000000000000000000000000000000010';
const RECIPIENT = '0x0000000000000000000000000000000000000020';
const NOW = 1_800_000_000n;

function message(overrides: Partial<ClaimRecipientAuthorizationMessage> = {}) {
  return {
    claimId: `0x${'11'.repeat(32)}` as Hex,
    recipient: RECIPIENT as Address,
    nonce: 7n,
    deadline: NOW + 300n,
    ...overrides,
  };
}

async function signedTypedData(
  overrides: Partial<ClaimRecipientAuthorizationMessage> = {},
) {
  const typedData = createClaimRecipientAuthorizationTypedData({
    verifyingContract: CONTRACT,
    message: message(overrides),
  });
  const signature = await CLAIMANT.signTypedData(typedData);
  return { typedData, signature };
}

test('claim-recipient authorization matches the contract EIP-712 domain and type', () => {
  const payload = createClaimRecipientAuthorizationSigningPayload({
    account: CLAIMANT.address,
    verifyingContract: CONTRACT,
    message: message(),
  });
  assert.equal(payload.version, 2);
  assert.equal(payload.kind, 'typed_data');
  assert.equal(payload.chainId, 'eip155:1');
  assert.equal(payload.accountId, `eip155:1:${CLAIMANT.address}`);
  assert.deepEqual(payload.typedData.domain, {
    name: 'Nakama Policy Registry',
    version: '1',
    chainId: 1,
    verifyingContract: CONTRACT,
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
  assert.equal(payload.typedData.primaryType, 'ClaimRecipient');
  assert.throws(() => {
    (
      payload.typedData.types.ClaimRecipient[0] as {
        name: string;
        type: string;
      }
    ).type = 'address';
  }, TypeError);
});

test('claim-recipient verification binds claimant, contract, nonce, and deadline', async () => {
  const { typedData, signature } = await signedTypedData();
  const verified = await verifyClaimRecipientAuthorization({
    typedData,
    signature,
    expectedClaimant: CLAIMANT.address,
    expectedVerifyingContract: CONTRACT,
    expectedNonce: 7n,
    now: NOW,
  });
  assert.equal(verified.claimant, CLAIMANT.address);
  assert.match(verified.digest, /^0x[0-9a-f]{64}$/i);

  await assert.rejects(
    verifyClaimRecipientAuthorization({
      typedData,
      signature,
      expectedClaimant: CLAIMANT.address,
      expectedVerifyingContract: CONTRACT,
      expectedNonce: 8n,
      now: NOW,
    }),
    NakamaEthereumAttestationError,
  );
});

test('claim-recipient verification rejects wrong-chain and expired payloads', async () => {
  const valid = await signedTypedData();
  const wrongChain = {
    ...valid.typedData,
    domain: { ...valid.typedData.domain, chainId: 10 },
  } as unknown as ClaimRecipientAuthorizationTypedData;

  await assert.rejects(
    verifyClaimRecipientAuthorization({
      typedData: wrongChain,
      signature: valid.signature,
      expectedClaimant: CLAIMANT.address,
      expectedVerifyingContract: CONTRACT,
      expectedNonce: 7n,
      now: NOW,
    }),
    NakamaEthereumAttestationError,
  );

  const expired = await signedTypedData({ deadline: NOW - 1n });
  await assert.rejects(
    verifyClaimRecipientAuthorization({
      typedData: expired.typedData,
      signature: expired.signature,
      expectedClaimant: CLAIMANT.address,
      expectedVerifyingContract: CONTRACT,
      expectedNonce: 7n,
      now: NOW,
    }),
    /expired/,
  );
});

test('atomic replay guard blocks digest replay and claim nonce reuse', async () => {
  const replayGuard = new InMemoryClaimRecipientReplayGuard();
  const first = await signedTypedData();
  const options = {
    ...first,
    expectedClaimant: CLAIMANT.address,
    expectedVerifyingContract: CONTRACT,
    expectedNonce: 7n,
    now: NOW,
    replayGuard,
  };

  await verifyAndConsumeClaimRecipientAuthorization(options);
  await assert.rejects(
    verifyAndConsumeClaimRecipientAuthorization(options),
    NakamaEthereumReplayError,
  );

  const sameNonceDifferentRecipient = await signedTypedData({
    recipient: '0x0000000000000000000000000000000000000030',
  });
  await assert.rejects(
    verifyAndConsumeClaimRecipientAuthorization({
      ...sameNonceDifferentRecipient,
      expectedClaimant: CLAIMANT.address,
      expectedVerifyingContract: CONTRACT,
      expectedNonce: 7n,
      now: NOW,
      replayGuard,
    }),
    NakamaEthereumReplayError,
  );
});

test('ERC-1271 claimant signatures require and use a mainnet public client', async () => {
  const typedData = createClaimRecipientAuthorizationTypedData({
    verifyingContract: CONTRACT,
    message: message(),
  });
  const smartWallet = '0x0000000000000000000000000000000000000040';
  const validContractSignature = `0x${'12'.repeat(32)}` as Hex;
  const client = {
    async getChainId() {
      return 1;
    },
    async verifyTypedData(args: { signature: Hex }) {
      return args.signature === validContractSignature;
    },
  } as unknown as EthereumPublicClient;

  const verified = await verifyClaimRecipientAuthorization({
    typedData,
    signature: validContractSignature,
    expectedClaimant: smartWallet,
    expectedVerifyingContract: CONTRACT,
    expectedNonce: 7n,
    now: NOW,
    client,
  });
  assert.equal(verified.claimant, smartWallet);

  await assert.rejects(
    verifyClaimRecipientAuthorization({
      typedData,
      signature: `0x${'ab'.repeat(32)}`,
      expectedClaimant: smartWallet,
      expectedVerifyingContract: CONTRACT,
      expectedNonce: 7n,
      now: NOW,
      client,
    }),
    /not valid for the expected claimant/,
  );
});
