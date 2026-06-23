[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / BuildTransactionParams

# Interface: BuildTransactionParams\<Args, Accounts\>

Defined in: [src/generated/protocol\_types.ts:40](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/generated/protocol_types.ts#L40)

## Extends

- [`BuildInstructionParams`](BuildInstructionParams.md)\<`Args`, `Accounts`\>

## Type Parameters

### Args

`Args`

### Accounts

`Accounts`

## Properties

### accounts

> **accounts**: `Accounts`

Defined in: [src/generated/protocol\_types.ts:36](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/generated/protocol_types.ts#L36)

#### Inherited from

[`BuildInstructionParams`](BuildInstructionParams.md).[`accounts`](BuildInstructionParams.md#accounts-1)

***

### appendInstructions?

> `optional` **appendInstructions?**: `TransactionInstruction`[]

Defined in: [src/generated/protocol\_types.ts:47](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/generated/protocol_types.ts#L47)

***

### args

> **args**: `Args`

Defined in: [src/generated/protocol\_types.ts:35](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/generated/protocol_types.ts#L35)

#### Inherited from

[`BuildInstructionParams`](BuildInstructionParams.md).[`args`](BuildInstructionParams.md#args-1)

***

### feePayer?

> `optional` **feePayer?**: [`PublicKeyish`](../type-aliases/PublicKeyish.md)

Defined in: [src/generated/protocol\_types.ts:45](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/generated/protocol_types.ts#L45)

***

### prependInstructions?

> `optional` **prependInstructions?**: `TransactionInstruction`[]

Defined in: [src/generated/protocol\_types.ts:46](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/generated/protocol_types.ts#L46)

***

### programId?

> `optional` **programId?**: [`PublicKeyish`](../type-aliases/PublicKeyish.md)

Defined in: [src/generated/protocol\_types.ts:37](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/generated/protocol_types.ts#L37)

#### Inherited from

[`BuildInstructionParams`](BuildInstructionParams.md).[`programId`](BuildInstructionParams.md#programid)

***

### recentBlockhash

> **recentBlockhash**: `string`

Defined in: [src/generated/protocol\_types.ts:44](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/generated/protocol_types.ts#L44)
