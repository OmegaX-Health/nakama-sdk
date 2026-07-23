[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / readRobinhoodEconomicFinality

# Function: readRobinhoodEconomicFinality()

> **readRobinhoodEconomicFinality**(`params`): `Promise`\<[`RobinhoodTransactionFinality`](../interfaces/RobinhoodTransactionFinality.md)\>

Defined in: [src/robinhood/receipts.ts:345](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/receipts.ts#L345)

## Parameters

### params

#### primaryL1BatchReader

[`RobinhoodL1BatchReader`](../interfaces/RobinhoodL1BatchReader.md)

#### primaryReader

[`RobinhoodReceiptReader`](../interfaces/RobinhoodReceiptReader.md)

#### secondaryL1BatchReader

[`RobinhoodL1BatchReader`](../interfaces/RobinhoodL1BatchReader.md)

#### secondaryReader

[`RobinhoodReceiptReader`](../interfaces/RobinhoodReceiptReader.md)

#### softConfirmations?

`number`

#### transaction

[`RobinhoodSubmittedTransaction`](../interfaces/RobinhoodSubmittedTransaction.md)

## Returns

`Promise`\<[`RobinhoodTransactionFinality`](../interfaces/RobinhoodTransactionFinality.md)\>
