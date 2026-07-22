[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / RobinhoodReceiptReader

# Interface: RobinhoodReceiptReader

Defined in: src/robinhood/receipts.ts:116

## Properties

### identity

> `readonly` **identity**: [`RobinhoodReaderIdentity`](RobinhoodReaderIdentity.md)

Defined in: src/robinhood/receipts.ts:117

## Methods

### getBlockHash()

> **getBlockHash**(`blockNumber`): `Promise`\<`` `0x${string}` `` \| `null`\>

Defined in: src/robinhood/receipts.ts:121

#### Parameters

##### blockNumber

`bigint`

#### Returns

`Promise`\<`` `0x${string}` `` \| `null`\>

***

### getBlockNumber()

> **getBlockNumber**(): `Promise`\<`bigint`\>

Defined in: src/robinhood/receipts.ts:120

#### Returns

`Promise`\<`bigint`\>

***

### getFinalizedBlockNumber()

> **getFinalizedBlockNumber**(): `Promise`\<`bigint` \| `null`\>

Defined in: src/robinhood/receipts.ts:123

#### Returns

`Promise`\<`bigint` \| `null`\>

***

### getL1PostingStatus()?

> `optional` **getL1PostingStatus**(`hash`): `Promise`\<`boolean` \| `null`\>

Defined in: src/robinhood/receipts.ts:125

Optional single-source display signal; never enough for economic finality.

#### Parameters

##### hash

`` `0x${string}` ``

#### Returns

`Promise`\<`boolean` \| `null`\>

***

### getReceipt()

> **getReceipt**(`hash`): `Promise`\<[`RobinhoodMinedReceipt`](RobinhoodMinedReceipt.md) \| `null`\>

Defined in: src/robinhood/receipts.ts:119

#### Parameters

##### hash

`` `0x${string}` ``

#### Returns

`Promise`\<[`RobinhoodMinedReceipt`](RobinhoodMinedReceipt.md) \| `null`\>

***

### getSafeBlockNumber()

> **getSafeBlockNumber**(): `Promise`\<`bigint` \| `null`\>

Defined in: src/robinhood/receipts.ts:122

#### Returns

`Promise`\<`bigint` \| `null`\>

***

### getTransaction()

> **getTransaction**(`hash`): `Promise`\<[`RobinhoodObservedTransaction`](RobinhoodObservedTransaction.md) \| `null`\>

Defined in: src/robinhood/receipts.ts:118

#### Parameters

##### hash

`` `0x${string}` ``

#### Returns

`Promise`\<[`RobinhoodObservedTransaction`](RobinhoodObservedTransaction.md) \| `null`\>
