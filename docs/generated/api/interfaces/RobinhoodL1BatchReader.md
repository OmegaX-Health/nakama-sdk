[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / RobinhoodL1BatchReader

# Interface: RobinhoodL1BatchReader

Defined in: [src/robinhood/receipts.ts:128](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/receipts.ts#L128)

## Properties

### identity

> `readonly` **identity**: [`RobinhoodReaderIdentity`](RobinhoodReaderIdentity.md)

Defined in: [src/robinhood/receipts.ts:129](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/receipts.ts#L129)

## Methods

### getBatchEvidence()

> **getBatchEvidence**(`hash`): `Promise`\<[`RobinhoodL1BatchEvidence`](RobinhoodL1BatchEvidence.md) \| `null`\>

Defined in: [src/robinhood/receipts.ts:130](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/receipts.ts#L130)

#### Parameters

##### hash

`` `0x${string}` ``

#### Returns

`Promise`\<[`RobinhoodL1BatchEvidence`](RobinhoodL1BatchEvidence.md) \| `null`\>
