[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / RobinhoodActionBuilder

# Interface: RobinhoodActionBuilder

Defined in: [src/robinhood/protocol.ts:181](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L181)

## Properties

### network

> `readonly` **network**: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md)

Defined in: [src/robinhood/protocol.ts:182](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L182)

***

### programId

> `readonly` **programId**: `` `0x${string}` ``

Defined in: [src/robinhood/protocol.ts:183](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L183)

## Methods

### activateMembership()

> **activateMembership**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:225](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L225)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### activateProgram()

> **activateProgram**(`context`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:199](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L199)

#### Parameters

##### context

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md)

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### approveActivationAsOperator()

> **approveActivationAsOperator**(`context`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:193](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L193)

#### Parameters

##### context

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md)

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### approveActivationAsSponsor()

> **approveActivationAsSponsor**(`context`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:190](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L190)

#### Parameters

##### context

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md)

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### approveCancellationAsOperator()

> **approveCancellationAsOperator**(`context`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:207](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L207)

#### Parameters

##### context

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md)

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### approveCancellationAsSponsor()

> **approveCancellationAsSponsor**(`context`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:204](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L204)

#### Parameters

##### context

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md)

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### approveExactUsdg()

> **approveExactUsdg**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:213](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L213)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### approveUnpauseAsOperator()

> **approveUnpauseAsOperator**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:310](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L310)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### cancelBeforePromises()

> **cancelBeforePromises**(`context`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:210](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L210)

#### Parameters

##### context

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md)

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### cancelMembership()

> **cancelMembership**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:240](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L240)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### claimMaturedRefund()

> **claimMaturedRefund**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:222](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L222)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### closeProgram()

> **closeProgram**(`context`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:203](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L203)

#### Parameters

##### context

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md)

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### enterRunoff()

> **enterRunoff**(`context`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:202](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L202)

#### Parameters

##### context

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md)

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### escalateInformationTimeout()

> **escalateInformationTimeout**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:282](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L282)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### escalateNoQuorum()

> **escalateNoQuorum**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:279](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L279)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### executeAppealDecision()

> **executeAppealDecision**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:271](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L271)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### executeInitialDecision()

> **executeInitialDecision**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:257](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L257)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### expireMembership()

> **expireMembership**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:237](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L237)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### fileAppeal()

> **fileAppeal**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:265](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L265)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### finalizeUnappealedDenial()

> **finalizeUnappealedDenial**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:285](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L285)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### fundProgram()

> **fundProgram**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:216](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L216)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### grantAgentAuthorization()

> **grantAgentAuthorization**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:291](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L291)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### guardianRevokeAgentAuthorization()

> **guardianRevokeAgentAuthorization**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:330](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L330)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### markProgramFunded()

> **markProgramFunded**(`context`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:187](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L187)

#### Parameters

##### context

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md)

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### markProgramReviewed()

> **markProgramReviewed**(`context`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:184](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L184)

#### Parameters

##### context

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md)

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### openEnrollment()

> **openEnrollment**(`context`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:196](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L196)

#### Parameters

##### context

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md)

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### openRequest()

> **openRequest**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:243](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L243)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### pauseScope()

> **pauseScope**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:302](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L302)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### recoverMembershipAccount()

> **recoverMembershipAccount**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:231](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L231)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### revokeAgentAuthorization()

> **revokeAgentAuthorization**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:296](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L296)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### setDependencyWarning()

> **setDependencyWarning**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:322](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L322)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### settleObligation()

> **settleObligation**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:288](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L288)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### unpauseScope()

> **unpauseScope**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:316](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L316)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

***

### updateEvidence()

> **updateEvidence**(`params`): [`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

Defined in: [src/robinhood/protocol.ts:251](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L251)

#### Parameters

##### params

[`PrepareRobinhoodActionContext`](PrepareRobinhoodActionContext.md) & `object`

#### Returns

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)
