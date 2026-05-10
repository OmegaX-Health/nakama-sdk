[**@omegax/protocol-sdk**](../README.md)

***

[@omegax/protocol-sdk](../README.md) / ProtocolClient

# Interface: ProtocolClient

Defined in: [src/generated/protocol\_types.ts:1900](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L1900)

## Properties

### connection

> `readonly` **connection**: `Connection`

Defined in: [src/generated/protocol\_types.ts:1901](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L1901)

***

### programId

> `readonly` **programId**: `PublicKey`

Defined in: [src/generated/protocol\_types.ts:1902](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L1902)

## Methods

### buildAcceptProtocolGovernanceAuthorityInstruction()

> **buildAcceptProtocolGovernanceAuthorityInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:1928](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L1928)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<`Record`\<`string`, `unknown`\>, [`AcceptProtocolGovernanceAuthorityAccounts`](AcceptProtocolGovernanceAuthorityAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildAcceptProtocolGovernanceAuthorityTx()

> **buildAcceptProtocolGovernanceAuthorityTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:1934](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L1934)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<`Record`\<`string`, `unknown`\>, [`AcceptProtocolGovernanceAuthorityAccounts`](AcceptProtocolGovernanceAuthorityAccounts.md)\>

#### Returns

`Transaction`

***

### buildAdjudicateClaimCaseInstruction()

> **buildAdjudicateClaimCaseInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:1940](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L1940)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`AdjudicateClaimCaseArgs`](AdjudicateClaimCaseArgs.md), [`AdjudicateClaimCaseAccounts`](AdjudicateClaimCaseAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildAdjudicateClaimCaseTx()

> **buildAdjudicateClaimCaseTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:1946](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L1946)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`AdjudicateClaimCaseArgs`](AdjudicateClaimCaseArgs.md), [`AdjudicateClaimCaseAccounts`](AdjudicateClaimCaseAccounts.md)\>

#### Returns

`Transaction`

***

### buildAllocateCapitalInstruction()

> **buildAllocateCapitalInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:1952](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L1952)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`AllocateCapitalArgs`](AllocateCapitalArgs.md), [`AllocateCapitalAccounts`](AllocateCapitalAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildAllocateCapitalTx()

> **buildAllocateCapitalTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:1958](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L1958)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`AllocateCapitalArgs`](AllocateCapitalArgs.md), [`AllocateCapitalAccounts`](AllocateCapitalAccounts.md)\>

#### Returns

`Transaction`

***

### buildAttachClaimEvidenceRefInstruction()

> **buildAttachClaimEvidenceRefInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:1964](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L1964)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`AttachClaimEvidenceRefArgs`](AttachClaimEvidenceRefArgs.md), [`AttachClaimEvidenceRefAccounts`](AttachClaimEvidenceRefAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildAttachClaimEvidenceRefTx()

> **buildAttachClaimEvidenceRefTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:1970](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L1970)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`AttachClaimEvidenceRefArgs`](AttachClaimEvidenceRefArgs.md), [`AttachClaimEvidenceRefAccounts`](AttachClaimEvidenceRefAccounts.md)\>

#### Returns

`Transaction`

***

### buildAttestClaimCaseInstruction()

> **buildAttestClaimCaseInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:1976](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L1976)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`AttestClaimCaseArgs`](AttestClaimCaseArgs.md), [`AttestClaimCaseAccounts`](AttestClaimCaseAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildAttestClaimCaseTx()

> **buildAttestClaimCaseTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:1982](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L1982)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`AttestClaimCaseArgs`](AttestClaimCaseArgs.md), [`AttestClaimCaseAccounts`](AttestClaimCaseAccounts.md)\>

#### Returns

`Transaction`

***

### buildAuthorizeClaimRecipientInstruction()

> **buildAuthorizeClaimRecipientInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:1988](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L1988)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`AuthorizeClaimRecipientArgs`](AuthorizeClaimRecipientArgs.md), [`AuthorizeClaimRecipientAccounts`](AuthorizeClaimRecipientAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildAuthorizeClaimRecipientTx()

> **buildAuthorizeClaimRecipientTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:1994](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L1994)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`AuthorizeClaimRecipientArgs`](AuthorizeClaimRecipientArgs.md), [`AuthorizeClaimRecipientAccounts`](AuthorizeClaimRecipientAccounts.md)\>

#### Returns

`Transaction`

***

### buildBackfillSchemaDependencyLedgerInstruction()

> **buildBackfillSchemaDependencyLedgerInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2000](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2000)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`BackfillSchemaDependencyLedgerArgs`](BackfillSchemaDependencyLedgerArgs.md), [`BackfillSchemaDependencyLedgerAccounts`](BackfillSchemaDependencyLedgerAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildBackfillSchemaDependencyLedgerTx()

> **buildBackfillSchemaDependencyLedgerTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2006](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2006)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`BackfillSchemaDependencyLedgerArgs`](BackfillSchemaDependencyLedgerArgs.md), [`BackfillSchemaDependencyLedgerAccounts`](BackfillSchemaDependencyLedgerAccounts.md)\>

#### Returns

`Transaction`

***

### buildCancelProtocolGovernanceAuthorityTransferInstruction()

> **buildCancelProtocolGovernanceAuthorityTransferInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2012](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2012)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<`Record`\<`string`, `unknown`\>, [`CancelProtocolGovernanceAuthorityTransferAccounts`](CancelProtocolGovernanceAuthorityTransferAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildCancelProtocolGovernanceAuthorityTransferTx()

> **buildCancelProtocolGovernanceAuthorityTransferTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2018](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2018)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<`Record`\<`string`, `unknown`\>, [`CancelProtocolGovernanceAuthorityTransferAccounts`](CancelProtocolGovernanceAuthorityTransferAccounts.md)\>

#### Returns

`Transaction`

***

### buildClaimOracleInstruction()

