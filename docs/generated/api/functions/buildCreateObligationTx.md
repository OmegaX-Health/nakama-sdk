[**@omegax/protocol-sdk**](../README.md)

***

[@omegax/protocol-sdk](../README.md) / buildCreateObligationTx

# Function: buildCreateObligationTx()

> **buildCreateObligationTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:835](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L835)

## Parameters

### params

#### allocationPositionAddress?

[`PublicKeyish`](../type-aliases/PublicKeyish.md) \| `null`

#### amount

`bigint`

#### assetMint

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### authority

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### beneficiaryAddress?

[`PublicKeyish`](../type-aliases/PublicKeyish.md) \| `null`

#### capitalClassAddress?

[`PublicKeyish`](../type-aliases/PublicKeyish.md) \| `null`

#### claimCaseAddress?

[`PublicKeyish`](../type-aliases/PublicKeyish.md) \| `null`

#### creationReasonHashHex?

`string` \| `null`

#### deliveryMode

`number`

#### fundingLineAddress

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### healthPlanAddress

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### liquidityPoolAddress?

[`PublicKeyish`](../type-aliases/PublicKeyish.md) \| `null`

#### memberWalletAddress?

[`PublicKeyish`](../type-aliases/PublicKeyish.md) \| `null`

#### obligationId

`string`

#### policySeriesAddress?

[`PublicKeyish`](../type-aliases/PublicKeyish.md) \| `null`

#### poolAssetMint?

[`PublicKeyish`](../type-aliases/PublicKeyish.md) \| `null`

#### programId?

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### recentBlockhash

`string`

#### reserveDomainAddress

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

## Returns

`Transaction`
