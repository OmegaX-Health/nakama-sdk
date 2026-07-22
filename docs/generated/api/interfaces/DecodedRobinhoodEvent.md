[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / DecodedRobinhoodEvent

# Interface: DecodedRobinhoodEvent

Defined in: [src/robinhood/protocol.ts:394](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L394)

## Properties

### args

> **args**: `Record`\<`string`, `unknown`\> \| readonly `unknown`[]

Defined in: [src/robinhood/protocol.ts:397](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L397)

***

### eventName

> **eventName**: `"AssetRegistered"` \| `"AssetStatusChanged"` \| `"AuthorityTransferStarted"` \| `"AuthorityTransferred"` \| `"SuiteRegistered"` \| `"SuiteStatusChanged"` \| `"ProgramRegistered"` \| `"ProgramSuiteDeployed"` \| `"ActivationApprovalRecorded"` \| `"CancellationApprovalRecorded"` \| `"ModulesBound"` \| `"ProgramStateChanged"` \| `"MemberLiabilityChanged"` \| `"ObligationApproved"` \| `"ObligationSettled"` \| `"PendingReservationChanged"` \| `"SponsorFundingReceived"` \| `"SponsorRefundClaimed"` \| `"SponsorRefundMatured"` \| `"ClaimManagerBound"` \| `"EIP712DomainChanged"` \| `"MembershipAccountRecovered"` \| `"MembershipActivated"` \| `"MembershipStateChanged"` \| `"DecisionConsumed"` \| `"AppealFiled"` \| `"EvidenceManifestUpdated"` \| `"RequestOpened"` \| `"RequestStateChanged"` \| `"SettlementModuleBound"` \| `"SettlementExecuted"` \| `"AuthorizationBlocked"` \| `"AuthorizationConsumed"` \| `"AuthorizationGranted"` \| `"AuthorizationRevoked"` \| `"SafetyGuardianBound"` \| `"AgentAuthorizationEmergencyRevoked"` \| `"DependencyWarningChanged"` \| `"OperatorUnpauseApproved"` \| `"ScopePaused"` \| `"ScopeUnpaused"`

Defined in: [src/robinhood/protocol.ts:396](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L396)

***

### log

> **log**: [`RobinhoodEventLog`](RobinhoodEventLog.md)

Defined in: [src/robinhood/protocol.ts:398](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L398)

***

### role

> **role**: `"factory"` \| `"assetRegistry"` \| `"templateRegistry"` \| `"poolRegistry"` \| `"program"` \| `"vault"` \| `"membershipRegistry"` \| `"decisionModule"` \| `"requestManager"` \| `"settlementModule"` \| `"agentAuthorizationRegistry"` \| `"safetyGuardian"`

Defined in: [src/robinhood/protocol.ts:395](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L395)