> **buildClaimOracleInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2024](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2024)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<`Record`\<`string`, `unknown`\>, [`ClaimOracleAccounts`](ClaimOracleAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildClaimOracleTx()

> **buildClaimOracleTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2030](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2030)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<`Record`\<`string`, `unknown`\>, [`ClaimOracleAccounts`](ClaimOracleAccounts.md)\>

#### Returns

`Transaction`

***

### buildCloseOutcomeSchemaInstruction()

> **buildCloseOutcomeSchemaInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2036](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2036)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<`Record`\<`string`, `unknown`\>, [`CloseOutcomeSchemaAccounts`](CloseOutcomeSchemaAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildCloseOutcomeSchemaTx()

> **buildCloseOutcomeSchemaTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2042](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2042)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<`Record`\<`string`, `unknown`\>, [`CloseOutcomeSchemaAccounts`](CloseOutcomeSchemaAccounts.md)\>

#### Returns

`Transaction`

***

### buildConfigureReserveAssetRailInstruction()

> **buildConfigureReserveAssetRailInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2048](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2048)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`ConfigureReserveAssetRailArgs`](ConfigureReserveAssetRailArgs.md), [`ConfigureReserveAssetRailAccounts`](ConfigureReserveAssetRailAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildConfigureReserveAssetRailTx()

> **buildConfigureReserveAssetRailTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2054](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2054)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`ConfigureReserveAssetRailArgs`](ConfigureReserveAssetRailArgs.md), [`ConfigureReserveAssetRailAccounts`](ConfigureReserveAssetRailAccounts.md)\>

#### Returns

`Transaction`

***

### buildCreateAllocationPositionInstruction()

> **buildCreateAllocationPositionInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2060](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2060)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`CreateAllocationPositionArgs`](CreateAllocationPositionArgs.md), [`CreateAllocationPositionAccounts`](CreateAllocationPositionAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildCreateAllocationPositionTx()

> **buildCreateAllocationPositionTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2066](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2066)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`CreateAllocationPositionArgs`](CreateAllocationPositionArgs.md), [`CreateAllocationPositionAccounts`](CreateAllocationPositionAccounts.md)\>

#### Returns

`Transaction`

***

### buildCreateCapitalClassInstruction()

> **buildCreateCapitalClassInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2072](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2072)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`CreateCapitalClassArgs`](CreateCapitalClassArgs.md), [`CreateCapitalClassAccounts`](CreateCapitalClassAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildCreateCapitalClassTx()

> **buildCreateCapitalClassTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2078](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2078)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`CreateCapitalClassArgs`](CreateCapitalClassArgs.md), [`CreateCapitalClassAccounts`](CreateCapitalClassAccounts.md)\>

#### Returns

`Transaction`

***

### buildCreateDomainAssetVaultInstruction()

> **buildCreateDomainAssetVaultInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2084](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2084)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`CreateDomainAssetVaultArgs`](CreateDomainAssetVaultArgs.md), [`CreateDomainAssetVaultAccounts`](CreateDomainAssetVaultAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildCreateDomainAssetVaultTx()

> **buildCreateDomainAssetVaultTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2090](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2090)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`CreateDomainAssetVaultArgs`](CreateDomainAssetVaultArgs.md), [`CreateDomainAssetVaultAccounts`](CreateDomainAssetVaultAccounts.md)\>

#### Returns

`Transaction`

***

### buildCreateHealthPlanInstruction()

> **buildCreateHealthPlanInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2096](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2096)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`CreateHealthPlanArgs`](CreateHealthPlanArgs.md), [`CreateHealthPlanAccounts`](CreateHealthPlanAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildCreateHealthPlanTx()

> **buildCreateHealthPlanTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2102](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2102)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`CreateHealthPlanArgs`](CreateHealthPlanArgs.md), [`CreateHealthPlanAccounts`](CreateHealthPlanAccounts.md)\>

#### Returns

`Transaction`

***

### buildCreateLiquidityPoolInstruction()

> **buildCreateLiquidityPoolInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2108](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2108)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`CreateLiquidityPoolArgs`](CreateLiquidityPoolArgs.md), [`CreateLiquidityPoolAccounts`](CreateLiquidityPoolAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildCreateLiquidityPoolTx()

> **buildCreateLiquidityPoolTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2114](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2114)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`CreateLiquidityPoolArgs`](CreateLiquidityPoolArgs.md), [`CreateLiquidityPoolAccounts`](CreateLiquidityPoolAccounts.md)\>

#### Returns

`Transaction`

***

### buildCreateObligationInstruction()

> **buildCreateObligationInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2120](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2120)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`CreateObligationArgs`](CreateObligationArgs.md), [`CreateObligationAccounts`](CreateObligationAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildCreateObligationTx()

> **buildCreateObligationTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2126](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2126)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`CreateObligationArgs`](CreateObligationArgs.md), [`CreateObligationAccounts`](CreateObligationAccounts.md)\>

#### Returns

`Transaction`

***

### buildCreatePolicySeriesInstruction()

> **buildCreatePolicySeriesInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2132](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2132)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`CreatePolicySeriesArgs`](CreatePolicySeriesArgs.md), [`CreatePolicySeriesAccounts`](CreatePolicySeriesAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildCreatePolicySeriesTx()

> **buildCreatePolicySeriesTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2138](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2138)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`CreatePolicySeriesArgs`](CreatePolicySeriesArgs.md), [`CreatePolicySeriesAccounts`](CreatePolicySeriesAccounts.md)\>

#### Returns

`Transaction`

***

### buildCreateReserveDomainInstruction()

> **buildCreateReserveDomainInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2144](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2144)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`CreateReserveDomainArgs`](CreateReserveDomainArgs.md), [`CreateReserveDomainAccounts`](CreateReserveDomainAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildCreateReserveDomainTx()

> **buildCreateReserveDomainTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2150](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2150)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`CreateReserveDomainArgs`](CreateReserveDomainArgs.md), [`CreateReserveDomainAccounts`](CreateReserveDomainAccounts.md)\>

#### Returns

