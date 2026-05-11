[**@omegax/protocol-sdk**](../README.md)

***

[@omegax/protocol-sdk](../README.md) / buildAdjudicateClaimCaseTx

# Function: buildAdjudicateClaimCaseTx()

> **buildAdjudicateClaimCaseTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:2466](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L2466)

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
