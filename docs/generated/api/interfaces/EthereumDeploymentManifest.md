[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / EthereumDeploymentManifest

# Interface: EthereumDeploymentManifest

Defined in: src/ethereum\_deployment.ts:100

## Properties

### auditReportSha256

> **auditReportSha256**: `string` \| `null`

Defined in: src/ethereum\_deployment.ts:135

***

### auditStatus

> **auditStatus**: [`EthereumAuditStatus`](../type-aliases/EthereumAuditStatus.md)

Defined in: src/ethereum\_deployment.ts:134

***

### caip2

> **caip2**: `"eip155:1"`

Defined in: src/ethereum\_deployment.ts:104

***

### chainId

> **chainId**: `1`

Defined in: src/ethereum\_deployment.ts:103

***

### confirmations

> **confirmations**: `number` \| `null`

Defined in: src/ethereum\_deployment.ts:110

***

### contractTemplates

> **contractTemplates**: `object`

Defined in: src/ethereum\_deployment.ts:130

#### reserveVault

> **reserveVault**: [`EthereumReserveVaultTemplate`](EthereumReserveVaultTemplate.md)

***

### deployer

> **deployer**: `` `0x${string}` `` \| `null`

Defined in: src/ethereum\_deployment.ts:106

***

### deploymentBlock

> **deploymentBlock**: `number` \| `null`

Defined in: src/ethereum\_deployment.ts:108

***

### deploymentBlockHash

> **deploymentBlockHash**: `` `0x${string}` `` \| `null`

Defined in: src/ethereum\_deployment.ts:109

***

### deploymentTransaction

> **deploymentTransaction**: `` `0x${string}` `` \| `null`

Defined in: src/ethereum\_deployment.ts:107

***

### entryContract

> **entryContract**: `"NakamaProtocolFactory"`

Defined in: src/ethereum\_deployment.ts:105

***

### liveContracts

> **liveContracts**: `object`

Defined in: src/ethereum\_deployment.ts:113

#### factory

> **factory**: [`EthereumLiveContractDeployment`](EthereumLiveContractDeployment.md) & `object`

##### Type Declaration

###### contractName

> **contractName**: `"NakamaProtocolFactory"`

###### deploymentKind

> **deploymentKind**: `"transaction-create"`

###### factoryNonce

> **factoryNonce**: `null`

#### policyRegistry

> **policyRegistry**: [`EthereumLiveContractDeployment`](EthereumLiveContractDeployment.md) & `object`

##### Type Declaration

###### contractName

> **contractName**: `"NakamaPolicyRegistry"`

###### deploymentKind

> **deploymentKind**: `"factory-create"`

###### factoryNonce

> **factoryNonce**: `1`

#### protocol

> **protocol**: [`EthereumLiveContractDeployment`](EthereumLiveContractDeployment.md) & `object`

##### Type Declaration

###### contractName

> **contractName**: `"NakamaCoverageProtocol"`

###### deploymentKind

> **deploymentKind**: `"factory-create"`

###### factoryNonce

> **factoryNonce**: `2`

***

### protocolArtifactSha256

> **protocolArtifactSha256**: `string` \| `null`

Defined in: src/ethereum\_deployment.ts:112

***

### releaseApprovalSha256

> **releaseApprovalSha256**: `string` \| `null`

Defined in: src/ethereum\_deployment.ts:136

***

### schemaVersion

> **schemaVersion**: `3`

Defined in: src/ethereum\_deployment.ts:101

***

### sourceCommit

> **sourceCommit**: `string` \| `null`

Defined in: src/ethereum\_deployment.ts:111

***

### status

> **status**: [`EthereumDeploymentStatus`](../type-aliases/EthereumDeploymentStatus.md)

Defined in: src/ethereum\_deployment.ts:102

***

### verificationEvidenceSha256

> **verificationEvidenceSha256**: `string` \| `null`

Defined in: src/ethereum\_deployment.ts:137

***

### verified

> **verified**: `boolean`

Defined in: src/ethereum\_deployment.ts:133
