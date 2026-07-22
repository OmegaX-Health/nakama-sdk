[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / AssessRobinhoodFinalityOptions

# Interface: AssessRobinhoodFinalityOptions

Defined in: src/robinhood/receipts.ts:93

## Properties

### canonicalBlockHash?

> `optional` **canonicalBlockHash?**: `` `0x${string}` `` \| `null`

Defined in: src/robinhood/receipts.ts:99

***

### chainHead?

> `optional` **chainHead?**: `bigint` \| `null`

Defined in: src/robinhood/receipts.ts:96

***

### finalizedBlock?

> `optional` **finalizedBlock?**: `bigint` \| `null`

Defined in: src/robinhood/receipts.ts:98

***

### l1Posted?

> `optional` **l1Posted?**: `boolean` \| `null`

Defined in: src/robinhood/receipts.ts:100

***

### observedAt?

> `optional` **observedAt?**: `string` \| `Date`

Defined in: src/robinhood/receipts.ts:104

***

### receipt?

> `optional` **receipt?**: [`RobinhoodMinedReceipt`](RobinhoodMinedReceipt.md) \| `null`

Defined in: src/robinhood/receipts.ts:95

***

### replacementHash?

> `optional` **replacementHash?**: `` `0x${string}` `` \| `null`

Defined in: src/robinhood/receipts.ts:101

***

### safeBlock?

> `optional` **safeBlock?**: `bigint` \| `null`

Defined in: src/robinhood/receipts.ts:97

***

### softConfirmations?

> `optional` **softConfirmations?**: `number`

Defined in: src/robinhood/receipts.ts:103

***

### timedOut?

> `optional` **timedOut?**: `boolean`

Defined in: src/robinhood/receipts.ts:102

***

### transaction

> **transaction**: [`RobinhoodSubmittedTransaction`](RobinhoodSubmittedTransaction.md)

Defined in: src/robinhood/receipts.ts:94
