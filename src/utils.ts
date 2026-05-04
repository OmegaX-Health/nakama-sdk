import { createHash, randomUUID } from 'node:crypto';

export function assertCanonicalJsonValue(
  value: unknown,
  label = 'value',
  seen = new WeakSet<object>(),
): void {
  if (value === null) return;

  const valueType = typeof value;
  if (valueType === 'string' || valueType === 'boolean') return;
  if (valueType === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error(`${label} must not contain NaN or infinity`);
    }
    return;
  }
  if (
    valueType === 'undefined' ||
    valueType === 'bigint' ||
    valueType === 'function' ||
    valueType === 'symbol'
  ) {
    throw new Error(`${label} contains unsupported ${valueType} value`);
  }

  const objectValue = value as object;
  if (seen.has(objectValue)) {
    throw new Error(`${label} contains a cyclic object`);
  }
  seen.add(objectValue);

  if (Array.isArray(value)) {
    value.forEach((entry, index) =>
      assertCanonicalJsonValue(entry, `${label}[${index}]`, seen),
    );
    seen.delete(objectValue);
    return;
  }

  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new Error(`${label} must contain only plain JSON objects`);
  }

  Object.entries(value as Record<string, unknown>).forEach(([key, entry]) =>
    assertCanonicalJsonValue(entry, `${label}.${key}`, seen),
  );
  seen.delete(objectValue);
}

function stableStringifyInternal(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringifyInternal).join(',')}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>).sort(
    ([a], [b]) => a.localeCompare(b),
  );
  return `{${entries
    .map(([key, v]) => `${JSON.stringify(key)}:${stableStringifyInternal(v)}`)
    .join(',')}}`;
}

export function stableStringify(value: unknown): string {
  assertCanonicalJsonValue(value);
  return stableStringifyInternal(value);
}

export function sha256Hex(value: Uint8Array | string): string {
  const hash = createHash('sha256');
  hash.update(value);
  return hash.digest('hex');
}

export function sha256Bytes(value: Uint8Array | string): Uint8Array {
  const hash = createHash('sha256');
  hash.update(value);
  return new Uint8Array(hash.digest());
}

export function toIsoString(value: Date | string): string {
  if (typeof value === 'string') return new Date(value).toISOString();
  return value.toISOString();
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID()}`;
}

export function anchorDiscriminator(namespace: string, name: string): Buffer {
  const preimage = `${namespace}:${name}`;
  const digest = createHash('sha256').update(preimage).digest();
  return digest.subarray(0, 8);
}

export function encodeU64Le(value: bigint): Buffer {
  const out = Buffer.alloc(8);
  out.writeBigUInt64LE(value);
  return out;
}

export function encodeI64Le(value: bigint): Buffer {
  const out = Buffer.alloc(8);
  out.writeBigInt64LE(value);
  return out;
}

export function encodeU32Le(value: number): Buffer {
  const out = Buffer.alloc(4);
  out.writeUInt32LE(value >>> 0);
  return out;
}

export function encodeU16Le(value: number): Buffer {
  const out = Buffer.alloc(2);
  out.writeUInt16LE(value & 0xffff);
  return out;
}

export function encodeString(value: string): Buffer {
  const bytes = Buffer.from(value, 'utf8');
  return Buffer.concat([encodeU32Le(bytes.length), bytes]);
}

export function readU32Le(buffer: Buffer, offset: number): number {
  return buffer.readUInt32LE(offset);
}

export function readU16Le(buffer: Buffer, offset: number): number {
  return buffer.readUInt16LE(offset);
}

export function readU64Le(buffer: Buffer, offset: number): bigint {
  return buffer.readBigUInt64LE(offset);
}

export function readI64Le(buffer: Buffer, offset: number): bigint {
  return buffer.readBigInt64LE(offset);
}

export function readString(
  buffer: Buffer,
  offset: number,
): { value: string; offset: number } {
  const length = readU32Le(buffer, offset);
  const start = offset + 4;
  const end = start + length;
  return {
    value: buffer.subarray(start, end).toString('utf8'),
    offset: end,
  };
}

export function toHex(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('hex');
}

export function fromHex(value: string, expectedLength?: number): Uint8Array {
  const normalized = value.trim().replace(/^0x/i, '');

  if (normalized.length % 2 !== 0) {
    throw new Error(
      'invalid hex string: expected an even number of characters',
    );
  }
  if (!/^[0-9a-fA-F]*$/.test(normalized)) {
    throw new Error('invalid hex string: contains non-hex characters');
  }

  const bytes = Buffer.from(normalized, 'hex');
  if (typeof expectedLength === 'number' && bytes.length !== expectedLength) {
    throw new Error(
      `invalid hex length: expected ${expectedLength}, got ${bytes.length}`,
    );
  }
  return new Uint8Array(bytes);
}

export function hashStringTo32(value: string): Uint8Array {
  return sha256Bytes(Buffer.from(value, 'utf8'));
}
