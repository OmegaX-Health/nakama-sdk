[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / WaitForRobinhoodFinalityOptions

# Interface: WaitForRobinhoodFinalityOptions

Defined in: src/robinhood/receipts.ts:133

## Properties

### pollingIntervalMs?

> `optional` **pollingIntervalMs?**: `number`

Defined in: src/robinhood/receipts.ts:143

***

### primaryL1BatchReader?

> `optional` **primaryL1BatchReader?**: [`RobinhoodL1BatchReader`](RobinhoodL1BatchReader.md)

Defined in: src/robinhood/receipts.ts:138

Two independent L1 sources are required for economic-finality targets.

***

### reader

> **reader**: [`RobinhoodReceiptReader`](RobinhoodReceiptReader.md)

Defined in: src/robinhood/receipts.ts:134

***

### secondaryL1BatchReader?

> `optional` **secondaryL1BatchReader?**: [`RobinhoodL1BatchReader`](RobinhoodL1BatchReader.md)

Defined in: src/robinhood/receipts.ts:139

***

### secondaryReader?

> `optional` **secondaryReader?**: [`RobinhoodReceiptReader`](RobinhoodReceiptReader.md)

Defined in: src/robinhood/receipts.ts:136

Required with l1BatchReader for l1_posted/finalized targets.

***

### signal?

> `optional` **signal?**: `AbortSignal`

Defined in: src/robinhood/receipts.ts:145

***

### softConfirmations?

> `optional` **softConfirmations?**: `number`

Defined in: src/robinhood/receipts.ts:144

***

### target?

> `optional` **target?**: `"finalized"` \| `"soft_confirmed"` \| `"l1_posted"`

Defined in: src/robinhood/receipts.ts:141

***

### timeoutMs?

> `optional` **timeoutMs?**: `number`

Defined in: src/robinhood/receipts.ts:142

***

### transaction

> **transaction**: [`RobinhoodSubmittedTransaction`](RobinhoodSubmittedTransaction.md)

Defined in: src/robinhood/receipts.ts:140
