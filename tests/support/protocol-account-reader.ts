import {
  SystemProgram,
  type AccountInfo,
  type Commitment,
  type Connection,
  type PublicKey,
} from '@solana/web3.js';

function createAccountInfo(
  data: Buffer,
  owner: PublicKey,
): AccountInfo<Buffer> {
  return {
    data,
    executable: false,
    lamports: 0,
    owner,
    rentEpoch: 0,
  };
}

export function createAccountReaderConnectionStub(
  accounts: ReadonlyMap<string, Buffer>,
  owner: PublicKey = SystemProgram.programId,
): Connection {
  const connectionStub = {
    async getAccountInfo(pubkey: PublicKey, commitment?: Commitment) {
      void commitment;
      const data = accounts.get(pubkey.toBase58());
      return data ? createAccountInfo(data, owner) : null;
    },
  };

  return connectionStub as unknown as Connection;
}
