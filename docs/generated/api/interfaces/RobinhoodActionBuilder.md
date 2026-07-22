[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / RobinhoodActionBuilder

# Interface: RobinhoodActionBuilder

Defined in: [src/robinhood/protocol.ts:178](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L178)

## Properties

### network

> `readonly` **network**: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md)

Defined in: [src/robinhood/protocol.ts:179](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L179)

***

### programId

> `readonly` **programId**: `` `0x${string}` ``

Defined in: [src/robinhood/protocol.ts:180](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L180)

## Methods

### activateMembership()

> **activateMembership**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:222](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L222)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### activateProgram()

> **activateProgram**(`context`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:196](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L196)

#### Parameters

##### context

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md)

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### approveActivationAsOperator()

> **approveActivationAsOperator**(`context`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:190](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L190)

#### Parameters

##### context

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md)

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### approveActivationAsSponsor()

> **approveActivationAsSponsor**(`context`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:187](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L187)

#### Parameters

##### context

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md)

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### approveCancellationAsOperator()

> **approveCancellationAsOperator**(`context`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:204](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L204)

#### Parameters

##### context

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md)

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### approveCancellationAsSponsor()

> **approveCancellationAsSponsor**(`context`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:201](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L201)

#### Parameters

##### context

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md)

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### approveExactUsdg()

> **approveExactUsdg**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:210](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L210)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### approveUnpauseAsOperator()

> **approveUnpauseAsOperator**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:314](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L314)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### cancelBeforePromises()

> **cancelBeforePromises**(`context`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:207](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L207)

#### Parameters

##### context

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md)

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### cancelMembership()

> **cancelMembership**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:244](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L244)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### claimMaturedRefund()

> **claimMaturedRefund**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:219](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L219)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### closeProgram()

> **closeProgram**(`context`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:200](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L200)

#### Parameters

##### context

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md)

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### enterRunoff()

> **enterRunoff**(`context`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:199](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L199)

#### Parameters

##### context

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md)

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### escalateInformationTimeout()

> **escalateInformationTimeout**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:286](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L286)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### escalateNoQuorum()

> **escalateNoQuorum**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:283](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L283)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### executeAppealDecision()

> **executeAppealDecision**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:275](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L275)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### executeInitialDecision()

> **executeInitialDecision**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:261](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L261)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### expireMembership()

> **expireMembership**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:241](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L241)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### fileAppeal()

> **fileAppeal**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:269](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L269)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### finalizeUnappealedDenial()

> **finalizeUnappealedDenial**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:289](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L289)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### fundProgram()

> **fundProgram**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:213](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L213)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### grantAgentAuthorization()

> **grantAgentAuthorization**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:295](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L295)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### guardianRevokeAgentAuthorization()

> **guardianRevokeAgentAuthorization**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:334](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L334)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### markProgramFunded()

> **markProgramFunded**(`context`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:184](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L184)

#### Parameters

##### context

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md)

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### markProgramReviewed()

> **markProgramReviewed**(`context`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:181](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L181)

#### Parameters

##### context

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md)

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### openEnrollment()

> **openEnrollment**(`context`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:193](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L193)

#### Parameters

##### context

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md)

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### openRequest()

> **openRequest**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:247](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L247)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### pauseScope()

> **pauseScope**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:306](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L306)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### recoverMembershipAccount()

> **recoverMembershipAccount**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:235](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L235)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### revokeAgentAuthorization()

> **revokeAgentAuthorization**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:300](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L300)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### revokeEligibilityAuthorization()

> **revokeEligibilityAuthorization**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:228](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L228)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### setDependencyWarning()

> **setDependencyWarning**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:326](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L326)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### settleObligation()

> **settleObligation**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:292](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L292)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### unpauseScope()

> **unpauseScope**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:320](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L320)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### updateEvidence()

> **updateEvidence**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:255](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L255)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)
