[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / DecodedRobinhoodEvent

# Interface: DecodedRobinhoodEvent

Defined in: [src/robinhood/protocol.ts:399](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L399)

## Properties

### args

> **args**: `Record`\<`string`, `unknown`\> \| readonly `unknown`[]

Defined in: [src/robinhood/protocol.ts:402](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L402)

***

### eventName

> **eventName**: `"AssetRegistered"` \| `"AssetStatusChanged"` \| `"AuthorityTransferStarted"` \| `"AuthorityTransferred"` \| `"SuiteRegistered"` \| `"SuiteStatusChanged"` \| `"ProgramRegistered"` \| `"ProgramSuiteDeployed"` \| `"ActivationApprovalRecorded"` \| `"CancellationApprovalRecorded"` \| `"ModulesBound"` \| `"ProgramStateChanged"` \| `"MemberLiabilityChanged"` \| `"ObligationApproved"` \| `"ObligationSettled"` \| `"PendingReservationChanged"` \| `"SponsorFundingReceived"` \| `"SponsorRefundClaimed"` \| `"SponsorRefundMatured"` \| `"ClaimManagerBound"` \| `"EIP712DomainChanged"` \| `"EligibilityAuthorizationRevoked"` \| `"MembershipAccountRecovered"` \| `"MembershipActivated"` \| `"MembershipStateChanged"` \| `"DecisionConsumed"` \| `"AppealFiled"` \| `"EvidenceManifestUpdated"` \| `"RequestOpened"` \| `"RequestStateChanged"` \| `"SettlementModuleBound"` \| `"SettlementExecuted"` \| `"AuthorizationBlocked"` \| `"AuthorizationConsumed"` \| `"AuthorizationGranted"` \| `"AuthorizationRevoked"` \| `"SafetyGuardianBound"` \| `"AgentAuthorizationEmergencyRevoked"` \| `"DependencyWarningChanged"` \| `"OperatorUnpauseApproved"` \| `"ScopePaused"` \| `"ScopeUnpaused"`

Defined in: [src/robinhood/protocol.ts:401](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L401)

***

### log

> **log**: [`RobinhoodEventLog`](RobinhoodEventLog.md)

Defined in: [src/robinhood/protocol.ts:403](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L403)

***

### role

> **role**: `"factory"` \| `"assetRegistry"` \| `"templateRegistry"` \| `"poolRegistry"` \| `"program"` \| `"vault"` \| `"membershipRegistry"` \| `"decisionModule"` \| `"requestManager"` \| `"settlementModule"` \| `"agentAuthorizationRegistry"` \| `"safetyGuardian"`

Defined in: [src/robinhood/protocol.ts:400](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L400)
