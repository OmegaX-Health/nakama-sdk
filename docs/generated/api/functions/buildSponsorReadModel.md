[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / buildSponsorReadModel

# Function: buildSponsorReadModel()

> **buildSponsorReadModel**(`params`): [`SponsorReadModel`](../type-aliases/SponsorReadModel.md)

Defined in: [src/protocol\_models.ts:600](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/protocol_models.ts#L600)

## Parameters

### params

#### claimCases

[`ClaimCaseSnapshot`](../type-aliases/ClaimCaseSnapshot.md)[]

#### fundingLines

[`FundingLineSnapshot`](../type-aliases/FundingLineSnapshot.md)[]

#### healthPlan

[`HealthPlanSnapshot`](../type-aliases/HealthPlanSnapshot.md)

#### obligations

[`ObligationSnapshot`](../type-aliases/ObligationSnapshot.md)[]

#### outcomesBySeries?

`Record`\<`string`, [`BigNumberish`](../type-aliases/BigNumberish.md)\>

#### planLedger?

[`PartialReserveBalanceSheet`](../type-aliases/PartialReserveBalanceSheet.md)

#### policySeries

[`PolicySeriesSnapshot`](../type-aliases/PolicySeriesSnapshot.md)[]

## Returns

[`SponsorReadModel`](../type-aliases/SponsorReadModel.md)
