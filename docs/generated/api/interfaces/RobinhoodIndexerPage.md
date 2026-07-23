[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / RobinhoodIndexerPage

# Interface: RobinhoodIndexerPage\<T\>

Defined in: [src/robinhood/query.ts:15](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/query.ts#L15)

## Type Parameters

### T

`T`

## Properties

### caip2

> **caip2**: `"eip155:4663"` \| `"eip155:46630"`

Defined in: [src/robinhood/query.ts:19](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/query.ts#L19)

***

### chainHead

> **chainHead**: `bigint`

Defined in: [src/robinhood/query.ts:24](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/query.ts#L24)

***

### chainId

> **chainId**: `4663` \| `46630`

Defined in: [src/robinhood/query.ts:18](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/query.ts#L18)

***

### confirmations

> **confirmations**: `number`

Defined in: [src/robinhood/query.ts:27](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/query.ts#L27)

***

### finalizedBlock

> **finalizedBlock**: `bigint` \| `null`

Defined in: [src/robinhood/query.ts:26](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/query.ts#L26)

***

### indexedBlock

> **indexedBlock**: `bigint`

Defined in: [src/robinhood/query.ts:22](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/query.ts#L22)

***

### indexedBlockHash

> **indexedBlockHash**: `` `0x${string}` ``

Defined in: [src/robinhood/query.ts:23](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/query.ts#L23)

***

### items

> **items**: readonly `T`[]

Defined in: [src/robinhood/query.ts:20](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/query.ts#L20)

***

### network

> **network**: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md)

Defined in: [src/robinhood/query.ts:17](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/query.ts#L17)

***

### nextCursor

> **nextCursor**: `string` \| `null`

Defined in: [src/robinhood/query.ts:21](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/query.ts#L21)

***

### observedAt

> **observedAt**: `string`

Defined in: [src/robinhood/query.ts:32](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/query.ts#L32)

***

### reconciliation

> **reconciliation**: `"indexer_behind"` \| `"divergent"`

Defined in: [src/robinhood/query.ts:28](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/query.ts#L28)

***

### safeBlock

> **safeBlock**: `bigint` \| `null`

Defined in: [src/robinhood/query.ts:25](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/query.ts#L25)

***

### scope

> **scope**: `"public_protocol_state"`

Defined in: [src/robinhood/query.ts:16](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/query.ts#L16)
