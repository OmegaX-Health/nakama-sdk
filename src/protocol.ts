import BN from 'bn.js';
import { BorshCoder } from '@coral-xyz/anchor';
import {
  AddressLookupTableAccount,
  type AccountInfo,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';

import protocolIdl from './generated/omegax_protocol.idl.json' with { type: 'json' };
import {
  CLAIM_ATTESTATION_DECISION_ABSTAIN,
  CLAIM_ATTESTATION_DECISION_REQUEST_REVIEW,
  CLAIM_ATTESTATION_DECISION_SUPPORT_APPROVE,
  CLAIM_ATTESTATION_DECISION_SUPPORT_DENY,
  NATIVE_SOL_MINT,
} from './protocol_models.js';
import {
  PROTOCOL_ACCOUNT_DISCRIMINATORS,
  PROTOCOL_INSTRUCTION_ACCOUNTS,
  PROTOCOL_INSTRUCTION_DISCRIMINATORS,
  PROTOCOL_PROGRAM_ID,
  type ProtocolInstructionAccount,
  type ProtocolInstructionName,
} from './generated/protocol_contract.js';
import type {
  BuildInstructionParams,
  BuildTransactionParams,
  GenericInstructionAccounts,
  ProtocolAccountName,
  ProtocolClient,
  PublicKeyish,
} from './generated/protocol_types.js';
import {
  deriveAllocationLedgerPda,
  deriveAllocationPositionPda,
  deriveClaimAttestationPda,
  deriveClaimCasePda,
  deriveCommitmentCampaignPda,
  deriveCommitmentLedgerPda,
  deriveCommitmentPaymentRailPda,
  deriveCommitmentPositionPda,
  deriveDomainAssetLedgerPda,
  deriveDomainAssetVaultTokenAccountPda,
  deriveDomainAssetVaultPda,
  deriveFundingLineLedgerPda,
  deriveFundingLinePda,
  deriveLpPositionPda,
  deriveMemberPositionPda,
  deriveMembershipAnchorSeatPda,
  deriveOracleProfilePda,
  deriveObligationPda,
  deriveOutcomeSchemaPda,
  derivePlanReserveLedgerPda,
  derivePoolOracleApprovalPda,
  derivePoolOracleFeeVaultPda,
  derivePoolOraclePermissionSetPda,
  derivePoolOraclePolicyPda,
  derivePoolTreasuryVaultPda,
  deriveSchemaDependencyLedgerPda,
  deriveProtocolFeeVaultPda,
  deriveProtocolGovernancePda,
  derivePoolClassLedgerPda,
  derivePolicySeriesPda,
  deriveReserveAssetRailPda,
  deriveReserveDomainPda,
  deriveSeriesReserveLedgerPda,
  getProgramId,
  toPublicKey,
  ZERO_PUBKEY_KEY,
} from './protocol_seeds.js';

type IdlField = { name: string; type: IdlType };
type IdlType =
  | string
  | { option: IdlType }
  | { vec: IdlType }
  | { array: [IdlType, number] }
  | { defined: { name: string } };

type IdlStruct = {
  kind: 'struct';
  fields?: IdlField[];
};

type IdlTypeEntry = {
  name: string;
  type: IdlStruct;
};

type IdlInstructionEntry = {
  name: string;
  args?: Array<{
    name: string;
    type: IdlType;
  }>;
};

const CODER = new BorshCoder(protocolIdl as never);
const ZERO_HASH_HEX = '00'.repeat(32);
const SPL_TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
);
export const UNSAFE_CUSTOM_PROGRAM_ID_ENV =
  'OMEGAX_SDK_UNSAFE_ALLOW_CUSTOM_PROGRAM_ID';
const TYPE_BY_NAME = new Map<string, IdlStruct>(
  ((protocolIdl as { types?: IdlTypeEntry[] }).types ?? []).map((entry) => [
    entry.name,
    entry.type,
  ]),
);
const ARG_TYPE_BY_INSTRUCTION = new Map<string, IdlType | null>(
  (
    (protocolIdl as { instructions?: IdlInstructionEntry[] }).instructions ?? []
  ).map((instruction) => [
    instruction.name,
    instruction.args?.[0]?.type ?? null,
  ]),
);

function classicTokenProgramId(
  tokenProgramId?: PublicKeyish | null,
): PublicKey {
  const candidate = toPublicKey(tokenProgramId ?? SPL_TOKEN_PROGRAM_ID);
  if (!candidate.equals(SPL_TOKEN_PROGRAM_ID)) {
    throw new Error(
      'OmegaX Protocol v1 supports only the classic SPL Token program.',
    );
  }
  return candidate;
}

function unsafeCustomProgramIdAllowed(explicitFlag?: boolean): boolean {
  const envValue = String(process.env[UNSAFE_CUSTOM_PROGRAM_ID_ENV] ?? '')
    .trim()
    .toLowerCase();
  return (
    explicitFlag === true ||
    envValue === '1' ||
    envValue === 'true' ||
    process.env.NODE_ENV === 'test'
  );
}

function resolveProgramIdForBuild(params: {
  programId?: PublicKeyish;
  unsafeAllowCustomProgramId?: boolean;
}): PublicKey {
  const resolved = toPublicKey(params.programId ?? PROTOCOL_PROGRAM_ID);
  const canonical = toPublicKey(PROTOCOL_PROGRAM_ID);
  if (
    !resolved.equals(canonical) &&
    !unsafeCustomProgramIdAllowed(params.unsafeAllowCustomProgramId)
  ) {
    throw new Error(
      `custom programId ${resolved.toBase58()} is unsafe for production SDK flows; set unsafeAllowCustomProgramId or ${UNSAFE_CUSTOM_PROGRAM_ID_ENV}=1 only for devnet/localnet/test workflows`,
    );
  }
  return resolved;
}

export const PROTOCOL_IDL_VERSION = ((
  protocolIdl as { metadata?: { version?: string }; version?: string }
).metadata?.version ??
  (protocolIdl as { version?: string }).version ??
  'unknown') as string;

export {
  CLAIM_ATTESTATION_DECISION_ABSTAIN,
  CLAIM_ATTESTATION_DECISION_REQUEST_REVIEW,
  CLAIM_ATTESTATION_DECISION_SUPPORT_APPROVE,
  CLAIM_ATTESTATION_DECISION_SUPPORT_DENY,
} from './protocol_models.js';

function pascalCase(value: string): string {
  return value
    .split('_')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');
}

