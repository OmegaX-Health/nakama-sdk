[**@omegax/protocol-sdk**](../README.md)

***

[@omegax/protocol-sdk](../README.md) / ProtocolClient

# Interface: ProtocolClient

Defined in: [src/generated/protocol\_types.ts:2098](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2098)

## Properties

### connection

> `readonly` **connection**: `Connection`

Defined in: [src/generated/protocol\_types.ts:2099](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2099)

***

### programId

> `readonly` **programId**: `PublicKey`

Defined in: [src/generated/protocol\_types.ts:2100](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2100)

## Methods

### buildActivateDirectPremiumCommitmentInstruction()

> **buildActivateDirectPremiumCommitmentInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2126](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2126)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`ActivateCommitmentArgs`](ActivateCommitmentArgs.md), [`ActivateDirectPremiumCommitmentAccounts`](ActivateDirectPremiumCommitmentAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildActivateDirectPremiumCommitmentTx()

> **buildActivateDirectPremiumCommitmentTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2132](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2132)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`ActivateCommitmentArgs`](ActivateCommitmentArgs.md), [`ActivateDirectPremiumCommitmentAccounts`](ActivateDirectPremiumCommitmentAccounts.md)\>

#### Returns

`Transaction`

***

### buildActivateTreasuryCreditCommitmentInstruction()

> **buildActivateTreasuryCreditCommitmentInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2138](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2138)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`ActivateCommitmentArgs`](ActivateCommitmentArgs.md), [`ActivateTreasuryCreditCommitmentAccounts`](ActivateTreasuryCreditCommitmentAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildActivateTreasuryCreditCommitmentTx()

> **buildActivateTreasuryCreditCommitmentTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2144](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2144)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`ActivateCommitmentArgs`](ActivateCommitmentArgs.md), [`ActivateTreasuryCreditCommitmentAccounts`](ActivateTreasuryCreditCommitmentAccounts.md)\>

#### Returns

`Transaction`

***

### buildActivateWaterfallCommitmentInstruction()

> **buildActivateWaterfallCommitmentInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2150](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2150)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`ActivateCommitmentArgs`](ActivateCommitmentArgs.md), [`ActivateWaterfallCommitmentAccounts`](ActivateWaterfallCommitmentAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildActivateWaterfallCommitmentTx()

> **buildActivateWaterfallCommitmentTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2156](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2156)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`ActivateCommitmentArgs`](ActivateCommitmentArgs.md), [`ActivateWaterfallCommitmentAccounts`](ActivateWaterfallCommitmentAccounts.md)\>

#### Returns

`Transaction`

***

### buildAdjudicateClaimCaseInstruction()

> **buildAdjudicateClaimCaseInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2162](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2162)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`AdjudicateClaimCaseArgs`](AdjudicateClaimCaseArgs.md), [`AdjudicateClaimCaseAccounts`](AdjudicateClaimCaseAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildAdjudicateClaimCaseTx()

> **buildAdjudicateClaimCaseTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2168](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2168)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`AdjudicateClaimCaseArgs`](AdjudicateClaimCaseArgs.md), [`AdjudicateClaimCaseAccounts`](AdjudicateClaimCaseAccounts.md)\>

#### Returns

`Transaction`

***

### buildAllocateCapitalInstruction()

> **buildAllocateCapitalInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2174](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2174)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`AllocateCapitalArgs`](AllocateCapitalArgs.md), [`AllocateCapitalAccounts`](AllocateCapitalAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildAllocateCapitalTx()

> **buildAllocateCapitalTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2180](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2180)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`AllocateCapitalArgs`](AllocateCapitalArgs.md), [`AllocateCapitalAccounts`](AllocateCapitalAccounts.md)\>

#### Returns

`Transaction`

***

### buildAttachClaimEvidenceRefInstruction()

> **buildAttachClaimEvidenceRefInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2186](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2186)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`AttachClaimEvidenceRefArgs`](AttachClaimEvidenceRefArgs.md), [`AttachClaimEvidenceRefAccounts`](AttachClaimEvidenceRefAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildAttachClaimEvidenceRefTx()

> **buildAttachClaimEvidenceRefTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2192](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2192)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`AttachClaimEvidenceRefArgs`](AttachClaimEvidenceRefArgs.md), [`AttachClaimEvidenceRefAccounts`](AttachClaimEvidenceRefAccounts.md)\>

#### Returns

`Transaction`

***

### buildAttestClaimCaseInstruction()

> **buildAttestClaimCaseInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2198](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2198)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`AttestClaimCaseArgs`](AttestClaimCaseArgs.md), [`AttestClaimCaseAccounts`](AttestClaimCaseAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildAttestClaimCaseTx()

> **buildAttestClaimCaseTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2204](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2204)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`AttestClaimCaseArgs`](AttestClaimCaseArgs.md), [`AttestClaimCaseAccounts`](AttestClaimCaseAccounts.md)\>

#### Returns

`Transaction`

***

### buildAuthorizeClaimRecipientInstruction()

> **buildAuthorizeClaimRecipientInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2210](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2210)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`AuthorizeClaimRecipientArgs`](AuthorizeClaimRecipientArgs.md), [`AuthorizeClaimRecipientAccounts`](AuthorizeClaimRecipientAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildAuthorizeClaimRecipientTx()

> **buildAuthorizeClaimRecipientTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2216](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2216)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`AuthorizeClaimRecipientArgs`](AuthorizeClaimRecipientArgs.md), [`AuthorizeClaimRecipientAccounts`](AuthorizeClaimRecipientAccounts.md)\>

#### Returns

`Transaction`

***

### buildBackfillSchemaDependencyLedgerInstruction()

> **buildBackfillSchemaDependencyLedgerInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2222](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2222)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`BackfillSchemaDependencyLedgerArgs`](BackfillSchemaDependencyLedgerArgs.md), [`BackfillSchemaDependencyLedgerAccounts`](BackfillSchemaDependencyLedgerAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildBackfillSchemaDependencyLedgerTx()

> **buildBackfillSchemaDependencyLedgerTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2228](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2228)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`BackfillSchemaDependencyLedgerArgs`](BackfillSchemaDependencyLedgerArgs.md), [`BackfillSchemaDependencyLedgerAccounts`](BackfillSchemaDependencyLedgerAccounts.md)\>

#### Returns

`Transaction`

***

