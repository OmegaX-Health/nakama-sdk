[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / VerifiedEthereumTransactionIntent

# Interface: VerifiedEthereumTransactionIntent

Defined in: src/ethereum\_contract.ts:119

## Extends

- [`VerifiedEthereumReceipt`](VerifiedEthereumReceipt.md)

## Properties

### confirmations

> **confirmations**: `number`

Defined in: src/ethereum\_contract.ts:105

#### Inherited from

[`VerifiedEthereumReceipt`](VerifiedEthereumReceipt.md).[`confirmations`](VerifiedEthereumReceipt.md#confirmations)

***

### receipt

> **receipt**: `TransactionReceipt`

Defined in: src/ethereum\_contract.ts:104

#### Inherited from

[`VerifiedEthereumReceipt`](VerifiedEthereumReceipt.md).[`receipt`](VerifiedEthereumReceipt.md#receipt)

***

### safe

> **safe**: `boolean`

Defined in: src/ethereum\_contract.ts:106

#### Inherited from

[`VerifiedEthereumReceipt`](VerifiedEthereumReceipt.md).[`safe`](VerifiedEthereumReceipt.md#safe)

***

### signingPayload

> **signingPayload**: [`TransactionSigningPayloadV2`](TransactionSigningPayloadV2.md)

Defined in: src/ethereum\_contract.ts:121

***

### submission

> **submission**: [`ReceiptSubmissionV2`](ReceiptSubmissionV2.md)

Defined in: src/ethereum\_contract.ts:120

***

### transaction

> **transaction**: `object`

Defined in: src/ethereum\_contract.ts:122

#### from

> **from**: `` `0x${string}` ``

#### hash

> **hash**: `` `0x${string}` ``

#### input

> **input**: `` `0x${string}` ``

#### to

> **to**: `` `0x${string}` ``

#### value

> **value**: `bigint`
