[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / VerifyEthereumTransactionIntentOptions

# Interface: VerifyEthereumTransactionIntentOptions

Defined in: src/ethereum\_contract.ts:109

## Extends

- `Omit`\<[`VerifyEthereumReceiptOptions`](VerifyEthereumReceiptOptions.md), `"hash"`\>

## Properties

### abi?

> `optional` **abi?**: `Abi`

Defined in: src/ethereum\_contract.ts:99

#### Inherited from

[`VerifyEthereumReceiptOptions`](VerifyEthereumReceiptOptions.md).[`abi`](VerifyEthereumReceiptOptions.md#abi)

***

### expectedIntentId

> **expectedIntentId**: `string`

Defined in: src/ethereum\_contract.ts:115

Trusted intent identifier selected before accepting the wallet response.

***

### minimumConfirmations?

> `optional` **minimumConfirmations?**: `number`

Defined in: src/ethereum\_contract.ts:97

#### Inherited from

[`VerifyEthereumReceiptOptions`](VerifyEthereumReceiptOptions.md).[`minimumConfirmations`](VerifyEthereumReceiptOptions.md#minimumconfirmations)

***

### requireSafeBlock?

> `optional` **requireSafeBlock?**: `boolean`

Defined in: src/ethereum\_contract.ts:98

#### Inherited from

[`VerifyEthereumReceiptOptions`](VerifyEthereumReceiptOptions.md).[`requireSafeBlock`](VerifyEthereumReceiptOptions.md#requiresafeblock)

***

### revertData?

> `optional` **revertData?**: `` `0x${string}` ``

Defined in: src/ethereum\_contract.ts:100

#### Inherited from

[`VerifyEthereumReceiptOptions`](VerifyEthereumReceiptOptions.md).[`revertData`](VerifyEthereumReceiptOptions.md#revertdata)

***

### signingPayload

> **signingPayload**: [`SigningPayloadV2`](../type-aliases/SigningPayloadV2.md)

Defined in: src/ethereum\_contract.ts:116

***

### submission

> **submission**: [`ReceiptSubmissionV2`](ReceiptSubmissionV2.md)

Defined in: src/ethereum\_contract.ts:113