function snakeToCamel(value: string): string {
  return value.replace(/_([a-z])/g, (_match, letter: string) =>
    letter.toUpperCase(),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isBnLike(
  value: unknown,
): value is { toString: (radix?: number) => string } {
  return (
    value !== null &&
    typeof value === 'object' &&
    (value as { constructor?: { name?: string } }).constructor?.name === 'BN' &&
    typeof (value as { toString?: unknown }).toString === 'function'
  );
}

function integerBounds(
  bits: number,
  signed: boolean,
): { min: bigint; max: bigint } {
  if (signed) {
    return {
      min: -(1n << BigInt(bits - 1)),
      max: (1n << BigInt(bits - 1)) - 1n,
    };
  }
  return {
    min: 0n,
    max: (1n << BigInt(bits)) - 1n,
  };
}

function normalizeIntegerInput(
  value: unknown,
  params: { bits: number; signed: boolean; label: string },
): bigint {
  let bigintValue: bigint;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const decimalPattern = params.signed ? /^-?\d+$/ : /^\d+$/;
    if (!decimalPattern.test(trimmed)) {
      throw new Error(`${params.label} must be a decimal integer string`);
    }
    bigintValue = BigInt(trimmed);
  } else if (value instanceof BN || isBnLike(value)) {
    bigintValue = BigInt(value.toString(10));
  } else if (typeof value === 'bigint') {
    bigintValue = value;
  } else if (typeof value === 'number') {
    if (!Number.isInteger(value) || !Number.isSafeInteger(value)) {
      throw new Error(`${params.label} must be a safe integer number`);
    }
    bigintValue = BigInt(value);
  } else {
    throw new Error(`${params.label} must be an integer`);
  }

  const { min, max } = integerBounds(params.bits, params.signed);
  if (bigintValue < min || bigintValue > max) {
    throw new Error(
      `${params.label} is outside ${params.signed ? 'signed' : 'unsigned'} ${params.bits}-bit range`,
    );
  }
  return bigintValue;
}

function hasAnyAccountScopeValue(
  values: Array<unknown | null | undefined>,
): boolean {
  return values.some((value) => value !== undefined && value !== null);
}

function assertAllOrNoneAccountScope(
  label: string,
  fields: Record<string, unknown | null | undefined>,
): void {
  const present = Object.entries(fields).filter(
    ([, value]) => value !== undefined && value !== null,
  );
  if (present.length > 0 && present.length !== Object.keys(fields).length) {
    throw new Error(
      `${label} account scope must include ${Object.keys(fields).join(', ')} together`,
    );
  }
}

function readFieldValue(
  record: Record<string, unknown>,
  fieldName: string,
): unknown {
  if (fieldName in record) {
    return record[fieldName];
  }

  const camelName = snakeToCamel(fieldName);
  if (camelName in record) {
    return record[camelName];
  }

  return undefined;
}

function requireStruct(typeName: string): IdlStruct {
  const type = TYPE_BY_NAME.get(typeName);
  if (!type || type.kind !== 'struct') {
    throw new Error(
      `Unsupported or missing IDL struct definition for ${typeName}`,
    );
  }
  return type;
}

function normalizeHex32(value: string, label: string): string {
  const normalized = value.trim().toLowerCase().replace(/^0x/, '');
  if (!/^[0-9a-f]{64}$/.test(normalized)) {
    throw new Error(`${label} must be a 32-byte hex string`);
  }
  return normalized;
}

function hexToFixedBytes(value: string, label: string): Uint8Array {
  return Uint8Array.from(Buffer.from(normalizeHex32(value, label), 'hex'));
}

function normalizeOptionalHex32(value?: string | null): string {
  const trimmed = value?.trim();
  if (!trimmed) return ZERO_HASH_HEX;
  return normalizeHex32(trimmed, 'hex value');
}

function normalizeInputValue(
  type: IdlType,
  value: unknown,
  label = 'instruction argument',
): unknown {
  if (typeof type === 'string') {
    switch (type) {
      case 'pubkey':
        return toPublicKey(value as PublicKeyish);
      case 'u64':
        return new BN(
          normalizeIntegerInput(value, {
            bits: 64,
            signed: false,
            label,
          }).toString(),
        );
      case 'i64':
        return new BN(
          normalizeIntegerInput(value, {
            bits: 64,
            signed: true,
            label,
          }).toString(),
        );
      case 'u8':
        return Number(
          normalizeIntegerInput(value, {
            bits: 8,
            signed: false,
            label,
          }),
        );
      case 'u16':
        return Number(
          normalizeIntegerInput(value, {
            bits: 16,
            signed: false,
            label,
          }),
        );
      case 'u32':
        return Number(
          normalizeIntegerInput(value, {
            bits: 32,
            signed: false,
            label,
          }),
        );
      case 'bool':
        if (typeof value !== 'boolean') {
          throw new Error(`${label} must be a boolean`);
        }
        return value;
      case 'string':
        if (typeof value !== 'string') {
          throw new Error(`${label} must be a string`);
        }
        return value;
      default:
        return value;
    }
  }

  if ('array' in type) {
    const [innerType, expectedLength] = type.array;
    if (!(value instanceof Uint8Array) && !Array.isArray(value)) {
      throw new Error(`${label} must be a fixed array`);
    }
    const raw =
      value instanceof Uint8Array
        ? [...value]
        : Array.isArray(value)
          ? value
          : [];
    if (raw.length !== expectedLength) {
      throw new Error(
        `${label} must be a fixed array of length ${expectedLength}`,
      );
    }
    if (innerType === 'u8') {
      return raw.map((entry, index) =>
        Number(
          normalizeIntegerInput(entry, {
            bits: 8,
            signed: false,
            label: `${label}[${index}]`,
          }),
        ),
      );
    }
    return raw.map((entry, index) =>
      normalizeInputValue(innerType, entry, `${label}[${index}]`),
    );
  }

  if ('option' in type) {
    if (value === null || value === undefined) return null;
    return normalizeInputValue(type.option, value, label);
  }

  if ('vec' in type) {
    if (!Array.isArray(value)) {
      throw new Error(`${label} must be an array`);
    }
    return value.map((entry, index) =>
      normalizeInputValue(type.vec, entry, `${label}[${index}]`),
    );
  }

  if ('defined' in type) {
    const struct = requireStruct(type.defined.name);
    if (!isRecord(value)) {
      throw new Error(`${label} must be an object`);
    }
    const record = value;
    const normalized: Record<string, unknown> = {};

    for (const field of struct.fields ?? []) {
      normalized[field.name] = normalizeInputValue(
        field.type,
        readFieldValue(record, field.name),
        `${label}.${field.name}`,
      );
    }

    return normalized;
  }

  return value;
}

function normalizeDecodedValue(type: IdlType, value: unknown): unknown {
  if (typeof type === 'string') {
    switch (type) {
      case 'pubkey':
        return value instanceof PublicKey
          ? value.toBase58()
          : String(value ?? '');
      case 'u64':
      case 'i64':
        if (typeof value === 'bigint') return value;
        if (typeof value === 'number') return BigInt(Math.trunc(value));
        if (typeof value === 'string') return BigInt(value);
        if (isBnLike(value)) return BigInt(value.toString(10));
        return 0n;
      default:
        return value;
    }
  }

  if ('array' in type) {
    if (value instanceof Uint8Array) {
      return value;
    }
    if (Array.isArray(value)) {
      return Uint8Array.from(
        value.map((entry) =>
          typeof entry === 'number'
            ? entry
            : Number(normalizeDecodedValue(type.array[0], entry)),
        ),
      );
    }
    return new Uint8Array();
  }

  if ('option' in type) {
    if (value === null || value === undefined) return null;
    return normalizeDecodedValue(type.option, value);
  }

  if ('vec' in type) {
    return Array.isArray(value)
      ? value.map((entry) => normalizeDecodedValue(type.vec, entry))
      : [];
  }

  if ('defined' in type) {
    const struct = requireStruct(type.defined.name);
    const record = isRecord(value) ? value : {};
    const normalized: Record<string, unknown> = {};

    for (const field of struct.fields ?? []) {
      normalized[field.name] = normalizeDecodedValue(
        field.type,
        readFieldValue(record, field.name),
      );
    }

    return normalized;
  }

  return value;
}

function resolveInstructionAccounts(
  instructionName: ProtocolInstructionName,
  accounts: GenericInstructionAccounts,
  programId: PublicKeyish,
): Array<{ pubkey: PublicKey; isSigner: boolean; isWritable: boolean }> {
  return (PROTOCOL_INSTRUCTION_ACCOUNTS[instructionName] ?? []).flatMap(
    (
      account,
    ): Array<{ pubkey: PublicKey; isSigner: boolean; isWritable: boolean }> => {
      if (account.address) {
        return [
          {
            pubkey: new PublicKey(account.address),
            isSigner: account.signer,
            isWritable: account.writable,
          },
        ];
      }

      const value = accounts[account.name];
      if (value === undefined || value === null) {
        if (account.optional) {
          return [
            {
              pubkey: toPublicKey(programId),
              isSigner: false,
              isWritable: false,
            },
          ];
        }
        throw new Error(
          `Missing required account "${account.name}" for instruction ${instructionName}`,
        );
      }

      return [
        {
          pubkey: toPublicKey(value),
          isSigner: account.signer,
          isWritable: account.writable,
        },
      ];
    },
  );
}

function inferFeePayer(
  instructionName: ProtocolInstructionName,
  accounts: GenericInstructionAccounts,
): PublicKey {
  const signer = (PROTOCOL_INSTRUCTION_ACCOUNTS[instructionName] ?? []).find(
    (account) => account.signer && !account.address,
  );
  if (!signer) {
    throw new Error(
      `Unable to infer fee payer for ${instructionName}. Pass feePayer explicitly.`,
    );
  }

  const signerAddress = accounts[signer.name];
  if (!signerAddress) {
    throw new Error(
      `Unable to infer fee payer for ${instructionName}: signer account "${signer.name}" is missing.`,
    );
  }

  return toPublicKey(signerAddress);
}

export function getProtocolIdl() {
  return protocolIdl;
}

export function listProtocolInstructionNames(): ProtocolInstructionName[] {
  return Object.keys(
    PROTOCOL_INSTRUCTION_DISCRIMINATORS,
  ) as ProtocolInstructionName[];
}

export function listProtocolInstructionAccounts(
  instructionName: ProtocolInstructionName,
): ProtocolInstructionAccount[] {
  return PROTOCOL_INSTRUCTION_ACCOUNTS[instructionName] ?? [];
}

export function listProtocolAccountNames(): ProtocolAccountName[] {
  return Object.keys(
    PROTOCOL_ACCOUNT_DISCRIMINATORS,
  ).sort() as ProtocolAccountName[];
}

export async function accountExists(
  connection: Connection,
  address: PublicKeyish,
): Promise<boolean> {
  const info = await connection.getAccountInfo(
    toPublicKey(address),
    'confirmed',
  );
  return info !== null;
}

export function decodeProtocolAccount<T = Record<string, unknown>>(
  accountName: ProtocolAccountName,
  data: Buffer | Uint8Array,
): T {
  const decoded = CODER.accounts.decode(
    accountName,
    Buffer.from(data),
  ) as unknown;
  const normalized = normalizeDecodedValue(
    { defined: { name: accountName } },
    decoded,
  );
  return normalized as T;
}

function decodeFetchedProtocolAccount<T = Record<string, unknown>>(
  accountName: ProtocolAccountName,
  address: PublicKey,
  info: AccountInfo<Buffer>,
  programId: PublicKey,
): T {
  if (!info.owner.equals(programId)) {
    throw new Error(
      `Account ${address.toBase58()} for ${accountName} is owned by ${info.owner.toBase58()}, not OmegaX Protocol program ${programId.toBase58()}.`,
    );
  }
  return decodeProtocolAccount<T>(accountName, info.data);
}

function attachProtocolTransactionMetadata(
  transaction: Transaction,
  params: {
    programId: PublicKey;
    unsafeAllowCustomProgramId?: boolean;
  },
): Transaction {
  Object.defineProperty(transaction, 'omegaxProtocolMetadata', {
    value: {
      programId: params.programId.toBase58(),
      canonicalProgramId: toPublicKey(PROTOCOL_PROGRAM_ID).toBase58(),
      unsafeCustomProgramId: !params.programId.equals(
        toPublicKey(PROTOCOL_PROGRAM_ID),
      ),
      unsafeAllowCustomProgramId:
        params.unsafeAllowCustomProgramId === true ||
        unsafeCustomProgramIdAllowed(),
    },
    enumerable: true,
    configurable: false,
    writable: false,
  });
  return transaction;
}

export function buildProtocolInstruction(
  params: BuildInstructionParams<
    Record<string, unknown>,
    GenericInstructionAccounts
  > & {
    instructionName: ProtocolInstructionName;
    unsafeAllowCustomProgramId?: boolean;
  },
): TransactionInstruction {
  const instructionArgsType = ARG_TYPE_BY_INSTRUCTION.get(
    params.instructionName,
  );
  const normalizedArgs = instructionArgsType
    ? { args: normalizeInputValue(instructionArgsType, params.args) }
    : {};

  const encoded = CODER.instruction.encode(
    params.instructionName,
    normalizedArgs,
  );

  const resolvedProgramId = resolveProgramIdForBuild({
    programId: params.programId,
    unsafeAllowCustomProgramId: params.unsafeAllowCustomProgramId,
  });

  return new TransactionInstruction({
    programId: resolvedProgramId,
    keys: resolveInstructionAccounts(
      params.instructionName,
      params.accounts,
      resolvedProgramId,
    ),
    data: Buffer.from(encoded),
  });
}

export function buildProtocolTransaction(
  params: BuildTransactionParams<
    Record<string, unknown>,
    GenericInstructionAccounts
  > & {
    instructionName: ProtocolInstructionName;
    unsafeAllowCustomProgramId?: boolean;
  },
): Transaction {
  const resolvedProgramId = resolveProgramIdForBuild({
    programId: params.programId,
    unsafeAllowCustomProgramId: params.unsafeAllowCustomProgramId,
  });
  const transaction = new Transaction({
    feePayer: params.feePayer
      ? toPublicKey(params.feePayer)
      : inferFeePayer(params.instructionName, params.accounts),
    recentBlockhash: params.recentBlockhash,
  });

  for (const instruction of params.prependInstructions ?? []) {
    transaction.add(instruction);
  }

  transaction.add(
    buildProtocolInstruction({
      instructionName: params.instructionName,
      args: params.args,
      accounts: params.accounts,
      programId: resolvedProgramId,
      unsafeAllowCustomProgramId: params.unsafeAllowCustomProgramId,
    }),
  );

  for (const instruction of params.appendInstructions ?? []) {
    transaction.add(instruction);
  }

  return attachProtocolTransactionMetadata(transaction, {
    programId: resolvedProgramId,
    unsafeAllowCustomProgramId: params.unsafeAllowCustomProgramId,
  });
}

function buildConvenienceTransaction(params: {
  instructionName: ProtocolInstructionName;
  feePayer: PublicKeyish;
  recentBlockhash: string;
  args: Record<string, unknown>;
  accounts: GenericInstructionAccounts;
  programId?: PublicKeyish;
  unsafeAllowCustomProgramId?: boolean;
}): Transaction {
  return buildProtocolTransaction({
    instructionName: params.instructionName,
    args: params.args,
    accounts: params.accounts,
    feePayer: params.feePayer,
    recentBlockhash: params.recentBlockhash,
    programId: params.programId,
    unsafeAllowCustomProgramId: params.unsafeAllowCustomProgramId,
  });
}

export type ProtocolInstructionAccountInput = {
  pubkey?: PublicKeyish | null;
  isSigner?: boolean;
  isWritable?: boolean;
};

function normalizeOrderedInstructionAccounts(
  accounts: ProtocolInstructionAccountInput[],
  programId: PublicKeyish = PROTOCOL_PROGRAM_ID,
): Array<{ pubkey: PublicKey; isSigner: boolean; isWritable: boolean }> {
  return accounts.map((account) => {
    const pubkey = toPublicKey(account.pubkey ?? programId);
    return {
      pubkey,
      isSigner: account.pubkey ? Boolean(account.isSigner) : false,
      isWritable: account.pubkey ? Boolean(account.isWritable) : false,
    };
  });
}

function buildOrderedInstruction(params: {
  instructionName: ProtocolInstructionName;
  args: Record<string, unknown>;
  accounts: ProtocolInstructionAccountInput[];
  programId?: PublicKeyish;
  unsafeAllowCustomProgramId?: boolean;
}): TransactionInstruction {
  const instructionArgsType = ARG_TYPE_BY_INSTRUCTION.get(
    params.instructionName,
  );
  const normalizedArgs = instructionArgsType
    ? { args: normalizeInputValue(instructionArgsType, params.args) }
    : {};

  const encoded = CODER.instruction.encode(
    params.instructionName,
    normalizedArgs,
  );

  const resolvedProgramId = resolveProgramIdForBuild({
    programId: params.programId,
    unsafeAllowCustomProgramId: params.unsafeAllowCustomProgramId,
  });

  return new TransactionInstruction({
    programId: resolvedProgramId,
    keys: normalizeOrderedInstructionAccounts(
      params.accounts,
      resolvedProgramId,
    ),
    data: Buffer.from(encoded),
  });
}

function buildOrderedTransaction(params: {
  feePayer: PublicKeyish;
  recentBlockhash: string;
  instructionName: ProtocolInstructionName;
  args: Record<string, unknown>;
  accounts: ProtocolInstructionAccountInput[];
  programId?: PublicKeyish;
  unsafeAllowCustomProgramId?: boolean;
}): Transaction {
  const resolvedProgramId = resolveProgramIdForBuild({
    programId: params.programId,
    unsafeAllowCustomProgramId: params.unsafeAllowCustomProgramId,
  });
  const transaction = new Transaction({
    feePayer: toPublicKey(params.feePayer),
    recentBlockhash: params.recentBlockhash,
  }).add(
    buildOrderedInstruction({
      instructionName: params.instructionName,
      args: params.args,
      accounts: params.accounts,
      programId: resolvedProgramId,
      unsafeAllowCustomProgramId: params.unsafeAllowCustomProgramId,
    }),
  );
  return attachProtocolTransactionMetadata(transaction, {
    programId: resolvedProgramId,
    unsafeAllowCustomProgramId: params.unsafeAllowCustomProgramId,
  });
}

function optionalProtocolAccount(
  pubkey?: PublicKeyish | null,
  isWritable = false,
  isSigner = false,
): ProtocolInstructionAccountInput {
  return pubkey
    ? { pubkey, isWritable, isSigner }
    : { pubkey: undefined, isWritable: false };
}

function optionalSeriesReserveLedgerAccount(
  policySeriesAddress: PublicKeyish | null | undefined,
  assetMint: PublicKeyish | null | undefined,
  programId?: PublicKeyish,
): ProtocolInstructionAccountInput {
  if (!policySeriesAddress || !assetMint) return optionalProtocolAccount();
  return optionalProtocolAccount(
    deriveSeriesReserveLedgerPda({
      policySeries: policySeriesAddress,
      assetMint,
      programId,
    }),
    true,
  );
}

function optionalPoolClassLedgerAccount(
  capitalClassAddress: PublicKeyish | null | undefined,
  poolAssetMint: PublicKeyish | null | undefined,
  programId?: PublicKeyish,
): ProtocolInstructionAccountInput {
  if (!capitalClassAddress || !poolAssetMint) return optionalProtocolAccount();
  return optionalProtocolAccount(
    derivePoolClassLedgerPda({
      capitalClass: capitalClassAddress,
      assetMint: poolAssetMint,
      programId,
    }),
    true,
  );
}

function optionalAllocationLedgerAccount(
  allocationPositionAddress: PublicKeyish | null | undefined,
  assetMint: PublicKeyish | null | undefined,
  programId?: PublicKeyish,
): ProtocolInstructionAccountInput {
  if (!allocationPositionAddress || !assetMint)
    return optionalProtocolAccount();
  return optionalProtocolAccount(
    deriveAllocationLedgerPda({
      allocationPosition: allocationPositionAddress,
      assetMint,
      programId,
    }),
    true,
  );
}

export type SettlementOutflowAccounts = {
  memberPositionAddress: PublicKeyish;
  vaultTokenAccountAddress: PublicKeyish;
  recipientTokenAccountAddress: PublicKeyish;
  tokenProgramId: PublicKeyish;
  poolOracleFeeVaultAddress?: PublicKeyish | null;
  poolOraclePolicyAddress?: PublicKeyish | null;
  oracleFeeAttestationAddress?: PublicKeyish | null;
};

type TokenCustodyFlowParams = {
  reserveDomainAddress: PublicKeyish;
  assetMint: PublicKeyish;
  vaultTokenAccountAddress?: PublicKeyish | null;
  tokenProgramId?: PublicKeyish | null;
  programId?: PublicKeyish;
};

function domainVaultAddress(params: TokenCustodyFlowParams): PublicKey {
  return deriveDomainAssetVaultPda({
    reserveDomain: params.reserveDomainAddress,
    assetMint: params.assetMint,
    programId: params.programId,
  });
}

function domainVaultTokenAddress(params: TokenCustodyFlowParams): PublicKey {
  return params.vaultTokenAccountAddress
    ? toPublicKey(params.vaultTokenAccountAddress)
    : deriveDomainAssetVaultTokenAccountPda({
        reserveDomain: params.reserveDomainAddress,
        assetMint: params.assetMint,
        programId: params.programId,
      });
}

function domainAssetLedgerAddress(params: TokenCustodyFlowParams): PublicKey {
  return deriveDomainAssetLedgerPda({
    reserveDomain: params.reserveDomainAddress,
    assetMint: params.assetMint,
    programId: params.programId,
  });
}

function tokenProgramAddress(tokenProgramId?: PublicKeyish | null): PublicKey {
  return classicTokenProgramId(tokenProgramId);
}

function commitmentCampaignAddress(params: {
  campaignAddress?: PublicKeyish | null;
  healthPlanAddress?: PublicKeyish | null;
  campaignId?: string | null;
  programId?: PublicKeyish;
}): PublicKey {
  if (params.campaignAddress) return toPublicKey(params.campaignAddress);
  if (params.healthPlanAddress && params.campaignId) {
    return deriveCommitmentCampaignPda({
      healthPlan: params.healthPlanAddress,
      campaignId: params.campaignId,
      programId: params.programId,
    });
  }
  throw new Error(
    'commitment campaign builder requires campaignAddress or healthPlanAddress + campaignId',
  );
}

function commitmentLedgerAddress(params: {
  ledgerAddress?: PublicKeyish | null;
  campaignAddress: PublicKeyish;
  paymentAssetMint: PublicKeyish;
  programId?: PublicKeyish;
}): PublicKey {
  return params.ledgerAddress
    ? toPublicKey(params.ledgerAddress)
    : deriveCommitmentLedgerPda({
        campaign: params.campaignAddress,
        paymentAssetMint: params.paymentAssetMint,
        programId: params.programId,
      });
}

function commitmentPaymentRailAddress(params: {
  paymentRailAddress?: PublicKeyish | null;
  campaignAddress: PublicKeyish;
  paymentAssetMint: PublicKeyish;
  programId?: PublicKeyish;
}): PublicKey {
  return params.paymentRailAddress
    ? toPublicKey(params.paymentRailAddress)
    : deriveCommitmentPaymentRailPda({
        campaign: params.campaignAddress,
        paymentAssetMint: params.paymentAssetMint,
        programId: params.programId,
      });
}

function commitmentPositionAddress(params: {
  positionAddress?: PublicKeyish | null;
  campaignAddress: PublicKeyish;
  depositor?: PublicKeyish | null;
  beneficiary?: PublicKeyish | null;
  programId?: PublicKeyish;
}): PublicKey {
  if (params.positionAddress) return toPublicKey(params.positionAddress);
  if (params.depositor && params.beneficiary) {
    return deriveCommitmentPositionPda({
      campaign: params.campaignAddress,
      depositor: params.depositor,
      beneficiary: params.beneficiary,
      programId: params.programId,
    });
  }
  throw new Error(
    'commitment position builder requires positionAddress or depositor + beneficiary',
  );
}

export function buildInitializeProtocolGovernanceTx(params: {
  governanceAuthority: PublicKeyish;
  recentBlockhash: string;
  protocolFeeBps: number;
  emergencyPaused: boolean;
  programId?: PublicKeyish;
}): Transaction {
  const governanceAuthority = toPublicKey(params.governanceAuthority);
  const programId = params.programId ?? getProgramId();
  return buildOrderedTransaction({
    feePayer: governanceAuthority,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'initialize_protocol_governance',
    programId,
    args: {
      protocol_fee_bps: params.protocolFeeBps,
      emergency_pause: params.emergencyPaused,
    },
    accounts: [
      { pubkey: governanceAuthority, isSigner: true, isWritable: true },
      { pubkey: deriveProtocolGovernancePda(programId), isWritable: true },
      { pubkey: SystemProgram.programId },
    ],
  });
}

export function buildCreateReserveDomainTx(params: {
  authority: PublicKeyish;
  recentBlockhash: string;
  domainId: string;
  displayName: string;
  domainAdmin?: PublicKeyish | null;
  settlementMode: number;
  legalStructureHashHex?: string | null;
  complianceBaselineHashHex?: string | null;
  allowedRailMask: number;
  pauseFlags: number;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const programId = params.programId ?? getProgramId();
  return buildOrderedTransaction({
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'create_reserve_domain',
    programId,
    args: {
      domain_id: params.domainId,
      display_name: params.displayName,
      domain_admin: toPublicKey(params.domainAdmin ?? authority),
      settlement_mode: params.settlementMode,
      legal_structure_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.legalStructureHashHex),
          'legal structure hash',
        ),
      ),
      compliance_baseline_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.complianceBaselineHashHex),
          'compliance baseline hash',
        ),
      ),
      allowed_rail_mask: params.allowedRailMask,
      pause_flags: params.pauseFlags,
    },
    accounts: [
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: deriveProtocolGovernancePda(programId) },
      {
        pubkey: deriveReserveDomainPda({
          domainId: params.domainId,
          programId,
        }),
        isWritable: true,
      },
      { pubkey: SystemProgram.programId },
    ],
  });
}

export function buildCreateDomainAssetVaultTx(params: {
  authority: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  assetMint: PublicKeyish;
  recentBlockhash: string;
  vaultTokenAccountAddress?: PublicKeyish;
  tokenProgram?: PublicKeyish;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const assetMint = toPublicKey(params.assetMint);
  const programId = params.programId ?? getProgramId();
  const vaultTokenAccount = deriveDomainAssetVaultTokenAccountPda({
    reserveDomain: params.reserveDomainAddress,
    assetMint,
    programId,
  });

  return buildOrderedTransaction({
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'create_domain_asset_vault',
    programId,
    args: {
      asset_mint: assetMint,
    },
    accounts: [
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: deriveProtocolGovernancePda(programId) },
      { pubkey: params.reserveDomainAddress, isWritable: true },
      {
        pubkey: deriveDomainAssetVaultPda({
          reserveDomain: params.reserveDomainAddress,
          assetMint,
          programId,
        }),
        isWritable: true,
      },
      {
        pubkey: deriveDomainAssetLedgerPda({
          reserveDomain: params.reserveDomainAddress,
          assetMint,
          programId,
        }),
        isWritable: true,
      },
      { pubkey: assetMint },
      { pubkey: vaultTokenAccount, isWritable: true },
      { pubkey: toPublicKey(params.tokenProgram ?? SPL_TOKEN_PROGRAM_ID) },
      { pubkey: SystemProgram.programId },
    ],
  });
}

