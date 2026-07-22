[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / NakamaEligibilityTypedData

# Interface: NakamaEligibilityTypedData

Defined in: [src/robinhood/eligibility.ts:73](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/eligibility.ts#L73)

## Properties

### domain

> **domain**: `object`

Defined in: [src/robinhood/eligibility.ts:74](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/eligibility.ts#L74)

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

> **message**: [`EligibilityAuthorization`](EligibilityAuthorization.md)

Defined in: [src/robinhood/eligibility.ts:82](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/eligibility.ts#L82)

***

### primaryType

> **primaryType**: `"Eligibility"`

Defined in: [src/robinhood/eligibility.ts:81](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/eligibility.ts#L81)

***

### types

> **types**: `Readonly`\<\{ `EIP712Domain`: readonly \[\{ `name`: `"name"`; `type`: `"string"`; \}, \{ `name`: `"version"`; `type`: `"string"`; \}, \{ `name`: `"chainId"`; `type`: `"uint256"`; \}, \{ `name`: `"verifyingContract"`; `type`: `"address"`; \}\]; `Eligibility`: readonly \[\{ `name`: `"programId"`; `type`: `"bytes32"`; \}, \{ `name`: `"memberCommitment"`; `type`: `"bytes32"`; \}, \{ `name`: `"account"`; `type`: `"address"`; \}, \{ `name`: `"termsCommitment"`; `type`: `"bytes32"`; \}, \{ `name`: `"privacyCommitment"`; `type`: `"bytes32"`; \}, \{ `name`: `"nonce"`; `type`: `"uint256"`; \}, \{ `name`: `"validUntil"`; `type`: `"uint64"`; \}\]; \}\>

Defined in: [src/robinhood/eligibility.ts:80](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/eligibility.ts#L80)
