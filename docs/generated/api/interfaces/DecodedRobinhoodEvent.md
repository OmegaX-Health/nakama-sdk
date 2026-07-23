[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / DecodedRobinhoodEvent

# Interface: DecodedRobinhoodEvent

Defined in: [src/robinhood/protocol.ts:522](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L522)

## Properties

### args

> **args**: `Record`\<`string`, `unknown`\> \| readonly `unknown`[]

Defined in: [src/robinhood/protocol.ts:525](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L525)

***

### eventName

> **eventName**: `"AssetRegistered"` \| `"AssetStatusChanged"` \| `"AuthorityTransferStarted"` \| `"AuthorityTransferred"` \| `"SuiteRegistered"` \| `"SuiteStatusChanged"` \| `"ProgramRegistered"` \| `"ProgramSuiteDeployed"` \| `"ActivationApprovalRecorded"` \| `"CancellationApprovalRecorded"` \| `"ModulesBound"` \| `"ProgramStateChanged"` \| `"EconomicActivity"` \| `"ClaimManagerBound"` \| `"EIP712DomainChanged"` \| `"EligibilityAuthorizationRevoked"` \| `"MembershipAccountRecovered"` \| `"MembershipActivated"` \| `"MembershipStateChanged"` \| `"DecisionConsumed"` \| `"AppealFiled"` \| `"EvidenceManifestUpdated"` \| `"RequestOpened"` \| `"RequestStateChanged"` \| `"SettlementModuleBound"` \| `"AuthorizationBlocked"` \| `"AuthorizationConsumed"` \| `"AuthorizationGranted"` \| `"AuthorizationRevoked"` \| `"SafetyGuardianBound"` \| `"AgentAuthorizationEmergencyRevoked"` \| `"DependencyWarningChanged"` \| `"OperatorUnpauseApproved"` \| `"ScopePaused"` \| `"ScopeUnpaused"`

Defined in: [src/robinhood/protocol.ts:524](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L524)

***

### log

> **log**: [`RobinhoodEventLog`](RobinhoodEventLog.md)

Defined in: [src/robinhood/protocol.ts:526](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L526)

***

### role

> **role**: `"factory"` \| `"assetRegistry"` \| `"templateRegistry"` \| `"poolRegistry"` \| `"program"` \| `"vault"` \| `"membershipRegistry"` \| `"decisionModule"` \| `"requestManager"` \| `"settlementModule"` \| `"agentAuthorizationRegistry"` \| `"safetyGuardian"`

Defined in: [src/robinhood/protocol.ts:523](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L523)
