import test from 'node:test';
import assert from 'node:assert/strict';
import { Keypair } from '@solana/web3.js';

import fixtureIdl from './fixtures/omegax_protocol.idl.json' with { type: 'json' };
import { NakamaLegacyWriteDisabledError } from '../src/errors.js';
import {
  PROTOCOL_INSTRUCTION_ACCOUNTS,
  PROTOCOL_INSTRUCTION_DISCRIMINATORS,
  PROTOCOL_PROGRAM_ID,
  type ProtocolInstructionName,
} from '../src/generated/protocol_contract.js';
import { createProtocolClient } from '../src/protocol.js';
import { createConnection } from '../src/rpc.js';

type IdlType =
  | string
  | { option: IdlType }
  | { vec: IdlType }
  | { array: [IdlType, number] }
  | { defined: { name: string } };

type IdlField = { name: string; type: IdlType };
type IdlStruct = { kind: 'struct'; fields?: IdlField[] };
type IdlTypeEntry = { name: string; type: IdlStruct };

const TYPE_BY_NAME = new Map<string, IdlStruct>(
  ((fixtureIdl as { types?: IdlTypeEntry[] }).types ?? []).map((entry) => [
    entry.name,
    entry.type,
  ]),
);

function dummyAddress() {
  return Keypair.generate().publicKey.toBase58();
}

function makeSeedString(name: string): string {
  return `${name}`.slice(0, 24) || 'seed';
}

function buildDummyValue(type: IdlType, fieldName: string): unknown {
  if (typeof type === 'string') {
    switch (type) {
      case 'bool':
        return true;
      case 'pubkey':
        return dummyAddress();
      case 'u8':
      case 'u16':
      case 'u32':
        return 1;
      case 'u64':
      case 'i64':
        return 1n;
      case 'string':
        return makeSeedString(fieldName);
      default:
        return 0;
    }
  }

  if ('array' in type) {
    const [, length] = type.array;
    return Uint8Array.from({ length }, (_unused, index) => index % 251);
  }

  if ('option' in type) {
    return buildDummyValue(type.option, fieldName);
  }

  if ('vec' in type) {
    return [buildDummyValue(type.vec, fieldName)];
  }

  if ('defined' in type) {
    const struct = TYPE_BY_NAME.get(type.defined.name);
    if (!struct || struct.kind !== 'struct') {
      throw new Error(`Missing fixture type ${type.defined.name}`);
    }

    const value: Record<string, unknown> = {};
    for (const field of struct.fields ?? []) {
      value[field.name] = buildDummyValue(field.type, field.name);
    }
    return value;
  }

  return null;
}

function buildDummyArgs(instructionName: ProtocolInstructionName) {
  const instruction = (
    fixtureIdl as {
      instructions: Array<{ name: string; args?: Array<{ type: IdlType }> }>;
    }
  ).instructions.find((entry) => entry.name === instructionName);
  const argType = instruction?.args?.[0]?.type;
  if (!argType) {
    return {};
  }
  return buildDummyValue(argType, 'args') as Record<string, unknown>;
}

test('generated legacy builders cover the IDL surface and fail closed', () => {
  const client = createProtocolClient(
    createConnection('http://127.0.0.1:8899', 'confirmed'),
    PROTOCOL_PROGRAM_ID,
  ) as Record<string, unknown>;
  const recentBlockhash = '11111111111111111111111111111111';

  for (const instructionName of Object.keys(
    PROTOCOL_INSTRUCTION_DISCRIMINATORS,
  ) as ProtocolInstructionName[]) {
    const accounts = Object.fromEntries(
      PROTOCOL_INSTRUCTION_ACCOUNTS[instructionName]
        .filter((account) => !account.address)
        .map((account) => [account.name, dummyAddress()]),
    );
    const builderBase = instructionName
      .split('_')
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join('');
    const builderName = `build${builderBase}Tx`;
    const builder = client[builderName] as
      | ((params: {
          args: Record<string, unknown>;
          accounts: Record<string, string>;
          recentBlockhash: string;
        }) => unknown)
      | undefined;

    assert.equal(typeof builder, 'function', `${builderName} is missing`);

    assert.throws(
      () =>
        builder({
          args: buildDummyArgs(instructionName),
          accounts,
          recentBlockhash,
        }),
      NakamaLegacyWriteDisabledError,
      instructionName,
    );
  }
});