`Transaction`

***

### buildDeallocateCapitalInstruction()

> **buildDeallocateCapitalInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2156](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2156)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`DeallocateCapitalArgs`](DeallocateCapitalArgs.md), [`DeallocateCapitalAccounts`](DeallocateCapitalAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildDeallocateCapitalTx()

> **buildDeallocateCapitalTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2162](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2162)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`DeallocateCapitalArgs`](DeallocateCapitalArgs.md), [`DeallocateCapitalAccounts`](DeallocateCapitalAccounts.md)\>

#### Returns

`Transaction`

***

### buildDepositIntoCapitalClassInstruction()

> **buildDepositIntoCapitalClassInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2168](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2168)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`DepositIntoCapitalClassArgs`](DepositIntoCapitalClassArgs.md), [`DepositIntoCapitalClassAccounts`](DepositIntoCapitalClassAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildDepositIntoCapitalClassTx()

> **buildDepositIntoCapitalClassTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2174](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2174)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`DepositIntoCapitalClassArgs`](DepositIntoCapitalClassArgs.md), [`DepositIntoCapitalClassAccounts`](DepositIntoCapitalClassAccounts.md)\>

#### Returns

`Transaction`

***

### buildFundSponsorBudgetInstruction()

> **buildFundSponsorBudgetInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2180](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2180)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`FundSponsorBudgetArgs`](FundSponsorBudgetArgs.md), [`FundSponsorBudgetAccounts`](FundSponsorBudgetAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildFundSponsorBudgetTx()

> **buildFundSponsorBudgetTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2186](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2186)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`FundSponsorBudgetArgs`](FundSponsorBudgetArgs.md), [`FundSponsorBudgetAccounts`](FundSponsorBudgetAccounts.md)\>

#### Returns

`Transaction`

***

### buildInitializeProtocolGovernanceInstruction()

> **buildInitializeProtocolGovernanceInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2228](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2228)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`InitializeProtocolGovernanceArgs`](InitializeProtocolGovernanceArgs.md), [`InitializeProtocolGovernanceAccounts`](InitializeProtocolGovernanceAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildInitializeProtocolGovernanceTx()

> **buildInitializeProtocolGovernanceTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2234](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2234)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`InitializeProtocolGovernanceArgs`](InitializeProtocolGovernanceArgs.md), [`InitializeProtocolGovernanceAccounts`](InitializeProtocolGovernanceAccounts.md)\>

#### Returns

`Transaction`

***

### buildInitializeSeriesReserveLedgerInstruction()

> **buildInitializeSeriesReserveLedgerInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2240](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2240)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`InitializeSeriesReserveLedgerArgs`](InitializeSeriesReserveLedgerArgs.md), [`InitializeSeriesReserveLedgerAccounts`](InitializeSeriesReserveLedgerAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildInitializeSeriesReserveLedgerTx()

> **buildInitializeSeriesReserveLedgerTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2246](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2246)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`InitializeSeriesReserveLedgerArgs`](InitializeSeriesReserveLedgerArgs.md), [`InitializeSeriesReserveLedgerAccounts`](InitializeSeriesReserveLedgerAccounts.md)\>

#### Returns

`Transaction`

***

### buildInitPoolOracleFeeVaultInstruction()

> **buildInitPoolOracleFeeVaultInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2192](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2192)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`InitPoolOracleFeeVaultArgs`](InitPoolOracleFeeVaultArgs.md), [`InitPoolOracleFeeVaultAccounts`](InitPoolOracleFeeVaultAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildInitPoolOracleFeeVaultTx()

> **buildInitPoolOracleFeeVaultTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2198](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2198)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`InitPoolOracleFeeVaultArgs`](InitPoolOracleFeeVaultArgs.md), [`InitPoolOracleFeeVaultAccounts`](InitPoolOracleFeeVaultAccounts.md)\>

#### Returns

`Transaction`

***

### buildInitPoolTreasuryVaultInstruction()

> **buildInitPoolTreasuryVaultInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2204](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2204)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`InitPoolTreasuryVaultArgs`](InitPoolTreasuryVaultArgs.md), [`InitPoolTreasuryVaultAccounts`](InitPoolTreasuryVaultAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildInitPoolTreasuryVaultTx()

> **buildInitPoolTreasuryVaultTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2210](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2210)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`InitPoolTreasuryVaultArgs`](InitPoolTreasuryVaultArgs.md), [`InitPoolTreasuryVaultAccounts`](InitPoolTreasuryVaultAccounts.md)\>

#### Returns

`Transaction`

***

### buildInitProtocolFeeVaultInstruction()

> **buildInitProtocolFeeVaultInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2216](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2216)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`InitProtocolFeeVaultArgs`](InitProtocolFeeVaultArgs.md), [`InitProtocolFeeVaultAccounts`](InitProtocolFeeVaultAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildInitProtocolFeeVaultTx()

> **buildInitProtocolFeeVaultTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2222](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2222)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`InitProtocolFeeVaultArgs`](InitProtocolFeeVaultArgs.md), [`InitProtocolFeeVaultAccounts`](InitProtocolFeeVaultAccounts.md)\>

#### Returns

`Transaction`

***

### buildInstruction()

> **buildInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:1904](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L1904)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<`Record`\<`string`, `unknown`\>, [`GenericInstructionAccounts`](../type-aliases/GenericInstructionAccounts.md)\> & `object`

#### Returns

`TransactionInstruction`

***

### buildMarkImpairmentInstruction()

> **buildMarkImpairmentInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2252](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2252)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`MarkImpairmentArgs`](MarkImpairmentArgs.md), [`MarkImpairmentAccounts`](MarkImpairmentAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildMarkImpairmentTx()

> **buildMarkImpairmentTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2255](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2255)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`MarkImpairmentArgs`](MarkImpairmentArgs.md), [`MarkImpairmentAccounts`](MarkImpairmentAccounts.md)\>

#### Returns

`Transaction`

***

### buildOpenClaimCaseInstruction()

