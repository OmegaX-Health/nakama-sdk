[**@omegax/protocol-sdk**](../README.md)

***

[@omegax/protocol-sdk](../README.md) / ProtocolClient

# Interface: ProtocolClient

Defined in: [src/generated/protocol\_types.ts:696](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L696)

## Properties

### connection

> `readonly` **connection**: `Connection`

Defined in: [src/generated/protocol\_types.ts:697](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L697)

***

### programId

> `readonly` **programId**: `PublicKey`

Defined in: [src/generated/protocol\_types.ts:698](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L698)

## Methods

### buildAdjudicateClaimCaseInstruction()

> **buildAdjudicateClaimCaseInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:724](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L724)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`AdjudicateClaimCaseArgs`](AdjudicateClaimCaseArgs.md), [`AdjudicateClaimCaseAccounts`](AdjudicateClaimCaseAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildAdjudicateClaimCaseTx()

> **buildAdjudicateClaimCaseTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:730](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L730)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`AdjudicateClaimCaseArgs`](AdjudicateClaimCaseArgs.md), [`AdjudicateClaimCaseAccounts`](AdjudicateClaimCaseAccounts.md)\>

#### Returns

`Transaction`

***

### buildAuthorizeClaimRecipientInstruction()

> **buildAuthorizeClaimRecipientInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:736](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L736)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`AuthorizeClaimRecipientArgs`](AuthorizeClaimRecipientArgs.md), [`AuthorizeClaimRecipientAccounts`](AuthorizeClaimRecipientAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildAuthorizeClaimRecipientTx()

> **buildAuthorizeClaimRecipientTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:742](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L742)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`AuthorizeClaimRecipientArgs`](AuthorizeClaimRecipientArgs.md), [`AuthorizeClaimRecipientAccounts`](AuthorizeClaimRecipientAccounts.md)\>

#### Returns

`Transaction`

***

### buildCreateDomainAssetVaultInstruction()

> **buildCreateDomainAssetVaultInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:748](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L748)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`CreateDomainAssetVaultArgs`](CreateDomainAssetVaultArgs.md), [`CreateDomainAssetVaultAccounts`](CreateDomainAssetVaultAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildCreateDomainAssetVaultTx()

> **buildCreateDomainAssetVaultTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:754](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L754)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`CreateDomainAssetVaultArgs`](CreateDomainAssetVaultArgs.md), [`CreateDomainAssetVaultAccounts`](CreateDomainAssetVaultAccounts.md)\>

#### Returns

`Transaction`

***

### buildCreateHealthPlanInstruction()

> **buildCreateHealthPlanInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:760](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L760)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`CreateHealthPlanArgs`](CreateHealthPlanArgs.md), [`CreateHealthPlanAccounts`](CreateHealthPlanAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildCreateHealthPlanTx()

> **buildCreateHealthPlanTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:766](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L766)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`CreateHealthPlanArgs`](CreateHealthPlanArgs.md), [`CreateHealthPlanAccounts`](CreateHealthPlanAccounts.md)\>

#### Returns

`Transaction`

***

### buildCreateObligationInstruction()

> **buildCreateObligationInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:772](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L772)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`CreateObligationArgs`](CreateObligationArgs.md), [`CreateObligationAccounts`](CreateObligationAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildCreateObligationTx()

> **buildCreateObligationTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:778](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L778)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`CreateObligationArgs`](CreateObligationArgs.md), [`CreateObligationAccounts`](CreateObligationAccounts.md)\>

#### Returns

`Transaction`

***

### buildCreatePolicySeriesInstruction()

> **buildCreatePolicySeriesInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:784](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L784)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`CreatePolicySeriesArgs`](CreatePolicySeriesArgs.md), [`CreatePolicySeriesAccounts`](CreatePolicySeriesAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildCreatePolicySeriesTx()

> **buildCreatePolicySeriesTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:790](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L790)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`CreatePolicySeriesArgs`](CreatePolicySeriesArgs.md), [`CreatePolicySeriesAccounts`](CreatePolicySeriesAccounts.md)\>

#### Returns

`Transaction`

***

### buildCreateReserveDomainInstruction()