export function buildConfigureReserveAssetRailTx(params: {
  authority: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  assetMint: PublicKeyish;
  assetSymbol: string;
  oracleAuthority?: PublicKeyish | null;
  role: number;
  payoutPriority: number;
  oracleSource: number;
  oracleFeedIdHex?: string | null;
  maxStalenessSeconds: bigint;
  haircutBps: number;
  maxExposureBps: number;
  depositEnabled: boolean;
  payoutEnabled: boolean;
  capacityEnabled: boolean;
  active: boolean;
  reasonHashHex?: string | null;
  recentBlockhash: string;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const assetMint = toPublicKey(params.assetMint);
  const programId = params.programId ?? getProgramId();
  return buildOrderedTransaction({
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'configure_reserve_asset_rail',
    programId,
    args: {
      asset_mint: assetMint,
      oracle_authority: toPublicKey(params.oracleAuthority ?? authority),
      asset_symbol: params.assetSymbol,
      role: params.role,
      payout_priority: params.payoutPriority,
      oracle_source: params.oracleSource,
      oracle_feed_id: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.oracleFeedIdHex),
          'oracle feed id',
        ),
      ),
      max_staleness_seconds: params.maxStalenessSeconds,
      haircut_bps: params.haircutBps,
      max_exposure_bps: params.maxExposureBps,
      deposit_enabled: params.depositEnabled,
      payout_enabled: params.payoutEnabled,
      capacity_enabled: params.capacityEnabled,
      active: params.active,
      reason_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.reasonHashHex),
          'reason hash',
        ),
      ),
    },
    accounts: [
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: deriveProtocolGovernancePda(programId) },
      { pubkey: params.reserveDomainAddress },
      {
        pubkey: deriveReserveAssetRailPda({
          reserveDomain: params.reserveDomainAddress,
          assetMint,
          programId,
        }),
        isWritable: true,
      },
      { pubkey: SystemProgram.programId },
    ],
  });
}

export function buildPublishReserveAssetRailPriceTx(params: {
  authority: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  assetMint: PublicKeyish;
  priceUsd1e8: bigint;
  confidenceBps: number;
  publishedAtTs: bigint;
  proofHashHex?: string | null;
  recentBlockhash: string;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const assetMint = toPublicKey(params.assetMint);
  const programId = params.programId ?? getProgramId();
  return buildOrderedTransaction({
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'publish_reserve_asset_rail_price',
    programId,
    args: {
      price_usd_1e8: params.priceUsd1e8,
      confidence_bps: params.confidenceBps,
      published_at_ts: params.publishedAtTs,
      proof_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.proofHashHex),
          'proof hash',
        ),
      ),
    },
    accounts: [
      { pubkey: authority, isSigner: true },
      { pubkey: deriveProtocolGovernancePda(programId) },
      {
        pubkey: deriveReserveAssetRailPda({
          reserveDomain: params.reserveDomainAddress,
          assetMint,
          programId,
        }),
        isWritable: true,
      },
    ],
  });
}

export function buildCreatePolicySeriesTx(params: {
  authority: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  assetMint: PublicKeyish;
  recentBlockhash: string;
  seriesId: string;
  displayName: string;
  metadataUri: string;
  mode: number;
  status: number;
  adjudicationMode: number;
  termsHashHex?: string | null;
  pricingHashHex?: string | null;
  payoutHashHex?: string | null;
  reserveModelHashHex?: string | null;
  evidenceRequirementsHashHex?: string | null;
  comparabilityHashHex?: string | null;
  policyOverridesHashHex?: string | null;
  cycleSeconds: bigint;
  termsVersion: number;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const programId = params.programId ?? getProgramId();
  const policySeries = derivePolicySeriesPda({
    healthPlan: params.healthPlanAddress,
    seriesId: params.seriesId,
    programId,
  });
  const seriesReserveLedger = deriveSeriesReserveLedgerPda({
    policySeries,
    assetMint: params.assetMint,
    programId,
  });
  return buildOrderedTransaction({
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'create_policy_series',
    programId,
    args: {
      series_id: params.seriesId,
      display_name: params.displayName,
      metadata_uri: params.metadataUri,
      asset_mint: toPublicKey(params.assetMint),
      mode: params.mode,
      status: params.status,
      adjudication_mode: params.adjudicationMode,
      terms_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.termsHashHex),
          'terms hash',
        ),
      ),
      pricing_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.pricingHashHex),
          'pricing hash',
        ),
      ),
      payout_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.payoutHashHex),
          'payout hash',
        ),
      ),
      reserve_model_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.reserveModelHashHex),
          'reserve model hash',
        ),
      ),
      evidence_requirements_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.evidenceRequirementsHashHex),
          'evidence requirements hash',
        ),
      ),
      comparability_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.comparabilityHashHex),
          'comparability hash',
        ),
      ),
      policy_overrides_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.policyOverridesHashHex),
          'policy overrides hash',
        ),
      ),
      cycle_seconds: params.cycleSeconds,
      terms_version: params.termsVersion,
    },
    accounts: [
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: deriveProtocolGovernancePda(programId) },
      { pubkey: params.healthPlanAddress },
      { pubkey: policySeries, isWritable: true },
      { pubkey: seriesReserveLedger, isWritable: true },
      { pubkey: SystemProgram.programId },
    ],
  });
}

export function buildInitializeSeriesReserveLedgerTx(params: {
  authority: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  policySeriesAddress: PublicKeyish;
  assetMint: PublicKeyish;
  recentBlockhash: string;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const assetMint = toPublicKey(params.assetMint);
  const programId = params.programId ?? getProgramId();
  const seriesReserveLedger = deriveSeriesReserveLedgerPda({
    policySeries: params.policySeriesAddress,
    assetMint,
    programId,
  });
  return buildOrderedTransaction({
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'initialize_series_reserve_ledger',
    programId,
    args: {
      asset_mint: assetMint,
    },
    accounts: [
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: deriveProtocolGovernancePda(programId) },
      { pubkey: params.healthPlanAddress },
      { pubkey: params.policySeriesAddress },
      { pubkey: seriesReserveLedger, isWritable: true },
      { pubkey: SystemProgram.programId },
    ],
  });
}

export function buildOpenFundingLineTx(params: {
  authority: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  assetMint: PublicKeyish;
  recentBlockhash: string;
  lineId: string;
  policySeriesAddress?: PublicKeyish | null;
  lineType: number;
  fundingPriority: number;
  committedAmount: bigint;
  capsHashHex?: string | null;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const assetMint = toPublicKey(params.assetMint);
  const programId = params.programId ?? getProgramId();
  const fundingLine = deriveFundingLinePda({
    healthPlan: params.healthPlanAddress,
    lineId: params.lineId,
    programId,
  });
  return buildOrderedTransaction({
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'open_funding_line',
    programId,
    args: {
      line_id: params.lineId,
      policy_series: toPublicKey(params.policySeriesAddress ?? ZERO_PUBKEY_KEY),
      asset_mint: assetMint,
      line_type: params.lineType,
      funding_priority: params.fundingPriority,
      committed_amount: params.committedAmount,
      caps_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.capsHashHex),
          'caps hash',
        ),
      ),
    },
    accounts: [
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: deriveProtocolGovernancePda(programId) },
      { pubkey: params.healthPlanAddress },
      {
        pubkey: deriveDomainAssetVaultPda({
          reserveDomain: params.reserveDomainAddress,
          assetMint,
          programId,
        }),
      },
      {
        pubkey: deriveDomainAssetLedgerPda({
          reserveDomain: params.reserveDomainAddress,
          assetMint,
          programId,
        }),
        isWritable: true,
      },
      { pubkey: fundingLine, isWritable: true },
      {
        pubkey: deriveFundingLineLedgerPda({
          fundingLine,
          assetMint,
          programId,
        }),
        isWritable: true,
      },
      {
        pubkey: derivePlanReserveLedgerPda({
          healthPlan: params.healthPlanAddress,
          assetMint,
          programId,
        }),
        isWritable: true,
      },
      optionalSeriesReserveLedgerAccount(
        params.policySeriesAddress,
        assetMint,
        programId,
      ),
      { pubkey: SystemProgram.programId },
    ],
  });
}

export function buildCreateCommitmentCampaignTx(params: {
  authority: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  coverageFundingLineAddress: PublicKeyish;
  paymentAssetMint: PublicKeyish;
  coverageAssetMint: PublicKeyish;
  reserveAssetRailAddress?: PublicKeyish | null;
  activationAuthority: PublicKeyish;
  recentBlockhash: string;
  campaignId: string;
  displayName: string;
  metadataUri: string;
  mode: number;
  depositAmount: bigint;
  coverageAmount: bigint;
  hardCapAmount: bigint;
  startsAtTs: bigint;
  refundAfterTs: bigint;
  expiresAtTs: bigint;
  termsHashHex?: string | null;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const paymentAssetMint = toPublicKey(params.paymentAssetMint);
  const coverageAssetMint = toPublicKey(params.coverageAssetMint);
  const programId = params.programId ?? getProgramId();
  const campaign = deriveCommitmentCampaignPda({
    healthPlan: params.healthPlanAddress,
    campaignId: params.campaignId,
    programId,
  });
  const paymentRail = deriveCommitmentPaymentRailPda({
    campaign,
    paymentAssetMint,
    programId,
  });
  const ledger = deriveCommitmentLedgerPda({
    campaign,
    paymentAssetMint,
    programId,
  });
  const reserveAssetRail = params.reserveAssetRailAddress
    ? toPublicKey(params.reserveAssetRailAddress)
    : deriveReserveAssetRailPda({
        reserveDomain: params.reserveDomainAddress,
        assetMint: paymentAssetMint,
        programId,
      });

  return buildOrderedTransaction({
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'create_commitment_campaign',
    programId,
    args: {
      campaign_id: params.campaignId,
      display_name: params.displayName,
      metadata_uri: params.metadataUri,
      payment_asset_mint: paymentAssetMint,
      coverage_asset_mint: coverageAssetMint,
      activation_authority: toPublicKey(params.activationAuthority),
      mode: params.mode,
      deposit_amount: params.depositAmount,
      coverage_amount: params.coverageAmount,
      hard_cap_amount: params.hardCapAmount,
      starts_at_ts: params.startsAtTs,
      refund_after_ts: params.refundAfterTs,
      expires_at_ts: params.expiresAtTs,
      terms_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.termsHashHex),
          'terms hash',
        ),
      ),
    },
    accounts: [
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: deriveProtocolGovernancePda(programId) },
      { pubkey: params.healthPlanAddress },
      {
        pubkey: deriveDomainAssetVaultPda({
          reserveDomain: params.reserveDomainAddress,
          assetMint: paymentAssetMint,
          programId,
        }),
      },
      { pubkey: reserveAssetRail },
      {
        pubkey: deriveDomainAssetLedgerPda({
          reserveDomain: params.reserveDomainAddress,
          assetMint: coverageAssetMint,
          programId,
        }),
        isWritable: true,
      },
      { pubkey: params.coverageFundingLineAddress },
      {
        pubkey: deriveFundingLineLedgerPda({
          fundingLine: params.coverageFundingLineAddress,
          assetMint: coverageAssetMint,
          programId,
        }),
        isWritable: true,
      },
      {
        pubkey: derivePlanReserveLedgerPda({
          healthPlan: params.healthPlanAddress,
          assetMint: coverageAssetMint,
          programId,
        }),
        isWritable: true,
      },
      { pubkey: campaign, isWritable: true },
      { pubkey: paymentRail, isWritable: true },
      { pubkey: ledger, isWritable: true },
      { pubkey: SystemProgram.programId },
    ],
  });
}

export function buildCreateCommitmentPaymentRailTx(params: {
  authority: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  campaignAddress?: PublicKeyish | null;
  campaignId?: string | null;
  coverageFundingLineAddress: PublicKeyish;
  paymentAssetMint: PublicKeyish;
  coverageAssetMint: PublicKeyish;
  reserveAssetRailAddress?: PublicKeyish | null;
  recentBlockhash: string;
  mode: number;
  depositAmount: bigint;
  coverageAmount: bigint;
  hardCapAmount: bigint;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const paymentAssetMint = toPublicKey(params.paymentAssetMint);
  const coverageAssetMint = toPublicKey(params.coverageAssetMint);
  const programId = params.programId ?? getProgramId();
  const campaign = commitmentCampaignAddress({ ...params, programId });
  const reserveAssetRail = params.reserveAssetRailAddress
    ? toPublicKey(params.reserveAssetRailAddress)
    : deriveReserveAssetRailPda({
        reserveDomain: params.reserveDomainAddress,
        assetMint: paymentAssetMint,
        programId,
      });

  return buildOrderedTransaction({
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'create_commitment_payment_rail',
    programId,
    args: {
      payment_asset_mint: paymentAssetMint,
      coverage_asset_mint: coverageAssetMint,
      reserve_asset_rail: reserveAssetRail,
      coverage_funding_line: toPublicKey(params.coverageFundingLineAddress),
      mode: params.mode,
      deposit_amount: params.depositAmount,
      coverage_amount: params.coverageAmount,
      hard_cap_amount: params.hardCapAmount,
    },
    accounts: [
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: deriveProtocolGovernancePda(programId) },
      { pubkey: params.healthPlanAddress },
      { pubkey: campaign, isWritable: true },
      {
        pubkey: deriveDomainAssetVaultPda({
          reserveDomain: params.reserveDomainAddress,
          assetMint: paymentAssetMint,
          programId,
        }),
      },
      { pubkey: reserveAssetRail },
      { pubkey: params.coverageFundingLineAddress },
      {
        pubkey: deriveCommitmentPaymentRailPda({
          campaign,
          paymentAssetMint,
          programId,
        }),
        isWritable: true,
      },
      {
        pubkey: deriveCommitmentLedgerPda({
          campaign,
          paymentAssetMint,
          programId,
        }),
        isWritable: true,
      },
      { pubkey: SystemProgram.programId },
    ],
  });
}

export function buildDepositCommitmentTx(params: {
  depositor: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  paymentAssetMint: PublicKeyish;
  sourceTokenAccountAddress: PublicKeyish;
  beneficiary: PublicKeyish;
  recentBlockhash: string;
  campaignAddress?: PublicKeyish | null;
  healthPlanAddress?: PublicKeyish | null;
  campaignId?: string | null;
  paymentRailAddress?: PublicKeyish | null;
  reserveAssetRailAddress?: PublicKeyish | null;
  ledgerAddress?: PublicKeyish | null;
  positionAddress?: PublicKeyish | null;
  vaultTokenAccountAddress?: PublicKeyish | null;
  acceptedTermsHashHex?: string | null;
  tokenProgramId?: PublicKeyish | null;
  programId?: PublicKeyish;
}): Transaction {
  const depositor = toPublicKey(params.depositor);
  const paymentAssetMint = toPublicKey(params.paymentAssetMint);
  const beneficiary = toPublicKey(params.beneficiary);
  const programId = params.programId ?? getProgramId();
  const campaign = commitmentCampaignAddress({ ...params, programId });
  const paymentRail = commitmentPaymentRailAddress({
    paymentRailAddress: params.paymentRailAddress,
    campaignAddress: campaign,
    paymentAssetMint,
    programId,
  });
  const reserveAssetRail = params.reserveAssetRailAddress
    ? toPublicKey(params.reserveAssetRailAddress)
    : deriveReserveAssetRailPda({
        reserveDomain: params.reserveDomainAddress,
        assetMint: paymentAssetMint,
        programId,
      });
  const ledger = commitmentLedgerAddress({
    ledgerAddress: params.ledgerAddress,
    campaignAddress: campaign,
    paymentAssetMint,
    programId,
  });
  const position = commitmentPositionAddress({
    positionAddress: params.positionAddress,
    campaignAddress: campaign,
    depositor,
    beneficiary,
    programId,
  });
  const tokenProgramId = classicTokenProgramId(params.tokenProgramId);
  const vaultTokenAccount = params.vaultTokenAccountAddress
    ? toPublicKey(params.vaultTokenAccountAddress)
    : deriveDomainAssetVaultTokenAccountPda({
        reserveDomain: params.reserveDomainAddress,
        assetMint: paymentAssetMint,
        programId,
      });

  return buildOrderedTransaction({
    feePayer: depositor,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'deposit_commitment',
    programId,
    args: {
      beneficiary,
      accepted_terms_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.acceptedTermsHashHex),
          'accepted terms hash',
        ),
      ),
    },
    accounts: [
      { pubkey: depositor, isSigner: true, isWritable: true },
      { pubkey: deriveProtocolGovernancePda(programId) },
      { pubkey: campaign, isWritable: true },
      { pubkey: paymentRail },
      { pubkey: reserveAssetRail },
      { pubkey: ledger, isWritable: true },
      { pubkey: position, isWritable: true },
      {
        pubkey: deriveDomainAssetVaultPda({
          reserveDomain: params.reserveDomainAddress,
          assetMint: paymentAssetMint,
          programId,
        }),
        isWritable: true,
      },
      { pubkey: params.sourceTokenAccountAddress, isWritable: true },
      { pubkey: paymentAssetMint },
      { pubkey: vaultTokenAccount, isWritable: true },
      { pubkey: tokenProgramId },
      { pubkey: SystemProgram.programId },
    ],
  });
}