> **buildOpenClaimCaseInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2258](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2258)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`OpenClaimCaseArgs`](OpenClaimCaseArgs.md), [`OpenClaimCaseAccounts`](OpenClaimCaseAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildOpenClaimCaseTx()

> **buildOpenClaimCaseTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2261](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2261)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`OpenClaimCaseArgs`](OpenClaimCaseArgs.md), [`OpenClaimCaseAccounts`](OpenClaimCaseAccounts.md)\>

#### Returns

`Transaction`

***

### buildOpenFundingLineInstruction()

> **buildOpenFundingLineInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2264](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2264)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`OpenFundingLineArgs`](OpenFundingLineArgs.md), [`OpenFundingLineAccounts`](OpenFundingLineAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildOpenFundingLineTx()

> **buildOpenFundingLineTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2270](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2270)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`OpenFundingLineArgs`](OpenFundingLineArgs.md), [`OpenFundingLineAccounts`](OpenFundingLineAccounts.md)\>

#### Returns

`Transaction`

***

### buildOpenMemberPositionInstruction()

> **buildOpenMemberPositionInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2276](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2276)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`OpenMemberPositionArgs`](OpenMemberPositionArgs.md), [`OpenMemberPositionAccounts`](OpenMemberPositionAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildOpenMemberPositionTx()

> **buildOpenMemberPositionTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2282](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2282)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`OpenMemberPositionArgs`](OpenMemberPositionArgs.md), [`OpenMemberPositionAccounts`](OpenMemberPositionAccounts.md)\>

#### Returns

`Transaction`

***

### buildProcessRedemptionQueueInstruction()

> **buildProcessRedemptionQueueInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2288](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2288)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`ProcessRedemptionQueueArgs`](ProcessRedemptionQueueArgs.md), [`ProcessRedemptionQueueAccounts`](ProcessRedemptionQueueAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildProcessRedemptionQueueTx()

> **buildProcessRedemptionQueueTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2294](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2294)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`ProcessRedemptionQueueArgs`](ProcessRedemptionQueueArgs.md), [`ProcessRedemptionQueueAccounts`](ProcessRedemptionQueueAccounts.md)\>

#### Returns

`Transaction`

***

### buildPublishReserveAssetRailPriceInstruction()

> **buildPublishReserveAssetRailPriceInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2300](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2300)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`PublishReserveAssetRailPriceArgs`](PublishReserveAssetRailPriceArgs.md), [`PublishReserveAssetRailPriceAccounts`](PublishReserveAssetRailPriceAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildPublishReserveAssetRailPriceTx()

> **buildPublishReserveAssetRailPriceTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2306](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2306)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`PublishReserveAssetRailPriceArgs`](PublishReserveAssetRailPriceArgs.md), [`PublishReserveAssetRailPriceAccounts`](PublishReserveAssetRailPriceAccounts.md)\>

#### Returns

`Transaction`

***

### buildRecordPremiumPaymentInstruction()

> **buildRecordPremiumPaymentInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2312](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2312)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`RecordPremiumPaymentArgs`](RecordPremiumPaymentArgs.md), [`RecordPremiumPaymentAccounts`](RecordPremiumPaymentAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildRecordPremiumPaymentTx()

> **buildRecordPremiumPaymentTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2318](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2318)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`RecordPremiumPaymentArgs`](RecordPremiumPaymentArgs.md), [`RecordPremiumPaymentAccounts`](RecordPremiumPaymentAccounts.md)\>

#### Returns

`Transaction`

***

### buildRegisterOracleInstruction()

> **buildRegisterOracleInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2324](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2324)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`RegisterOracleArgs`](RegisterOracleArgs.md), [`RegisterOracleAccounts`](RegisterOracleAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildRegisterOracleTx()

> **buildRegisterOracleTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2327](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2327)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`RegisterOracleArgs`](RegisterOracleArgs.md), [`RegisterOracleAccounts`](RegisterOracleAccounts.md)\>

#### Returns

`Transaction`

***

### buildRegisterOutcomeSchemaInstruction()

> **buildRegisterOutcomeSchemaInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2330](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2330)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`RegisterOutcomeSchemaArgs`](RegisterOutcomeSchemaArgs.md), [`RegisterOutcomeSchemaAccounts`](RegisterOutcomeSchemaAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildRegisterOutcomeSchemaTx()

> **buildRegisterOutcomeSchemaTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2336](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2336)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`RegisterOutcomeSchemaArgs`](RegisterOutcomeSchemaArgs.md), [`RegisterOutcomeSchemaAccounts`](RegisterOutcomeSchemaAccounts.md)\>

#### Returns

`Transaction`

***

### buildReleaseReserveInstruction()

> **buildReleaseReserveInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2342](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2342)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`ReleaseReserveArgs`](ReleaseReserveArgs.md), [`ReleaseReserveAccounts`](ReleaseReserveAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildReleaseReserveTx()

> **buildReleaseReserveTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2345](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2345)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`ReleaseReserveArgs`](ReleaseReserveArgs.md), [`ReleaseReserveAccounts`](ReleaseReserveAccounts.md)\>

#### Returns

`Transaction`

***

### buildRequestRedemptionInstruction()

> **buildRequestRedemptionInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2348](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2348)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`RequestRedemptionArgs`](RequestRedemptionArgs.md), [`RequestRedemptionAccounts`](RequestRedemptionAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildRequestRedemptionTx()

> **buildRequestRedemptionTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2354](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2354)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`RequestRedemptionArgs`](RequestRedemptionArgs.md), [`RequestRedemptionAccounts`](RequestRedemptionAccounts.md)\>

#### Returns

`Transaction`

***

### buildReserveObligationInstruction()

> **buildReserveObligationInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2360](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2360)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`ReserveObligationArgs`](ReserveObligationArgs.md), [`ReserveObligationAccounts`](ReserveObligationAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildReserveObligationTx()

> **buildReserveObligationTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2366](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2366)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`ReserveObligationArgs`](ReserveObligationArgs.md), [`ReserveObligationAccounts`](ReserveObligationAccounts.md)\>

