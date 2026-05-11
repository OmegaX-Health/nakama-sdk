[**@omegax/protocol-sdk**](../README.md)

***

[@omegax/protocol-sdk](../README.md) / buildPublishReserveAssetRailPriceTx

# Function: buildPublishReserveAssetRailPriceTx()

> **buildPublishReserveAssetRailPriceTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:1302](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L1302)

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
