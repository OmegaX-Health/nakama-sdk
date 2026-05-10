[**@omegax/protocol-sdk**](../README.md)

***

[@omegax/protocol-sdk](../README.md) / buildOpenMemberPositionTx

# Function: buildOpenMemberPositionTx()

> **buildOpenMemberPositionTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:2189](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L2189)

## Parameters

### params

#### anchorRefAddress?

[`PublicKeyish`](../type-aliases/PublicKeyish.md) \| `null`

#### delegatedRightsMask

`number`

#### eligibilityStatus

`number`

#### healthPlanAddress

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### inviteAuthorityAddress?

[`PublicKeyish`](../type-aliases/PublicKeyish.md) \| `null`

#### inviteExpiresAt

`bigint`

#### inviteIdHashHex?

`string` \| `null`

#### programId?

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### proofMode

`number`

#### recentBlockhash

`string`

#### seriesScopeAddress?

[`PublicKeyish`](../type-aliases/PublicKeyish.md) \| `null`

#### subjectCommitmentHashHex?

`string` \| `null`

#### tokenGateAccountAddress?

[`PublicKeyish`](../type-aliases/PublicKeyish.md) \| `null`

#### tokenGateAmountSnapshot

`bigint`

#### wallet

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

## Returns

`Transaction`