function buildActivateCommitmentTx(params: {
  instructionName:
    | 'activate_direct_premium_commitment'
    | 'activate_treasury_credit_commitment'
    | 'activate_waterfall_commitment';
  activationAuthority: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  coverageFundingLineAddress: PublicKeyish;
  paymentAssetMint: PublicKeyish;
  coverageAssetMint: PublicKeyish;
  positionAddress: PublicKeyish;
  recentBlockhash: string;
  campaignAddress?: PublicKeyish | null;
  campaignId?: string | null;
  paymentRailAddress?: PublicKeyish | null;
  reserveAssetRailAddress?: PublicKeyish | null;
  ledgerAddress?: PublicKeyish | null;
  policySeriesAddress?: PublicKeyish | null;
  activationReasonHashHex?: string | null;
  programId?: PublicKeyish;
}): Transaction {
  const activationAuthority = toPublicKey(params.activationAuthority);
  const paymentAssetMint = toPublicKey(params.paymentAssetMint);
  const coverageAssetMint = toPublicKey(params.coverageAssetMint);
  const programId = params.programId ?? getProgramId();
  const campaign = commitmentCampaignAddress({ ...params, programId });
  const paymentRail = commitmentPaymentRailAddress({
    paymentRailAddress: params.paymentRailAddress,
    campaignAddress: campaign,
    paymentAssetMint,
    programId,
  });
  const reserveAssetRail = params.reserveAssetRailAddress
    ? toPublicKey(params.reserveAssetRailAddress)
    : deriveReserveAssetRailPda({
        reserveDomain: params.reserveDomainAddress,
        assetMint: paymentAssetMint,
        programId,
      });
  const ledger = commitmentLedgerAddress({
    ledgerAddress: params.ledgerAddress,
    campaignAddress: campaign,
    paymentAssetMint,
    programId,
  });
  const coverageLedgerAssetMint =
    params.instructionName === 'activate_waterfall_commitment'
      ? paymentAssetMint
      : coverageAssetMint;

  return buildOrderedTransaction({
    feePayer: activationAuthority,
    recentBlockhash: params.recentBlockhash,
    instructionName: params.instructionName,
    programId,
    args: {
      activation_reason_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.activationReasonHashHex),
          'activation reason hash',
        ),
      ),
    },
    accounts: [
      { pubkey: activationAuthority, isSigner: true },
      { pubkey: deriveProtocolGovernancePda(programId) },
      { pubkey: params.healthPlanAddress },
      { pubkey: campaign, isWritable: true },
      { pubkey: paymentRail },
      ...(params.instructionName === 'activate_waterfall_commitment'
        ? [{ pubkey: reserveAssetRail }]
        : []),
      { pubkey: ledger, isWritable: true },
      { pubkey: params.positionAddress, isWritable: true },
      {
        pubkey: deriveDomainAssetLedgerPda({
          reserveDomain: params.reserveDomainAddress,
          assetMint: coverageLedgerAssetMint,
          programId,
        }),
        isWritable: true,
      },
      { pubkey: params.coverageFundingLineAddress, isWritable: true },
      {
        pubkey: deriveFundingLineLedgerPda({
          fundingLine: params.coverageFundingLineAddress,
          assetMint: coverageLedgerAssetMint,
          programId,
        }),
        isWritable: true,
      },
      {
        pubkey: derivePlanReserveLedgerPda({
          healthPlan: params.healthPlanAddress,
          assetMint: coverageLedgerAssetMint,
          programId,
        }),
        isWritable: true,
      },
      optionalSeriesReserveLedgerAccount(
        params.policySeriesAddress,
        coverageLedgerAssetMint,
        programId,
      ),
    ],
  });
}

export function buildActivateDirectPremiumCommitmentTx(
  params: Omit<
    Parameters<typeof buildActivateCommitmentTx>[0],
    'instructionName'
  >,
): Transaction {
  return buildActivateCommitmentTx({
    ...params,
    instructionName: 'activate_direct_premium_commitment',
  });
}

export function buildActivateTreasuryCreditCommitmentTx(
  params: Omit<
    Parameters<typeof buildActivateCommitmentTx>[0],
    'instructionName'
  >,
): Transaction {
  return buildActivateCommitmentTx({
    ...params,
    instructionName: 'activate_treasury_credit_commitment',
  });
}

export function buildActivateWaterfallCommitmentTx(
  params: Omit<
    Parameters<typeof buildActivateCommitmentTx>[0],
    'instructionName'
  >,
): Transaction {
  return buildActivateCommitmentTx({
    ...params,
    instructionName: 'activate_waterfall_commitment',
  });
}

export function buildRefundCommitmentTx(params: {
  depositor: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  paymentAssetMint: PublicKeyish;
  recipientTokenAccountAddress: PublicKeyish;
  recentBlockhash: string;
  campaignAddress?: PublicKeyish | null;
  healthPlanAddress?: PublicKeyish | null;
  campaignId?: string | null;
  paymentRailAddress?: PublicKeyish | null;
  ledgerAddress?: PublicKeyish | null;
  positionAddress?: PublicKeyish | null;
  beneficiary?: PublicKeyish | null;
  vaultTokenAccountAddress?: PublicKeyish | null;
  refundReasonHashHex?: string | null;
  tokenProgramId?: PublicKeyish | null;
  programId?: PublicKeyish;
}): Transaction {
  const depositor = toPublicKey(params.depositor);
  const paymentAssetMint = toPublicKey(params.paymentAssetMint);
  const programId = params.programId ?? getProgramId();
  const campaign = commitmentCampaignAddress({ ...params, programId });
  const paymentRail = commitmentPaymentRailAddress({
    paymentRailAddress: params.paymentRailAddress,
    campaignAddress: campaign,
    paymentAssetMint,
    programId,
  });
  const ledger = commitmentLedgerAddress({
    ledgerAddress: params.ledgerAddress,
    campaignAddress: campaign,
    paymentAssetMint,
    programId,
  });
  const position = commitmentPositionAddress({
    positionAddress: params.positionAddress,
    campaignAddress: campaign,
    depositor,
    beneficiary: params.beneficiary,
    programId,
  });
  const tokenProgramId = classicTokenProgramId(params.tokenProgramId);
  const vaultTokenAccount = params.vaultTokenAccountAddress
    ? toPublicKey(params.vaultTokenAccountAddress)
    : deriveDomainAssetVaultTokenAccountPda({
        reserveDomain: params.reserveDomainAddress,
        assetMint: paymentAssetMint,
        programId,
      });

  return buildOrderedTransaction({
    feePayer: depositor,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'refund_commitment',
    programId,
    args: {
      refund_reason_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.refundReasonHashHex),
          'refund reason hash',
        ),
      ),
    },
    accounts: [
      { pubkey: depositor, isSigner: true, isWritable: true },
      { pubkey: campaign, isWritable: true },
      { pubkey: paymentRail },
      { pubkey: ledger, isWritable: true },
      { pubkey: position, isWritable: true },
      {
        pubkey: deriveDomainAssetVaultPda({
          reserveDomain: params.reserveDomainAddress,
          assetMint: paymentAssetMint,
          programId,
        }),
        isWritable: true,
      },
      { pubkey: paymentAssetMint },
      { pubkey: vaultTokenAccount, isWritable: true },
      { pubkey: params.recipientTokenAccountAddress, isWritable: true },
      { pubkey: tokenProgramId },
    ],
  });
}

