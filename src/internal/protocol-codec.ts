import { BorshCoder } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

import protocolIdl from '../generated/omegax_protocol.idl.json' with { type: 'json' };
import type { PublicKeyish } from '../generated/protocol_types.js';
import { toPublicKey } from '../protocol_seeds.js';

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

export const PROTOCOL_IDL_VERSION = ((
  protocolIdl as { metadata?: { version?: string }; version?: string }
).metadata?.version ??
  (protocolIdl as { version?: string }).version ??
  'unknown') as string;

export function getProtocolIdl() {
  return protocolIdl;
}

export function encodeProtocolInstructionData(
  instructionName: string,
  args: Record<string, unknown>,
): Buffer {
  const instructionArgsType = ARG_TYPE_BY_INSTRUCTION.get(instructionName);
  const normalizedArgs = instructionArgsType
    ? { args: normalizeInputValue(instructionArgsType, args) }
    : {};

  return Buffer.from(CODER.instruction.encode(instructionName, normalizedArgs));
}

export function decodeProtocolAccountData<T = Record<string, unknown>>(
  accountName: string,
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

export function normalizeHex32(value: string, label: string): string {
  const normalized = value.trim().toLowerCase().replace(/^0x/, '');
  if (!/^[0-9a-f]{64}$/.test(normalized)) {
    throw new Error(`${label} must be a 32-byte hex string`);
  }
  return normalized;
}

export function hexToFixedBytes(value: string, label: string): Uint8Array {
  return Uint8Array.from(Buffer.from(normalizeHex32(value, label), 'hex'));
}

export function normalizeOptionalHex32(value?: string | null): string {
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
