[**@omegax/protocol-sdk**](../README.md)

***

[@omegax/protocol-sdk](../README.md) / SafeProtocolClient

# Interface: SafeProtocolClient

Defined in: [src/protocol.ts:4140](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L4140)

## Properties

### connection

> **connection**: `Connection`

Defined in: [src/protocol.ts:4141](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L4141)

***

### programId

> **programId**: `PublicKey`

Defined in: [src/protocol.ts:4142](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L4142)

***

### raw

> **raw**: [`ProtocolClient`](ProtocolClient.md)

Defined in: [src/protocol.ts:4143](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L4143)

## Methods

### buildAttestClaimCaseTx()

> **buildAttestClaimCaseTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:4187](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L4187)

#### Parameters

##### params

[`SafeAttestClaimCaseTxParams`](../type-aliases/SafeAttestClaimCaseTxParams.md)

#### Returns

`Transaction`

***

### buildDepositCommitmentTx()

> **buildDepositCommitmentTx**(`params`): `Promise`\<`Transaction`\>

Defined in: [src/protocol.ts:4145](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L4145)

#### Parameters

##### params

[`SafeDepositCommitmentTxParams`](../type-aliases/SafeDepositCommitmentTxParams.md)

#### Returns

`Promise`\<`Transaction`\>

***

### buildDepositIntoCapitalClassTx()

> **buildDepositIntoCapitalClassTx**(`params`): `Promise`\<`Transaction`\>

Defined in: [src/protocol.ts:4154](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L4154)

#### Parameters

##### params

[`SafeDepositIntoCapitalClassTxParams`](../type-aliases/SafeDepositIntoCapitalClassTxParams.md)

#### Returns

`Promise`\<`Transaction`\>

***

### buildFundSponsorBudgetTx()

> **buildFundSponsorBudgetTx**(`params`): `Promise`\<`Transaction`\>

Defined in: [src/protocol.ts:4148](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L4148)

#### Parameters

##### params

[`SafeFundSponsorBudgetTxParams`](../type-aliases/SafeFundSponsorBudgetTxParams.md)

#### Returns

`Promise`\<`Transaction`\>

***

### buildMarkImpairmentTx()

> **buildMarkImpairmentTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:4185](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L4185)

#### Parameters

##### params

[`SafeMarkImpairmentTxParams`](../type-aliases/SafeMarkImpairmentTxParams.md)

#### Returns

`Transaction`

***

### buildOpenClaimCaseTx()

> **buildOpenClaimCaseTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:4179](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L4179)

#### Parameters

##### params

[`SafeOpenClaimCaseTxParams`](../type-aliases/SafeOpenClaimCaseTxParams.md)

#### Returns

`Transaction`

***

### buildProcessRedemptionQueueTx()

> **buildProcessRedemptionQueueTx**(`params`): `Promise`\<`Transaction`\>

Defined in: [src/protocol.ts:4158](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L4158)

#### Parameters

##### params

[`SafeProcessRedemptionQueueTxParams`](../type-aliases/SafeProcessRedemptionQueueTxParams.md)

#### Returns

`Promise`\<`Transaction`\>

***

### buildRecordPremiumPaymentTx()

> **buildRecordPremiumPaymentTx**(`params`): `Promise`\<`Transaction`\>

Defined in: [src/protocol.ts:4151](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L4151)

#### Parameters

##### params

[`SafeRecordPremiumPaymentTxParams`](../type-aliases/SafeRecordPremiumPaymentTxParams.md)

#### Returns

`Promise`\<`Transaction`\>

***

### buildRegisterOracleTx()

> **buildRegisterOracleTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:4186](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L4186)

#### Parameters

##### params

[`SafeRegisterOracleTxParams`](../type-aliases/SafeRegisterOracleTxParams.md)

#### Returns

`Transaction`

***

### buildReleaseReserveTx()

> **buildReleaseReserveTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:4181](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L4181)

#### Parameters

##### params

[`SafeReleaseReserveTxParams`](../type-aliases/SafeReleaseReserveTxParams.md)

#### Returns

`Transaction`

***

### buildRequestRedemptionTx()

> **buildRequestRedemptionTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:4157](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L4157)

#### Parameters

##### params

[`SafeRequestRedemptionTxParams`](../type-aliases/SafeRequestRedemptionTxParams.md)

#### Returns

`Transaction`

***

### buildReserveObligationTx()

> **buildReserveObligationTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:4180](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L4180)

#### Parameters

##### params

[`SafeReserveObligationTxParams`](../type-aliases/SafeReserveObligationTxParams.md)

#### Returns

`Transaction`

***

### buildSettleObligationTx()

> **buildSettleObligationTx**(`params`): `Promise`\<`Transaction`\>

Defined in: [src/protocol.ts:4182](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L4182)

#### Parameters

##### params

[`SafeSettleObligationTxParams`](../type-aliases/SafeSettleObligationTxParams.md)

#### Returns

`Promise`\<`Transaction`\>

***

### buildWithdrawPoolOracleFeeSolTx()

> **buildWithdrawPoolOracleFeeSolTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:4176](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L4176)

#### Parameters

##### params

[`SafeWithdrawPoolOracleFeeSolTxParams`](../type-aliases/SafeWithdrawPoolOracleFeeSolTxParams.md)

#### Returns

`Transaction`

***

### buildWithdrawPoolOracleFeeSplTx()

> **buildWithdrawPoolOracleFeeSplTx**(`params`): `Promise`\<`Transaction`\>

Defined in: [src/protocol.ts:4167](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L4167)

#### Parameters

##### params

[`SafeWithdrawPoolOracleFeeSplTxParams`](../type-aliases/SafeWithdrawPoolOracleFeeSplTxParams.md)

#### Returns

`Promise`\<`Transaction`\>

***

### buildWithdrawPoolTreasurySolTx()

> **buildWithdrawPoolTreasurySolTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:4173](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L4173)

#### Parameters

##### params

[`SafeWithdrawPoolTreasurySolTxParams`](../type-aliases/SafeWithdrawPoolTreasurySolTxParams.md)

#### Returns

`Transaction`

***

### buildWithdrawPoolTreasurySplTx()

> **buildWithdrawPoolTreasurySplTx**(`params`): `Promise`\<`Transaction`\>

Defined in: [src/protocol.ts:4164](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L4164)

#### Parameters

##### params

[`SafeWithdrawPoolTreasurySplTxParams`](../type-aliases/SafeWithdrawPoolTreasurySplTxParams.md)

#### Returns

`Promise`\<`Transaction`\>

***

### buildWithdrawProtocolFeeSolTx()

> **buildWithdrawProtocolFeeSolTx**(`params`): `Transaction`

Defined in: [src/protocol.ts:4170](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L4170)

#### Parameters

##### params

[`SafeWithdrawProtocolFeeSolTxParams`](../type-aliases/SafeWithdrawProtocolFeeSolTxParams.md)

#### Returns

`Transaction`

***

### buildWithdrawProtocolFeeSplTx()

> **buildWithdrawProtocolFeeSplTx**(`params`): `Promise`\<`Transaction`\>

Defined in: [src/protocol.ts:4161](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L4161)

#### Parameters

##### params

[`SafeWithdrawProtocolFeeSplTxParams`](../type-aliases/SafeWithdrawProtocolFeeSplTxParams.md)

#### Returns

`Promise`\<`Transaction`\>

***

### getProgramId()

> **getProgramId**(): `PublicKey`

Defined in: [src/protocol.ts:4144](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/protocol.ts#L4144)

#### Returns

`PublicKey`