function buildFundingInflowTx(params: {
  instructionName: 'fund_sponsor_budget' | 'record_premium_payment';
  authority: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  fundingLineAddress: PublicKeyish;
  assetMint: PublicKeyish;
  sourceTokenAccountAddress: PublicKeyish;
  recentBlockhash: string;
  amount: bigint;
  policySeriesAddress?: PublicKeyish | null;
  vaultTokenAccountAddress?: PublicKeyish | null;
  tokenProgramId?: PublicKeyish | null;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const assetMint = toPublicKey(params.assetMint);
  const programId = params.programId ?? getProgramId();
  const tokenProgramId = tokenProgramAddress(params.tokenProgramId);
  const commonAccounts: GenericInstructionAccounts = {
    authority,
    protocol_governance: deriveProtocolGovernancePda(programId),
    health_plan: toPublicKey(params.healthPlanAddress),
    domain_asset_vault: domainVaultAddress({
      reserveDomainAddress: params.reserveDomainAddress,
      assetMint,
      programId,
    }),
    domain_asset_ledger: domainAssetLedgerAddress({
      reserveDomainAddress: params.reserveDomainAddress,
      assetMint,
      programId,
    }),
    funding_line: toPublicKey(params.fundingLineAddress),
    funding_line_ledger: deriveFundingLineLedgerPda({
      fundingLine: params.fundingLineAddress,
      assetMint,
      programId,
    }),
    plan_reserve_ledger: derivePlanReserveLedgerPda({
      healthPlan: params.healthPlanAddress,
      assetMint,
      programId,
    }),
    series_reserve_ledger: params.policySeriesAddress
      ? deriveSeriesReserveLedgerPda({
          policySeries: params.policySeriesAddress,
          assetMint,
          programId,
        })
      : undefined,
    source_token_account: toPublicKey(params.sourceTokenAccountAddress),
    asset_mint: assetMint,
    vault_token_account: domainVaultTokenAddress({
      reserveDomainAddress: params.reserveDomainAddress,
      assetMint,
      vaultTokenAccountAddress: params.vaultTokenAccountAddress,
      programId,
    }),
    token_program: tokenProgramId,
  };

  return buildConvenienceTransaction({
    instructionName: params.instructionName,
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    programId,
    args: { amount: params.amount },
    accounts:
      params.instructionName === 'record_premium_payment'
        ? {
            ...commonAccounts,
            protocol_fee_vault: deriveProtocolFeeVaultPda({
              reserveDomain: params.reserveDomainAddress,
              assetMint,
              programId,
            }),
          }
        : commonAccounts,
  });
}

export function buildFundSponsorBudgetTx(params: {
  authority: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  fundingLineAddress: PublicKeyish;
  assetMint: PublicKeyish;
  sourceTokenAccountAddress: PublicKeyish;
  recentBlockhash: string;
  amount: bigint;
  policySeriesAddress?: PublicKeyish | null;
  vaultTokenAccountAddress?: PublicKeyish | null;
  tokenProgramId?: PublicKeyish | null;
  programId?: PublicKeyish;
}): Transaction {
  return buildFundingInflowTx({
    ...params,
    instructionName: 'fund_sponsor_budget',
  });
}

export function buildRecordPremiumPaymentTx(params: {
  authority: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  fundingLineAddress: PublicKeyish;
  assetMint: PublicKeyish;
  sourceTokenAccountAddress: PublicKeyish;
  recentBlockhash: string;
  amount: bigint;
  policySeriesAddress?: PublicKeyish | null;
  vaultTokenAccountAddress?: PublicKeyish | null;
  tokenProgramId?: PublicKeyish | null;
  programId?: PublicKeyish;
}): Transaction {
  return buildFundingInflowTx({
    ...params,
    instructionName: 'record_premium_payment',
  });
}

export function buildDepositIntoCapitalClassTx(params: {
  owner: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  liquidityPoolAddress: PublicKeyish;
  capitalClassAddress: PublicKeyish;
  assetMint: PublicKeyish;
  sourceTokenAccountAddress: PublicKeyish;
  recentBlockhash: string;
  amount: bigint;
  shares: bigint;
  vaultTokenAccountAddress?: PublicKeyish | null;
  tokenProgramId?: PublicKeyish | null;
  programId?: PublicKeyish;
}): Transaction {
  const owner = toPublicKey(params.owner);
  const assetMint = toPublicKey(params.assetMint);
  const programId = params.programId ?? getProgramId();
  return buildConvenienceTransaction({
    instructionName: 'deposit_into_capital_class',
    feePayer: owner,
    recentBlockhash: params.recentBlockhash,
    programId,
    args: {
      amount: params.amount,
      shares: params.shares,
    },
    accounts: {
      owner,
      protocol_governance: deriveProtocolGovernancePda(programId),
      domain_asset_vault: domainVaultAddress({
        reserveDomainAddress: params.reserveDomainAddress,
        assetMint,
        programId,
      }),
      domain_asset_ledger: domainAssetLedgerAddress({
        reserveDomainAddress: params.reserveDomainAddress,
        assetMint,
        programId,
      }),
      liquidity_pool: toPublicKey(params.liquidityPoolAddress),
      capital_class: toPublicKey(params.capitalClassAddress),
      pool_class_ledger: derivePoolClassLedgerPda({
        capitalClass: params.capitalClassAddress,
        assetMint,
        programId,
      }),
      lp_position: deriveLpPositionPda({
        capitalClass: params.capitalClassAddress,
        owner,
        programId,
      }),
      pool_treasury_vault: derivePoolTreasuryVaultPda({
        liquidityPool: params.liquidityPoolAddress,
        assetMint,
        programId,
      }),
      source_token_account: toPublicKey(params.sourceTokenAccountAddress),
      asset_mint: assetMint,
      vault_token_account: domainVaultTokenAddress({
        reserveDomainAddress: params.reserveDomainAddress,
        assetMint,
        vaultTokenAccountAddress: params.vaultTokenAccountAddress,
        programId,
      }),
      token_program: tokenProgramAddress(params.tokenProgramId),
      system_program: SystemProgram.programId,
    },
  });
}

export function buildRequestRedemptionTx(params: {
  owner: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  liquidityPoolAddress: PublicKeyish;
  capitalClassAddress: PublicKeyish;
  assetMint: PublicKeyish;
  recentBlockhash: string;
  shares: bigint;
  programId?: PublicKeyish;
}): Transaction {
  const owner = toPublicKey(params.owner);
  const assetMint = toPublicKey(params.assetMint);
  const programId = params.programId ?? getProgramId();
  return buildConvenienceTransaction({
    instructionName: 'request_redemption',
    feePayer: owner,
    recentBlockhash: params.recentBlockhash,
    programId,
    args: { shares: params.shares },
    accounts: {
      owner,
      protocol_governance: deriveProtocolGovernancePda(programId),
      liquidity_pool: toPublicKey(params.liquidityPoolAddress),
      capital_class: toPublicKey(params.capitalClassAddress),
      pool_class_ledger: derivePoolClassLedgerPda({
        capitalClass: params.capitalClassAddress,
        assetMint,
        programId,
      }),
      domain_asset_ledger: domainAssetLedgerAddress({
        reserveDomainAddress: params.reserveDomainAddress,
        assetMint,
        programId,
      }),
      lp_position: deriveLpPositionPda({
        capitalClass: params.capitalClassAddress,
        owner,
        programId,
      }),
    },
  });
}

export function buildProcessRedemptionQueueTx(params: {
  authority: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  liquidityPoolAddress: PublicKeyish;
  capitalClassAddress: PublicKeyish;
  lpOwnerAddress: PublicKeyish;
  assetMint: PublicKeyish;
  recipientTokenAccountAddress: PublicKeyish;
  recentBlockhash: string;
  shares: bigint;
  vaultTokenAccountAddress?: PublicKeyish | null;
  tokenProgramId?: PublicKeyish | null;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const assetMint = toPublicKey(params.assetMint);
  const programId = params.programId ?? getProgramId();
  const lpPosition = deriveLpPositionPda({
    capitalClass: params.capitalClassAddress,
    owner: params.lpOwnerAddress,
    programId,
  });
  return buildConvenienceTransaction({
    instructionName: 'process_redemption_queue',
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    programId,
    args: { shares: params.shares },
    accounts: {
      authority,
      protocol_governance: deriveProtocolGovernancePda(programId),
      domain_asset_vault: domainVaultAddress({
        reserveDomainAddress: params.reserveDomainAddress,
        assetMint,
        programId,
      }),
      domain_asset_ledger: domainAssetLedgerAddress({
        reserveDomainAddress: params.reserveDomainAddress,
        assetMint,
        programId,
      }),
      liquidity_pool: toPublicKey(params.liquidityPoolAddress),
      capital_class: toPublicKey(params.capitalClassAddress),
      pool_class_ledger: derivePoolClassLedgerPda({
        capitalClass: params.capitalClassAddress,
        assetMint,
        programId,
      }),
      lp_position: lpPosition,
      pool_treasury_vault: derivePoolTreasuryVaultPda({
        liquidityPool: params.liquidityPoolAddress,
        assetMint,
        programId,
      }),
      asset_mint: assetMint,
      vault_token_account: domainVaultTokenAddress({
        reserveDomainAddress: params.reserveDomainAddress,
        assetMint,
        vaultTokenAccountAddress: params.vaultTokenAccountAddress,
        programId,
      }),
      recipient_token_account: toPublicKey(params.recipientTokenAccountAddress),
      token_program: tokenProgramAddress(params.tokenProgramId),
    },
  });
}

function buildFeeWithdrawalSplTx(params: {
  instructionName:
    | 'withdraw_protocol_fee_spl'
    | 'withdraw_pool_treasury_spl'
    | 'withdraw_pool_oracle_fee_spl';
  authority: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  assetMint: PublicKeyish;
  recipientTokenAccountAddress: PublicKeyish;
  recentBlockhash: string;
  amount: bigint;
  liquidityPoolAddress?: PublicKeyish;
  oracleAddress?: PublicKeyish;
  vaultTokenAccountAddress?: PublicKeyish | null;
  tokenProgramId?: PublicKeyish | null;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const assetMint = toPublicKey(params.assetMint);
  const programId = params.programId ?? getProgramId();
  const baseAccounts: GenericInstructionAccounts = {
    authority,
    protocol_governance: deriveProtocolGovernancePda(programId),
    domain_asset_vault: domainVaultAddress({
      reserveDomainAddress: params.reserveDomainAddress,
      assetMint,
      programId,
    }),
    domain_asset_ledger: domainAssetLedgerAddress({
      reserveDomainAddress: params.reserveDomainAddress,
      assetMint,
      programId,
    }),
    asset_mint: assetMint,
    vault_token_account: domainVaultTokenAddress({
      reserveDomainAddress: params.reserveDomainAddress,
      assetMint,
      vaultTokenAccountAddress: params.vaultTokenAccountAddress,
      programId,
    }),
    recipient_token_account: toPublicKey(params.recipientTokenAccountAddress),
    token_program: tokenProgramAddress(params.tokenProgramId),
  };

  if (params.instructionName === 'withdraw_protocol_fee_spl') {
    return buildConvenienceTransaction({
      instructionName: params.instructionName,
      feePayer: authority,
      recentBlockhash: params.recentBlockhash,
      programId,
      args: { amount: params.amount },
      accounts: {
        ...baseAccounts,
        reserve_domain: toPublicKey(params.reserveDomainAddress),
        protocol_fee_vault: deriveProtocolFeeVaultPda({
          reserveDomain: params.reserveDomainAddress,
          assetMint,
          programId,
        }),
      },
    });
  }

  if (!params.liquidityPoolAddress) {
    throw new Error(`${params.instructionName} requires liquidityPoolAddress`);
  }
  const liquidityPool = toPublicKey(params.liquidityPoolAddress);
  const commonPoolAccounts = {
    ...baseAccounts,
    liquidity_pool: liquidityPool,
  };

  if (params.instructionName === 'withdraw_pool_treasury_spl') {
    return buildConvenienceTransaction({
      instructionName: params.instructionName,
      feePayer: authority,
      recentBlockhash: params.recentBlockhash,
      programId,
      args: { amount: params.amount },
      accounts: {
        ...commonPoolAccounts,
        pool_treasury_vault: derivePoolTreasuryVaultPda({
          liquidityPool,
          assetMint,
          programId,
        }),
      },
    });
  }

  if (!params.oracleAddress) {
    throw new Error('withdraw_pool_oracle_fee_spl requires oracleAddress');
  }
  const oracleProfile = deriveOracleProfilePda({
    oracle: params.oracleAddress,
    programId,
  });
  return buildConvenienceTransaction({
    instructionName: params.instructionName,
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    programId,
    args: { amount: params.amount },
    accounts: {
      ...commonPoolAccounts,
      oracle_profile: oracleProfile,
      pool_oracle_fee_vault: derivePoolOracleFeeVaultPda({
        liquidityPool,
        oracle: params.oracleAddress,
        assetMint,
        programId,
      }),
    },
  });
}

export function buildWithdrawProtocolFeeSplTx(params: {
  authority: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  assetMint: PublicKeyish;
  recipientTokenAccountAddress: PublicKeyish;
  recentBlockhash: string;
  amount: bigint;
  vaultTokenAccountAddress?: PublicKeyish | null;
  tokenProgramId?: PublicKeyish | null;
  programId?: PublicKeyish;
}): Transaction {
  return buildFeeWithdrawalSplTx({
    ...params,
    instructionName: 'withdraw_protocol_fee_spl',
  });
}

export function buildWithdrawPoolTreasurySplTx(params: {
  authority: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  liquidityPoolAddress: PublicKeyish;
  assetMint: PublicKeyish;
  recipientTokenAccountAddress: PublicKeyish;
  recentBlockhash: string;
  amount: bigint;
  vaultTokenAccountAddress?: PublicKeyish | null;
  tokenProgramId?: PublicKeyish | null;
  programId?: PublicKeyish;
}): Transaction {
  return buildFeeWithdrawalSplTx({
    ...params,
    instructionName: 'withdraw_pool_treasury_spl',
  });
}

export function buildWithdrawPoolOracleFeeSplTx(params: {
  authority: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  liquidityPoolAddress: PublicKeyish;
  oracleAddress: PublicKeyish;
  assetMint: PublicKeyish;
  recipientTokenAccountAddress: PublicKeyish;
  recentBlockhash: string;
  amount: bigint;
  vaultTokenAccountAddress?: PublicKeyish | null;
  tokenProgramId?: PublicKeyish | null;
  programId?: PublicKeyish;
}): Transaction {
  return buildFeeWithdrawalSplTx({
    ...params,
    instructionName: 'withdraw_pool_oracle_fee_spl',
  });
}

function buildFeeWithdrawalSolTx(params: {
  instructionName:
    | 'withdraw_protocol_fee_sol'
    | 'withdraw_pool_treasury_sol'
    | 'withdraw_pool_oracle_fee_sol';
  authority: PublicKeyish;
  recipient: PublicKeyish;
  recentBlockhash: string;
  amount: bigint;
  reserveDomainAddress?: PublicKeyish;
  liquidityPoolAddress?: PublicKeyish;
  oracleAddress?: PublicKeyish;
  assetMint?: PublicKeyish;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const assetMint = toPublicKey(params.assetMint ?? NATIVE_SOL_MINT);
  const programId = params.programId ?? getProgramId();
  const baseAccounts: GenericInstructionAccounts = {
    authority,
    protocol_governance: deriveProtocolGovernancePda(programId),
    recipient: toPublicKey(params.recipient),
    system_program: SystemProgram.programId,
  };

  if (params.instructionName === 'withdraw_protocol_fee_sol') {
    if (!params.reserveDomainAddress) {
      throw new Error(
        'withdraw_protocol_fee_sol requires reserveDomainAddress',
      );
    }
    return buildConvenienceTransaction({
      instructionName: params.instructionName,
      feePayer: authority,
      recentBlockhash: params.recentBlockhash,
      programId,
      args: { amount: params.amount },
      accounts: {
        ...baseAccounts,
        reserve_domain: toPublicKey(params.reserveDomainAddress),
        protocol_fee_vault: deriveProtocolFeeVaultPda({
          reserveDomain: params.reserveDomainAddress,
          assetMint,
          programId,
        }),
      },
    });
  }

  if (!params.liquidityPoolAddress) {
    throw new Error(`${params.instructionName} requires liquidityPoolAddress`);
  }
  const liquidityPool = toPublicKey(params.liquidityPoolAddress);
  if (params.instructionName === 'withdraw_pool_treasury_sol') {
    return buildConvenienceTransaction({
      instructionName: params.instructionName,
      feePayer: authority,
      recentBlockhash: params.recentBlockhash,
      programId,
      args: { amount: params.amount },
      accounts: {
        ...baseAccounts,
        liquidity_pool: liquidityPool,
        pool_treasury_vault: derivePoolTreasuryVaultPda({
          liquidityPool,
          assetMint,
          programId,
        }),
      },
    });
  }

  if (!params.oracleAddress) {
    throw new Error('withdraw_pool_oracle_fee_sol requires oracleAddress');
  }
  return buildConvenienceTransaction({
    instructionName: params.instructionName,
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    programId,
    args: { amount: params.amount },
    accounts: {
      ...baseAccounts,
      liquidity_pool: liquidityPool,
      oracle_profile: deriveOracleProfilePda({
        oracle: params.oracleAddress,
        programId,
      }),
      pool_oracle_fee_vault: derivePoolOracleFeeVaultPda({
        liquidityPool,
        oracle: params.oracleAddress,
        assetMint,
        programId,
      }),
    },
  });
}

export function buildWithdrawProtocolFeeSolTx(params: {
  authority: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  recipient: PublicKeyish;
  recentBlockhash: string;
  amount: bigint;
  assetMint?: PublicKeyish;
  programId?: PublicKeyish;
}): Transaction {
  return buildFeeWithdrawalSolTx({
    ...params,
    instructionName: 'withdraw_protocol_fee_sol',
  });
}

export function buildWithdrawPoolTreasurySolTx(params: {
  authority: PublicKeyish;
  liquidityPoolAddress: PublicKeyish;
  recipient: PublicKeyish;
  recentBlockhash: string;
  amount: bigint;
  assetMint?: PublicKeyish;
  programId?: PublicKeyish;
}): Transaction {
  return buildFeeWithdrawalSolTx({
    ...params,
    instructionName: 'withdraw_pool_treasury_sol',
  });
}

export function buildWithdrawPoolOracleFeeSolTx(params: {
  authority: PublicKeyish;
  liquidityPoolAddress: PublicKeyish;
  oracleAddress: PublicKeyish;
  recipient: PublicKeyish;
  recentBlockhash: string;
  amount: bigint;
  assetMint?: PublicKeyish;
  programId?: PublicKeyish;
}): Transaction {
  return buildFeeWithdrawalSolTx({
    ...params,
    instructionName: 'withdraw_pool_oracle_fee_sol',
  });
}

export function buildPauseCommitmentCampaignTx(params: {
  authority: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  recentBlockhash: string;
  status: number;
  campaignAddress?: PublicKeyish | null;
  campaignId?: string | null;
  reasonHashHex?: string | null;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const programId = params.programId ?? getProgramId();
  const campaign = commitmentCampaignAddress({ ...params, programId });

  return buildOrderedTransaction({
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'pause_commitment_campaign',
    programId,
    args: {
      status: params.status,
      reason_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.reasonHashHex),
          'reason hash',
        ),
      ),
    },
    accounts: [
      { pubkey: authority, isSigner: true },
      { pubkey: deriveProtocolGovernancePda(programId) },
      { pubkey: params.healthPlanAddress },
      { pubkey: campaign, isWritable: true },
    ],
  });
}

export function buildOpenMemberPositionTx(params: {
  wallet: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  recentBlockhash: string;
  seriesScopeAddress?: PublicKeyish | null;
  subjectCommitmentHashHex?: string | null;
  eligibilityStatus: number;
  delegatedRightsMask: number;
  proofMode: number;
  tokenGateAmountSnapshot: bigint;
  inviteIdHashHex?: string | null;
  inviteExpiresAt: bigint;
  anchorRefAddress?: PublicKeyish | null;
  tokenGateAccountAddress?: PublicKeyish | null;
  inviteAuthorityAddress?: PublicKeyish | null;
  programId?: PublicKeyish;
}): Transaction {
  const wallet = toPublicKey(params.wallet);
  const seriesScope = toPublicKey(params.seriesScopeAddress ?? ZERO_PUBKEY_KEY);
  const anchorRef = toPublicKey(params.anchorRefAddress ?? ZERO_PUBKEY_KEY);
  const memberPosition = deriveMemberPositionPda({
    healthPlan: params.healthPlanAddress,
    wallet,
    seriesScope,
    programId: params.programId,
  });
  const membershipAnchorSeat = !anchorRef.equals(ZERO_PUBKEY_KEY)
    ? deriveMembershipAnchorSeatPda({
        healthPlan: params.healthPlanAddress,
        anchorRef,
        programId: params.programId,
      })
    : undefined;

  return buildOrderedTransaction({
    feePayer: wallet,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'open_member_position',
    programId: params.programId,
    args: {
      series_scope: seriesScope,
      subject_commitment: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.subjectCommitmentHashHex),
          'subject commitment hash',
        ),
      ),
      eligibility_status: params.eligibilityStatus,
      delegated_rights: params.delegatedRightsMask,
      proof_mode: params.proofMode,
      token_gate_amount_snapshot: params.tokenGateAmountSnapshot,
      invite_id_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.inviteIdHashHex),
          'invite id hash',
        ),
      ),
      invite_expires_at: params.inviteExpiresAt,
      anchor_ref: anchorRef,
    },
    accounts: [
      { pubkey: wallet, isSigner: true, isWritable: true },
      { pubkey: deriveProtocolGovernancePda(params.programId) },
      { pubkey: params.healthPlanAddress },
      { pubkey: memberPosition, isWritable: true },
      optionalProtocolAccount(membershipAnchorSeat, true),
      optionalProtocolAccount(params.tokenGateAccountAddress),
      optionalProtocolAccount(params.inviteAuthorityAddress, false, true),
      { pubkey: SystemProgram.programId },
    ],
  });
}

export function buildCreateObligationTx(params: {
  authority: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  fundingLineAddress: PublicKeyish;
  assetMint: PublicKeyish;
  recentBlockhash: string;
  obligationId: string;
  policySeriesAddress?: PublicKeyish | null;
  memberWalletAddress?: PublicKeyish | null;
  beneficiaryAddress?: PublicKeyish | null;
  claimCaseAddress?: PublicKeyish | null;
  liquidityPoolAddress?: PublicKeyish | null;
  capitalClassAddress?: PublicKeyish | null;
  allocationPositionAddress?: PublicKeyish | null;
  deliveryMode: number;
  amount: bigint;
  creationReasonHashHex?: string | null;
  poolAssetMint?: PublicKeyish | null;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const programId = params.programId ?? getProgramId();
  const obligation = deriveObligationPda({
    fundingLine: params.fundingLineAddress,
    obligationId: params.obligationId,
    programId,
  });
  return buildOrderedTransaction({
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'create_obligation',
    programId,
    args: {
      obligation_id: params.obligationId,
      asset_mint: toPublicKey(params.assetMint),
      policy_series: toPublicKey(params.policySeriesAddress ?? ZERO_PUBKEY_KEY),
      member_wallet: toPublicKey(params.memberWalletAddress ?? ZERO_PUBKEY_KEY),
      beneficiary: toPublicKey(params.beneficiaryAddress ?? ZERO_PUBKEY_KEY),
      claim_case: toPublicKey(params.claimCaseAddress ?? ZERO_PUBKEY_KEY),
      liquidity_pool: toPublicKey(
        params.liquidityPoolAddress ?? ZERO_PUBKEY_KEY,
      ),
      capital_class: toPublicKey(params.capitalClassAddress ?? ZERO_PUBKEY_KEY),
      allocation_position: toPublicKey(
        params.allocationPositionAddress ?? ZERO_PUBKEY_KEY,
      ),
      delivery_mode: params.deliveryMode,
      amount: params.amount,
      creation_reason_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.creationReasonHashHex),
          'creation reason hash',
        ),
      ),
    },
    accounts: [
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: deriveProtocolGovernancePda(programId) },
      { pubkey: params.healthPlanAddress },
      {
        pubkey: deriveDomainAssetLedgerPda({
          reserveDomain: params.reserveDomainAddress,
          assetMint: params.assetMint,
          programId,
        }),
        isWritable: true,
      },
      { pubkey: params.fundingLineAddress, isWritable: true },
      {
        pubkey: deriveFundingLineLedgerPda({
          fundingLine: params.fundingLineAddress,
          assetMint: params.assetMint,
          programId,
        }),
        isWritable: true,
      },
      {
        pubkey: derivePlanReserveLedgerPda({
          healthPlan: params.healthPlanAddress,
          assetMint: params.assetMint,
          programId,
        }),
        isWritable: true,
      },
      optionalSeriesReserveLedgerAccount(
        params.policySeriesAddress,
        params.assetMint,
        programId,
      ),
      optionalPoolClassLedgerAccount(
        params.capitalClassAddress,
        params.poolAssetMint,
        programId,
      ),
      optionalAllocationLedgerAccount(
        params.allocationPositionAddress,
        params.assetMint,
        programId,
      ),
      { pubkey: obligation, isWritable: true },
      { pubkey: SystemProgram.programId },
    ],
  });
}