### buildClaimOracleInstruction()

> **buildClaimOracleInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2234](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2234)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<`Record`\<`string`, `unknown`\>, [`ClaimOracleAccounts`](ClaimOracleAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildClaimOracleTx()

> **buildClaimOracleTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2240](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2240)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<`Record`\<`string`, `unknown`\>, [`ClaimOracleAccounts`](ClaimOracleAccounts.md)\>

#### Returns

`Transaction`

***

### buildCloseOutcomeSchemaInstruction()

> **buildCloseOutcomeSchemaInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2246](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2246)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<`Record`\<`string`, `unknown`\>, [`CloseOutcomeSchemaAccounts`](CloseOutcomeSchemaAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildCloseOutcomeSchemaTx()

> **buildCloseOutcomeSchemaTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2252](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2252)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<`Record`\<`string`, `unknown`\>, [`CloseOutcomeSchemaAccounts`](CloseOutcomeSchemaAccounts.md)\>

#### Returns

`Transaction`

***

### buildConfigureReserveAssetRailInstruction()

> **buildConfigureReserveAssetRailInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2258](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2258)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`ConfigureReserveAssetRailArgs`](ConfigureReserveAssetRailArgs.md), [`ConfigureReserveAssetRailAccounts`](ConfigureReserveAssetRailAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildConfigureReserveAssetRailTx()

> **buildConfigureReserveAssetRailTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2264](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2264)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`ConfigureReserveAssetRailArgs`](ConfigureReserveAssetRailArgs.md), [`ConfigureReserveAssetRailAccounts`](ConfigureReserveAssetRailAccounts.md)\>

#### Returns

`Transaction`

***

### buildCreateAllocationPositionInstruction()

> **buildCreateAllocationPositionInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2270](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2270)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`CreateAllocationPositionArgs`](CreateAllocationPositionArgs.md), [`CreateAllocationPositionAccounts`](CreateAllocationPositionAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildCreateAllocationPositionTx()

> **buildCreateAllocationPositionTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2276](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2276)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`CreateAllocationPositionArgs`](CreateAllocationPositionArgs.md), [`CreateAllocationPositionAccounts`](CreateAllocationPositionAccounts.md)\>

#### Returns

`Transaction`

***

### buildCreateCapitalClassInstruction()

> **buildCreateCapitalClassInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2282](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2282)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`CreateCapitalClassArgs`](CreateCapitalClassArgs.md), [`CreateCapitalClassAccounts`](CreateCapitalClassAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildCreateCapitalClassTx()

> **buildCreateCapitalClassTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2288](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2288)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`CreateCapitalClassArgs`](CreateCapitalClassArgs.md), [`CreateCapitalClassAccounts`](CreateCapitalClassAccounts.md)\>

#### Returns

`Transaction`

***

### buildCreateCommitmentCampaignInstruction()

> **buildCreateCommitmentCampaignInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2294](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2294)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`CreateCommitmentCampaignArgs`](CreateCommitmentCampaignArgs.md), [`CreateCommitmentCampaignAccounts`](CreateCommitmentCampaignAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildCreateCommitmentCampaignTx()

> **buildCreateCommitmentCampaignTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2300](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2300)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`CreateCommitmentCampaignArgs`](CreateCommitmentCampaignArgs.md), [`CreateCommitmentCampaignAccounts`](CreateCommitmentCampaignAccounts.md)\>

#### Returns

`Transaction`

***

### buildCreateCommitmentPaymentRailInstruction()

> **buildCreateCommitmentPaymentRailInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2306](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2306)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`CreateCommitmentPaymentRailArgs`](CreateCommitmentPaymentRailArgs.md), [`CreateCommitmentPaymentRailAccounts`](CreateCommitmentPaymentRailAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildCreateCommitmentPaymentRailTx()

> **buildCreateCommitmentPaymentRailTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2312](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2312)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`CreateCommitmentPaymentRailArgs`](CreateCommitmentPaymentRailArgs.md), [`CreateCommitmentPaymentRailAccounts`](CreateCommitmentPaymentRailAccounts.md)\>

#### Returns

`Transaction`

***

### buildCreateDomainAssetVaultInstruction()

> **buildCreateDomainAssetVaultInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2318](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2318)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`CreateDomainAssetVaultArgs`](CreateDomainAssetVaultArgs.md), [`CreateDomainAssetVaultAccounts`](CreateDomainAssetVaultAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildCreateDomainAssetVaultTx()

> **buildCreateDomainAssetVaultTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2324](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2324)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`CreateDomainAssetVaultArgs`](CreateDomainAssetVaultArgs.md), [`CreateDomainAssetVaultAccounts`](CreateDomainAssetVaultAccounts.md)\>

#### Returns

`Transaction`

***

### buildCreateHealthPlanInstruction()

> **buildCreateHealthPlanInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2330](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2330)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`CreateHealthPlanArgs`](CreateHealthPlanArgs.md), [`CreateHealthPlanAccounts`](CreateHealthPlanAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildCreateHealthPlanTx()

> **buildCreateHealthPlanTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2336](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2336)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`CreateHealthPlanArgs`](CreateHealthPlanArgs.md), [`CreateHealthPlanAccounts`](CreateHealthPlanAccounts.md)\>

#### Returns

`Transaction`

***

### buildCreateLiquidityPoolInstruction()

> **buildCreateLiquidityPoolInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2342](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2342)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`CreateLiquidityPoolArgs`](CreateLiquidityPoolArgs.md), [`CreateLiquidityPoolAccounts`](CreateLiquidityPoolAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildCreateLiquidityPoolTx()

> **buildCreateLiquidityPoolTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2348](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2348)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`CreateLiquidityPoolArgs`](CreateLiquidityPoolArgs.md), [`CreateLiquidityPoolAccounts`](CreateLiquidityPoolAccounts.md)\>

#### Returns

`Transaction`

***

### buildCreateObligationInstruction()

> **buildCreateObligationInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2354](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2354)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`CreateObligationArgs`](CreateObligationArgs.md), [`CreateObligationAccounts`](CreateObligationAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildCreateObligationTx()

> **buildCreateObligationTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2360](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2360)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`CreateObligationArgs`](CreateObligationArgs.md), [`CreateObligationAccounts`](CreateObligationAccounts.md)\>

#### Returns

`Transaction`

***

### buildCreatePolicySeriesInstruction()

> **buildCreatePolicySeriesInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2366](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2366)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`CreatePolicySeriesArgs`](CreatePolicySeriesArgs.md), [`CreatePolicySeriesAccounts`](CreatePolicySeriesAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildCreatePolicySeriesTx()

> **buildCreatePolicySeriesTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2372](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2372)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`CreatePolicySeriesArgs`](CreatePolicySeriesArgs.md), [`CreatePolicySeriesAccounts`](CreatePolicySeriesAccounts.md)\>

#### Returns

`Transaction`

***

### buildCreateReserveDomainInstruction()

> **buildCreateReserveDomainInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2378](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2378)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`CreateReserveDomainArgs`](CreateReserveDomainArgs.md), [`CreateReserveDomainAccounts`](CreateReserveDomainAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildCreateReserveDomainTx()

> **buildCreateReserveDomainTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2384](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2384)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`CreateReserveDomainArgs`](CreateReserveDomainArgs.md), [`CreateReserveDomainAccounts`](CreateReserveDomainAccounts.md)\>

#### Returns

`Transaction`

***

### buildDeallocateCapitalInstruction()

> **buildDeallocateCapitalInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2390](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2390)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`DeallocateCapitalArgs`](DeallocateCapitalArgs.md), [`DeallocateCapitalAccounts`](DeallocateCapitalAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildDeallocateCapitalTx()

> **buildDeallocateCapitalTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2396](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2396)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`DeallocateCapitalArgs`](DeallocateCapitalArgs.md), [`DeallocateCapitalAccounts`](DeallocateCapitalAccounts.md)\>

#### Returns

`Transaction`

***

### buildDepositCommitmentInstruction()

> **buildDepositCommitmentInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2402](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2402)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`DepositCommitmentArgs`](DepositCommitmentArgs.md), [`DepositCommitmentAccounts`](DepositCommitmentAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildDepositCommitmentTx()

> **buildDepositCommitmentTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2408](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2408)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`DepositCommitmentArgs`](DepositCommitmentArgs.md), [`DepositCommitmentAccounts`](DepositCommitmentAccounts.md)\>

#### Returns

`Transaction`

***

### buildDepositIntoCapitalClassInstruction()

> **buildDepositIntoCapitalClassInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2414](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2414)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`DepositIntoCapitalClassArgs`](DepositIntoCapitalClassArgs.md), [`DepositIntoCapitalClassAccounts`](DepositIntoCapitalClassAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildDepositIntoCapitalClassTx()

> **buildDepositIntoCapitalClassTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2420](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2420)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`DepositIntoCapitalClassArgs`](DepositIntoCapitalClassArgs.md), [`DepositIntoCapitalClassAccounts`](DepositIntoCapitalClassAccounts.md)\>

#### Returns

`Transaction`

***

### buildFundSponsorBudgetInstruction()

> **buildFundSponsorBudgetInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2426](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2426)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`FundSponsorBudgetArgs`](FundSponsorBudgetArgs.md), [`FundSponsorBudgetAccounts`](FundSponsorBudgetAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildFundSponsorBudgetTx()

> **buildFundSponsorBudgetTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2432](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2432)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`FundSponsorBudgetArgs`](FundSponsorBudgetArgs.md), [`FundSponsorBudgetAccounts`](FundSponsorBudgetAccounts.md)\>

#### Returns

`Transaction`

***

### buildInitializeProtocolGovernanceInstruction()

> **buildInitializeProtocolGovernanceInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2474](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2474)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`InitializeProtocolGovernanceArgs`](InitializeProtocolGovernanceArgs.md), [`InitializeProtocolGovernanceAccounts`](InitializeProtocolGovernanceAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildInitializeProtocolGovernanceTx()

> **buildInitializeProtocolGovernanceTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2480](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2480)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`InitializeProtocolGovernanceArgs`](InitializeProtocolGovernanceArgs.md), [`InitializeProtocolGovernanceAccounts`](InitializeProtocolGovernanceAccounts.md)\>

#### Returns

`Transaction`

***

### buildInitializeSeriesReserveLedgerInstruction()

> **buildInitializeSeriesReserveLedgerInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2486](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2486)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`InitializeSeriesReserveLedgerArgs`](InitializeSeriesReserveLedgerArgs.md), [`InitializeSeriesReserveLedgerAccounts`](InitializeSeriesReserveLedgerAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildInitializeSeriesReserveLedgerTx()

> **buildInitializeSeriesReserveLedgerTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2492](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2492)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`InitializeSeriesReserveLedgerArgs`](InitializeSeriesReserveLedgerArgs.md), [`InitializeSeriesReserveLedgerAccounts`](InitializeSeriesReserveLedgerAccounts.md)\>

#### Returns

`Transaction`

***

### buildInitPoolOracleFeeVaultInstruction()

> **buildInitPoolOracleFeeVaultInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2438](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2438)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`InitPoolOracleFeeVaultArgs`](InitPoolOracleFeeVaultArgs.md), [`InitPoolOracleFeeVaultAccounts`](InitPoolOracleFeeVaultAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildInitPoolOracleFeeVaultTx()

> **buildInitPoolOracleFeeVaultTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2444](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2444)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`InitPoolOracleFeeVaultArgs`](InitPoolOracleFeeVaultArgs.md), [`InitPoolOracleFeeVaultAccounts`](InitPoolOracleFeeVaultAccounts.md)\>

#### Returns

`Transaction`

***

### buildInitPoolTreasuryVaultInstruction()

> **buildInitPoolTreasuryVaultInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2450](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2450)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`InitPoolTreasuryVaultArgs`](InitPoolTreasuryVaultArgs.md), [`InitPoolTreasuryVaultAccounts`](InitPoolTreasuryVaultAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildInitPoolTreasuryVaultTx()

> **buildInitPoolTreasuryVaultTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2456](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2456)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`InitPoolTreasuryVaultArgs`](InitPoolTreasuryVaultArgs.md), [`InitPoolTreasuryVaultAccounts`](InitPoolTreasuryVaultAccounts.md)\>

#### Returns

`Transaction`

***

### buildInitProtocolFeeVaultInstruction()

> **buildInitProtocolFeeVaultInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2462](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2462)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`InitProtocolFeeVaultArgs`](InitProtocolFeeVaultArgs.md), [`InitProtocolFeeVaultAccounts`](InitProtocolFeeVaultAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildInitProtocolFeeVaultTx()

> **buildInitProtocolFeeVaultTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2468](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2468)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`InitProtocolFeeVaultArgs`](InitProtocolFeeVaultArgs.md), [`InitProtocolFeeVaultAccounts`](InitProtocolFeeVaultAccounts.md)\>

#### Returns

`Transaction`

***

### buildInstruction()

> **buildInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2102](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2102)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<`Record`\<`string`, `unknown`\>, [`GenericInstructionAccounts`](../type-aliases/GenericInstructionAccounts.md)\> & `object`

#### Returns

`TransactionInstruction`

***

### buildMarkImpairmentInstruction()

> **buildMarkImpairmentInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2498](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2498)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`MarkImpairmentArgs`](MarkImpairmentArgs.md), [`MarkImpairmentAccounts`](MarkImpairmentAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildMarkImpairmentTx()

> **buildMarkImpairmentTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2501](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2501)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`MarkImpairmentArgs`](MarkImpairmentArgs.md), [`MarkImpairmentAccounts`](MarkImpairmentAccounts.md)\>

#### Returns

`Transaction`

***

### buildOpenClaimCaseInstruction()

> **buildOpenClaimCaseInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2504](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2504)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`OpenClaimCaseArgs`](OpenClaimCaseArgs.md), [`OpenClaimCaseAccounts`](OpenClaimCaseAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildOpenClaimCaseTx()

> **buildOpenClaimCaseTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2507](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2507)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`OpenClaimCaseArgs`](OpenClaimCaseArgs.md), [`OpenClaimCaseAccounts`](OpenClaimCaseAccounts.md)\>

#### Returns

`Transaction`

***

### buildOpenFundingLineInstruction()

> **buildOpenFundingLineInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2510](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2510)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`OpenFundingLineArgs`](OpenFundingLineArgs.md), [`OpenFundingLineAccounts`](OpenFundingLineAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildOpenFundingLineTx()

> **buildOpenFundingLineTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2516](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2516)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`OpenFundingLineArgs`](OpenFundingLineArgs.md), [`OpenFundingLineAccounts`](OpenFundingLineAccounts.md)\>

#### Returns

`Transaction`

***

### buildOpenMemberPositionInstruction()

> **buildOpenMemberPositionInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2522](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2522)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`OpenMemberPositionArgs`](OpenMemberPositionArgs.md), [`OpenMemberPositionAccounts`](OpenMemberPositionAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildOpenMemberPositionTx()

> **buildOpenMemberPositionTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2528](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2528)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`OpenMemberPositionArgs`](OpenMemberPositionArgs.md), [`OpenMemberPositionAccounts`](OpenMemberPositionAccounts.md)\>

#### Returns

`Transaction`

***

### buildPauseCommitmentCampaignInstruction()

> **buildPauseCommitmentCampaignInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2534](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2534)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`PauseCommitmentCampaignArgs`](PauseCommitmentCampaignArgs.md), [`PauseCommitmentCampaignAccounts`](PauseCommitmentCampaignAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildPauseCommitmentCampaignTx()

> **buildPauseCommitmentCampaignTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2540](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2540)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`PauseCommitmentCampaignArgs`](PauseCommitmentCampaignArgs.md), [`PauseCommitmentCampaignAccounts`](PauseCommitmentCampaignAccounts.md)\>

#### Returns

`Transaction`

***

### buildProcessRedemptionQueueInstruction()

> **buildProcessRedemptionQueueInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2546](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2546)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`ProcessRedemptionQueueArgs`](ProcessRedemptionQueueArgs.md), [`ProcessRedemptionQueueAccounts`](ProcessRedemptionQueueAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildProcessRedemptionQueueTx()

> **buildProcessRedemptionQueueTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2552](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2552)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`ProcessRedemptionQueueArgs`](ProcessRedemptionQueueArgs.md), [`ProcessRedemptionQueueAccounts`](ProcessRedemptionQueueAccounts.md)\>

#### Returns

`Transaction`

***

### buildPublishReserveAssetRailPriceInstruction()

> **buildPublishReserveAssetRailPriceInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2558](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2558)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`PublishReserveAssetRailPriceArgs`](PublishReserveAssetRailPriceArgs.md), [`PublishReserveAssetRailPriceAccounts`](PublishReserveAssetRailPriceAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildPublishReserveAssetRailPriceTx()

> **buildPublishReserveAssetRailPriceTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2564](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2564)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`PublishReserveAssetRailPriceArgs`](PublishReserveAssetRailPriceArgs.md), [`PublishReserveAssetRailPriceAccounts`](PublishReserveAssetRailPriceAccounts.md)\>

#### Returns

`Transaction`

***

### buildRecordPremiumPaymentInstruction()

> **buildRecordPremiumPaymentInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2570](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2570)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`RecordPremiumPaymentArgs`](RecordPremiumPaymentArgs.md), [`RecordPremiumPaymentAccounts`](RecordPremiumPaymentAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildRecordPremiumPaymentTx()

> **buildRecordPremiumPaymentTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2576](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2576)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`RecordPremiumPaymentArgs`](RecordPremiumPaymentArgs.md), [`RecordPremiumPaymentAccounts`](RecordPremiumPaymentAccounts.md)\>

#### Returns

`Transaction`

***

### buildRefundCommitmentInstruction()

> **buildRefundCommitmentInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2582](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2582)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`RefundCommitmentArgs`](RefundCommitmentArgs.md), [`RefundCommitmentAccounts`](RefundCommitmentAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildRefundCommitmentTx()

> **buildRefundCommitmentTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2588](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2588)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`RefundCommitmentArgs`](RefundCommitmentArgs.md), [`RefundCommitmentAccounts`](RefundCommitmentAccounts.md)\>

#### Returns

`Transaction`

***

### buildRegisterOracleInstruction()

> **buildRegisterOracleInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2594](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2594)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`RegisterOracleArgs`](RegisterOracleArgs.md), [`RegisterOracleAccounts`](RegisterOracleAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildRegisterOracleTx()

> **buildRegisterOracleTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2597](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2597)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`RegisterOracleArgs`](RegisterOracleArgs.md), [`RegisterOracleAccounts`](RegisterOracleAccounts.md)\>

#### Returns

`Transaction`

***

### buildRegisterOutcomeSchemaInstruction()

> **buildRegisterOutcomeSchemaInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2600](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2600)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`RegisterOutcomeSchemaArgs`](RegisterOutcomeSchemaArgs.md), [`RegisterOutcomeSchemaAccounts`](RegisterOutcomeSchemaAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildRegisterOutcomeSchemaTx()

> **buildRegisterOutcomeSchemaTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2606](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2606)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`RegisterOutcomeSchemaArgs`](RegisterOutcomeSchemaArgs.md), [`RegisterOutcomeSchemaAccounts`](RegisterOutcomeSchemaAccounts.md)\>

#### Returns

`Transaction`

***

### buildReleaseReserveInstruction()

> **buildReleaseReserveInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2612](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2612)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`ReleaseReserveArgs`](ReleaseReserveArgs.md), [`ReleaseReserveAccounts`](ReleaseReserveAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildReleaseReserveTx()

> **buildReleaseReserveTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2615](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2615)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`ReleaseReserveArgs`](ReleaseReserveArgs.md), [`ReleaseReserveAccounts`](ReleaseReserveAccounts.md)\>

#### Returns

`Transaction`

***

### buildRequestRedemptionInstruction()

> **buildRequestRedemptionInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2618](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2618)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`RequestRedemptionArgs`](RequestRedemptionArgs.md), [`RequestRedemptionAccounts`](RequestRedemptionAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildRequestRedemptionTx()

> **buildRequestRedemptionTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2624](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2624)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`RequestRedemptionArgs`](RequestRedemptionArgs.md), [`RequestRedemptionAccounts`](RequestRedemptionAccounts.md)\>

#### Returns

`Transaction`

***

### buildReserveObligationInstruction()

> **buildReserveObligationInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2630](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2630)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`ReserveObligationArgs`](ReserveObligationArgs.md), [`ReserveObligationAccounts`](ReserveObligationAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildReserveObligationTx()

> **buildReserveObligationTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2636](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2636)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`ReserveObligationArgs`](ReserveObligationArgs.md), [`ReserveObligationAccounts`](ReserveObligationAccounts.md)\>

#### Returns

`Transaction`

***

### buildRotateProtocolGovernanceAuthorityInstruction()

> **buildRotateProtocolGovernanceAuthorityInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2642](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2642)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`RotateProtocolGovernanceAuthorityArgs`](RotateProtocolGovernanceAuthorityArgs.md), [`RotateProtocolGovernanceAuthorityAccounts`](RotateProtocolGovernanceAuthorityAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildRotateProtocolGovernanceAuthorityTx()

> **buildRotateProtocolGovernanceAuthorityTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2648](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2648)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`RotateProtocolGovernanceAuthorityArgs`](RotateProtocolGovernanceAuthorityArgs.md), [`RotateProtocolGovernanceAuthorityAccounts`](RotateProtocolGovernanceAuthorityAccounts.md)\>

#### Returns

`Transaction`

***

### buildSetPoolOracleInstruction()

> **buildSetPoolOracleInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2654](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2654)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`SetPoolOracleArgs`](SetPoolOracleArgs.md), [`SetPoolOracleAccounts`](SetPoolOracleAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildSetPoolOraclePermissionsInstruction()

> **buildSetPoolOraclePermissionsInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2660](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2660)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`SetPoolOraclePermissionsArgs`](SetPoolOraclePermissionsArgs.md), [`SetPoolOraclePermissionsAccounts`](SetPoolOraclePermissionsAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildSetPoolOraclePermissionsTx()

> **buildSetPoolOraclePermissionsTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2666](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2666)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`SetPoolOraclePermissionsArgs`](SetPoolOraclePermissionsArgs.md), [`SetPoolOraclePermissionsAccounts`](SetPoolOraclePermissionsAccounts.md)\>

#### Returns

`Transaction`

***

### buildSetPoolOraclePolicyInstruction()

> **buildSetPoolOraclePolicyInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2672](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2672)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`SetPoolOraclePolicyArgs`](SetPoolOraclePolicyArgs.md), [`SetPoolOraclePolicyAccounts`](SetPoolOraclePolicyAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildSetPoolOraclePolicyTx()

> **buildSetPoolOraclePolicyTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2678](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2678)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`SetPoolOraclePolicyArgs`](SetPoolOraclePolicyArgs.md), [`SetPoolOraclePolicyAccounts`](SetPoolOraclePolicyAccounts.md)\>

#### Returns

`Transaction`

***

### buildSetPoolOracleTx()

> **buildSetPoolOracleTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2657](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2657)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`SetPoolOracleArgs`](SetPoolOracleArgs.md), [`SetPoolOracleAccounts`](SetPoolOracleAccounts.md)\>

#### Returns

`Transaction`

***

### buildSetProtocolEmergencyPauseInstruction()

> **buildSetProtocolEmergencyPauseInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2684](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2684)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`SetProtocolEmergencyPauseArgs`](SetProtocolEmergencyPauseArgs.md), [`SetProtocolEmergencyPauseAccounts`](SetProtocolEmergencyPauseAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildSetProtocolEmergencyPauseTx()

> **buildSetProtocolEmergencyPauseTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2690](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2690)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`SetProtocolEmergencyPauseArgs`](SetProtocolEmergencyPauseArgs.md), [`SetProtocolEmergencyPauseAccounts`](SetProtocolEmergencyPauseAccounts.md)\>

#### Returns

`Transaction`

***

### buildSettleClaimCaseInstruction()

> **buildSettleClaimCaseInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2696](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2696)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`SettleClaimCaseArgs`](SettleClaimCaseArgs.md), [`SettleClaimCaseAccounts`](SettleClaimCaseAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildSettleClaimCaseTx()

> **buildSettleClaimCaseTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2702](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2702)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`SettleClaimCaseArgs`](SettleClaimCaseArgs.md), [`SettleClaimCaseAccounts`](SettleClaimCaseAccounts.md)\>

#### Returns

`Transaction`

***

### buildSettleObligationInstruction()

> **buildSettleObligationInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2708](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2708)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`SettleObligationArgs`](SettleObligationArgs.md), [`SettleObligationAccounts`](SettleObligationAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildSettleObligationTx()

> **buildSettleObligationTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2714](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2714)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`SettleObligationArgs`](SettleObligationArgs.md), [`SettleObligationAccounts`](SettleObligationAccounts.md)\>

#### Returns

