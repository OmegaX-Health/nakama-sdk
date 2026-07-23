[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / WaitForRobinhoodFinalityOptions

# Interface: WaitForRobinhoodFinalityOptions

Defined in: [src/robinhood/receipts.ts:133](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/receipts.ts#L133)

## Properties

### pollingIntervalMs?

> `optional` **pollingIntervalMs?**: `number`

Defined in: [src/robinhood/receipts.ts:143](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/receipts.ts#L143)

***

### primaryL1BatchReader?

> `optional` **primaryL1BatchReader?**: [`RobinhoodL1BatchReader`](RobinhoodL1BatchReader.md)

Defined in: [src/robinhood/receipts.ts:138](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/receipts.ts#L138)

Two independent L1 sources are required for economic-finality targets.

***

### reader

> **reader**: [`RobinhoodReceiptReader`](RobinhoodReceiptReader.md)

Defined in: [src/robinhood/receipts.ts:134](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/receipts.ts#L134)

***

### secondaryL1BatchReader?

> `optional` **secondaryL1BatchReader?**: [`RobinhoodL1BatchReader`](RobinhoodL1BatchReader.md)

Defined in: [src/robinhood/receipts.ts:139](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/receipts.ts#L139)

***

### secondaryReader?

> `optional` **secondaryReader?**: [`RobinhoodReceiptReader`](RobinhoodReceiptReader.md)

Defined in: [src/robinhood/receipts.ts:136](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/receipts.ts#L136)

Required with l1BatchReader for l1_posted/finalized targets.

***

### signal?

> `optional` **signal?**: `AbortSignal`

Defined in: [src/robinhood/receipts.ts:145](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/receipts.ts#L145)

***

### softConfirmations?

> `optional` **softConfirmations?**: `number`

Defined in: [src/robinhood/receipts.ts:144](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/receipts.ts#L144)

***

### target?

> `optional` **target?**: `"finalized"` \| `"soft_confirmed"` \| `"l1_posted"`

Defined in: [src/robinhood/receipts.ts:141](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/receipts.ts#L141)

***

### timeoutMs?

> `optional` **timeoutMs?**: `number`

Defined in: [src/robinhood/receipts.ts:142](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/receipts.ts#L142)

***

### transaction

> **transaction**: [`RobinhoodSubmittedTransaction`](RobinhoodSubmittedTransaction.md)

Defined in: [src/robinhood/receipts.ts:140](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/receipts.ts#L140)