#### Returns

`Transaction`

***

### buildRotateProtocolGovernanceAuthorityInstruction()

> **buildRotateProtocolGovernanceAuthorityInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2372](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2372)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`RotateProtocolGovernanceAuthorityArgs`](RotateProtocolGovernanceAuthorityArgs.md), [`RotateProtocolGovernanceAuthorityAccounts`](RotateProtocolGovernanceAuthorityAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildRotateProtocolGovernanceAuthorityTx()

> **buildRotateProtocolGovernanceAuthorityTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2378](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2378)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`RotateProtocolGovernanceAuthorityArgs`](RotateProtocolGovernanceAuthorityArgs.md), [`RotateProtocolGovernanceAuthorityAccounts`](RotateProtocolGovernanceAuthorityAccounts.md)\>

#### Returns

`Transaction`

***

### buildSetPoolOracleInstruction()

> **buildSetPoolOracleInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2384](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2384)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`SetPoolOracleArgs`](SetPoolOracleArgs.md), [`SetPoolOracleAccounts`](SetPoolOracleAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildSetPoolOraclePermissionsInstruction()

> **buildSetPoolOraclePermissionsInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2390](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2390)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`SetPoolOraclePermissionsArgs`](SetPoolOraclePermissionsArgs.md), [`SetPoolOraclePermissionsAccounts`](SetPoolOraclePermissionsAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildSetPoolOraclePermissionsTx()

> **buildSetPoolOraclePermissionsTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2396](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2396)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`SetPoolOraclePermissionsArgs`](SetPoolOraclePermissionsArgs.md), [`SetPoolOraclePermissionsAccounts`](SetPoolOraclePermissionsAccounts.md)\>

#### Returns

`Transaction`

***

### buildSetPoolOraclePolicyInstruction()

> **buildSetPoolOraclePolicyInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2402](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2402)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`SetPoolOraclePolicyArgs`](SetPoolOraclePolicyArgs.md), [`SetPoolOraclePolicyAccounts`](SetPoolOraclePolicyAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildSetPoolOraclePolicyTx()

> **buildSetPoolOraclePolicyTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2408](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2408)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`SetPoolOraclePolicyArgs`](SetPoolOraclePolicyArgs.md), [`SetPoolOraclePolicyAccounts`](SetPoolOraclePolicyAccounts.md)\>

#### Returns

`Transaction`

***

### buildSetPoolOracleTx()

> **buildSetPoolOracleTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2387](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2387)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`SetPoolOracleArgs`](SetPoolOracleArgs.md), [`SetPoolOracleAccounts`](SetPoolOracleAccounts.md)\>

#### Returns

`Transaction`

***

### buildSetProtocolEmergencyPauseInstruction()

> **buildSetProtocolEmergencyPauseInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2414](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2414)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`SetProtocolEmergencyPauseArgs`](SetProtocolEmergencyPauseArgs.md), [`SetProtocolEmergencyPauseAccounts`](SetProtocolEmergencyPauseAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildSetProtocolEmergencyPauseTx()

> **buildSetProtocolEmergencyPauseTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2420](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2420)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`SetProtocolEmergencyPauseArgs`](SetProtocolEmergencyPauseArgs.md), [`SetProtocolEmergencyPauseAccounts`](SetProtocolEmergencyPauseAccounts.md)\>

#### Returns

`Transaction`

***

### buildSettleClaimCaseInstruction()

> **buildSettleClaimCaseInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2426](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2426)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`SettleClaimCaseArgs`](SettleClaimCaseArgs.md), [`SettleClaimCaseAccounts`](SettleClaimCaseAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildSettleClaimCaseSelectedAssetInstruction()

> **buildSettleClaimCaseSelectedAssetInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2438](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2438)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`SettleClaimCaseSelectedAssetArgs`](SettleClaimCaseSelectedAssetArgs.md), [`SettleClaimCaseSelectedAssetAccounts`](SettleClaimCaseSelectedAssetAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildSettleClaimCaseSelectedAssetTx()

> **buildSettleClaimCaseSelectedAssetTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2444](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2444)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`SettleClaimCaseSelectedAssetArgs`](SettleClaimCaseSelectedAssetArgs.md), [`SettleClaimCaseSelectedAssetAccounts`](SettleClaimCaseSelectedAssetAccounts.md)\>

#### Returns

`Transaction`

***

### buildSettleClaimCaseTx()

> **buildSettleClaimCaseTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2432](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2432)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`SettleClaimCaseArgs`](SettleClaimCaseArgs.md), [`SettleClaimCaseAccounts`](SettleClaimCaseAccounts.md)\>

#### Returns

`Transaction`

***

### buildSettleObligationInstruction()

> **buildSettleObligationInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2450](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2450)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`SettleObligationArgs`](SettleObligationArgs.md), [`SettleObligationAccounts`](SettleObligationAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildSettleObligationTx()

> **buildSettleObligationTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2456](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2456)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`SettleObligationArgs`](SettleObligationArgs.md), [`SettleObligationAccounts`](SettleObligationAccounts.md)\>

#### Returns

`Transaction`

***

### buildTransaction()

> **buildTransaction**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:1912](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L1912)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<`Record`\<`string`, `unknown`\>, [`GenericInstructionAccounts`](../type-aliases/GenericInstructionAccounts.md)\> & `object`

#### Returns

`Transaction`

***

### buildUpdateAllocationCapsInstruction()

> **buildUpdateAllocationCapsInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2462](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2462)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`UpdateAllocationCapsArgs`](UpdateAllocationCapsArgs.md), [`UpdateAllocationCapsAccounts`](UpdateAllocationCapsAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildUpdateAllocationCapsTx()

> **buildUpdateAllocationCapsTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2468](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2468)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`UpdateAllocationCapsArgs`](UpdateAllocationCapsArgs.md), [`UpdateAllocationCapsAccounts`](UpdateAllocationCapsAccounts.md)\>