`Transaction`

***

### buildTransaction()

> **buildTransaction**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2110](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2110)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<`Record`\<`string`, `unknown`\>, [`GenericInstructionAccounts`](../type-aliases/GenericInstructionAccounts.md)\> & `object`

#### Returns

`Transaction`

***

### buildUpdateAllocationCapsInstruction()

> **buildUpdateAllocationCapsInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2720](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2720)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`UpdateAllocationCapsArgs`](UpdateAllocationCapsArgs.md), [`UpdateAllocationCapsAccounts`](UpdateAllocationCapsAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildUpdateAllocationCapsTx()

> **buildUpdateAllocationCapsTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2726](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2726)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`UpdateAllocationCapsArgs`](UpdateAllocationCapsArgs.md), [`UpdateAllocationCapsAccounts`](UpdateAllocationCapsAccounts.md)\>

#### Returns

`Transaction`

***

### buildUpdateCapitalClassControlsInstruction()

> **buildUpdateCapitalClassControlsInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2732](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2732)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`UpdateCapitalClassControlsArgs`](UpdateCapitalClassControlsArgs.md), [`UpdateCapitalClassControlsAccounts`](UpdateCapitalClassControlsAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildUpdateCapitalClassControlsTx()

> **buildUpdateCapitalClassControlsTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2738](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2738)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`UpdateCapitalClassControlsArgs`](UpdateCapitalClassControlsArgs.md), [`UpdateCapitalClassControlsAccounts`](UpdateCapitalClassControlsAccounts.md)\>

#### Returns

`Transaction`

***

### buildUpdateHealthPlanControlsInstruction()

> **buildUpdateHealthPlanControlsInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2744](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2744)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`UpdateHealthPlanControlsArgs`](UpdateHealthPlanControlsArgs.md), [`UpdateHealthPlanControlsAccounts`](UpdateHealthPlanControlsAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildUpdateHealthPlanControlsTx()

> **buildUpdateHealthPlanControlsTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2750](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2750)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`UpdateHealthPlanControlsArgs`](UpdateHealthPlanControlsArgs.md), [`UpdateHealthPlanControlsAccounts`](UpdateHealthPlanControlsAccounts.md)\>

#### Returns

`Transaction`

***

### buildUpdateLpPositionCredentialingInstruction()

> **buildUpdateLpPositionCredentialingInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2756](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2756)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`UpdateLpPositionCredentialingArgs`](UpdateLpPositionCredentialingArgs.md), [`UpdateLpPositionCredentialingAccounts`](UpdateLpPositionCredentialingAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildUpdateLpPositionCredentialingTx()

> **buildUpdateLpPositionCredentialingTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2762](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2762)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`UpdateLpPositionCredentialingArgs`](UpdateLpPositionCredentialingArgs.md), [`UpdateLpPositionCredentialingAccounts`](UpdateLpPositionCredentialingAccounts.md)\>

#### Returns

`Transaction`

***

### buildUpdateMemberEligibilityInstruction()

> **buildUpdateMemberEligibilityInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2768](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2768)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`UpdateMemberEligibilityArgs`](UpdateMemberEligibilityArgs.md), [`UpdateMemberEligibilityAccounts`](UpdateMemberEligibilityAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildUpdateMemberEligibilityTx()

> **buildUpdateMemberEligibilityTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2774](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2774)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`UpdateMemberEligibilityArgs`](UpdateMemberEligibilityArgs.md), [`UpdateMemberEligibilityAccounts`](UpdateMemberEligibilityAccounts.md)\>

#### Returns

`Transaction`

***

### buildUpdateOracleProfileInstruction()

> **buildUpdateOracleProfileInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2780](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2780)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`UpdateOracleProfileArgs`](UpdateOracleProfileArgs.md), [`UpdateOracleProfileAccounts`](UpdateOracleProfileAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildUpdateOracleProfileTx()

> **buildUpdateOracleProfileTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2786](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2786)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`UpdateOracleProfileArgs`](UpdateOracleProfileArgs.md), [`UpdateOracleProfileAccounts`](UpdateOracleProfileAccounts.md)\>

#### Returns

`Transaction`

***

### buildUpdateReserveDomainControlsInstruction()

> **buildUpdateReserveDomainControlsInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2792](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2792)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`UpdateReserveDomainControlsArgs`](UpdateReserveDomainControlsArgs.md), [`UpdateReserveDomainControlsAccounts`](UpdateReserveDomainControlsAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildUpdateReserveDomainControlsTx()

> **buildUpdateReserveDomainControlsTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2798](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2798)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`UpdateReserveDomainControlsArgs`](UpdateReserveDomainControlsArgs.md), [`UpdateReserveDomainControlsAccounts`](UpdateReserveDomainControlsAccounts.md)\>

#### Returns

`Transaction`

***

### buildVerifyOutcomeSchemaInstruction()

> **buildVerifyOutcomeSchemaInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2804](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2804)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`VerifyOutcomeSchemaArgs`](VerifyOutcomeSchemaArgs.md), [`VerifyOutcomeSchemaAccounts`](VerifyOutcomeSchemaAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildVerifyOutcomeSchemaTx()

> **buildVerifyOutcomeSchemaTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2810](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2810)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`VerifyOutcomeSchemaArgs`](VerifyOutcomeSchemaArgs.md), [`VerifyOutcomeSchemaAccounts`](VerifyOutcomeSchemaAccounts.md)\>

#### Returns

`Transaction`

***

### buildVersionPolicySeriesInstruction()

> **buildVersionPolicySeriesInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2816](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2816)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`VersionPolicySeriesArgs`](VersionPolicySeriesArgs.md), [`VersionPolicySeriesAccounts`](VersionPolicySeriesAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildVersionPolicySeriesTx()

> **buildVersionPolicySeriesTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2822](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2822)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`VersionPolicySeriesArgs`](VersionPolicySeriesArgs.md), [`VersionPolicySeriesAccounts`](VersionPolicySeriesAccounts.md)\>

#### Returns

`Transaction`

***

### buildWithdrawPoolOracleFeeSolInstruction()

> **buildWithdrawPoolOracleFeeSolInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2828](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2828)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`WithdrawArgs`](WithdrawArgs.md), [`WithdrawPoolOracleFeeSolAccounts`](WithdrawPoolOracleFeeSolAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildWithdrawPoolOracleFeeSolTx()

> **buildWithdrawPoolOracleFeeSolTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2834](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2834)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`WithdrawArgs`](WithdrawArgs.md), [`WithdrawPoolOracleFeeSolAccounts`](WithdrawPoolOracleFeeSolAccounts.md)\>

