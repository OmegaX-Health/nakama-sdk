[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / NakamaDecisionSigningPayload

# Interface: NakamaDecisionSigningPayload

Defined in: src/robinhood/decision.ts:136

## Properties

### accountId

> **accountId**: `` `eip155:4663:0x${string}` `` \| `` `eip155:46630:0x${string}` ``

Defined in: src/robinhood/decision.ts:140

***

### authorizationType

> **authorizationType**: `"program_decision"`

Defined in: src/robinhood/decision.ts:142

***

### chainId

> **chainId**: `number`

Defined in: src/robinhood/decision.ts:139

***

### kind

> **kind**: `"typed_data"`

Defined in: src/robinhood/decision.ts:141

***

### network

> **network**: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md)

Defined in: src/robinhood/decision.ts:138

***

### typedData

> **typedData**: [`NakamaDecisionTypedData`](NakamaDecisionTypedData.md)

Defined in: src/robinhood/decision.ts:143

***

### version

> **version**: `1`

Defined in: src/robinhood/decision.ts:137