#### Returns

`Transaction`

***

### buildUpdateCapitalClassControlsInstruction()

> **buildUpdateCapitalClassControlsInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2474](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2474)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`UpdateCapitalClassControlsArgs`](UpdateCapitalClassControlsArgs.md), [`UpdateCapitalClassControlsAccounts`](UpdateCapitalClassControlsAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildUpdateCapitalClassControlsTx()

> **buildUpdateCapitalClassControlsTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2480](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2480)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`UpdateCapitalClassControlsArgs`](UpdateCapitalClassControlsArgs.md), [`UpdateCapitalClassControlsAccounts`](UpdateCapitalClassControlsAccounts.md)\>

#### Returns

`Transaction`

***

### buildUpdateHealthPlanControlsInstruction()

> **buildUpdateHealthPlanControlsInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2486](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2486)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`UpdateHealthPlanControlsArgs`](UpdateHealthPlanControlsArgs.md), [`UpdateHealthPlanControlsAccounts`](UpdateHealthPlanControlsAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildUpdateHealthPlanControlsTx()

> **buildUpdateHealthPlanControlsTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2492](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2492)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`UpdateHealthPlanControlsArgs`](UpdateHealthPlanControlsArgs.md), [`UpdateHealthPlanControlsAccounts`](UpdateHealthPlanControlsAccounts.md)\>

#### Returns

`Transaction`

***

### buildUpdateLpPositionCredentialingInstruction()

> **buildUpdateLpPositionCredentialingInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2498](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2498)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`UpdateLpPositionCredentialingArgs`](UpdateLpPositionCredentialingArgs.md), [`UpdateLpPositionCredentialingAccounts`](UpdateLpPositionCredentialingAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildUpdateLpPositionCredentialingTx()

> **buildUpdateLpPositionCredentialingTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2504](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2504)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`UpdateLpPositionCredentialingArgs`](UpdateLpPositionCredentialingArgs.md), [`UpdateLpPositionCredentialingAccounts`](UpdateLpPositionCredentialingAccounts.md)\>

#### Returns

`Transaction`

***

### buildUpdateMemberEligibilityInstruction()

> **buildUpdateMemberEligibilityInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2510](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2510)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`UpdateMemberEligibilityArgs`](UpdateMemberEligibilityArgs.md), [`UpdateMemberEligibilityAccounts`](UpdateMemberEligibilityAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildUpdateMemberEligibilityTx()

> **buildUpdateMemberEligibilityTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2516](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2516)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`UpdateMemberEligibilityArgs`](UpdateMemberEligibilityArgs.md), [`UpdateMemberEligibilityAccounts`](UpdateMemberEligibilityAccounts.md)\>

#### Returns

`Transaction`

***

### buildUpdateOracleProfileInstruction()

> **buildUpdateOracleProfileInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2522](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2522)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`UpdateOracleProfileArgs`](UpdateOracleProfileArgs.md), [`UpdateOracleProfileAccounts`](UpdateOracleProfileAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildUpdateOracleProfileTx()

> **buildUpdateOracleProfileTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2528](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2528)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`UpdateOracleProfileArgs`](UpdateOracleProfileArgs.md), [`UpdateOracleProfileAccounts`](UpdateOracleProfileAccounts.md)\>

#### Returns

`Transaction`

***

### buildUpdateReserveDomainControlsInstruction()

> **buildUpdateReserveDomainControlsInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2534](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2534)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`UpdateReserveDomainControlsArgs`](UpdateReserveDomainControlsArgs.md), [`UpdateReserveDomainControlsAccounts`](UpdateReserveDomainControlsAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildUpdateReserveDomainControlsTx()

> **buildUpdateReserveDomainControlsTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2540](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2540)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`UpdateReserveDomainControlsArgs`](UpdateReserveDomainControlsArgs.md), [`UpdateReserveDomainControlsAccounts`](UpdateReserveDomainControlsAccounts.md)\>

#### Returns

`Transaction`

***

### buildVerifyOutcomeSchemaInstruction()

> **buildVerifyOutcomeSchemaInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2546](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2546)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`VerifyOutcomeSchemaArgs`](VerifyOutcomeSchemaArgs.md), [`VerifyOutcomeSchemaAccounts`](VerifyOutcomeSchemaAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildVerifyOutcomeSchemaTx()

> **buildVerifyOutcomeSchemaTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2552](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2552)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`VerifyOutcomeSchemaArgs`](VerifyOutcomeSchemaArgs.md), [`VerifyOutcomeSchemaAccounts`](VerifyOutcomeSchemaAccounts.md)\>

#### Returns

`Transaction`

***

### buildVersionPolicySeriesInstruction()

> **buildVersionPolicySeriesInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2558](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2558)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`VersionPolicySeriesArgs`](VersionPolicySeriesArgs.md), [`VersionPolicySeriesAccounts`](VersionPolicySeriesAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildVersionPolicySeriesTx()

> **buildVersionPolicySeriesTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2564](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2564)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`VersionPolicySeriesArgs`](VersionPolicySeriesArgs.md), [`VersionPolicySeriesAccounts`](VersionPolicySeriesAccounts.md)\>

#### Returns

`Transaction`

***

### buildWithdrawPoolOracleFeeSolInstruction()

> **buildWithdrawPoolOracleFeeSolInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2570](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2570)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`WithdrawArgs`](WithdrawArgs.md), [`WithdrawPoolOracleFeeSolAccounts`](WithdrawPoolOracleFeeSolAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildWithdrawPoolOracleFeeSolTx()

> **buildWithdrawPoolOracleFeeSolTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2576](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2576)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`WithdrawArgs`](WithdrawArgs.md), [`WithdrawPoolOracleFeeSolAccounts`](WithdrawPoolOracleFeeSolAccounts.md)\>

#### Returns

`Transaction`

***

### buildWithdrawPoolOracleFeeSplInstruction()

> **buildWithdrawPoolOracleFeeSplInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2582](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2582)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`WithdrawArgs`](WithdrawArgs.md), [`WithdrawPoolOracleFeeSplAccounts`](WithdrawPoolOracleFeeSplAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildWithdrawPoolOracleFeeSplTx()

> **buildWithdrawPoolOracleFeeSplTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2588](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2588)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`WithdrawArgs`](WithdrawArgs.md), [`WithdrawPoolOracleFeeSplAccounts`](WithdrawPoolOracleFeeSplAccounts.md)\>

#### Returns

`Transaction`

***

### buildWithdrawPoolTreasurySolInstruction()

> **buildWithdrawPoolTreasurySolInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2594](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2594)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`WithdrawArgs`](WithdrawArgs.md), [`WithdrawPoolTreasurySolAccounts`](WithdrawPoolTreasurySolAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildWithdrawPoolTreasurySolTx()

> **buildWithdrawPoolTreasurySolTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2600](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2600)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`WithdrawArgs`](WithdrawArgs.md), [`WithdrawPoolTreasurySolAccounts`](WithdrawPoolTreasurySolAccounts.md)\>

#### Returns

`Transaction`

***

### buildWithdrawPoolTreasurySplInstruction()

> **buildWithdrawPoolTreasurySplInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2606](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2606)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`WithdrawArgs`](WithdrawArgs.md), [`WithdrawPoolTreasurySplAccounts`](WithdrawPoolTreasurySplAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildWithdrawPoolTreasurySplTx()

> **buildWithdrawPoolTreasurySplTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2612](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2612)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`WithdrawArgs`](WithdrawArgs.md), [`WithdrawPoolTreasurySplAccounts`](WithdrawPoolTreasurySplAccounts.md)\>

#### Returns

`Transaction`

***

### buildWithdrawProtocolFeeSolInstruction()

> **buildWithdrawProtocolFeeSolInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2618](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2618)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`WithdrawArgs`](WithdrawArgs.md), [`WithdrawProtocolFeeSolAccounts`](WithdrawProtocolFeeSolAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildWithdrawProtocolFeeSolTx()

> **buildWithdrawProtocolFeeSolTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2624](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2624)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`WithdrawArgs`](WithdrawArgs.md), [`WithdrawProtocolFeeSolAccounts`](WithdrawProtocolFeeSolAccounts.md)\>

#### Returns

`Transaction`

***

### buildWithdrawProtocolFeeSplInstruction()

> **buildWithdrawProtocolFeeSplInstruction**(`params`): `TransactionInstruction`

Defined in: [src/generated/protocol\_types.ts:2630](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2630)

#### Parameters

##### params

[`BuildInstructionParams`](BuildInstructionParams.md)\<[`WithdrawArgs`](WithdrawArgs.md), [`WithdrawProtocolFeeSplAccounts`](WithdrawProtocolFeeSplAccounts.md)\>

#### Returns

`TransactionInstruction`

***

### buildWithdrawProtocolFeeSplTx()

> **buildWithdrawProtocolFeeSplTx**(`params`): `Transaction`

Defined in: [src/generated/protocol\_types.ts:2636](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2636)

#### Parameters

##### params

[`BuildTransactionParams`](BuildTransactionParams.md)\<[`WithdrawArgs`](WithdrawArgs.md), [`WithdrawProtocolFeeSplAccounts`](WithdrawProtocolFeeSplAccounts.md)\>

#### Returns

`Transaction`

***

### decodeAccount()

> **decodeAccount**\<`T`\>(`accountName`, `data`): `T`

Defined in: [src/generated/protocol\_types.ts:1920](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L1920)

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

Defined in: [src/generated/protocol\_types.ts:1924](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L1924)

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

Defined in: [src/generated/protocol\_types.ts:2642](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2642)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`AllocationLedger`](AllocationLedger.md) \| `null`\>

***

### fetchAllocationPosition()

> **fetchAllocationPosition**(`address`): `Promise`\<[`AllocationPosition`](AllocationPosition.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2645](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2645)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`AllocationPosition`](AllocationPosition.md) \| `null`\>

***

### fetchCapitalClass()

> **fetchCapitalClass**(`address`): `Promise`\<[`CapitalClass`](CapitalClass.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2648](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2648)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`CapitalClass`](CapitalClass.md) \| `null`\>

***

### fetchClaimAttestation()

> **fetchClaimAttestation**(`address`): `Promise`\<[`ClaimAttestation`](ClaimAttestation.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2649](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2649)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`ClaimAttestation`](ClaimAttestation.md) \| `null`\>

***

### fetchClaimCase()

> **fetchClaimCase**(`address`): `Promise`\<[`ClaimCase`](ClaimCase.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2652](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2652)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`ClaimCase`](ClaimCase.md) \| `null`\>

***

### fetchDomainAssetLedger()

> **fetchDomainAssetLedger**(`address`): `Promise`\<[`DomainAssetLedger`](DomainAssetLedger.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2653](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2653)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`DomainAssetLedger`](DomainAssetLedger.md) \| `null`\>

***

### fetchDomainAssetVault()

> **fetchDomainAssetVault**(`address`): `Promise`\<[`DomainAssetVault`](DomainAssetVault.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2656](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2656)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`DomainAssetVault`](DomainAssetVault.md) \| `null`\>

***

### fetchFundingLine()

> **fetchFundingLine**(`address`): `Promise`\<[`FundingLine`](FundingLine.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2659](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2659)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`FundingLine`](FundingLine.md) \| `null`\>

***

### fetchFundingLineLedger()

> **fetchFundingLineLedger**(`address`): `Promise`\<[`FundingLineLedger`](FundingLineLedger.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2660](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2660)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`FundingLineLedger`](FundingLineLedger.md) \| `null`\>

***

### fetchHealthPlan()

> **fetchHealthPlan**(`address`): `Promise`\<[`HealthPlan`](HealthPlan.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2663](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2663)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`HealthPlan`](HealthPlan.md) \| `null`\>

