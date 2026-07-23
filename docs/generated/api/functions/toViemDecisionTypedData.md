[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / toViemDecisionTypedData

# Function: toViemDecisionTypedData()

> **toViemDecisionTypedData**(`typedData`): `object`

Defined in: [src/robinhood/decision.ts:442](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/decision.ts#L442)

Viem derives EIP712Domain itself; wallet JSON retains the explicit schema.

## Parameters

### typedData

[`NakamaDecisionTypedData`](../interfaces/NakamaDecisionTypedData.md)

## Returns

`object`

### domain

> **domain**: `object`

#### domain.chainId

> **chainId**: `number`

#### domain.name

> **name**: `"Nakama Protection Decision"`

#### domain.verifyingContract

> **verifyingContract**: `` `0x${string}` ``

#### domain.version

> **version**: `"1"`

### message

> **message**: [`NakamaDecisionMessage`](../interfaces/NakamaDecisionMessage.md)

### primaryType

> **primaryType**: `"Decision"`

### types

> **types**: `object`

#### types.Decision

> **Decision**: readonly \[\{ `name`: `"programId"`; `type`: `"bytes32"`; \}, \{ `name`: `"requestId"`; `type`: `"bytes32"`; \}, \{ `name`: `"termsCommitment"`; `type`: `"bytes32"`; \}, \{ `name`: `"evidenceManifestCommitment"`; `type`: `"bytes32"`; \}, \{ `name`: `"evidenceVersion"`; `type`: `"uint32"`; \}, \{ `name`: `"reviewRound"`; `type`: `"uint8"`; \}, \{ `name`: `"reviewerRole"`; `type`: `"uint8"`; \}, \{ `name`: `"action"`; `type`: `"uint8"`; \}, \{ `name`: `"approvedAmount"`; `type`: `"uint256"`; \}, \{ `name`: `"recipientCommitment"`; `type`: `"bytes32"`; \}, \{ `name`: `"publicReasonCode"`; `type`: `"bytes32"`; \}, \{ `name`: `"nonce"`; `type`: `"uint256"`; \}, \{ `name`: `"validUntil"`; `type`: `"uint64"`; \}\] = `typedData.types.Decision`
