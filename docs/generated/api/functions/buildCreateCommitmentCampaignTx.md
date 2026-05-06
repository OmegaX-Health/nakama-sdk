[**@omegax/protocol-sdk**](../README.md)

***

[@omegax/protocol-sdk](../README.md) / buildCreateCommitmentCampaignTx

# Function: buildCreateCommitmentCampaignTx()

> **buildCreateCommitmentCampaignTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:1555](https://github.com/OmegaX-Health/omegax-sdk/blob/18eba6eebb5b732fec0b45b896a6b09b9c0e3cbc/src/protocol.ts#L1555)

## Parameters

### params

#### activationAuthority

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### authority

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### campaignId

`string`

#### coverageAmount

`bigint`

#### coverageAssetMint

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### coverageFundingLineAddress

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### depositAmount

`bigint`

#### displayName

`string`

#### expiresAtTs

`bigint`

#### hardCapAmount

`bigint`

#### healthPlanAddress

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### metadataUri

`string`

#### mode

`number`

#### paymentAssetMint

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### programId?

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### recentBlockhash

`string`

#### refundAfterTs

`bigint`

#### reserveAssetRailAddress?

[`PublicKeyish`](../type-aliases/PublicKeyish.md) \| `null`

#### reserveDomainAddress

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### startsAtTs

`bigint`

#### termsHashHex?

`string` \| `null`

## Returns

`Transaction`
