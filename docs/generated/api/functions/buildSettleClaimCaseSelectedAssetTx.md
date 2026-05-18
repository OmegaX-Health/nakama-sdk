[**@omegax/protocol-sdk**](../README.md)

***

[@omegax/protocol-sdk](../README.md) / buildSettleClaimCaseSelectedAssetTx

# Function: buildSettleClaimCaseSelectedAssetTx()

> **buildSettleClaimCaseSelectedAssetTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:2260](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L2260)

## Parameters

### params

#### authority

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### claimAssetMint

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### claimAssetRailAddress?

[`PublicKeyish`](../type-aliases/PublicKeyish.md) \| `null`

#### claimCaseAddress

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### claimCreditAmount

`bigint`

#### healthPlanAddress

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### maxOverpayBps

`number`

#### memberPositionAddress

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### payoutAmount

`bigint`

#### payoutAssetMint

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### payoutAssetRailAddress?

[`PublicKeyish`](../type-aliases/PublicKeyish.md) \| `null`

#### payoutFundingLineAddress

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### payoutVaultTokenAccountAddress

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### policySeriesAddress?

[`PublicKeyish`](../type-aliases/PublicKeyish.md) \| `null`

#### programId?

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### recentBlockhash

`string`

#### recipientTokenAccountAddress

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### reserveDomainAddress

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### settlementReasonHashHex?

`string` \| `null`

#### tokenProgramId

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

## Returns

`Transaction`