export function buildOpenClaimCaseTx(params: {
  authority: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  memberPositionAddress: PublicKeyish;
  fundingLineAddress: PublicKeyish;
  recentBlockhash: string;
  claimId: string;
  policySeriesAddress?: PublicKeyish | null;
  claimantAddress?: PublicKeyish | null;
  memberWalletAddress?: PublicKeyish | null;
  evidenceRefHashHex?: string | null;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const programId = params.programId ?? getProgramId();
  const claimCase = deriveClaimCasePda({
    healthPlan: params.healthPlanAddress,
    claimId: params.claimId,
    programId,
  });
  const claimantAddress = params.claimantAddress ?? params.memberWalletAddress;
  if (!claimantAddress) {
    throw new Error(
      'claimantAddress or memberWalletAddress is required; operator claim intake must not default claimant to the operator authority',
    );
  }
  return buildOrderedTransaction({
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'open_claim_case',
    programId,
    args: {
      claim_id: params.claimId,
      policy_series: toPublicKey(params.policySeriesAddress ?? ZERO_PUBKEY_KEY),
      claimant: toPublicKey(claimantAddress),
      evidence_ref_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.evidenceRefHashHex),
          'evidence ref hash',
        ),
      ),
    },
    accounts: [
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: deriveProtocolGovernancePda(programId) },
      { pubkey: params.healthPlanAddress },
      { pubkey: params.memberPositionAddress },
      { pubkey: params.fundingLineAddress },
      { pubkey: claimCase, isWritable: true },
      { pubkey: SystemProgram.programId },
    ],
  });
}

export function buildAttachClaimEvidenceRefTx(params: {
  authority: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  claimCaseAddress: PublicKeyish;
  recentBlockhash: string;
  evidenceRefHashHex?: string | null;
  decisionSupportHashHex?: string | null;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const programId = params.programId ?? getProgramId();
  return buildOrderedTransaction({
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'attach_claim_evidence_ref',
    programId,
    args: {
      evidence_ref_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.evidenceRefHashHex),
          'evidence ref hash',
        ),
      ),
      decision_support_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.decisionSupportHashHex),
          'decision support hash',
        ),
      ),
    },
    accounts: [
      { pubkey: authority, isSigner: true },
      { pubkey: deriveProtocolGovernancePda(programId) },
      { pubkey: params.healthPlanAddress },
      { pubkey: params.claimCaseAddress, isWritable: true },
    ],
  });
}

export function buildAdjudicateClaimCaseTx(params: {
  authority: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  claimCaseAddress: PublicKeyish;
  recentBlockhash: string;
  reviewState: number;
  approvedAmount: bigint;
  deniedAmount: bigint;
  reserveAmount: bigint;
  decisionSupportHashHex?: string | null;
  obligationAddress?: PublicKeyish | null;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const programId = params.programId ?? getProgramId();
  return buildOrderedTransaction({
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'adjudicate_claim_case',
    programId,
    args: {
      review_state: params.reviewState,
      approved_amount: params.approvedAmount,
      denied_amount: params.deniedAmount,
      reserve_amount: params.reserveAmount,
      decision_support_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.decisionSupportHashHex),
          'decision support hash',
        ),
      ),
    },
    accounts: [
      { pubkey: authority, isSigner: true },
      { pubkey: deriveProtocolGovernancePda(programId) },
      { pubkey: params.healthPlanAddress },
      { pubkey: params.claimCaseAddress, isWritable: true },
      optionalProtocolAccount(params.obligationAddress, true),
    ],
  });
}

function buildObligationFlowTx(params: {
  instructionName:
    | 'reserve_obligation'
    | 'release_reserve'
    | 'settle_obligation';
  authority: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  fundingLineAddress: PublicKeyish;
  assetMint: PublicKeyish;
  obligationAddress: PublicKeyish;
  recentBlockhash: string;
  claimCaseAddress?: PublicKeyish | null;
  policySeriesAddress?: PublicKeyish | null;
  capitalClassAddress?: PublicKeyish | null;
  allocationPositionAddress?: PublicKeyish | null;
  poolAssetMint?: PublicKeyish | null;
  memberPositionAddress?: PublicKeyish | null;
  vaultTokenAccountAddress?: PublicKeyish | null;
  recipientTokenAccountAddress?: PublicKeyish | null;
  tokenProgramId?: PublicKeyish | null;
  poolOracleFeeVaultAddress?: PublicKeyish | null;
  poolOraclePolicyAddress?: PublicKeyish | null;
  oracleFeeAttestationAddress?: PublicKeyish | null;
  args: Record<string, unknown>;
  includeVault?: boolean;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const programId = params.programId ?? getProgramId();
  assertAllOrNoneAccountScope('LP allocation', {
    capitalClassAddress: params.capitalClassAddress,
    allocationPositionAddress: params.allocationPositionAddress,
    poolAssetMint: params.poolAssetMint,
  });
  if (params.instructionName === 'settle_obligation') {
    assertAllOrNoneAccountScope('settlement outflow', {
      memberPositionAddress: params.memberPositionAddress,
      vaultTokenAccountAddress: params.vaultTokenAccountAddress,
      recipientTokenAccountAddress: params.recipientTokenAccountAddress,
      tokenProgramId: params.tokenProgramId,
    });
    if (!params.memberPositionAddress) {
      throw new Error(
        'settle_obligation requires memberPositionAddress, vaultTokenAccountAddress, recipientTokenAccountAddress, and tokenProgramId for payout/custody safety',
      );
    }
    classicTokenProgramId(params.tokenProgramId);
    assertAllOrNoneAccountScope('settlement oracle fee', {
      poolOracleFeeVaultAddress: params.poolOracleFeeVaultAddress,
      poolOraclePolicyAddress: params.poolOraclePolicyAddress,
      oracleFeeAttestationAddress: params.oracleFeeAttestationAddress,
    });
    if (
      hasAnyAccountScopeValue([
        params.poolOracleFeeVaultAddress,
        params.poolOraclePolicyAddress,
        params.oracleFeeAttestationAddress,
      ]) &&
      !params.claimCaseAddress
    ) {
      throw new Error(
        'settlement oracle fee account scope requires claimCaseAddress',
      );
    }
  }
  return buildOrderedTransaction({
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    instructionName: params.instructionName,
    programId,
    args: params.args,
    accounts: [
      { pubkey: authority, isSigner: true },
      { pubkey: deriveProtocolGovernancePda(programId) },
      { pubkey: params.healthPlanAddress },
      ...(params.includeVault
        ? [
            {
              pubkey: deriveDomainAssetVaultPda({
                reserveDomain: params.reserveDomainAddress,
                assetMint: params.assetMint,
                programId,
              }),
              isWritable: true,
            } satisfies ProtocolInstructionAccountInput,
          ]
        : []),
      {
        pubkey: deriveDomainAssetLedgerPda({
          reserveDomain: params.reserveDomainAddress,
          assetMint: params.assetMint,
          programId,
        }),
        isWritable: true,
      },
      { pubkey: params.fundingLineAddress, isWritable: true },
      {
        pubkey: deriveFundingLineLedgerPda({
          fundingLine: params.fundingLineAddress,
          assetMint: params.assetMint,
          programId,
        }),
        isWritable: true,
      },
      {
        pubkey: derivePlanReserveLedgerPda({
          healthPlan: params.healthPlanAddress,
          assetMint: params.assetMint,
          programId,
        }),
        isWritable: true,
      },
      optionalSeriesReserveLedgerAccount(
        params.policySeriesAddress,
        params.assetMint,
        programId,
      ),
      optionalPoolClassLedgerAccount(
        params.capitalClassAddress,
        params.poolAssetMint,
        programId,
      ),
      optionalProtocolAccount(params.allocationPositionAddress, true),
      optionalAllocationLedgerAccount(
        params.allocationPositionAddress,
        params.assetMint,
        programId,
      ),
      { pubkey: params.obligationAddress, isWritable: true },
      optionalProtocolAccount(params.claimCaseAddress, true),
      ...(params.instructionName === 'settle_obligation'
        ? [
            optionalProtocolAccount(params.memberPositionAddress),
            optionalProtocolAccount(params.assetMint),
            optionalProtocolAccount(params.vaultTokenAccountAddress, true),
            optionalProtocolAccount(params.recipientTokenAccountAddress, true),
            optionalProtocolAccount(params.tokenProgramId),
            optionalProtocolAccount(params.poolOracleFeeVaultAddress, true),
            optionalProtocolAccount(params.poolOraclePolicyAddress),
            optionalProtocolAccount(params.oracleFeeAttestationAddress),
          ]
        : []),
    ],
  });
}

export function buildReserveObligationTx(params: {
  authority: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  fundingLineAddress: PublicKeyish;
  assetMint: PublicKeyish;
  obligationAddress: PublicKeyish;
  recentBlockhash: string;
  amount: bigint;
  claimCaseAddress?: PublicKeyish | null;
  policySeriesAddress?: PublicKeyish | null;
  capitalClassAddress?: PublicKeyish | null;
  allocationPositionAddress?: PublicKeyish | null;
  poolAssetMint?: PublicKeyish | null;
  programId?: PublicKeyish;
}): Transaction {
  return buildObligationFlowTx({
    ...params,
    instructionName: 'reserve_obligation',
    args: { amount: params.amount },
  });
}

export function buildReleaseReserveTx(params: {
  authority: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  fundingLineAddress: PublicKeyish;
  assetMint: PublicKeyish;
  obligationAddress: PublicKeyish;
  recentBlockhash: string;
  amount: bigint;
  claimCaseAddress?: PublicKeyish | null;
  policySeriesAddress?: PublicKeyish | null;
  capitalClassAddress?: PublicKeyish | null;
  allocationPositionAddress?: PublicKeyish | null;
  poolAssetMint?: PublicKeyish | null;
  programId?: PublicKeyish;
}): Transaction {
  return buildObligationFlowTx({
    ...params,
    instructionName: 'release_reserve',
    args: { amount: params.amount },
  });
}

export function buildSettleObligationTx(
  params: {
    authority: PublicKeyish;
    healthPlanAddress: PublicKeyish;
    reserveDomainAddress: PublicKeyish;
    fundingLineAddress: PublicKeyish;
    assetMint: PublicKeyish;
    obligationAddress: PublicKeyish;
    recentBlockhash: string;
    nextStatus: number;
    amount: bigint;
    settlementReasonHashHex?: string | null;
    claimCaseAddress?: PublicKeyish | null;
    policySeriesAddress?: PublicKeyish | null;
    capitalClassAddress?: PublicKeyish | null;
    allocationPositionAddress?: PublicKeyish | null;
    poolAssetMint?: PublicKeyish | null;
    programId?: PublicKeyish;
  } & SettlementOutflowAccounts,
): Transaction {
  return buildObligationFlowTx({
    ...params,
    instructionName: 'settle_obligation',
    includeVault: true,
    args: {
      next_status: params.nextStatus,
      amount: params.amount,
      settlement_reason_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.settlementReasonHashHex),
          'settlement reason hash',
        ),
      ),
    },
  });
}

export function buildUpdateLpPositionCredentialingTx(params: {
  authority: PublicKeyish;
  poolAddress: PublicKeyish;
  capitalClassAddress: PublicKeyish;
  ownerAddress: PublicKeyish;
  recentBlockhash: string;
  credentialed: boolean;
  reasonHashHex?: string | null;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const programId = params.programId ?? getProgramId();
  return buildOrderedTransaction({
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'update_lp_position_credentialing',
    programId,
    args: {
      owner: toPublicKey(params.ownerAddress),
      credentialed: params.credentialed,
      reason_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.reasonHashHex),
          'reason hash',
        ),
      ),
    },
    accounts: [
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: deriveProtocolGovernancePda(programId) },
      { pubkey: params.poolAddress },
      { pubkey: params.capitalClassAddress },
      {
        pubkey: deriveLpPositionPda({
          capitalClass: params.capitalClassAddress,
          owner: params.ownerAddress,
          programId,
        }),
        isWritable: true,
      },
      { pubkey: SystemProgram.programId },
    ],
  });
}