> **buildCreateReserveDomainInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:796](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L796)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`CreateReserveDomainArgs`](CreateReserveDomainArgs.md), [`CreateReserveDomainAccounts`](CreateReserveDomainAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildCreateReserveDomainTx()

> **buildCreateReserveDomainTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:802](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L802)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`CreateReserveDomainArgs`](CreateReserveDomainArgs.md), [`CreateReserveDomainAccounts`](CreateReserveDomainAccounts.md)\>

#### Returns

`Transaction`

***

### buildDepositReserveCapitalInstruction()

> **buildDepositReserveCapitalInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:808](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L808)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`DepositReserveCapitalArgs`](DepositReserveCapitalArgs.md), [`DepositReserveCapitalAccounts`](DepositReserveCapitalAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildDepositReserveCapitalTx()

> **buildDepositReserveCapitalTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:814](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L814)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`DepositReserveCapitalArgs`](DepositReserveCapitalArgs.md), [`DepositReserveCapitalAccounts`](DepositReserveCapitalAccounts.md)\>

#### Returns

`Transaction`

***

### buildFundSponsorBudgetInstruction()

> **buildFundSponsorBudgetInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:820](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L820)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`FundSponsorBudgetArgs`](FundSponsorBudgetArgs.md), [`FundSponsorBudgetAccounts`](FundSponsorBudgetAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildFundSponsorBudgetTx()

> **buildFundSponsorBudgetTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:826](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L826)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`FundSponsorBudgetArgs`](FundSponsorBudgetArgs.md), [`FundSponsorBudgetAccounts`](FundSponsorBudgetAccounts.md)\>

#### Returns

`Transaction`

***

### buildInstruction()

> **buildInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:700](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L700)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<`Record`\<`string`, `unknown`\>, [`GenericInstructionAccounts`](../type-aliases/GenericInstructionAccounts.md)\> & `object`

#### Returns

`TransactionInstruction`

***

### buildOpenClaimCaseInstruction()

> **buildOpenClaimCaseInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:832](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L832)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`OpenClaimCaseArgs`](OpenClaimCaseArgs.md), [`OpenClaimCaseAccounts`](OpenClaimCaseAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildOpenClaimCaseTx()

> **buildOpenClaimCaseTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:835](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L835)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`OpenClaimCaseArgs`](OpenClaimCaseArgs.md), [`OpenClaimCaseAccounts`](OpenClaimCaseAccounts.md)\>

#### Returns

`Transaction`

***

### buildOpenFundingLineInstruction()

> **buildOpenFundingLineInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:838](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L838)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`OpenFundingLineArgs`](OpenFundingLineArgs.md), [`OpenFundingLineAccounts`](OpenFundingLineAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildOpenFundingLineTx()

> **buildOpenFundingLineTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:844](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L844)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`OpenFundingLineArgs`](OpenFundingLineArgs.md), [`OpenFundingLineAccounts`](OpenFundingLineAccounts.md)\>

#### Returns

`Transaction`

***

### buildRecordPremiumPaymentInstruction()

> **buildRecordPremiumPaymentInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:850](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L850)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`RecordPremiumPaymentArgs`](RecordPremiumPaymentArgs.md), [`RecordPremiumPaymentAccounts`](RecordPremiumPaymentAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildRecordPremiumPaymentTx()

> **buildRecordPremiumPaymentTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:856](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L856)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`RecordPremiumPaymentArgs`](RecordPremiumPaymentArgs.md), [`RecordPremiumPaymentAccounts`](RecordPremiumPaymentAccounts.md)\>

#### Returns

`Transaction`

***

### buildRecordReserveEarningsInstruction()

> **buildRecordReserveEarningsInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:862](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L862)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`RecordReserveEarningsArgs`](RecordReserveEarningsArgs.md), [`RecordReserveEarningsAccounts`](RecordReserveEarningsAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildRecordReserveEarningsTx()

> **buildRecordReserveEarningsTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:868](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L868)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`RecordReserveEarningsArgs`](RecordReserveEarningsArgs.md), [`RecordReserveEarningsAccounts`](RecordReserveEarningsAccounts.md)\>

#### Returns

`Transaction`

***

### buildReleaseReserveInstruction()