#### Returns

`Transaction`

***

### buildWithdrawPoolOracleFeeSplInstruction()

> **buildWithdrawPoolOracleFeeSplInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2840](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2840)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`WithdrawArgs`](WithdrawArgs.md), [`WithdrawPoolOracleFeeSplAccounts`](WithdrawPoolOracleFeeSplAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildWithdrawPoolOracleFeeSplTx()

> **buildWithdrawPoolOracleFeeSplTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2846](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2846)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`WithdrawArgs`](WithdrawArgs.md), [`WithdrawPoolOracleFeeSplAccounts`](WithdrawPoolOracleFeeSplAccounts.md)\>

#### Returns

`Transaction`

***

### buildWithdrawPoolTreasurySolInstruction()

> **buildWithdrawPoolTreasurySolInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2852](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2852)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`WithdrawArgs`](WithdrawArgs.md), [`WithdrawPoolTreasurySolAccounts`](WithdrawPoolTreasurySolAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildWithdrawPoolTreasurySolTx()

> **buildWithdrawPoolTreasurySolTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2858](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2858)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`WithdrawArgs`](WithdrawArgs.md), [`WithdrawPoolTreasurySolAccounts`](WithdrawPoolTreasurySolAccounts.md)\>

#### Returns

`Transaction`

***

### buildWithdrawPoolTreasurySplInstruction()

> **buildWithdrawPoolTreasurySplInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2864](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2864)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`WithdrawArgs`](WithdrawArgs.md), [`WithdrawPoolTreasurySplAccounts`](WithdrawPoolTreasurySplAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildWithdrawPoolTreasurySplTx()

> **buildWithdrawPoolTreasurySplTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2870](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2870)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`WithdrawArgs`](WithdrawArgs.md), [`WithdrawPoolTreasurySplAccounts`](WithdrawPoolTreasurySplAccounts.md)\>

#### Returns

`Transaction`

***

### buildWithdrawProtocolFeeSolInstruction()

> **buildWithdrawProtocolFeeSolInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2876](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2876)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`WithdrawArgs`](WithdrawArgs.md), [`WithdrawProtocolFeeSolAccounts`](WithdrawProtocolFeeSolAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildWithdrawProtocolFeeSolTx()

> **buildWithdrawProtocolFeeSolTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2882](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2882)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`WithdrawArgs`](WithdrawArgs.md), [`WithdrawProtocolFeeSolAccounts`](WithdrawProtocolFeeSolAccounts.md)\>

#### Returns

`Transaction`

***

### buildWithdrawProtocolFeeSplInstruction()

> **buildWithdrawProtocolFeeSplInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2888](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2888)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`WithdrawArgs`](WithdrawArgs.md), [`WithdrawProtocolFeeSplAccounts`](WithdrawProtocolFeeSplAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildWithdrawProtocolFeeSplTx()

> **buildWithdrawProtocolFeeSplTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2894](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2894)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`WithdrawArgs`](WithdrawArgs.md), [`WithdrawProtocolFeeSplAccounts`](WithdrawProtocolFeeSplAccounts.md)\>

#### Returns

`Transaction`

***

### decodeAccount()

> **decodeAccount**\<`T`\>(`accountName`, `data`): `T`

Defined in: [src/generated/protocol\_types.ts:2118](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2118)

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

Defined in: [src/generated/protocol\_types.ts:2122](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2122)

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

### fetchAllocationLedger()

> **fetchAllocationLedger**(`address`): `Promise`\<[`AllocationLedger`](AllocationLedger.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2900](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2900)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`AllocationLedger`](AllocationLedger.md) \| `null`\>

***

### fetchAllocationPosition()

> **fetchAllocationPosition**(`address`): `Promise`\<[`AllocationPosition`](AllocationPosition.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2903](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2903)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`AllocationPosition`](AllocationPosition.md) \| `null`\>

***

### fetchCapitalClass()

> **fetchCapitalClass**(`address`): `Promise`\<[`CapitalClass`](CapitalClass.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2906](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2906)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`CapitalClass`](CapitalClass.md) \| `null`\>

***

### fetchClaimAttestation()

> **fetchClaimAttestation**(`address`): `Promise`\<[`ClaimAttestation`](ClaimAttestation.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2907](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2907)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`ClaimAttestation`](ClaimAttestation.md) \| `null`\>

***

### fetchClaimCase()

> **fetchClaimCase**(`address`): `Promise`\<[`ClaimCase`](ClaimCase.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2910](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2910)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`ClaimCase`](ClaimCase.md) \| `null`\>

***

### fetchCommitmentCampaign()

> **fetchCommitmentCampaign**(`address`): `Promise`\<[`CommitmentCampaign`](CommitmentCampaign.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2911](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2911)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`CommitmentCampaign`](CommitmentCampaign.md) \| `null`\>

***

### fetchCommitmentLedger()

> **fetchCommitmentLedger**(`address`): `Promise`\<[`CommitmentLedger`](CommitmentLedger.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2914](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2914)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`CommitmentLedger`](CommitmentLedger.md) \| `null`\>

***

### fetchCommitmentPaymentRail()

> **fetchCommitmentPaymentRail**(`address`): `Promise`\<[`CommitmentPaymentRail`](CommitmentPaymentRail.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2917](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2917)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`CommitmentPaymentRail`](CommitmentPaymentRail.md) \| `null`\>

***

### fetchCommitmentPosition()

> **fetchCommitmentPosition**(`address`): `Promise`\<[`CommitmentPosition`](CommitmentPosition.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2920](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2920)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`CommitmentPosition`](CommitmentPosition.md) \| `null`\>

***

### fetchDomainAssetLedger()

> **fetchDomainAssetLedger**(`address`): `Promise`\<[`DomainAssetLedger`](DomainAssetLedger.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2923](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2923)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`DomainAssetLedger`](DomainAssetLedger.md) \| `null`\>

***

### fetchDomainAssetVault()

> **fetchDomainAssetVault**(`address`): `Promise`\<[`DomainAssetVault`](DomainAssetVault.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2926](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2926)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`DomainAssetVault`](DomainAssetVault.md) \| `null`\>

