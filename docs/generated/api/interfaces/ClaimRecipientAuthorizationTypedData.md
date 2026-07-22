[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / ClaimRecipientAuthorizationTypedData

# Interface: ClaimRecipientAuthorizationTypedData

Defined in: src/ethereum\_oracle.ts:45

## Properties

### domain

> **domain**: `object`

Defined in: src/ethereum\_oracle.ts:46

#### chainId

> **chainId**: `1`

#### name

> **name**: `"Nakama Policy Registry"`

#### verifyingContract

> **verifyingContract**: `` `0x${string}` ``

#### version

> **version**: `"1"`

***

### message

> **message**: [`ClaimRecipientAuthorizationMessage`](ClaimRecipientAuthorizationMessage.md)

Defined in: src/ethereum\_oracle.ts:54

***

### primaryType

> **primaryType**: `"ClaimRecipient"`

Defined in: src/ethereum\_oracle.ts:53

***

### types

> **types**: `object`

Defined in: src/ethereum\_oracle.ts:52

#### ClaimRecipient

> `readonly` **ClaimRecipient**: readonly \[\{ `name`: `"claimId"`; `type`: `"bytes32"`; \}, \{ `name`: `"recipient"`; `type`: `"address"`; \}, \{ `name`: `"nonce"`; `type`: `"uint256"`; \}, \{ `name`: `"deadline"`; `type`: `"uint256"`; \}\]
