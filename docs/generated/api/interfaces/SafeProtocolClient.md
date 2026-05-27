[**@omegax/protocol-sdk**](../README.md)

***

[@omegax/protocol-sdk](../README.md) / SafeProtocolClient

# Interface: SafeProtocolClient

Defined in: [src/protocol.ts:3476](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3476)

## Properties

### connection

> **connection**: `Connection`

Defined in: [src/protocol.ts:3477](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3477)

***

### programId

> **programId**: `PublicKey`

Defined in: [src/protocol.ts:3478](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3478)

***

### raw

> **raw**: [`ProtocolClient`](ProtocolClient.md)

Defined in: [src/protocol.ts:3479](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3479)

## Methods

### buildAttestClaimCaseTx()

> **buildAttestClaimCaseTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:3526](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3526)

#### Parameters

##### params

[`SafeAttestClaimCaseTxParams`](../type-aliases/SafeAttestClaimCaseTxParams.md)

#### Returns

`Transaction`

***

### buildDepositIntoCapitalClassTx()

> **buildDepositIntoCapitalClassTx**(`params`): `Promise`\<`Transaction`\>

Defined in: [src/protocol.ts:3487](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3487)

#### Parameters

##### params

[`SafeDepositIntoCapitalClassTxParams`](../type-aliases/SafeDepositIntoCapitalClassTxParams.md)

#### Returns

`Promise`\<`Transaction`\>

***

### buildFundSponsorBudgetTx()

> **buildFundSponsorBudgetTx**(`params`): `Promise`\<`Transaction`\>

Defined in: [src/protocol.ts:3481](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3481)

#### Parameters

##### params

[`SafeFundSponsorBudgetTxParams`](../type-aliases/SafeFundSponsorBudgetTxParams.md)

#### Returns

`Promise`\<`Transaction`\>

***

### buildMarkImpairmentTx()

> **buildMarkImpairmentTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:3524](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3524)

#### Parameters

##### params

[`SafeMarkImpairmentTxParams`](../type-aliases/SafeMarkImpairmentTxParams.md)

#### Returns

`Transaction`

***

### buildOpenClaimCaseTx()

> **buildOpenClaimCaseTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:3512](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3512)

#### Parameters

##### params

[`SafeOpenClaimCaseTxParams`](../type-aliases/SafeOpenClaimCaseTxParams.md)

#### Returns

`Transaction`

***

### buildProcessRedemptionQueueTx()

> **buildProcessRedemptionQueueTx**(`params`): `Promise`\<`Transaction`\>

Defined in: [src/protocol.ts:3491](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3491)

#### Parameters

##### params

[`SafeProcessRedemptionQueueTxParams`](../type-aliases/SafeProcessRedemptionQueueTxParams.md)

#### Returns

`Promise`\<`Transaction`\>

***

### buildRecordPremiumPaymentTx()

> **buildRecordPremiumPaymentTx**(`params`): `Promise`\<`Transaction`\>

Defined in: [src/protocol.ts:3484](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3484)

#### Parameters

##### params

[`SafeRecordPremiumPaymentTxParams`](../type-aliases/SafeRecordPremiumPaymentTxParams.md)

#### Returns

`Promise`\<`Transaction`\>

***

### buildRegisterOracleTx()

> **buildRegisterOracleTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:3525](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3525)

#### Parameters

##### params

[`SafeRegisterOracleTxParams`](../type-aliases/SafeRegisterOracleTxParams.md)

#### Returns

`Transaction`

***

### buildReleaseReserveTx()

> **buildReleaseReserveTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:3514](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3514)

#### Parameters

##### params

[`SafeReleaseReserveTxParams`](../type-aliases/SafeReleaseReserveTxParams.md)

#### Returns

`Transaction`

***

### buildRequestRedemptionTx()

> **buildRequestRedemptionTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:3490](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3490)

#### Parameters

##### params

[`SafeRequestRedemptionTxParams`](../type-aliases/SafeRequestRedemptionTxParams.md)

#### Returns

`Transaction`

***

