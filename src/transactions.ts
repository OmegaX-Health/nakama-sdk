import bs58 from 'bs58';
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';

import { OmegaXTransactionDecodeError } from './errors.js';

export type SolanaTransaction = Transaction | VersionedTransaction;

function decodeShortVecLength(
  bytes: Uint8Array,
  offset = 0,
): {
  length: number;
  bytesRead: number;
} {
  let length = 0;
  let size = 0;
  let cursor = offset;
  while (cursor < bytes.length) {
    const value = bytes[cursor] ?? 0;
    length |= (value & 0x7f) << (size * 7);
    size += 1;
    cursor += 1;
    if ((value & 0x80) === 0) {
      return { length, bytesRead: size };
    }
  }
  throw new OmegaXTransactionDecodeError('invalid shortvec length', {
    details: { offset },
  });
}

function versionedStaticAccountKeys(
  transaction: VersionedTransaction,
): PublicKey[] {
  const message = transaction.message as
    | {
        staticAccountKeys?: PublicKey[];
        getAccountKeys?: () => { staticAccountKeys: PublicKey[] };
      }
    | undefined;
  return (
    message?.staticAccountKeys ??
    message?.getAccountKeys?.().staticAccountKeys ??
    []
  );
}

function signatureIsPresent(signature: Uint8Array | null | undefined): boolean {
  if (!signature || signature.length === 0) return false;
  return signature.some((value) => value !== 0);
}

export function decodeSolanaTransaction(
  input: string | Uint8Array | Buffer,
): SolanaTransaction {
  const bytes =
    typeof input === 'string'
      ? Buffer.from(input, 'base64')
      : Buffer.from(input);
  const { length: signatureCount, bytesRead } = decodeShortVecLength(bytes);
  const messageOffset = bytesRead + signatureCount * 64;
  if (messageOffset >= bytes.length) {
    throw new OmegaXTransactionDecodeError('invalid serialized transaction', {
      details: { byteLength: bytes.length, signatureCount, messageOffset },
    });
  }

  const messagePrefix = bytes[messageOffset] ?? 0;
  if ((messagePrefix & 0x80) !== 0) {
    try {
      return VersionedTransaction.deserialize(bytes);
    } catch (error) {
      throw new OmegaXTransactionDecodeError(
        'invalid serialized versioned transaction',
        {
          details: { byteLength: bytes.length },
          cause: error,
        },
      );
    }
  }
  try {
    return Transaction.from(bytes);
  } catch (error) {
    throw new OmegaXTransactionDecodeError(
      'invalid serialized legacy transaction',
      {
        details: { byteLength: bytes.length },
        cause: error,
      },
    );
  }
}

export function serializeSolanaTransaction(
  transaction: SolanaTransaction,
): Buffer {
  if (transaction instanceof Transaction) {
    return transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });
  }
  return Buffer.from(transaction.serialize());
}

export function serializeSolanaTransactionBase64(
  transaction: SolanaTransaction,
): string {
  return serializeSolanaTransaction(transaction).toString('base64');
}

export function solanaTransactionMessageBytes(
  transaction: SolanaTransaction,
): Uint8Array {
  if (transaction instanceof Transaction) {
    return transaction.serializeMessage();
  }
  return transaction.message.serialize();
}

function normalizeSolanaMessageBytesIgnoringRecentBlockhash(
  messageBytes: Uint8Array,
): Uint8Array {
  const normalized = Uint8Array.from(messageBytes);
  const messagePrefix = normalized[0] ?? 0;
  const isVersioned = (messagePrefix & 0x80) !== 0;

  let cursor = isVersioned ? 1 : 0;
  cursor += 3;

  const { length: accountKeyCount, bytesRead } = decodeShortVecLength(
    normalized,
    cursor,
  );
  cursor += bytesRead + accountKeyCount * 32;

  if (cursor + 32 > normalized.length) {
    throw new OmegaXTransactionDecodeError(
      'invalid serialized transaction message',
      {
        details: { byteLength: normalized.length, accountKeyCount, cursor },
      },
    );
  }

  normalized.fill(0, cursor, cursor + 32);
  return normalized;
}

export function solanaTransactionIntentMessageBytes(
  transaction: SolanaTransaction,
): Uint8Array {
  return normalizeSolanaMessageBytesIgnoringRecentBlockhash(
    solanaTransactionMessageBytes(transaction),
  );
}

export function solanaTransactionMessageBase64(
  input: SolanaTransaction | string | Uint8Array | Buffer,
): string {
  const transaction =
    typeof input === 'string' ||
    input instanceof Uint8Array ||
    Buffer.isBuffer(input)
      ? decodeSolanaTransaction(input)
      : input;
  return Buffer.from(solanaTransactionMessageBytes(transaction)).toString(
    'base64',
  );
}

export function solanaTransactionRequiredSigner(
  transaction: SolanaTransaction,
): string | null {
  if (transaction instanceof Transaction) {
    return transaction.feePayer?.toBase58() ?? null;
  }

  const accountKeys = versionedStaticAccountKeys(transaction);
  return accountKeys[0]?.toBase58() ?? null;
}

export function solanaTransactionFirstSignature(
  transaction: SolanaTransaction,
): string | null {
  if (transaction instanceof Transaction) {
    if (transaction.signatures.length === 0) return null;
    const first = transaction.signatures[0];
    if (!signatureIsPresent(first?.signature)) return null;
    return bs58.encode(first.signature as Uint8Array);
  }

  const first = transaction.signatures[0];
  if (!signatureIsPresent(first)) return null;
  return bs58.encode(first);
}

export function solanaTransactionSignerSignature(
  transaction: SolanaTransaction,
  signer: string,
): Uint8Array | null {
  if (transaction instanceof Transaction) {
    const entry = transaction.signatures.find(
      (candidate) => candidate.publicKey.toBase58() === signer,
    );
    return signatureIsPresent(entry?.signature)
      ? (entry?.signature as Uint8Array)
      : null;
  }

  const accountKeys = versionedStaticAccountKeys(transaction);
  const signerIndex = accountKeys.findIndex(
    (candidate) => candidate.toBase58() === signer,
  );
  if (signerIndex < 0) return null;

  const header = (
    transaction.message as { header?: { numRequiredSignatures?: number } }
  ).header;
  const requiredSignerCount = header?.numRequiredSignatures ?? 0;
  if (signerIndex >= requiredSignerCount) {
    return null;
  }

  const signature = transaction.signatures[signerIndex];
  return signatureIsPresent(signature) ? signature : null;
}
