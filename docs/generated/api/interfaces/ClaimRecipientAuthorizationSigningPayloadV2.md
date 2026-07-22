[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / ClaimRecipientAuthorizationSigningPayloadV2

# Interface: ClaimRecipientAuthorizationSigningPayloadV2

Defined in: src/ethereum\_oracle.ts:57

## Extends

- `Omit`\<[`TypedDataSigningPayloadV2`](TypedDataSigningPayloadV2.md), `"typedData"`\>

## Properties

### accountId

> **accountId**: `` `eip155:1:0x${string}` ``

Defined in: src/ethereum.ts:91

#### Inherited from

[`TypedDataSigningPayloadV2`](TypedDataSigningPayloadV2.md).[`accountId`](TypedDataSigningPayloadV2.md#accountid)

***

### authorizationType

> **authorizationType**: `"claim_recipient"`

Defined in: src/ethereum.ts:93

#### Inherited from

[`TypedDataSigningPayloadV2`](TypedDataSigningPayloadV2.md).[`authorizationType`](TypedDataSigningPayloadV2.md#authorizationtype)

***

### chainId

> **chainId**: `"eip155:1"`

Defined in: src/ethereum.ts:90

#### Inherited from

[`TypedDataSigningPayloadV2`](TypedDataSigningPayloadV2.md).[`chainId`](TypedDataSigningPayloadV2.md#chainid)

***

### kind

> **kind**: `"typed_data"`

Defined in: src/ethereum.ts:92

#### Inherited from

[`TypedDataSigningPayloadV2`](TypedDataSigningPayloadV2.md).[`kind`](TypedDataSigningPayloadV2.md#kind)

***

### transaction?

> `optional` **transaction?**: `undefined`

Defined in: src/ethereum.ts:95

#### Inherited from

[`TypedDataSigningPayloadV2`](TypedDataSigningPayloadV2.md).[`transaction`](TypedDataSigningPayloadV2.md#transaction)

***

### typedData

> **typedData**: [`ClaimRecipientAuthorizationTypedData`](ClaimRecipientAuthorizationTypedData.md)

Defined in: src/ethereum\_oracle.ts:61

***

### version

> **version**: `2`

Defined in: src/ethereum.ts:89

#### Inherited from

[`TypedDataSigningPayloadV2`](TypedDataSigningPayloadV2.md).[`version`](TypedDataSigningPayloadV2.md#version)
