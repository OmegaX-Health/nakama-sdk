[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / AuthorizationStatusV2

# Interface: AuthorizationStatusV2

Defined in: src/ethereum.ts:131

## Properties

### accountId

> **accountId**: `` `eip155:1:0x${string}` ``

Defined in: src/ethereum.ts:136

***

### authorizationId

> **authorizationId**: `string`

Defined in: src/ethereum.ts:133

***

### authorizationType

> **authorizationType**: `"claim_recipient"`

Defined in: src/ethereum.ts:137

***

### chainId

> **chainId**: `"eip155:1"`

Defined in: src/ethereum.ts:135

***

### intentId

> **intentId**: `string`

Defined in: src/ethereum.ts:134

***

### reasonCode?

> `optional` **reasonCode?**: `string`

Defined in: src/ethereum.ts:140

***

### relayerTxHash?

> `optional` **relayerTxHash?**: `` `0x${string}` ``

Defined in: src/ethereum.ts:139

***

### status

> **status**: [`AuthorizationLifecycleStatusV2`](../type-aliases/AuthorizationLifecycleStatusV2.md)

Defined in: src/ethereum.ts:138

***

### version

> **version**: `2`

Defined in: src/ethereum.ts:132
