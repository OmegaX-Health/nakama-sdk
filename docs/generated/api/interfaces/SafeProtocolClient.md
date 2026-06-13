[**@omegax/protocol-sdk**](../README.md)

***

[@omegax/protocol-sdk](../README.md) / SafeProtocolClient

# Interface: SafeProtocolClient

Defined in: [src/protocol.ts:1896](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L1896)

## Properties

### connection

> **connection**: `Connection`

Defined in: [src/protocol.ts:1897](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L1897)

***

### programId

> **programId**: `PublicKey`

Defined in: [src/protocol.ts:1898](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L1898)

***

### raw

> **raw**: [`ProtocolClient`](ProtocolClient.md)

Defined in: [src/protocol.ts:1899](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L1899)

## Methods

### buildFundSponsorBudgetTx()

> **buildFundSponsorBudgetTx**(`params`): `Promise`\<`Transaction`\>

Defined in: [src/protocol.ts:1901](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L1901)

#### Parameters

##### params

[`SafeFundSponsorBudgetTxParams`](../type-aliases/SafeFundSponsorBudgetTxParams.md)

#### Returns

`Promise`\<`Transaction`\>

***

### buildOpenClaimCaseTx()

> **buildOpenClaimCaseTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:1907](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L1907)

#### Parameters

##### params

[`SafeOpenClaimCaseTxParams`](../type-aliases/SafeOpenClaimCaseTxParams.md)

#### Returns

`Transaction`

***

### buildRecordPremiumPaymentTx()

> **buildRecordPremiumPaymentTx**(`params`): `Promise`\<`Transaction`\>

Defined in: [src/protocol.ts:1904](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L1904)

#### Parameters

##### params

[`SafeRecordPremiumPaymentTxParams`](../type-aliases/SafeRecordPremiumPaymentTxParams.md)

#### Returns

`Promise`\<`Transaction`\>

***

### buildReleaseReserveTx()

> **buildReleaseReserveTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:1909](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L1909)

#### Parameters

##### params

[`SafeReleaseReserveTxParams`](../type-aliases/SafeReleaseReserveTxParams.md)

#### Returns

`Transaction`

***

### buildReserveObligationTx()

> **buildReserveObligationTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:1908](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L1908)

#### Parameters

##### params

[`SafeReserveObligationTxParams`](../type-aliases/SafeReserveObligationTxParams.md)

#### Returns

`Transaction`

***

### buildSettleClaimCaseTx()

> **buildSettleClaimCaseTx**(`params`): `Promise`\<`Transaction`\>

Defined in: [src/protocol.ts:1913](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L1913)

#### Parameters

##### params

[`SafeSettleClaimCaseTxParams`](../type-aliases/SafeSettleClaimCaseTxParams.md)

#### Returns

`Promise`\<`Transaction`\>

***

### buildSettleObligationTx()

> **buildSettleObligationTx**(`params`): `Promise`\<`Transaction`\>

Defined in: [src/protocol.ts:1910](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L1910)

#### Parameters

##### params

[`SafeSettleObligationTxParams`](../type-aliases/SafeSettleObligationTxParams.md)

#### Returns

`Promise`\<`Transaction`\>

***

### getProgramId()

> **getProgramId**(): `PublicKey`

Defined in: [src/protocol.ts:1900](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L1900)

#### Returns

`PublicKey`
