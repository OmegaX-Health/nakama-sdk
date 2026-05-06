[**@omegax/protocol-sdk**](../README.md)

***

[@omegax/protocol-sdk](../README.md) / buildOpenFundingLineTx

# Function: buildOpenFundingLineTx()

> **buildOpenFundingLineTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:1468](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L1468)

## Parameters

### params

#### assetMint

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### authority

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### capsHashHex?

`string` \| `null`

#### committedAmount

`bigint`

#### fundingPriority

`number`

#### healthPlanAddress

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### lineId

`string`

#### lineType

`number`

#### policySeriesAddress?

[`PublicKeyish`](../type-aliases/PublicKeyish.md) \| `null`

#### programId?

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### recentBlockhash

`string`

#### reserveDomainAddress

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

## Returns

`Transaction`