export function buildMarkImpairmentTx(params: {
  authority: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  reserveDomainAddress: PublicKeyish;
  fundingLineAddress: PublicKeyish;
  assetMint: PublicKeyish;
  recentBlockhash: string;
  amount: bigint;
  reasonHashHex?: string | null;
  policySeriesAddress?: PublicKeyish | null;
  capitalClassAddress?: PublicKeyish | null;
  allocationPositionAddress?: PublicKeyish | null;
  obligationAddress?: PublicKeyish | null;
  poolAssetMint?: PublicKeyish | null;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const programId = params.programId ?? getProgramId();
  assertAllOrNoneAccountScope('LP allocation', {
    capitalClassAddress: params.capitalClassAddress,
    allocationPositionAddress: params.allocationPositionAddress,
    poolAssetMint: params.poolAssetMint,
  });
  return buildOrderedTransaction({
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    instructionName: 'mark_impairment',
    programId,
    args: {
      amount: params.amount,
      reason_hash: Array.from(
        hexToFixedBytes(
          normalizeOptionalHex32(params.reasonHashHex),
          'reason hash',
        ),
      ),
    },
    accounts: [
      { pubkey: authority, isSigner: true },
      { pubkey: deriveProtocolGovernancePda(programId) },
      { pubkey: params.healthPlanAddress },
      {
        pubkey: deriveDomainAssetLedgerPda({
          reserveDomain: params.reserveDomainAddress,
          assetMint: params.assetMint,
          programId,
        }),
        isWritable: true,
      },
      { pubkey: params.fundingLineAddress, isWritable: true },
      {
        pubkey: deriveFundingLineLedgerPda({
          fundingLine: params.fundingLineAddress,
          assetMint: params.assetMint,
          programId,
        }),
        isWritable: true,
      },
      {
        pubkey: derivePlanReserveLedgerPda({
          healthPlan: params.healthPlanAddress,
          assetMint: params.assetMint,
          programId,
        }),
        isWritable: true,
      },
      optionalSeriesReserveLedgerAccount(
        params.policySeriesAddress,
        params.assetMint,
        programId,
      ),
      optionalPoolClassLedgerAccount(
        params.capitalClassAddress,
        params.poolAssetMint,
        programId,
      ),
      optionalProtocolAccount(params.allocationPositionAddress, true),
      optionalAllocationLedgerAccount(
        params.allocationPositionAddress,
        params.assetMint,
        programId,
      ),
      optionalProtocolAccount(params.obligationAddress, true),
    ],
  });
}

export function buildRegisterOracleTx(params: {
  admin: PublicKeyish;
  oracle: PublicKeyish;
  recentBlockhash: string;
  oracleType: number;
  displayName: string;
  legalName: string;
  websiteUrl: string;
  appUrl: string;
  logoUri: string;
  webhookUrl: string;
  supportedSchemaKeyHashesHex: string[];
  programId?: PublicKeyish;
}): Transaction {
  const admin = toPublicKey(params.admin);
  const oracle = toPublicKey(params.oracle);
  if (!admin.equals(oracle)) {
    throw new Error(
      'register_oracle requires admin and oracle to match; use a documented recovery flow before separating these authorities',
    );
  }
  return buildConvenienceTransaction({
    instructionName: 'register_oracle',
    feePayer: admin,
    recentBlockhash: params.recentBlockhash,
    programId: params.programId,
    args: {
      oracle,
      oracle_type: params.oracleType,
      display_name: params.displayName,
      legal_name: params.legalName,
      website_url: params.websiteUrl,
      app_url: params.appUrl,
      logo_uri: params.logoUri,
      webhook_url: params.webhookUrl,
      supported_schema_key_hashes: params.supportedSchemaKeyHashesHex.map(
        (value) => Array.from(hexToFixedBytes(value, 'schema key hash')),
      ),
    },
    accounts: {
      admin,
      oracle_profile: deriveOracleProfilePda({
        oracle,
        programId: params.programId,
      }),
      system_program: SystemProgram.programId,
    },
  });
}

export function buildClaimOracleTx(params: {
  oracle: PublicKeyish;
  recentBlockhash: string;
  programId?: PublicKeyish;
}): Transaction {
  const oracle = toPublicKey(params.oracle);
  return buildConvenienceTransaction({
    instructionName: 'claim_oracle',
    feePayer: oracle,
    recentBlockhash: params.recentBlockhash,
    programId: params.programId,
    args: {},
    accounts: {
      oracle,
      oracle_profile: deriveOracleProfilePda({
        oracle,
        programId: params.programId,
      }),
    },
  });
}

export function buildUpdateOracleProfileTx(params: {
  authority: PublicKeyish;
  oracle: PublicKeyish;
  recentBlockhash: string;
  oracleType: number;
  displayName: string;
  legalName: string;
  websiteUrl: string;
  appUrl: string;
  logoUri: string;
  webhookUrl: string;
  supportedSchemaKeyHashesHex: string[];
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const oracle = toPublicKey(params.oracle);
  return buildConvenienceTransaction({
    instructionName: 'update_oracle_profile',
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    programId: params.programId,
    args: {
      oracle_type: params.oracleType,
      display_name: params.displayName,
      legal_name: params.legalName,
      website_url: params.websiteUrl,
      app_url: params.appUrl,
      logo_uri: params.logoUri,
      webhook_url: params.webhookUrl,
      supported_schema_key_hashes: params.supportedSchemaKeyHashesHex.map(
        (value) => Array.from(hexToFixedBytes(value, 'schema key hash')),
      ),
    },
    accounts: {
      authority,
      protocol_governance: deriveProtocolGovernancePda(
        params.programId ?? getProgramId(),
      ),
      oracle_profile: deriveOracleProfilePda({
        oracle,
        programId: params.programId,
      }),
    },
  });
}

export function buildSetPoolOracleTx(params: {
  authority: PublicKeyish;
  poolAddress: PublicKeyish;
  oracle: PublicKeyish;
  recentBlockhash: string;
  active: boolean;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const liquidityPool = toPublicKey(params.poolAddress);
  const oracle = toPublicKey(params.oracle);
  return buildConvenienceTransaction({
    instructionName: 'set_pool_oracle',
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    programId: params.programId,
    args: { active: params.active },
    accounts: {
      authority,
      protocol_governance: deriveProtocolGovernancePda(
        params.programId ?? getProgramId(),
      ),
      liquidity_pool: liquidityPool,
      oracle_profile: deriveOracleProfilePda({
        oracle,
        programId: params.programId,
      }),
      pool_oracle_approval: derivePoolOracleApprovalPda({
        liquidityPool,
        oracle,
        programId: params.programId,
      }),
      system_program: SystemProgram.programId,
    },
  });
}

export function buildSetPoolOraclePermissionsTx(params: {
  authority: PublicKeyish;
  poolAddress: PublicKeyish;
  oracle: PublicKeyish;
  permissions: number;
  recentBlockhash: string;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const liquidityPool = toPublicKey(params.poolAddress);
  const oracle = toPublicKey(params.oracle);
  return buildConvenienceTransaction({
    instructionName: 'set_pool_oracle_permissions',
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    programId: params.programId,
    args: { permissions: params.permissions },
    accounts: {
      authority,
      protocol_governance: deriveProtocolGovernancePda(
        params.programId ?? getProgramId(),
      ),
      liquidity_pool: liquidityPool,
      oracle_profile: deriveOracleProfilePda({
        oracle,
        programId: params.programId,
      }),
      pool_oracle_approval: derivePoolOracleApprovalPda({
        liquidityPool,
        oracle,
        programId: params.programId,
      }),
      pool_oracle_permission_set: derivePoolOraclePermissionSetPda({
        liquidityPool,
        oracle,
        programId: params.programId,
      }),
      system_program: SystemProgram.programId,
    },
  });
}

export function buildSetPoolOraclePolicyTx(params: {
  authority: PublicKeyish;
  poolAddress: PublicKeyish;
  recentBlockhash: string;
  quorumM: number;
  quorumN: number;
  requireVerifiedSchema: boolean;
  oracleFeeBps: number;
  allowDelegateClaim: boolean;
  challengeWindowSecs: number;
  programId?: PublicKeyish;
}): Transaction {
  const authority = toPublicKey(params.authority);
  const liquidityPool = toPublicKey(params.poolAddress);
  return buildConvenienceTransaction({
    instructionName: 'set_pool_oracle_policy',
    feePayer: authority,
    recentBlockhash: params.recentBlockhash,
    programId: params.programId,
    args: {
      quorum_m: params.quorumM,
      quorum_n: params.quorumN,
      require_verified_schema: params.requireVerifiedSchema,
      oracle_fee_bps: params.oracleFeeBps,
      allow_delegate_claim: params.allowDelegateClaim,
      challenge_window_secs: params.challengeWindowSecs,
    },
    accounts: {
      authority,
      protocol_governance: deriveProtocolGovernancePda(
        params.programId ?? getProgramId(),
      ),
      liquidity_pool: liquidityPool,
      pool_oracle_policy: derivePoolOraclePolicyPda({
        liquidityPool,
        programId: params.programId,
      }),
      system_program: SystemProgram.programId,
    },
  });
}

export function buildRegisterOutcomeSchemaTx(params: {
  publisher: PublicKeyish;
  recentBlockhash: string;
  schemaKeyHashHex: string;
  schemaKey: string;
  version: number;
  schemaHashHex: string;
  schemaFamily: number;
  visibility: number;
  metadataUri: string;
  programId?: PublicKeyish;
}): Transaction {
  const publisher = toPublicKey(params.publisher);
  const normalizedSchemaKeyHash = normalizeHex32(
    params.schemaKeyHashHex,
    'schema key hash',
  );
  return buildConvenienceTransaction({
    instructionName: 'register_outcome_schema',
    feePayer: publisher,
    recentBlockhash: params.recentBlockhash,
    programId: params.programId,
    args: {
      schema_key_hash: Array.from(
        hexToFixedBytes(normalizedSchemaKeyHash, 'schema key hash'),
      ),
      schema_key: params.schemaKey,
      version: params.version,
      schema_hash: Array.from(
        hexToFixedBytes(params.schemaHashHex, 'schema hash'),
      ),
      schema_family: params.schemaFamily,
      visibility: params.visibility,
      metadata_uri: params.metadataUri,
    },
    accounts: {
      publisher,
      outcome_schema: deriveOutcomeSchemaPda({
        schemaKeyHashHex: normalizedSchemaKeyHash,
        programId: params.programId,
      }),
      schema_dependency_ledger: deriveSchemaDependencyLedgerPda({
        schemaKeyHashHex: normalizedSchemaKeyHash,
        programId: params.programId,
      }),
      system_program: SystemProgram.programId,
    },
  });
}

export function buildVerifyOutcomeSchemaTx(params: {
  governanceAuthority: PublicKeyish;
  recentBlockhash: string;
  schemaKeyHashHex: string;
  verified: boolean;
  programId?: PublicKeyish;
}): Transaction {
  const governanceAuthority = toPublicKey(params.governanceAuthority);
  const normalizedSchemaKeyHash = normalizeHex32(
    params.schemaKeyHashHex,
    'schema key hash',
  );
  return buildConvenienceTransaction({
    instructionName: 'verify_outcome_schema',
    feePayer: governanceAuthority,
    recentBlockhash: params.recentBlockhash,
    programId: params.programId,
    args: {
      verified: params.verified,
    },
    accounts: {
      governance_authority: governanceAuthority,
      protocol_governance: deriveProtocolGovernancePda(
        params.programId ?? getProgramId(),
      ),
      outcome_schema: deriveOutcomeSchemaPda({
        schemaKeyHashHex: normalizedSchemaKeyHash,
        programId: params.programId,
      }),
    },
  });
}

export function buildBackfillSchemaDependencyLedgerTx(params: {
  governanceAuthority: PublicKeyish;
  recentBlockhash: string;
  schemaKeyHashHex: string;
  poolRuleAddresses: PublicKeyish[];
  programId?: PublicKeyish;
}): Transaction {
  const governanceAuthority = toPublicKey(params.governanceAuthority);
  const normalizedSchemaKeyHash = normalizeHex32(
    params.schemaKeyHashHex,
    'schema key hash',
  );
  return buildConvenienceTransaction({
    instructionName: 'backfill_schema_dependency_ledger',
    feePayer: governanceAuthority,
    recentBlockhash: params.recentBlockhash,
    programId: params.programId,
    args: {
      schema_key_hash: Array.from(
        hexToFixedBytes(normalizedSchemaKeyHash, 'schema key hash'),
      ),
      pool_rule_addresses: params.poolRuleAddresses.map((value) =>
        toPublicKey(value),
      ),
    },
    accounts: {
      governance_authority: governanceAuthority,
      protocol_governance: deriveProtocolGovernancePda(
        params.programId ?? getProgramId(),
      ),
      outcome_schema: deriveOutcomeSchemaPda({
        schemaKeyHashHex: normalizedSchemaKeyHash,
        programId: params.programId,
      }),
      schema_dependency_ledger: deriveSchemaDependencyLedgerPda({
        schemaKeyHashHex: normalizedSchemaKeyHash,
        programId: params.programId,
      }),
      system_program: SystemProgram.programId,
    },
  });
}

export function buildCloseOutcomeSchemaTx(params: {
  governanceAuthority: PublicKeyish;
  recipientSystemAccount: PublicKeyish;
  recentBlockhash: string;
  schemaKeyHashHex: string;
  programId?: PublicKeyish;
}): Transaction {
  const governanceAuthority = toPublicKey(params.governanceAuthority);
  const normalizedSchemaKeyHash = normalizeHex32(
    params.schemaKeyHashHex,
    'schema key hash',
  );
  return buildConvenienceTransaction({
    instructionName: 'close_outcome_schema',
    feePayer: governanceAuthority,
    recentBlockhash: params.recentBlockhash,
    programId: params.programId,
    args: {},
    accounts: {
      governance_authority: governanceAuthority,
      protocol_governance: deriveProtocolGovernancePda(
        params.programId ?? getProgramId(),
      ),
      outcome_schema: deriveOutcomeSchemaPda({
        schemaKeyHashHex: normalizedSchemaKeyHash,
        programId: params.programId,
      }),
      schema_dependency_ledger: deriveSchemaDependencyLedgerPda({
        schemaKeyHashHex: normalizedSchemaKeyHash,
        programId: params.programId,
      }),
      recipient_system_account: toPublicKey(params.recipientSystemAccount),
    },
  });
}

function assertValidClaimAttestationDecision(decision: number): void {
  if (
    decision !== CLAIM_ATTESTATION_DECISION_SUPPORT_APPROVE &&
    decision !== CLAIM_ATTESTATION_DECISION_SUPPORT_DENY &&
    decision !== CLAIM_ATTESTATION_DECISION_REQUEST_REVIEW &&
    decision !== CLAIM_ATTESTATION_DECISION_ABSTAIN
  ) {
    throw new Error(
      'claim attestation decision must be one of 0 (approve), 1 (deny), 2 (review), or 3 (abstain)',
    );
  }
}

export function buildAttestClaimCaseTx(params: {
  oracle: PublicKeyish;
  healthPlanAddress: PublicKeyish;
  claimCaseAddress: PublicKeyish;
  fundingLineAddress: PublicKeyish;
  recentBlockhash: string;
  decision: number;
  attestationHashHex: string;
  attestationRefHashHex?: string | null;
  schemaKeyHashHex: string;
  liquidityPoolAddress?: PublicKeyish | null;
  capitalClassAddress?: PublicKeyish | null;
  allocationPositionAddress?: PublicKeyish | null;
  poolOracleApprovalAddress?: PublicKeyish | null;
  poolOraclePermissionSetAddress?: PublicKeyish | null;
  poolOraclePolicyAddress?: PublicKeyish | null;
  programId?: PublicKeyish;
}): Transaction {
  const oracle = toPublicKey(params.oracle);
  const claimCase = toPublicKey(params.claimCaseAddress);
  const programId = params.programId ?? getProgramId();
  assertValidClaimAttestationDecision(params.decision);
  const attestationHash = normalizeHex32(
    params.attestationHashHex,
    'attestation hash',
  );
  const attestationRefHash = normalizeHex32(
    params.attestationRefHashHex ?? '0'.repeat(64),
    'attestation ref hash',
  );
  const schemaKeyHash = normalizeHex32(
    params.schemaKeyHashHex,
    'schema key hash',
  );
  const poolScopeRequested = hasAnyAccountScopeValue([
    params.liquidityPoolAddress,
    params.capitalClassAddress,
    params.allocationPositionAddress,
    params.poolOracleApprovalAddress,
    params.poolOraclePermissionSetAddress,
    params.poolOraclePolicyAddress,
  ]);
  if (
    poolScopeRequested &&
    (!params.liquidityPoolAddress || !params.capitalClassAddress)
  ) {
    throw new Error(
      'claim attestation pool scope requires liquidityPoolAddress and capitalClassAddress together; derived pool oracle and allocation accounts are added from that complete scope',
    );
  }
  const liquidityPool = params.liquidityPoolAddress
    ? toPublicKey(params.liquidityPoolAddress)
    : undefined;
  const capitalClass = params.capitalClassAddress
    ? toPublicKey(params.capitalClassAddress)
    : undefined;
  const allocationPosition = params.allocationPositionAddress
    ? toPublicKey(params.allocationPositionAddress)
    : capitalClass
      ? deriveAllocationPositionPda({
          capitalClass,
          fundingLine: params.fundingLineAddress,
          programId,
        })
      : undefined;
  const poolOracleApproval = params.poolOracleApprovalAddress
    ? toPublicKey(params.poolOracleApprovalAddress)
    : liquidityPool
      ? derivePoolOracleApprovalPda({ liquidityPool, oracle, programId })
      : undefined;
  const poolOraclePermissionSet = params.poolOraclePermissionSetAddress
    ? toPublicKey(params.poolOraclePermissionSetAddress)
    : liquidityPool
      ? derivePoolOraclePermissionSetPda({ liquidityPool, oracle, programId })
      : undefined;
  const poolOraclePolicy = params.poolOraclePolicyAddress
    ? toPublicKey(params.poolOraclePolicyAddress)
    : liquidityPool
      ? derivePoolOraclePolicyPda({ liquidityPool, programId })
      : undefined;
  return buildConvenienceTransaction({
    instructionName: 'attest_claim_case',
    feePayer: oracle,
    recentBlockhash: params.recentBlockhash,
    programId,
    args: {
      decision: params.decision,
      attestation_hash: Array.from(
        hexToFixedBytes(attestationHash, 'attestation hash'),
      ),
      attestation_ref_hash: Array.from(
        hexToFixedBytes(attestationRefHash, 'attestation ref hash'),
      ),
      schema_key_hash: Array.from(
        hexToFixedBytes(schemaKeyHash, 'schema key hash'),
      ),
    },
    accounts: {
      oracle,
      protocol_governance: deriveProtocolGovernancePda(programId),
      health_plan: toPublicKey(params.healthPlanAddress),
      oracle_profile: deriveOracleProfilePda({ oracle, programId }),
      claim_case: claimCase,
      funding_line: toPublicKey(params.fundingLineAddress),
      outcome_schema: deriveOutcomeSchemaPda({
        schemaKeyHashHex: schemaKeyHash,
        programId,
      }),
      claim_attestation: deriveClaimAttestationPda({
        claimCase,
        oracle,
        programId,
      }),
      liquidity_pool: liquidityPool,
      capital_class: capitalClass,
      allocation_position: allocationPosition,
      pool_oracle_approval: poolOracleApproval,
      pool_oracle_permission_set: poolOraclePermissionSet,
      pool_oracle_policy: poolOraclePolicy,
      system_program: SystemProgram.programId,
    },
  });
}

export function compileTransactionToV0(
  transaction: Transaction,
  lookupTableAccounts: AddressLookupTableAccount[],
): VersionedTransaction {
  if (!transaction.feePayer) {
    throw new Error(
      'transaction fee payer is required to compile a v0 transaction',
    );
  }
  if (!transaction.recentBlockhash) {
    throw new Error(
      'transaction recentBlockhash is required to compile a v0 transaction',
    );
  }

  const message = new TransactionMessage({
    payerKey: transaction.feePayer,
    recentBlockhash: transaction.recentBlockhash,
    instructions: transaction.instructions,
  }).compileToV0Message(lookupTableAccounts);

  return new VersionedTransaction(message);
}

export async function preflightClassicTokenAccount(params: {
  connection: Connection;
  tokenAccountAddress: PublicKeyish;
  mintAddress: PublicKeyish;
  ownerAddress?: PublicKeyish | null;
  label?: string;
}): Promise<void> {
  const label = params.label ?? 'token account';
  const tokenAccount = toPublicKey(params.tokenAccountAddress);
  const expectedMint = toPublicKey(params.mintAddress);
  const expectedOwner = params.ownerAddress
    ? toPublicKey(params.ownerAddress)
    : null;
  const info = await params.connection.getAccountInfo(
    tokenAccount,
    'confirmed',
  );
  if (!info) {
    throw new Error(`${label} ${tokenAccount.toBase58()} does not exist`);
  }
  if (!info.owner.equals(SPL_TOKEN_PROGRAM_ID)) {
    throw new Error(`${label} must be owned by the classic SPL Token program`);
  }
  if (info.data.length < 72) {
    throw new Error(`${label} has invalid SPL Token account data`);
  }

  const actualMint = new PublicKey(info.data.subarray(0, 32));
  const actualOwner = new PublicKey(info.data.subarray(32, 64));
  if (!actualMint.equals(expectedMint)) {
    throw new Error(
      `${label} mint mismatch: expected ${expectedMint.toBase58()}, got ${actualMint.toBase58()}`,
    );
  }
  if (expectedOwner && !actualOwner.equals(expectedOwner)) {
    throw new Error(
      `${label} owner mismatch: expected ${expectedOwner.toBase58()}, got ${actualOwner.toBase58()}`,
    );
  }
}

export function createSafeProtocolClient(
  connection: Connection,
  options?: {
    programId?: PublicKeyish;
    unsafeAllowCustomProgramId?: boolean;
  },
) {
  const programId = resolveProgramIdForBuild({
    programId: options?.programId,
    unsafeAllowCustomProgramId: options?.unsafeAllowCustomProgramId,
  });
  const raw = createProtocolClient(connection, programId, {
    unsafeAllowCustomProgramId: options?.unsafeAllowCustomProgramId,
  });

  const preflightDomainVaultInflow = async (params: {
    authority: PublicKeyish;
    reserveDomainAddress: PublicKeyish;
    assetMint: PublicKeyish;
    sourceTokenAccountAddress: PublicKeyish;
    vaultTokenAccountAddress?: PublicKeyish | null;
    sourceLabel: string;
  }): Promise<void> => {
    const assetMint = toPublicKey(params.assetMint);
    const vaultTokenAccount = domainVaultTokenAddress({
      reserveDomainAddress: params.reserveDomainAddress,
      assetMint,
      vaultTokenAccountAddress: params.vaultTokenAccountAddress,
      programId,
    });
    const domainAssetVault = domainVaultAddress({
      reserveDomainAddress: params.reserveDomainAddress,
      assetMint,
      programId,
    });
    await preflightClassicTokenAccount({
      connection,
      tokenAccountAddress: params.sourceTokenAccountAddress,
      mintAddress: assetMint,
      ownerAddress: params.authority,
      label: params.sourceLabel,
    });
    await preflightClassicTokenAccount({
      connection,
      tokenAccountAddress: vaultTokenAccount,
      mintAddress: assetMint,
      ownerAddress: domainAssetVault,
      label: 'domain vault token account',
    });
  };

  const preflightDomainVaultOutflow = async (params: {
    reserveDomainAddress: PublicKeyish;
    assetMint: PublicKeyish;
    recipientTokenAccountAddress: PublicKeyish;
    vaultTokenAccountAddress?: PublicKeyish | null;
    recipientOwnerAddress?: PublicKeyish | null;
    recipientLabel?: string;
  }): Promise<void> => {
    const assetMint = toPublicKey(params.assetMint);
    const vaultTokenAccount = domainVaultTokenAddress({
      reserveDomainAddress: params.reserveDomainAddress,
      assetMint,
      vaultTokenAccountAddress: params.vaultTokenAccountAddress,
      programId,
    });
    const domainAssetVault = domainVaultAddress({
      reserveDomainAddress: params.reserveDomainAddress,
      assetMint,
      programId,
    });
    await preflightClassicTokenAccount({
      connection,
      tokenAccountAddress: vaultTokenAccount,
      mintAddress: assetMint,
      ownerAddress: domainAssetVault,
      label: 'domain vault token account',
    });
    await preflightClassicTokenAccount({
      connection,
      tokenAccountAddress: params.recipientTokenAccountAddress,
      mintAddress: assetMint,
      ownerAddress: params.recipientOwnerAddress,
      label: params.recipientLabel ?? 'recipient token account',
    });
  };

  return {
    connection,
    programId,
    raw,
    getProgramId: () => programId,
    async buildDepositCommitmentTx(
      params: Omit<Parameters<typeof buildDepositCommitmentTx>[0], 'programId'>,
    ): Promise<Transaction> {
      const paymentAssetMint = toPublicKey(params.paymentAssetMint);
      const vaultTokenAccount = params.vaultTokenAccountAddress
        ? toPublicKey(params.vaultTokenAccountAddress)
        : deriveDomainAssetVaultTokenAccountPda({
            reserveDomain: params.reserveDomainAddress,
            assetMint: paymentAssetMint,
            programId,
          });
      const domainAssetVault = deriveDomainAssetVaultPda({
        reserveDomain: params.reserveDomainAddress,
        assetMint: paymentAssetMint,
        programId,
      });
      await preflightClassicTokenAccount({
        connection,
        tokenAccountAddress: params.sourceTokenAccountAddress,
        mintAddress: paymentAssetMint,
        ownerAddress: params.depositor,
        label: 'deposit source token account',
      });
      await preflightClassicTokenAccount({
        connection,
        tokenAccountAddress: vaultTokenAccount,
        mintAddress: paymentAssetMint,
        ownerAddress: domainAssetVault,
        label: 'domain vault token account',
      });
      return buildDepositCommitmentTx({ ...params, programId });
    },
    async buildFundSponsorBudgetTx(
      params: Omit<Parameters<typeof buildFundSponsorBudgetTx>[0], 'programId'>,
    ): Promise<Transaction> {
      await preflightDomainVaultInflow({
        authority: params.authority,
        reserveDomainAddress: params.reserveDomainAddress,
        assetMint: params.assetMint,
        sourceTokenAccountAddress: params.sourceTokenAccountAddress,
        vaultTokenAccountAddress: params.vaultTokenAccountAddress,
        sourceLabel: 'sponsor funding source token account',
      });
      return buildFundSponsorBudgetTx({ ...params, programId });
    },
    async buildRecordPremiumPaymentTx(
      params: Omit<
        Parameters<typeof buildRecordPremiumPaymentTx>[0],
        'programId'
      >,
    ): Promise<Transaction> {
      await preflightDomainVaultInflow({
        authority: params.authority,
        reserveDomainAddress: params.reserveDomainAddress,
        assetMint: params.assetMint,
        sourceTokenAccountAddress: params.sourceTokenAccountAddress,
        vaultTokenAccountAddress: params.vaultTokenAccountAddress,
        sourceLabel: 'premium source token account',
      });
      return buildRecordPremiumPaymentTx({ ...params, programId });
    },
    async buildDepositIntoCapitalClassTx(
      params: Omit<
        Parameters<typeof buildDepositIntoCapitalClassTx>[0],
        'programId'
      >,
    ): Promise<Transaction> {
      await preflightDomainVaultInflow({
        authority: params.owner,
        reserveDomainAddress: params.reserveDomainAddress,
        assetMint: params.assetMint,
        sourceTokenAccountAddress: params.sourceTokenAccountAddress,
        vaultTokenAccountAddress: params.vaultTokenAccountAddress,
        sourceLabel: 'LP deposit source token account',
      });
      return buildDepositIntoCapitalClassTx({ ...params, programId });
    },
    buildRequestRedemptionTx(
      params: Omit<Parameters<typeof buildRequestRedemptionTx>[0], 'programId'>,
    ): Transaction {
      return buildRequestRedemptionTx({ ...params, programId });
    },
    async buildProcessRedemptionQueueTx(
      params: Omit<
        Parameters<typeof buildProcessRedemptionQueueTx>[0],
        'programId'
      >,
    ): Promise<Transaction> {
      await preflightDomainVaultOutflow({
        reserveDomainAddress: params.reserveDomainAddress,
        assetMint: params.assetMint,
        recipientTokenAccountAddress: params.recipientTokenAccountAddress,
        vaultTokenAccountAddress: params.vaultTokenAccountAddress,
        recipientOwnerAddress: params.lpOwnerAddress,
        recipientLabel: 'LP redemption recipient token account',
      });
      return buildProcessRedemptionQueueTx({ ...params, programId });
    },
    async buildWithdrawProtocolFeeSplTx(
      params: Omit<
        Parameters<typeof buildWithdrawProtocolFeeSplTx>[0],
        'programId'
      >,
    ): Promise<Transaction> {
      await preflightDomainVaultOutflow({
        reserveDomainAddress: params.reserveDomainAddress,
        assetMint: params.assetMint,
        recipientTokenAccountAddress: params.recipientTokenAccountAddress,
        vaultTokenAccountAddress: params.vaultTokenAccountAddress,
        recipientLabel: 'protocol fee recipient token account',
      });
      return buildWithdrawProtocolFeeSplTx({ ...params, programId });
    },
    async buildWithdrawPoolTreasurySplTx(
      params: Omit<
        Parameters<typeof buildWithdrawPoolTreasurySplTx>[0],
        'programId'
      >,
    ): Promise<Transaction> {
      await preflightDomainVaultOutflow({
        reserveDomainAddress: params.reserveDomainAddress,
        assetMint: params.assetMint,
        recipientTokenAccountAddress: params.recipientTokenAccountAddress,
        vaultTokenAccountAddress: params.vaultTokenAccountAddress,
        recipientLabel: 'pool treasury recipient token account',
      });
      return buildWithdrawPoolTreasurySplTx({ ...params, programId });
    },
    async buildWithdrawPoolOracleFeeSplTx(
      params: Omit<
        Parameters<typeof buildWithdrawPoolOracleFeeSplTx>[0],
        'programId'
      >,
    ): Promise<Transaction> {
      await preflightDomainVaultOutflow({
        reserveDomainAddress: params.reserveDomainAddress,
        assetMint: params.assetMint,
        recipientTokenAccountAddress: params.recipientTokenAccountAddress,
        vaultTokenAccountAddress: params.vaultTokenAccountAddress,
        recipientLabel: 'pool oracle fee recipient token account',
      });
      return buildWithdrawPoolOracleFeeSplTx({ ...params, programId });
    },
    buildWithdrawProtocolFeeSolTx(
      params: Omit<
        Parameters<typeof buildWithdrawProtocolFeeSolTx>[0],
        'programId'
      >,
    ): Transaction {
      return buildWithdrawProtocolFeeSolTx({ ...params, programId });
    },
    buildWithdrawPoolTreasurySolTx(
      params: Omit<
        Parameters<typeof buildWithdrawPoolTreasurySolTx>[0],
        'programId'
      >,
    ): Transaction {
      return buildWithdrawPoolTreasurySolTx({ ...params, programId });
    },
    buildWithdrawPoolOracleFeeSolTx(
      params: Omit<
        Parameters<typeof buildWithdrawPoolOracleFeeSolTx>[0],
        'programId'
      >,
    ): Transaction {
      return buildWithdrawPoolOracleFeeSolTx({ ...params, programId });
    },
    buildOpenClaimCaseTx(
      params: Omit<Parameters<typeof buildOpenClaimCaseTx>[0], 'programId'>,
    ): Transaction {
      return buildOpenClaimCaseTx({ ...params, programId });
    },
    buildReserveObligationTx(
      params: Omit<Parameters<typeof buildReserveObligationTx>[0], 'programId'>,
    ): Transaction {
      return buildReserveObligationTx({ ...params, programId });
    },
    buildReleaseReserveTx(
      params: Omit<Parameters<typeof buildReleaseReserveTx>[0], 'programId'>,
    ): Transaction {
      return buildReleaseReserveTx({ ...params, programId });
    },
    async buildSettleObligationTx(
      params: Omit<
        Parameters<typeof buildSettleObligationTx>[0],
        'programId'
      > & {
        recipientOwnerAddress: PublicKeyish;
      },
    ): Promise<Transaction> {
      await preflightDomainVaultOutflow({
        reserveDomainAddress: params.reserveDomainAddress,
        assetMint: params.assetMint,
        recipientTokenAccountAddress: params.recipientTokenAccountAddress,
        vaultTokenAccountAddress: params.vaultTokenAccountAddress,
        recipientOwnerAddress: params.recipientOwnerAddress,
        recipientLabel: 'settlement recipient token account',
      });
      const {
        recipientOwnerAddress: _recipientOwnerAddress,
        ...builderParams
      } = params;
      void _recipientOwnerAddress;
      return buildSettleObligationTx({ ...builderParams, programId });
    },
    buildMarkImpairmentTx(
      params: Omit<Parameters<typeof buildMarkImpairmentTx>[0], 'programId'>,
    ): Transaction {
      return buildMarkImpairmentTx({ ...params, programId });
    },
    buildRegisterOracleTx(
      params: Omit<Parameters<typeof buildRegisterOracleTx>[0], 'programId'>,
    ): Transaction {
      return buildRegisterOracleTx({ ...params, programId });
    },
    buildAttestClaimCaseTx(
      params: Omit<Parameters<typeof buildAttestClaimCaseTx>[0], 'programId'>,
    ): Transaction {
      return buildAttestClaimCaseTx({ ...params, programId });
    },
  };
}

export function createProtocolClient(
  connection: Connection,
  programId: PublicKeyish = PROTOCOL_PROGRAM_ID,
  options?: { unsafeAllowCustomProgramId?: boolean },
): ProtocolClient {
  const resolvedProgramId = resolveProgramIdForBuild({
    programId,
    unsafeAllowCustomProgramId: options?.unsafeAllowCustomProgramId,
  });
  const resolveClientProgramId = (inputProgramId?: PublicKeyish): PublicKey => {
    if (inputProgramId === undefined || inputProgramId === null) {
      return resolvedProgramId;
    }

    const requestedProgramId = toPublicKey(inputProgramId);
    if (!requestedProgramId.equals(resolvedProgramId)) {
      throw new Error(
        `programId mismatch: expected ${resolvedProgramId.toBase58()}, received ${requestedProgramId.toBase58()}`,
      );
    }

    return resolvedProgramId;
  };

  const client: Record<string, unknown> = {
    connection,
    programId: resolvedProgramId,
    getProgramId: () => resolvedProgramId,
    buildInstruction: (
      params: BuildInstructionParams<
        Record<string, unknown>,
        GenericInstructionAccounts
      > & {
        instructionName: ProtocolInstructionName;
      },
    ) =>
      buildProtocolInstruction({
        ...params,
        programId: resolveClientProgramId(params.programId),
      }),
    buildTransaction: (
      params: BuildTransactionParams<
        Record<string, unknown>,
        GenericInstructionAccounts
      > & {
        instructionName: ProtocolInstructionName;
      },
    ) =>
      buildProtocolTransaction({
        ...params,
        programId: resolveClientProgramId(params.programId),
      }),
    decodeAccount: <T = Record<string, unknown>>(
      accountName: ProtocolAccountName,
      data: Buffer | Uint8Array,
    ): T => decodeProtocolAccount<T>(accountName, data),
    async fetchAccount<T = Record<string, unknown>>(
      accountName: ProtocolAccountName,
      address: PublicKeyish,
    ): Promise<T | null> {
      const resolvedAddress = toPublicKey(address);
      const info = await connection.getAccountInfo(
        resolvedAddress,
        'confirmed',
      );
      if (!info) return null;
      return decodeFetchedProtocolAccount<T>(
        accountName,
        resolvedAddress,
        info,
        resolvedProgramId,
      );
    },
  };

  for (const instructionName of listProtocolInstructionNames()) {
    const pascalName = pascalCase(instructionName);
    client[`build${pascalName}Instruction`] = (
      params: BuildInstructionParams<
        Record<string, unknown>,
        GenericInstructionAccounts
      >,
    ) =>
      buildProtocolInstruction({
        ...params,
        instructionName,
        programId: resolveClientProgramId(params.programId),
      });

    client[`build${pascalName}Tx`] = (
      params: BuildTransactionParams<
        Record<string, unknown>,
        GenericInstructionAccounts
      >,
    ) =>
      buildProtocolTransaction({
        ...params,
        instructionName,
        programId: resolveClientProgramId(params.programId),
      });
  }

  for (const accountName of listProtocolAccountNames()) {
    if (accountName === 'ProtocolGovernance') {
      client.fetchProtocolGovernance = async (
        address?: PublicKeyish,
      ): Promise<Record<string, unknown> | null> => {
        const resolvedAddress =
          address ?? deriveProtocolGovernancePda(resolvedProgramId);
        const resolvedPublicKey = toPublicKey(resolvedAddress);
        const info = await connection.getAccountInfo(
          resolvedPublicKey,
          'confirmed',
        );
        if (!info) return null;
        return decodeFetchedProtocolAccount(
          'ProtocolGovernance',
          resolvedPublicKey,
          info,
          resolvedProgramId,
        );
      };
      continue;
    }

    client[`fetch${accountName}`] = async (
      address: PublicKeyish,
    ): Promise<Record<string, unknown> | null> => {
      const resolvedAddress = toPublicKey(address);
      const info = await connection.getAccountInfo(
        resolvedAddress,
        'confirmed',
      );
      if (!info) return null;
      return decodeFetchedProtocolAccount(
        accountName,
        resolvedAddress,
        info,
        resolvedProgramId,
      );
    };
  }

  return client as unknown as ProtocolClient;
}

export {
  PROTOCOL_ACCOUNT_DISCRIMINATORS,
  PROTOCOL_INSTRUCTION_ACCOUNTS,
  PROTOCOL_INSTRUCTION_DISCRIMINATORS,
  PROTOCOL_PROGRAM_ID,
  getProgramId,
};