### buildReserveObligationTx()

> **buildReserveObligationTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:3513](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3513)

#### Parameters

##### params

[`SafeReserveObligationTxParams`](../type-aliases/SafeReserveObligationTxParams.md)

#### Returns

`Transaction`

***

### buildSettleClaimCaseSelectedAssetTx()

> **buildSettleClaimCaseSelectedAssetTx**(`params`): `Promise`\<`Transaction`\>

Defined in: [src/protocol.ts:3521](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3521)

#### Parameters

##### params

[`SafeSettleClaimCaseSelectedAssetTxParams`](../type-aliases/SafeSettleClaimCaseSelectedAssetTxParams.md)

#### Returns

`Promise`\<`Transaction`\>

***

### buildSettleClaimCaseTx()

> **buildSettleClaimCaseTx**(`params`): `Promise`\<`Transaction`\>

Defined in: [src/protocol.ts:3518](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3518)

#### Parameters

##### params

[`SafeSettleClaimCaseTxParams`](../type-aliases/SafeSettleClaimCaseTxParams.md)

#### Returns

`Promise`\<`Transaction`\>

***

### buildSettleObligationTx()

> **buildSettleObligationTx**(`params`): `Promise`\<`Transaction`\>

Defined in: [src/protocol.ts:3515](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3515)

#### Parameters

##### params

[`SafeSettleObligationTxParams`](../type-aliases/SafeSettleObligationTxParams.md)

#### Returns

`Promise`\<`Transaction`\>

***

### buildWithdrawPoolOracleFeeSolTx()

> **buildWithdrawPoolOracleFeeSolTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:3509](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3509)

#### Parameters

##### params

[`SafeWithdrawPoolOracleFeeSolTxParams`](../type-aliases/SafeWithdrawPoolOracleFeeSolTxParams.md)

#### Returns

`Transaction`

***

### buildWithdrawPoolOracleFeeSplTx()

> **buildWithdrawPoolOracleFeeSplTx**(`params`): `Promise`\<`Transaction`\>

Defined in: [src/protocol.ts:3500](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3500)

#### Parameters

##### params

[`SafeWithdrawPoolOracleFeeSplTxParams`](../type-aliases/SafeWithdrawPoolOracleFeeSplTxParams.md)

#### Returns

`Promise`\<`Transaction`\>

***

### buildWithdrawPoolTreasurySolTx()

> **buildWithdrawPoolTreasurySolTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:3506](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3506)

#### Parameters

##### params

[`SafeWithdrawPoolTreasurySolTxParams`](../type-aliases/SafeWithdrawPoolTreasurySolTxParams.md)

#### Returns

`Transaction`

***

### buildWithdrawPoolTreasurySplTx()

> **buildWithdrawPoolTreasurySplTx**(`params`): `Promise`\<`Transaction`\>

Defined in: [src/protocol.ts:3497](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3497)

#### Parameters

##### params

[`SafeWithdrawPoolTreasurySplTxParams`](../type-aliases/SafeWithdrawPoolTreasurySplTxParams.md)

#### Returns

`Promise`\<`Transaction`\>

***

### buildWithdrawProtocolFeeSolTx()

> **buildWithdrawProtocolFeeSolTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:3503](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3503)

#### Parameters

##### params

[`SafeWithdrawProtocolFeeSolTxParams`](../type-aliases/SafeWithdrawProtocolFeeSolTxParams.md)

#### Returns

`Transaction`

***

### buildWithdrawProtocolFeeSplTx()

> **buildWithdrawProtocolFeeSplTx**(`params`): `Promise`\<`Transaction`\>

Defined in: [src/protocol.ts:3494](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3494)

#### Parameters

##### params

[`SafeWithdrawProtocolFeeSplTxParams`](../type-aliases/SafeWithdrawProtocolFeeSplTxParams.md)

#### Returns

`Promise`\<`Transaction`\>

***

### getProgramId()

> **getProgramId**(): `PublicKey`

Defined in: [src/protocol.ts:3480](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3480)

#### Returns

`PublicKey`
