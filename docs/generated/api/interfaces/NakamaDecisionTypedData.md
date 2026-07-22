[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / NakamaDecisionTypedData

# Interface: NakamaDecisionTypedData

Defined in: [src/robinhood/decision.ts:124](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/decision.ts#L124)

## Properties

### domain

> **domain**: `object`

Defined in: [src/robinhood/decision.ts:125](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/decision.ts#L125)

#### chainId

> **chainId**: `number`

#### name

> **name**: `"Nakama Protection Decision"`

#### verifyingContract

> **verifyingContract**: `` `0x${string}` ``

#### version

> **version**: `"1"`

***

### message

> **message**: [`NakamaDecisionMessage`](NakamaDecisionMessage.md)

Defined in: [src/robinhood/decision.ts:133](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/decision.ts#L133)

***

### primaryType

> **primaryType**: `"Decision"`

Defined in: [src/robinhood/decision.ts:132](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/decision.ts#L132)

***

### types

> **types**: `Readonly`\<\{ `Decision`: readonly \[\{ `name`: `"programId"`; `type`: `"bytes32"`; \}, \{ `name`: `"requestId"`; `type`: `"bytes32"`; \}, \{ `name`: `"termsCommitment"`; `type`: `"bytes32"`; \}, \{ `name`: `"evidenceManifestCommitment"`; `type`: `"bytes32"`; \}, \{ `name`: `"evidenceVersion"`; `type`: `"uint32"`; \}, \{ `name`: `"reviewRound"`; `type`: `"uint8"`; \}, \{ `name`: `"reviewerRole"`; `type`: `"uint8"`; \}, \{ `name`: `"action"`; `type`: `"uint8"`; \}, \{ `name`: `"approvedAmount"`; `type`: `"uint256"`; \}, \{ `name`: `"recipientCommitment"`; `type`: `"bytes32"`; \}, \{ `name`: `"publicReasonCode"`; `type`: `"bytes32"`; \}, \{ `name`: `"nonce"`; `type`: `"uint256"`; \}, \{ `name`: `"validUntil"`; `type`: `"uint64"`; \}\]; `EIP712Domain`: readonly \[\{ `name`: `"name"`; `type`: `"string"`; \}, \{ `name`: `"version"`; `type`: `"string"`; \}, \{ `name`: `"chainId"`; `type`: `"uint256"`; \}, \{ `name`: `"verifyingContract"`; `type`: `"address"`; \}\]; \}\>

Defined in: [src/robinhood/decision.ts:131](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/decision.ts#L131)
