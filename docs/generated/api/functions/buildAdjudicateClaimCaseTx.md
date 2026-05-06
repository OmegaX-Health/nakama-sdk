[**@omegax/protocol-sdk**](../README.md)

***

[@omegax/protocol-sdk](../README.md) / buildAdjudicateClaimCaseTx

# Function: buildAdjudicateClaimCaseTx()

> **buildAdjudicateClaimCaseTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:3009](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3009)

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
