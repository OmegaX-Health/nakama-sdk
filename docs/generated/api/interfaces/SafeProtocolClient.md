[**@omegax/protocol-sdk**](../README.md)

***

[@omegax/protocol-sdk](../README.md) / SafeProtocolClient

# Interface: SafeProtocolClient

Defined in: [src/protocol.ts:3859](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3859)

## Properties

### connection

> **connection**: `Connection`

Defined in: [src/protocol.ts:3860](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3860)

***

### programId

> **programId**: `PublicKey`

Defined in: [src/protocol.ts:3861](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3861)

***

### raw

> **raw**: [`ProtocolClient`](ProtocolClient.md)

Defined in: [src/protocol.ts:3862](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3862)

## Methods

### buildAttestClaimCaseTx()

> **buildAttestClaimCaseTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:3909](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3909)

#### Parameters

##### params

[`SafeAttestClaimCaseTxParams`](../type-aliases/SafeAttestClaimCaseTxParams.md)

#### Returns

`Transaction`

***

### buildDepositIntoCapitalClassTx()

> **buildDepositIntoCapitalClassTx**(`params`): `Promise`\<`Transaction`\>

Defined in: [src/protocol.ts:3870](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3870)

#### Parameters

##### params

[`SafeDepositIntoCapitalClassTxParams`](../type-aliases/SafeDepositIntoCapitalClassTxParams.md)

#### Returns

`Promise`\<`Transaction`\>

***

### buildFundSponsorBudgetTx()

> **buildFundSponsorBudgetTx**(`params`): `Promise`\<`Transaction`\>

Defined in: [src/protocol.ts:3864](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3864)

#### Parameters

##### params

[`SafeFundSponsorBudgetTxParams`](../type-aliases/SafeFundSponsorBudgetTxParams.md)

#### Returns

`Promise`\<`Transaction`\>

***

### buildMarkImpairmentTx()

> **buildMarkImpairmentTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:3907](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3907)

#### Parameters

##### params

[`SafeMarkImpairmentTxParams`](../type-aliases/SafeMarkImpairmentTxParams.md)

#### Returns

`Transaction`

***

### buildOpenClaimCaseTx()

> **buildOpenClaimCaseTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:3895](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3895)

#### Parameters

##### params

[`SafeOpenClaimCaseTxParams`](../type-aliases/SafeOpenClaimCaseTxParams.md)

#### Returns

`Transaction`

***

### buildProcessRedemptionQueueTx()

> **buildProcessRedemptionQueueTx**(`params`): `Promise`\<`Transaction`\>

Defined in: [src/protocol.ts:3874](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3874)

#### Parameters

##### params

[`SafeProcessRedemptionQueueTxParams`](../type-aliases/SafeProcessRedemptionQueueTxParams.md)

#### Returns

`Promise`\<`Transaction`\>

***

### buildRecordPremiumPaymentTx()

> **buildRecordPremiumPaymentTx**(`params`): `Promise`\<`Transaction`\>

Defined in: [src/protocol.ts:3867](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3867)

#### Parameters

##### params

[`SafeRecordPremiumPaymentTxParams`](../type-aliases/SafeRecordPremiumPaymentTxParams.md)

#### Returns

`Promise`\<`Transaction`\>

***

### buildRegisterOracleTx()

> **buildRegisterOracleTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:3908](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3908)

#### Parameters

##### params

[`SafeRegisterOracleTxParams`](../type-aliases/SafeRegisterOracleTxParams.md)

#### Returns

`Transaction`

***

### buildReleaseReserveTx()

> **buildReleaseReserveTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:3897](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3897)

#### Parameters

##### params

[`SafeReleaseReserveTxParams`](../type-aliases/SafeReleaseReserveTxParams.md)

#### Returns

`Transaction`

***

### buildRequestRedemptionTx()

> **buildRequestRedemptionTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:3873](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3873)

#### Parameters

##### params

[`SafeRequestRedemptionTxParams`](../type-aliases/SafeRequestRedemptionTxParams.md)

#### Returns

`Transaction`

