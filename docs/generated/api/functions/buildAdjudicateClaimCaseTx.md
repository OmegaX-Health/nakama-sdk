[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / buildAdjudicateClaimCaseTx

# Function: buildAdjudicateClaimCaseTx()

> **buildAdjudicateClaimCaseTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:961](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/protocol.ts#L961)

## Parameters

### params

#### approvedAmount

`bigint`

#### authority

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### claimCaseAddress

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### decisionSupportHashHex?

`string` \| `null`

#### deniedAmount

`bigint`

#### evidenceRefHashHex?

`string` \| `null`

#### healthPlanAddress

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### obligationAddress?

[`PublicKeyish`](../type-aliases/PublicKeyish.md) \| `null`

#### programId?

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### recentBlockhash

`string`

#### reserveAmount

`bigint`

#### reviewState

`number`

## Returns

`Transaction`
