[**@omegax/protocol-sdk**](../README.md)

***

[@omegax/protocol-sdk](../README.md) / buildConfigureReserveAssetRailTx

# Function: buildConfigureReserveAssetRailTx()

> **buildConfigureReserveAssetRailTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:1212](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L1212)

## Parameters

### params

#### active

`boolean`

#### assetMint

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### assetSymbol

`string`

#### authority

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### capacityEnabled

`boolean`

#### depositEnabled

`boolean`

#### haircutBps

`number`

#### maxExposureBps

`number`

#### maxStalenessSeconds

`bigint`

#### oracleAuthority?

[`PublicKeyish`](../type-aliases/PublicKeyish.md) \| `null`

#### oracleFeedIdHex?

`string` \| `null`

#### oracleSource

`number`

#### payoutEnabled

`boolean`

#### payoutPriority

`number`

#### programId?

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### reasonHashHex?

`string` \| `null`

#### recentBlockhash

`string`

#### reserveDomainAddress

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### role

`number`

## Returns

`Transaction`
