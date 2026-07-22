[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / RobinhoodDeploymentManifest

# Interface: RobinhoodDeploymentManifest

Defined in: src/robinhood/artifacts.ts:65

## Properties

### artifactBundleSha256

> **artifactBundleSha256**: `string` \| `null`

Defined in: src/robinhood/artifacts.ts:73

***

### auditReportSha256

> **auditReportSha256**: `string` \| `null`

Defined in: src/robinhood/artifacts.ts:83

***

### auditStatus

> **auditStatus**: `"unaudited"` \| `"audited"`

Defined in: src/robinhood/artifacts.ts:82

***

### caip2

> **caip2**: `"eip155:4663"` \| `"eip155:46630"`

Defined in: src/robinhood/artifacts.ts:70

***

### chainId

> **chainId**: `4663` \| `46630`

Defined in: src/robinhood/artifacts.ts:69

***

### contracts

> **contracts**: `Partial`\<`Record`\<[`RobinhoodContractRole`](../type-aliases/RobinhoodContractRole.md), [`RobinhoodContractDeployment`](RobinhoodContractDeployment.md)\>\>

Defined in: src/robinhood/artifacts.ts:77

***

### deploymentBlock

> **deploymentBlock**: `number` \| `null`

Defined in: src/robinhood/artifacts.ts:75

***

### deploymentBlockHash

> **deploymentBlockHash**: `` `0x${string}` `` \| `null`

Defined in: src/robinhood/artifacts.ts:76

***

### deploymentTransaction

> **deploymentTransaction**: `` `0x${string}` `` \| `null`

Defined in: src/robinhood/artifacts.ts:74

***

### network

> **network**: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md)

Defined in: src/robinhood/artifacts.ts:68

***

### protocolRelease

> **protocolRelease**: `string` \| `null`

Defined in: src/robinhood/artifacts.ts:71

***

### releaseApprovalSha256

> **releaseApprovalSha256**: `string` \| `null`

Defined in: src/robinhood/artifacts.ts:84

***

### schemaVersion

> **schemaVersion**: `1`

Defined in: src/robinhood/artifacts.ts:66

***

### settlementAsset

> **settlementAsset**: [`RobinhoodSettlementAsset`](RobinhoodSettlementAsset.md)

Defined in: src/robinhood/artifacts.ts:80

***

### sourceCommit

> **sourceCommit**: `string` \| `null`

Defined in: src/robinhood/artifacts.ts:72

***

### status

> **status**: `"unconfigured"` \| `"deployed"`

Defined in: src/robinhood/artifacts.ts:67

***

### verified

> **verified**: `boolean`

Defined in: src/robinhood/artifacts.ts:81
