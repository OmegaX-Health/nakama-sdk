[**@omegax/protocol-sdk**](../README.md)

***

[@omegax/protocol-sdk](../README.md) / BuildTransactionParams

# Interface: BuildTransactionParams\<Args, Accounts\>

Defined in: [src/generated/protocol\_types.ts:60](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L60)

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

Defined in: [src/generated/protocol\_types.ts:56](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L56)

#### Inherited from

[`BuildInstructionParams`](BuildInstructionParams.md).[`accounts`](BuildInstructionParams.md#accounts-1)

***

### appendInstructions?

> `optional` **appendInstructions?**: `TransactionInstruction`[]

Defined in: [src/generated/protocol\_types.ts:67](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L67)

***

### args

> **args**: `Args`

Defined in: [src/generated/protocol\_types.ts:55](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L55)

#### Inherited from

[`BuildInstructionParams`](BuildInstructionParams.md).[`args`](BuildInstructionParams.md#args-1)

***

### feePayer?

> `optional` **feePayer?**: [`PublicKeyish`](../type-aliases/PublicKeyish.md)

Defined in: [src/generated/protocol\_types.ts:65](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L65)

***

### prependInstructions?

> `optional` **prependInstructions?**: `TransactionInstruction`[]

Defined in: [src/generated/protocol\_types.ts:66](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L66)

***

### programId?

> `optional` **programId?**: [`PublicKeyish`](../type-aliases/PublicKeyish.md)

Defined in: [src/generated/protocol\_types.ts:57](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L57)

#### Inherited from

[`BuildInstructionParams`](BuildInstructionParams.md).[`programId`](BuildInstructionParams.md#programid)

***

### recentBlockhash

> **recentBlockhash**: `string`

Defined in: [src/generated/protocol\_types.ts:64](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L64)
