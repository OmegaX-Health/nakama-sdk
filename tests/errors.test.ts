import test from 'node:test';
import assert from 'node:assert/strict';
import { PublicKey, type AccountInfo, type Commitment } from '@solana/web3.js';

import {
  OmegaXAccountNotFoundError,
  OmegaXAccountOwnerMismatchError,
  OmegaXConfigError,
  OmegaXInvalidPublicKeyError,
  OmegaXProgramMismatchError,
  OmegaXTokenAccountPreflightError,
  OmegaXTransactionDecodeError,
  createConnection,
  createProtocolClient,
  decodeSolanaTransaction,
  getProgramId,
  preflightClassicTokenAccount,
  toPublicKey,
} from '../src/index.js';

const SPL_TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
);

function createTokenAccountData(params: {
  mint: PublicKey;
  owner: PublicKey;
}): Buffer {
  const data = Buffer.alloc(72);
  params.mint.toBuffer().copy(data, 0);
  params.owner.toBuffer().copy(data, 32);
  return data;
}

function createTokenAccountInfo(params: {
  mint: PublicKey;
  owner: PublicKey;
  accountOwner?: PublicKey;
}): AccountInfo<Buffer> {
  return {
    data: createTokenAccountData(params),
    executable: false,
    lamports: 0,
    owner: params.accountOwner ?? SPL_TOKEN_PROGRAM_ID,
    rentEpoch: 0,
  };
}

test('typed errors expose stable codes, details, and causes', () => {
  const cause = new Error('source failure');
  const error = new OmegaXConfigError('bad config', {
    details: { setting: 'network' },
    cause,
  });

  assert(error instanceof Error);
  assert(error instanceof OmegaXConfigError);
  assert.equal(error.name, 'OmegaXConfigError');
  assert.equal(error.code, 'OMEGAX_CONFIG_ERROR');
  assert.deepEqual(error.details, { setting: 'network' });
  assert.equal(error.cause, cause);
});

test('public key normalization throws an actionable typed error', () => {
  assert.throws(
    () => toPublicKey('not-a-public-key'),
    (error) =>
      error instanceof OmegaXInvalidPublicKeyError &&
      error.code === 'OMEGAX_INVALID_PUBLIC_KEY' &&
      error.details?.value === 'not-a-public-key',
  );
});

test('network helpers throw typed config errors', () => {
  assert.throws(
    () => createConnection({ network: 'testnet' as never }),
    (error) =>
      error instanceof OmegaXConfigError &&
      error.code === 'OMEGAX_CONFIG_ERROR' &&
      error.details?.network === 'testnet',
  );
});

test('custom program ID guard throws a typed program mismatch error', () => {
  const client = createProtocolClient(
    createConnection('http://127.0.0.1:8899'),
  );
  assert.throws(
    () =>
      client.buildInstruction({
        instructionName: 'initialize_protocol_governance',
        programId: PublicKey.unique(),
        args: {},
        accounts: {},
      }),
    (error) =>
      error instanceof OmegaXProgramMismatchError &&
      error.code === 'OMEGAX_PROGRAM_MISMATCH' &&
      error.details?.expectedProgramId === getProgramId().toBase58(),
  );
});

test('transaction decoding throws a typed decode error', () => {
  assert.throws(
    () => decodeSolanaTransaction(Buffer.from([0])),
    (error) =>
      error instanceof OmegaXTransactionDecodeError &&
      error.code === 'OMEGAX_TRANSACTION_DECODE',
  );
});

test('token account preflight exposes account-not-found and mismatch errors', async () => {
  const tokenAccount = PublicKey.unique();
  const mint = PublicKey.unique();
  const owner = PublicKey.unique();
  const wrongMint = PublicKey.unique();
  const accounts = new Map<string, AccountInfo<Buffer>>([
    [
      tokenAccount.toBase58(),
      createTokenAccountInfo({
        mint: wrongMint,
        owner,
      }),
    ],
  ]);
  const connection = {
    async getAccountInfo(pubkey: PublicKey, commitment?: Commitment) {
      void commitment;
      return accounts.get(pubkey.toBase58()) ?? null;
    },
  };

  await assert.rejects(
    preflightClassicTokenAccount({
      connection: connection as never,
      tokenAccountAddress: PublicKey.unique(),
      mintAddress: mint,
      ownerAddress: owner,
    }),
    (error) =>
      error instanceof OmegaXAccountNotFoundError &&
      error.code === 'OMEGAX_ACCOUNT_NOT_FOUND',
  );

  await assert.rejects(
    preflightClassicTokenAccount({
      connection: connection as never,
      tokenAccountAddress: tokenAccount,
      mintAddress: mint,
      ownerAddress: owner,
    }),
    (error) =>
      error instanceof OmegaXTokenAccountPreflightError &&
      error.code === 'OMEGAX_TOKEN_ACCOUNT_PREFLIGHT' &&
      error.details?.expectedMint === mint.toBase58(),
  );
});

test('token account owner mismatch uses a dedicated typed error', async () => {
  const tokenAccount = PublicKey.unique();
  const mint = PublicKey.unique();
  const owner = PublicKey.unique();
  const accounts = new Map<string, AccountInfo<Buffer>>([
    [
      tokenAccount.toBase58(),
      createTokenAccountInfo({
        mint,
        owner,
        accountOwner: PublicKey.unique(),
      }),
    ],
  ]);
  const connection = {
    async getAccountInfo(pubkey: PublicKey, commitment?: Commitment) {
      void commitment;
      return accounts.get(pubkey.toBase58()) ?? null;
    },
  };

  await assert.rejects(
    preflightClassicTokenAccount({
      connection: connection as never,
      tokenAccountAddress: tokenAccount,
      mintAddress: mint,
      ownerAddress: owner,
    }),
    (error) =>
      error instanceof OmegaXAccountOwnerMismatchError &&
      error.code === 'OMEGAX_ACCOUNT_OWNER_MISMATCH',
  );
});