***

### buildReserveObligationTx()

> **buildReserveObligationTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:3896](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3896)

#### Parameters

##### params

[`SafeReserveObligationTxParams`](../type-aliases/SafeReserveObligationTxParams.md)

#### Returns

`Transaction`

***

### buildSettleClaimCaseSelectedAssetTx()

> **buildSettleClaimCaseSelectedAssetTx**(`params`): `Promise`\<`Transaction`\>

Defined in: [src/protocol.ts:3904](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3904)

#### Parameters

##### params

[`SafeSettleClaimCaseSelectedAssetTxParams`](../type-aliases/SafeSettleClaimCaseSelectedAssetTxParams.md)

#### Returns

`Promise`\<`Transaction`\>

***

### buildSettleClaimCaseTx()

> **buildSettleClaimCaseTx**(`params`): `Promise`\<`Transaction`\>

Defined in: [src/protocol.ts:3901](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3901)

#### Parameters

##### params

[`SafeSettleClaimCaseTxParams`](../type-aliases/SafeSettleClaimCaseTxParams.md)

#### Returns

`Promise`\<`Transaction`\>

***

### buildSettleObligationTx()

> **buildSettleObligationTx**(`params`): `Promise`\<`Transaction`\>

Defined in: [src/protocol.ts:3898](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3898)

#### Parameters

##### params

[`SafeSettleObligationTxParams`](../type-aliases/SafeSettleObligationTxParams.md)

#### Returns

`Promise`\<`Transaction`\>

***

### buildWithdrawPoolOracleFeeSolTx()

> **buildWithdrawPoolOracleFeeSolTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:3892](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3892)

#### Parameters

##### params

[`SafeWithdrawPoolOracleFeeSolTxParams`](../type-aliases/SafeWithdrawPoolOracleFeeSolTxParams.md)

#### Returns

`Transaction`

***

### buildWithdrawPoolOracleFeeSplTx()

> **buildWithdrawPoolOracleFeeSplTx**(`params`): `Promise`\<`Transaction`\>

Defined in: [src/protocol.ts:3883](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3883)

#### Parameters

##### params

[`SafeWithdrawPoolOracleFeeSplTxParams`](../type-aliases/SafeWithdrawPoolOracleFeeSplTxParams.md)

#### Returns

`Promise`\<`Transaction`\>

***

### buildWithdrawPoolTreasurySolTx()

> **buildWithdrawPoolTreasurySolTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:3889](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3889)

#### Parameters

##### params

[`SafeWithdrawPoolTreasurySolTxParams`](../type-aliases/SafeWithdrawPoolTreasurySolTxParams.md)

#### Returns

`Transaction`

***

### buildWithdrawPoolTreasurySplTx()

> **buildWithdrawPoolTreasurySplTx**(`params`): `Promise`\<`Transaction`\>

Defined in: [src/protocol.ts:3880](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3880)

#### Parameters

##### params

[`SafeWithdrawPoolTreasurySplTxParams`](../type-aliases/SafeWithdrawPoolTreasurySplTxParams.md)

#### Returns

`Promise`\<`Transaction`\>

***

### buildWithdrawProtocolFeeSolTx()

> **buildWithdrawProtocolFeeSolTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:3886](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3886)

#### Parameters

##### params

[`SafeWithdrawProtocolFeeSolTxParams`](../type-aliases/SafeWithdrawProtocolFeeSolTxParams.md)

#### Returns

`Transaction`

***

### buildWithdrawProtocolFeeSplTx()

> **buildWithdrawProtocolFeeSplTx**(`params`): `Promise`\<`Transaction`\>

Defined in: [src/protocol.ts:3877](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3877)

#### Parameters

##### params

[`SafeWithdrawProtocolFeeSplTxParams`](../type-aliases/SafeWithdrawProtocolFeeSplTxParams.md)

#### Returns

`Promise`\<`Transaction`\>

***

### getProgramId()

> **getProgramId**(): `PublicKey`

Defined in: [src/protocol.ts:3863](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L3863)

#### Returns

`PublicKey`
