[**@omegax/protocol-sdk**](../README.md)

***

[@omegax/protocol-sdk](../README.md) / buildCreateCommitmentPaymentRailTx

# Function: buildCreateCommitmentPaymentRailTx()

> **buildCreateCommitmentPaymentRailTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:1676](https://github.com/OmegaX-Health/omegax-sdk/blob/18eba6eebb5b732fec0b45b896a6b09b9c0e3cbc/src/protocol.ts#L1676)

## Parameters

### params

#### authority

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### campaignAddress?

[`PublicKeyish`](../type-aliases/PublicKeyish.md) \| `null`

#### campaignId?

`string` \| `null`

#### coverageAmount

`bigint`

#### coverageAssetMint

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### coverageFundingLineAddress

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### depositAmount

`bigint`

#### hardCapAmount

`bigint`

#### healthPlanAddress

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### mode

`number`

#### paymentAssetMint

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### programId?

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### recentBlockhash

`string`

#### reserveAssetRailAddress?

[`PublicKeyish`](../type-aliases/PublicKeyish.md) \| `null`

#### reserveDomainAddress

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

## Returns

`Transaction`
