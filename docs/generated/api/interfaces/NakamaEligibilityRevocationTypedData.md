[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / NakamaEligibilityRevocationTypedData

# Interface: NakamaEligibilityRevocationTypedData

Defined in: [src/robinhood/eligibility.ts:85](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/eligibility.ts#L85)

## Properties

### domain

> **domain**: `object`

Defined in: [src/robinhood/eligibility.ts:86](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/eligibility.ts#L86)

#### chainId

> **chainId**: `number`

#### name

> **name**: `"Nakama Membership Eligibility"`

#### verifyingContract

> **verifyingContract**: `` `0x${string}` ``

#### version

> **version**: `"1"`

***

### message

> **message**: [`EligibilityRevocationAuthorization`](EligibilityRevocationAuthorization.md)

Defined in: [src/robinhood/eligibility.ts:89](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/eligibility.ts#L89)

***

### primaryType

> **primaryType**: `"EligibilityRevocation"`

Defined in: [src/robinhood/eligibility.ts:88](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/eligibility.ts#L88)

***

### types

> **types**: `Readonly`\<\{ `EIP712Domain`: readonly \[\{ `name`: `"name"`; `type`: `"string"`; \}, \{ `name`: `"version"`; `type`: `"string"`; \}, \{ `name`: `"chainId"`; `type`: `"uint256"`; \}, \{ `name`: `"verifyingContract"`; `type`: `"address"`; \}\]; `EligibilityRevocation`: readonly \[\{ `name`: `"programId"`; `type`: `"bytes32"`; \}, \{ `name`: `"authorizationDigest"`; `type`: `"bytes32"`; \}, \{ `name`: `"nonce"`; `type`: `"uint256"`; \}, \{ `name`: `"validUntil"`; `type`: `"uint64"`; \}\]; \}\>

Defined in: [src/robinhood/eligibility.ts:87](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/eligibility.ts#L87)
