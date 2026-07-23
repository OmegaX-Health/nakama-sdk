[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / RobinhoodActionBuilder

# Interface: RobinhoodActionBuilder

Defined in: [src/robinhood/protocol.ts:308](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L308)

## Properties

### network

> `readonly` **network**: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md)

Defined in: [src/robinhood/protocol.ts:309](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L309)

***

### programId

> `readonly` **programId**: `` `0x${string}` ``

Defined in: [src/robinhood/protocol.ts:310](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L310)

## Methods

### activateMembership()

> **activateMembership**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:352](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L352)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### activateProgram()

> **activateProgram**(`context`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:326](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L326)

#### Parameters

##### context

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md)

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### approveActivationAsOperator()

> **approveActivationAsOperator**(`context`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:320](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L320)

#### Parameters

##### context

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md)

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### approveActivationAsSponsor()

> **approveActivationAsSponsor**(`context`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:317](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L317)

#### Parameters

##### context

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md)

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### approveCancellationAsOperator()

> **approveCancellationAsOperator**(`context`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:334](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L334)

#### Parameters

##### context

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md)

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### approveCancellationAsSponsor()

> **approveCancellationAsSponsor**(`context`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:331](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L331)

#### Parameters

##### context

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md)

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### approveExactUsdg()

> **approveExactUsdg**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:340](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L340)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### approveUnpauseAsOperator()

> **approveUnpauseAsOperator**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:444](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L444)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### cancelBeforePromises()

> **cancelBeforePromises**(`context`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:337](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L337)

#### Parameters

##### context

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md)

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### cancelMembership()

> **cancelMembership**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:374](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L374)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### claimMaturedRefund()

> **claimMaturedRefund**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:349](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L349)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### closeProgram()

> **closeProgram**(`context`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:330](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L330)

#### Parameters

##### context

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md)

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### enterRunoff()

> **enterRunoff**(`context`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:329](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L329)

#### Parameters

##### context

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md)

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### escalateInformationTimeout()

> **escalateInformationTimeout**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:416](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L416)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### escalateNoQuorum()

> **escalateNoQuorum**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:413](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L413)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### executeAppealDecision()

> **executeAppealDecision**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:405](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L405)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### executeInitialDecision()

> **executeInitialDecision**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:391](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L391)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### expireMembership()

> **expireMembership**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:371](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L371)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### fileAppeal()

> **fileAppeal**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:399](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L399)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### finalizeUnappealedDenial()

> **finalizeUnappealedDenial**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:419](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L419)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### fundProgram()

> **fundProgram**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:343](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L343)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### grantAgentAuthorization()

> **grantAgentAuthorization**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:425](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L425)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### guardianRevokeAgentAuthorization()

> **guardianRevokeAgentAuthorization**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:464](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L464)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### markProgramFunded()

> **markProgramFunded**(`context`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:314](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L314)

#### Parameters

##### context

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md)

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### markProgramReviewed()

> **markProgramReviewed**(`context`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:311](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L311)

#### Parameters

##### context

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md)

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### openEnrollment()

> **openEnrollment**(`context`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:323](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L323)

#### Parameters

##### context

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md)

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### openRequest()

> **openRequest**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:377](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L377)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### pauseScope()

> **pauseScope**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:436](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L436)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### recoverMembershipAccount()

> **recoverMembershipAccount**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:365](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L365)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### revokeAgentAuthorization()

> **revokeAgentAuthorization**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:430](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L430)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### revokeEligibilityAuthorization()

> **revokeEligibilityAuthorization**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:358](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L358)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### setDependencyWarning()

> **setDependencyWarning**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:456](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L456)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### settleObligation()

> **settleObligation**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:422](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L422)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### unpauseScope()

> **unpauseScope**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:450](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L450)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### updateEvidence()

> **updateEvidence**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:385](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L385)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)