> **buildReleaseReserveInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:874](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L874)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`ReleaseReserveArgs`](ReleaseReserveArgs.md), [`ReleaseReserveAccounts`](ReleaseReserveAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildReleaseReserveTx()

> **buildReleaseReserveTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:877](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L877)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`ReleaseReserveArgs`](ReleaseReserveArgs.md), [`ReleaseReserveAccounts`](ReleaseReserveAccounts.md)\>

#### Returns

`Transaction`

***

### buildReserveObligationInstruction()

> **buildReserveObligationInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:880](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L880)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`ReserveObligationArgs`](ReserveObligationArgs.md), [`ReserveObligationAccounts`](ReserveObligationAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildReserveObligationTx()

> **buildReserveObligationTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:886](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L886)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`ReserveObligationArgs`](ReserveObligationArgs.md), [`ReserveObligationAccounts`](ReserveObligationAccounts.md)\>

#### Returns

`Transaction`

***

### buildReturnReserveCapitalInstruction()

> **buildReturnReserveCapitalInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:892](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L892)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`ReturnReserveCapitalArgs`](ReturnReserveCapitalArgs.md), [`ReturnReserveCapitalAccounts`](ReturnReserveCapitalAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildReturnReserveCapitalTx()

> **buildReturnReserveCapitalTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:898](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L898)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`ReturnReserveCapitalArgs`](ReturnReserveCapitalArgs.md), [`ReturnReserveCapitalAccounts`](ReturnReserveCapitalAccounts.md)\>

#### Returns

`Transaction`

***

### buildSettleClaimCaseInstruction()

> **buildSettleClaimCaseInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:904](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L904)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`SettleClaimCaseArgs`](SettleClaimCaseArgs.md), [`SettleClaimCaseAccounts`](SettleClaimCaseAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildSettleClaimCaseTx()

> **buildSettleClaimCaseTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:910](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L910)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`SettleClaimCaseArgs`](SettleClaimCaseArgs.md), [`SettleClaimCaseAccounts`](SettleClaimCaseAccounts.md)\>

#### Returns

`Transaction`

***

### buildSettleObligationInstruction()

> **buildSettleObligationInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:916](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L916)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`SettleObligationArgs`](SettleObligationArgs.md), [`SettleObligationAccounts`](SettleObligationAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildSettleObligationTx()

> **buildSettleObligationTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:922](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L922)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`SettleObligationArgs`](SettleObligationArgs.md), [`SettleObligationAccounts`](SettleObligationAccounts.md)\>

#### Returns

`Transaction`

***

### buildTransaction()

> **buildTransaction**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:708](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L708)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<`Record`\<`string`, `unknown`\>, [`GenericInstructionAccounts`](../type-aliases/GenericInstructionAccounts.md)\> & `object`

#### Returns

`Transaction`

***

### buildUpdateHealthPlanControlsInstruction()

> **buildUpdateHealthPlanControlsInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:928](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L928)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`UpdateHealthPlanControlsArgs`](UpdateHealthPlanControlsArgs.md), [`UpdateHealthPlanControlsAccounts`](UpdateHealthPlanControlsAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildUpdateHealthPlanControlsTx()

> **buildUpdateHealthPlanControlsTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:934](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L934)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`UpdateHealthPlanControlsArgs`](UpdateHealthPlanControlsArgs.md), [`UpdateHealthPlanControlsAccounts`](UpdateHealthPlanControlsAccounts.md)\>

#### Returns

`Transaction`

***

### buildUpdateReserveDomainControlsInstruction()

> **buildUpdateReserveDomainControlsInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:940](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L940)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`UpdateReserveDomainControlsArgs`](UpdateReserveDomainControlsArgs.md), [`UpdateReserveDomainControlsAccounts`](UpdateReserveDomainControlsAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildUpdateReserveDomainControlsTx()

> **buildUpdateReserveDomainControlsTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:946](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L946)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`UpdateReserveDomainControlsArgs`](UpdateReserveDomainControlsArgs.md), [`UpdateReserveDomainControlsAccounts`](UpdateReserveDomainControlsAccounts.md)\>

#### Returns

`Transaction`

***

### buildVersionPolicySeriesInstruction()

> **buildVersionPolicySeriesInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:952](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L952)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`VersionPolicySeriesArgs`](VersionPolicySeriesArgs.md), [`VersionPolicySeriesAccounts`](VersionPolicySeriesAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildVersionPolicySeriesTx()

> **buildVersionPolicySeriesTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:958](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L958)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`VersionPolicySeriesArgs`](VersionPolicySeriesArgs.md), [`VersionPolicySeriesAccounts`](VersionPolicySeriesAccounts.md)\>

#### Returns

`Transaction`

***

### decodeAccount()

> **decodeAccount**\<`T`\>(`accountName`, `data`): `T`

Defined in: [src/generated/protocol\_types.ts:716](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L716)

#### Type Parameters

##### T

`T` = `Record`\<`string`, `unknown`\>

#### Parameters

##### accountName

[`ProtocolAccountName`](../type-aliases/ProtocolAccountName.md)

##### data

`Uint8Array`\<`ArrayBufferLike`\> \| `Buffer`\<`ArrayBufferLike`\>

#### Returns

`T`

***

### fetchAccount()

> **fetchAccount**\<`T`\>(`accountName`, `address`): `Promise`\<`T` \| `null`\>

Defined in: [src/generated/protocol\_types.ts:720](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L720)

#### Type Parameters

##### T

`T` = `Record`\<`string`, `unknown`\>

#### Parameters

##### accountName

[`ProtocolAccountName`](../type-aliases/ProtocolAccountName.md)

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<`T` \| `null`\>

***

### fetchCapitalContribution()

> **fetchCapitalContribution**(`address`): `Promise`\<[`CapitalContribution`](CapitalContribution.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:964](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L964)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`CapitalContribution`](CapitalContribution.md) \| `null`\>

***

### fetchClaimCase()

> **fetchClaimCase**(`address`): `Promise`\<[`ClaimCase`](ClaimCase.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:967](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L967)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`ClaimCase`](ClaimCase.md) \| `null`\>

***

### fetchDomainAssetLedger()

> **fetchDomainAssetLedger**(`address`): `Promise`\<[`DomainAssetLedger`](DomainAssetLedger.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:968](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L968)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`DomainAssetLedger`](DomainAssetLedger.md) \| `null`\>

***

### fetchDomainAssetVault()

> **fetchDomainAssetVault**(`address`): `Promise`\<[`DomainAssetVault`](DomainAssetVault.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:971](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L971)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`DomainAssetVault`](DomainAssetVault.md) \| `null`\>

***

### fetchFundingLine()

> **fetchFundingLine**(`address`): `Promise`\<[`FundingLine`](FundingLine.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:974](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L974)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`FundingLine`](FundingLine.md) \| `null`\>

***

### fetchFundingLineLedger()

> **fetchFundingLineLedger**(`address`): `Promise`\<[`FundingLineLedger`](FundingLineLedger.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:975](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L975)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`FundingLineLedger`](FundingLineLedger.md) \| `null`\>

***

### fetchHealthPlan()

> **fetchHealthPlan**(`address`): `Promise`\<[`HealthPlan`](HealthPlan.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:978](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L978)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`HealthPlan`](HealthPlan.md) \| `null`\>

***

### fetchObligation()

> **fetchObligation**(`address`): `Promise`\<[`Obligation`](Obligation.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:979](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L979)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`Obligation`](Obligation.md) \| `null`\>

***

### fetchPlanReserveLedger()

> **fetchPlanReserveLedger**(`address`): `Promise`\<[`PlanReserveLedger`](PlanReserveLedger.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:980](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L980)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`PlanReserveLedger`](PlanReserveLedger.md) \| `null`\>

***

### fetchPolicySeries()

> **fetchPolicySeries**(`address`): `Promise`\<[`PolicySeries`](PolicySeries.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:983](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L983)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`PolicySeries`](PolicySeries.md) \| `null`\>

***

### fetchReserveDomain()

> **fetchReserveDomain**(`address`): `Promise`\<[`ReserveDomain`](ReserveDomain.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:984](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L984)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`ReserveDomain`](ReserveDomain.md) \| `null`\>

***

### getProgramId()

> **getProgramId**(): `PublicKey`

Defined in: [src/generated/protocol\_types.ts:699](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L699)

#### Returns

`PublicKey`