***

### fetchFundingLine()

> **fetchFundingLine**(`address`): `Promise`\<[`FundingLine`](FundingLine.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2929](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2929)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`FundingLine`](FundingLine.md) \| `null`\>

***

### fetchFundingLineLedger()

> **fetchFundingLineLedger**(`address`): `Promise`\<[`FundingLineLedger`](FundingLineLedger.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2930](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2930)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`FundingLineLedger`](FundingLineLedger.md) \| `null`\>

***

### fetchHealthPlan()

> **fetchHealthPlan**(`address`): `Promise`\<[`HealthPlan`](HealthPlan.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2933](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2933)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`HealthPlan`](HealthPlan.md) \| `null`\>

***

### fetchLiquidityPool()

> **fetchLiquidityPool**(`address`): `Promise`\<[`LiquidityPool`](LiquidityPool.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2935](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2935)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`LiquidityPool`](LiquidityPool.md) \| `null`\>

***

### fetchLPPosition()

> **fetchLPPosition**(`address`): `Promise`\<[`LPPosition`](LPPosition.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2934](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2934)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`LPPosition`](LPPosition.md) \| `null`\>

***

### fetchMemberPosition()

> **fetchMemberPosition**(`address`): `Promise`\<[`MemberPosition`](MemberPosition.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2936](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2936)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`MemberPosition`](MemberPosition.md) \| `null`\>

***

### fetchMembershipAnchorSeat()

> **fetchMembershipAnchorSeat**(`address`): `Promise`\<[`MembershipAnchorSeat`](MembershipAnchorSeat.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2937](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2937)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`MembershipAnchorSeat`](MembershipAnchorSeat.md) \| `null`\>

***

### fetchObligation()

> **fetchObligation**(`address`): `Promise`\<[`Obligation`](Obligation.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2940](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2940)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`Obligation`](Obligation.md) \| `null`\>

***

### fetchOracleProfile()

> **fetchOracleProfile**(`address`): `Promise`\<[`OracleProfile`](OracleProfile.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2941](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2941)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`OracleProfile`](OracleProfile.md) \| `null`\>

***

### fetchOutcomeSchema()

> **fetchOutcomeSchema**(`address`): `Promise`\<[`OutcomeSchema`](OutcomeSchema.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2942](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2942)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`OutcomeSchema`](OutcomeSchema.md) \| `null`\>

***

### fetchPlanReserveLedger()

> **fetchPlanReserveLedger**(`address`): `Promise`\<[`PlanReserveLedger`](PlanReserveLedger.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2943](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2943)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`PlanReserveLedger`](PlanReserveLedger.md) \| `null`\>

***

### fetchPolicySeries()

> **fetchPolicySeries**(`address`): `Promise`\<[`PolicySeries`](PolicySeries.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2946](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2946)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`PolicySeries`](PolicySeries.md) \| `null`\>

***

### fetchPoolClassLedger()

> **fetchPoolClassLedger**(`address`): `Promise`\<[`PoolClassLedger`](PoolClassLedger.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2947](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2947)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`PoolClassLedger`](PoolClassLedger.md) \| `null`\>

***

### fetchPoolOracleApproval()

> **fetchPoolOracleApproval**(`address`): `Promise`\<[`PoolOracleApproval`](PoolOracleApproval.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2948](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2948)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`PoolOracleApproval`](PoolOracleApproval.md) \| `null`\>

***

### fetchPoolOracleFeeVault()

> **fetchPoolOracleFeeVault**(`address`): `Promise`\<[`PoolOracleFeeVault`](PoolOracleFeeVault.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2951](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2951)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`PoolOracleFeeVault`](PoolOracleFeeVault.md) \| `null`\>

***

### fetchPoolOraclePermissionSet()

> **fetchPoolOraclePermissionSet**(`address`): `Promise`\<[`PoolOraclePermissionSet`](PoolOraclePermissionSet.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2954](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2954)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`PoolOraclePermissionSet`](PoolOraclePermissionSet.md) \| `null`\>

***

### fetchPoolOraclePolicy()

> **fetchPoolOraclePolicy**(`address`): `Promise`\<[`PoolOraclePolicy`](PoolOraclePolicy.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2957](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2957)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`PoolOraclePolicy`](PoolOraclePolicy.md) \| `null`\>

***

### fetchPoolTreasuryVault()

> **fetchPoolTreasuryVault**(`address`): `Promise`\<[`PoolTreasuryVault`](PoolTreasuryVault.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2960](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2960)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`PoolTreasuryVault`](PoolTreasuryVault.md) \| `null`\>

***

### fetchProtocolFeeVault()

> **fetchProtocolFeeVault**(`address`): `Promise`\<[`ProtocolFeeVault`](ProtocolFeeVault.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2963](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2963)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`ProtocolFeeVault`](ProtocolFeeVault.md) \| `null`\>

***

### fetchProtocolGovernance()

> **fetchProtocolGovernance**(`address?`): `Promise`\<[`ProtocolGovernance`](ProtocolGovernance.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2966](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2966)

#### Parameters

##### address?

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`ProtocolGovernance`](ProtocolGovernance.md) \| `null`\>

***

### fetchReserveAssetRail()

> **fetchReserveAssetRail**(`address`): `Promise`\<[`ReserveAssetRail`](ReserveAssetRail.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2969](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2969)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`ReserveAssetRail`](ReserveAssetRail.md) \| `null`\>

***

### fetchReserveDomain()

> **fetchReserveDomain**(`address`): `Promise`\<[`ReserveDomain`](ReserveDomain.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2972](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2972)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`ReserveDomain`](ReserveDomain.md) \| `null`\>

***

### fetchSchemaDependencyLedger()

> **fetchSchemaDependencyLedger**(`address`): `Promise`\<[`SchemaDependencyLedger`](SchemaDependencyLedger.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2973](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2973)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`SchemaDependencyLedger`](SchemaDependencyLedger.md) \| `null`\>

***

### fetchSeriesReserveLedger()

> **fetchSeriesReserveLedger**(`address`): `Promise`\<[`SeriesReserveLedger`](SeriesReserveLedger.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2976](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2976)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`SeriesReserveLedger`](SeriesReserveLedger.md) \| `null`\>

***

### getProgramId()

> **getProgramId**(): `PublicKey`

Defined in: [src/generated/protocol\_types.ts:2101](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2101)

#### Returns

`PublicKey`
