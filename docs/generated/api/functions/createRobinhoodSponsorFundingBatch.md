[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / createRobinhoodSponsorFundingBatch

# Function: createRobinhoodSponsorFundingBatch()

> **createRobinhoodSponsorFundingBatch**(`params`): [`RobinhoodSponsorFundingBatch`](../interfaces/RobinhoodSponsorFundingBatch.md)

Defined in: [src/robinhood/wallet.ts:1398](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L1398)

Creates a non-submitting exact approval+funding batch plan. A selected smart
account provider may encode it later, but the SDK exposes no generic batch
execution escape hatch.

## Parameters

### params

#### approval

[`PreparedRobinhoodAction`](../interfaces/PreparedRobinhoodAction.md)

#### bundle

[`RobinhoodProtocolArtifactBundle`](../interfaces/RobinhoodProtocolArtifactBundle.md)

#### funding

[`PreparedRobinhoodAction`](../interfaces/PreparedRobinhoodAction.md)

#### manifest

[`RobinhoodDeploymentManifest`](../interfaces/RobinhoodDeploymentManifest.md)

#### now?

`number` \| `bigint` \| `Date`

#### runtime

[`VerifiedRobinhoodDeploymentRuntime`](../interfaces/VerifiedRobinhoodDeploymentRuntime.md)

## Returns

[`RobinhoodSponsorFundingBatch`](../interfaces/RobinhoodSponsorFundingBatch.md)
