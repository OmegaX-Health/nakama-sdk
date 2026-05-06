[**@omegax/protocol-sdk**](../README.md)

***

[@omegax/protocol-sdk](../README.md) / buildPublishReserveAssetRailPriceTx

# Function: buildPublishReserveAssetRailPriceTx()

> **buildPublishReserveAssetRailPriceTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:1285](https://github.com/OmegaX-Health/omegax-sdk/blob/18eba6eebb5b732fec0b45b896a6b09b9c0e3cbc/src/protocol.ts#L1285)

## Parameters

### params

#### assetMint

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### authority

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### confidenceBps

`number`

#### priceUsd1e8

`bigint`

#### programId?

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### proofHashHex?

`string` \| `null`

#### publishedAtTs

`bigint`

#### recentBlockhash

`string`

#### reserveDomainAddress

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

## Returns

`Transaction`
