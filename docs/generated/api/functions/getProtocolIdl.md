[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / getProtocolIdl

# Function: getProtocolIdl()

> **getProtocolIdl**(): `object`

Defined in: [src/protocol.ts:126](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/protocol.ts#L126)

## Returns

`object`

### accounts

> **accounts**: `object`[]

### address

> **address**: `string` = `"6EXiDfGVbG7V1X2xaEALDZ7CtSuezkM8ZvXXFpk5WxQM"`

### errors

> **errors**: `object`[]

### events

> **events**: `object`[]

### instructions

> **instructions**: (\{ `accounts`: (\{ `address?`: `undefined`; `name`: `string`; `pda?`: `undefined`; `signer`: `boolean`; `writable`: `boolean`; \} \| \{ `address?`: `undefined`; `name`: `string`; `pda`: \{ `seeds`: (\{ `account?`: ...; `kind`: ...; `path?`: ...; `value`: ...; \} \| \{ `account`: ...; `kind`: ...; `path`: ...; `value?`: ...; \})[]; \}; `signer?`: `undefined`; `writable?`: `undefined`; \} \| \{ `address?`: `undefined`; `name`: `string`; `pda`: \{ `seeds`: (\{ `account?`: ...; `kind`: ...; `path?`: ...; `value`: ...; \} \| \{ `account?`: ...; `kind`: ...; `path`: ...; `value?`: ...; \} \| \{ `account`: ...; `kind`: ...; `path`: ...; `value?`: ...; \})[]; \}; `signer?`: `undefined`; `writable`: `boolean`; \} \| \{ `address?`: `undefined`; `name`: `string`; `pda?`: `undefined`; `signer?`: `undefined`; `writable`: `boolean`; \} \| \{ `address?`: `undefined`; `name`: `string`; `pda?`: `undefined`; `signer?`: `undefined`; `writable?`: `undefined`; \} \| \{ `address`: `string`; `name`: `string`; `pda?`: `undefined`; `signer?`: `undefined`; `writable?`: `undefined`; \})[]; `args`: `object`[]; `discriminator`: `number`[]; `name`: `string`; \} \| \{ `accounts`: (\{ `address?`: `undefined`; `name`: `string`; `optional?`: `undefined`; `pda?`: `undefined`; `signer`: `boolean`; `writable`: `boolean`; \} \| \{ `address?`: `undefined`; `name`: `string`; `optional?`: `undefined`; `pda`: \{ `seeds`: (\{ `account?`: ...; `kind`: ...; `path?`: ...; `value`: ...; \} \| \{ `account`: ...; `kind`: ...; `path`: ...; `value?`: ...; \} \| \{ `account?`: ...; `kind`: ...; `path`: ...; `value?`: ...; \})[]; \}; `signer?`: `undefined`; `writable?`: `undefined`; \} \| \{ `address?`: `undefined`; `name`: `string`; `optional?`: `undefined`; `pda`: \{ `seeds`: (\{ `account?`: ...; `kind`: ...; `path?`: ...; `value`: ...; \} \| \{ `account`: ...; `kind`: ...; `path`: ...; `value?`: ...; \} \| \{ `account?`: ...; `kind`: ...; `path`: ...; `value?`: ...; \})[]; \}; `signer?`: `undefined`; `writable`: `boolean`; \} \| \{ `address?`: `undefined`; `name`: `string`; `optional`: `boolean`; `pda?`: `undefined`; `signer?`: `undefined`; `writable?`: `undefined`; \} \| \{ `address`: `string`; `name`: `string`; `optional?`: `undefined`; `pda?`: `undefined`; `signer?`: `undefined`; `writable?`: `undefined`; \})[]; `args`: `object`[]; `discriminator`: `number`[]; `name`: `string`; \} \| \{ `accounts`: (\{ `address?`: `undefined`; `name`: `string`; `optional?`: `undefined`; `pda?`: `undefined`; `signer`: `boolean`; `writable?`: `undefined`; \} \| \{ `address?`: `undefined`; `name`: `string`; `optional?`: `undefined`; `pda`: \{ `seeds`: (\{ `account?`: ...; `kind`: ...; `path?`: ...; `value`: ...; \} \| \{ `account`: ...; `kind`: ...; `path`: ...; `value?`: ...; \})[]; \}; `signer?`: `undefined`; `writable?`: `undefined`; \} \| \{ `address?`: `undefined`; `name`: `string`; `optional?`: `undefined`; `pda`: \{ `seeds`: (\{ `account?`: ...; `kind`: ...; `path?`: ...; `value`: ...; \} \| \{ `account?`: ...; `kind`: ...; `path`: ...; `value?`: ...; \} \| \{ `account`: ...; `kind`: ...; `path`: ...; `value?`: ...; \})[]; \}; `signer?`: `undefined`; `writable`: `boolean`; \} \| \{ `address?`: `undefined`; `name`: `string`; `optional`: `boolean`; `pda?`: `undefined`; `signer?`: `undefined`; `writable`: `boolean`; \} \| \{ `address?`: `undefined`; `name`: `string`; `optional?`: `undefined`; `pda?`: `undefined`; `signer?`: `undefined`; `writable?`: `undefined`; \} \| \{ `address?`: `undefined`; `name`: `string`; `optional?`: `undefined`; `pda?`: `undefined`; `signer?`: `undefined`; `writable`: `boolean`; \} \| \{ `address`: `string`; `name`: `string`; `optional?`: `undefined`; `pda?`: `undefined`; `signer?`: `undefined`; `writable?`: `undefined`; \})[]; `args`: `object`[]; `discriminator`: `number`[]; `name`: `string`; \} \| \{ `accounts`: (\{ `address?`: `undefined`; `name`: `string`; `optional?`: `undefined`; `pda?`: `undefined`; `signer`: `boolean`; `writable?`: `undefined`; \} \| \{ `address?`: `undefined`; `name`: `string`; `optional?`: `undefined`; `pda`: \{ `seeds`: (\{ `account?`: ...; `kind`: ...; `path?`: ...; `value`: ...; \} \| \{ `account`: ...; `kind`: ...; `path`: ...; `value?`: ...; \})[]; \}; `signer?`: `undefined`; `writable?`: `undefined`; \} \| \{ `address?`: `undefined`; `name`: `string`; `optional?`: `undefined`; `pda`: \{ `seeds`: (\{ `account?`: ...; `kind`: ...; `path?`: ...; `value`: ...; \} \| \{ `account?`: ...; `kind`: ...; `path`: ...; `value?`: ...; \} \| \{ `account`: ...; `kind`: ...; `path`: ...; `value?`: ...; \})[]; \}; `signer?`: `undefined`; `writable`: `boolean`; \} \| \{ `address?`: `undefined`; `name`: `string`; `optional`: `boolean`; `pda`: \{ `seeds`: (\{ `account?`: ...; `kind`: ...; `path?`: ...; `value`: ...; \} \| \{ `account?`: ...; `kind`: ...; `path`: ...; `value?`: ...; \} \| \{ `account`: ...; `kind`: ...; `path`: ...; `value?`: ...; \})[]; \}; `signer?`: `undefined`; `writable`: `boolean`; \} \| \{ `address?`: `undefined`; `name`: `string`; `optional`: `boolean`; `pda?`: `undefined`; `signer?`: `undefined`; `writable?`: `undefined`; \} \| \{ `address?`: `undefined`; `name`: `string`; `optional`: `boolean`; `pda?`: `undefined`; `signer?`: `undefined`; `writable`: `boolean`; \} \| \{ `address`: `string`; `name`: `string`; `optional`: `boolean`; `pda?`: `undefined`; `signer?`: `undefined`; `writable?`: `undefined`; \})[]; `args`: `object`[]; `discriminator`: `number`[]; `name`: `string`; \})[]

### metadata

> **metadata**: `object`

#### metadata.description

> **description**: `string` = `"OmegaX health reserve protocol with reserve domains, health plans, funding lines, obligations, and claims"`

#### metadata.name

> **name**: `string` = `"omegax_protocol"`

#### metadata.spec

> **spec**: `string` = `"0.1.0"`

#### metadata.version

> **version**: `string` = `"0.3.1"`

### types

> **types**: (\{ `name`: `string`; `type`: \{ `fields`: (\{ `name`: `string`; `type`: `string`; \} \| \{ `name`: `string`; `type`: \{ `array`: (... \| ...)[]; \}; \})[]; `kind`: `string`; \}; \} \| \{ `name`: `string`; `type`: \{ `fields`: (\{ `name`: `string`; `type`: `string`; \} \| \{ `name`: `string`; `type`: \{ `defined`: \{ `name`: `string`; \}; \}; \})[]; `kind`: `string`; \}; \})[]
