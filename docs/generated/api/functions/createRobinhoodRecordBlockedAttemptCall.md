[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / createRobinhoodRecordBlockedAttemptCall

# Function: createRobinhoodRecordBlockedAttemptCall()

> **createRobinhoodRecordBlockedAttemptCall**(`params`): [`RobinhoodRecordBlockedAttemptCall`](../interfaces/RobinhoodRecordBlockedAttemptCall.md)

Defined in: [src/robinhood/protocol.ts:1840](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L1840)

Encodes the registry call a reviewed adapter makes after a failed attempt.
The returned call is deliberately not a PreparedRobinhoodAction: an EOA or
generic smart account cannot impersonate the adapter required by msg.sender.

## Parameters

### params

#### adapter

`string`

#### assetAmount

`bigint`

#### authorizationId

`` `0x${string}` ``

#### bundle

[`RobinhoodProtocolArtifactBundle`](../interfaces/RobinhoodProtocolArtifactBundle.md)

#### manifest

[`RobinhoodDeploymentManifest`](../interfaces/RobinhoodDeploymentManifest.md)

#### nativeValue

`bigint`

#### principal

`string`

#### programId

`` `0x${string}` ``

#### runtime

[`VerifiedRobinhoodDeploymentRuntime`](../interfaces/VerifiedRobinhoodDeploymentRuntime.md)

#### selector

`` `0x${string}` ``

## Returns

[`RobinhoodRecordBlockedAttemptCall`](../interfaces/RobinhoodRecordBlockedAttemptCall.md)
