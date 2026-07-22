[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / DecodedRobinhoodEvent

# Interface: DecodedRobinhoodEvent

Defined in: src/robinhood/protocol.ts:394

## Properties

### args

> **args**: `Record`\<`string`, `unknown`\> \| readonly `unknown`[]

Defined in: src/robinhood/protocol.ts:397

***

### eventName

> **eventName**: `"AssetRegistered"` \| `"AssetStatusChanged"` \| `"AuthorityTransferStarted"` \| `"AuthorityTransferred"` \| `"SuiteRegistered"` \| `"SuiteStatusChanged"` \| `"ProgramRegistered"` \| `"ProgramSuiteDeployed"` \| `"ActivationApprovalRecorded"` \| `"CancellationApprovalRecorded"` \| `"ModulesBound"` \| `"ProgramStateChanged"` \| `"MemberLiabilityChanged"` \| `"ObligationApproved"` \| `"ObligationSettled"` \| `"PendingReservationChanged"` \| `"SponsorFundingReceived"` \| `"SponsorRefundClaimed"` \| `"SponsorRefundMatured"` \| `"ClaimManagerBound"` \| `"EIP712DomainChanged"` \| `"MembershipAccountRecovered"` \| `"MembershipActivated"` \| `"MembershipStateChanged"` \| `"DecisionConsumed"` \| `"AppealFiled"` \| `"EvidenceManifestUpdated"` \| `"RequestOpened"` \| `"RequestStateChanged"` \| `"SettlementModuleBound"` \| `"SettlementExecuted"` \| `"AuthorizationBlocked"` \| `"AuthorizationConsumed"` \| `"AuthorizationGranted"` \| `"AuthorizationRevoked"` \| `"SafetyGuardianBound"` \| `"AgentAuthorizationEmergencyRevoked"` \| `"DependencyWarningChanged"` \| `"OperatorUnpauseApproved"` \| `"ScopePaused"` \| `"ScopeUnpaused"`

Defined in: src/robinhood/protocol.ts:396

***

### log

> **log**: [`RobinhoodEventLog`](RobinhoodEventLog.md)

Defined in: src/robinhood/protocol.ts:398

***

### role

> **role**: `"factory"` \| `"assetRegistry"` \| `"templateRegistry"` \| `"poolRegistry"` \| `"program"` \| `"vault"` \| `"membershipRegistry"` \| `"decisionModule"` \| `"requestManager"` \| `"settlementModule"` \| `"agentAuthorizationRegistry"` \| `"safetyGuardian"`

Defined in: src/robinhood/protocol.ts:395