***

### fetchLiquidityPool()

> **fetchLiquidityPool**(`address`): `Promise`\<[`LiquidityPool`](LiquidityPool.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2665](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2665)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`LiquidityPool`](LiquidityPool.md) \| `null`\>

***

### fetchLPPosition()

> **fetchLPPosition**(`address`): `Promise`\<[`LPPosition`](LPPosition.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2664](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2664)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`LPPosition`](LPPosition.md) \| `null`\>

***

### fetchMemberPosition()

> **fetchMemberPosition**(`address`): `Promise`\<[`MemberPosition`](MemberPosition.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2666](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2666)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`MemberPosition`](MemberPosition.md) \| `null`\>

***

### fetchMembershipAnchorSeat()

> **fetchMembershipAnchorSeat**(`address`): `Promise`\<[`MembershipAnchorSeat`](MembershipAnchorSeat.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2667](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2667)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`MembershipAnchorSeat`](MembershipAnchorSeat.md) \| `null`\>

***

### fetchObligation()

> **fetchObligation**(`address`): `Promise`\<[`Obligation`](Obligation.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2670](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2670)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`Obligation`](Obligation.md) \| `null`\>

***

### fetchOracleProfile()

> **fetchOracleProfile**(`address`): `Promise`\<[`OracleProfile`](OracleProfile.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2671](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2671)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`OracleProfile`](OracleProfile.md) \| `null`\>

***

### fetchOutcomeSchema()

> **fetchOutcomeSchema**(`address`): `Promise`\<[`OutcomeSchema`](OutcomeSchema.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2672](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2672)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`OutcomeSchema`](OutcomeSchema.md) \| `null`\>

***

### fetchPlanReserveLedger()

> **fetchPlanReserveLedger**(`address`): `Promise`\<[`PlanReserveLedger`](PlanReserveLedger.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2673](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2673)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`PlanReserveLedger`](PlanReserveLedger.md) \| `null`\>

***

### fetchPolicySeries()

> **fetchPolicySeries**(`address`): `Promise`\<[`PolicySeries`](PolicySeries.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2676](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2676)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`PolicySeries`](PolicySeries.md) \| `null`\>

***

### fetchPoolClassLedger()

> **fetchPoolClassLedger**(`address`): `Promise`\<[`PoolClassLedger`](PoolClassLedger.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2677](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2677)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`PoolClassLedger`](PoolClassLedger.md) \| `null`\>

***

### fetchPoolOracleApproval()

> **fetchPoolOracleApproval**(`address`): `Promise`\<[`PoolOracleApproval`](PoolOracleApproval.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2678](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2678)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`PoolOracleApproval`](PoolOracleApproval.md) \| `null`\>

***

### fetchPoolOracleFeeVault()

> **fetchPoolOracleFeeVault**(`address`): `Promise`\<[`PoolOracleFeeVault`](PoolOracleFeeVault.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2681](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2681)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`PoolOracleFeeVault`](PoolOracleFeeVault.md) \| `null`\>

***

### fetchPoolOraclePermissionSet()

> **fetchPoolOraclePermissionSet**(`address`): `Promise`\<[`PoolOraclePermissionSet`](PoolOraclePermissionSet.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2684](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2684)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`PoolOraclePermissionSet`](PoolOraclePermissionSet.md) \| `null`\>

***

### fetchPoolOraclePolicy()

> **fetchPoolOraclePolicy**(`address`): `Promise`\<[`PoolOraclePolicy`](PoolOraclePolicy.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2687](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2687)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`PoolOraclePolicy`](PoolOraclePolicy.md) \| `null`\>

***

### fetchPoolTreasuryVault()

> **fetchPoolTreasuryVault**(`address`): `Promise`\<[`PoolTreasuryVault`](PoolTreasuryVault.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2690](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2690)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`PoolTreasuryVault`](PoolTreasuryVault.md) \| `null`\>

***

### fetchProtocolFeeVault()

> **fetchProtocolFeeVault**(`address`): `Promise`\<[`ProtocolFeeVault`](ProtocolFeeVault.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2693](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2693)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`ProtocolFeeVault`](ProtocolFeeVault.md) \| `null`\>

***

### fetchProtocolGovernance()

> **fetchProtocolGovernance**(`address?`): `Promise`\<[`ProtocolGovernance`](ProtocolGovernance.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2696](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2696)

#### Parameters

##### address?

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`ProtocolGovernance`](ProtocolGovernance.md) \| `null`\>

***

### fetchReserveAssetRail()

> **fetchReserveAssetRail**(`address`): `Promise`\<[`ReserveAssetRail`](ReserveAssetRail.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2699](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2699)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`ReserveAssetRail`](ReserveAssetRail.md) \| `null`\>

***

### fetchReserveDomain()

> **fetchReserveDomain**(`address`): `Promise`\<[`ReserveDomain`](ReserveDomain.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2702](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2702)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`ReserveDomain`](ReserveDomain.md) \| `null`\>

***

### fetchSchemaDependencyLedger()

> **fetchSchemaDependencyLedger**(`address`): `Promise`\<[`SchemaDependencyLedger`](SchemaDependencyLedger.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2703](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2703)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`SchemaDependencyLedger`](SchemaDependencyLedger.md) \| `null`\>

***

### fetchSeriesReserveLedger()

> **fetchSeriesReserveLedger**(`address`): `Promise`\<[`SeriesReserveLedger`](SeriesReserveLedger.md) \| `null`\>

Defined in: [src/generated/protocol\_types.ts:2706](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L2706)

#### Parameters

##### address

[`PublicKeyish`](../type-aliases/PublicKeyish.md)

#### Returns

`Promise`\<[`SeriesReserveLedger`](SeriesReserveLedger.md) \| `null`\>

***

### getProgramId()

> **getProgramId**(): `PublicKey`

Defined in: [src/generated/protocol\_types.ts:1903](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/generated/protocol_types.ts#L1903)

#### Returns

`PublicKey`
