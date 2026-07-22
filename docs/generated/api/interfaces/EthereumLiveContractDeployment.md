[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / EthereumLiveContractDeployment

# Interface: EthereumLiveContractDeployment

Defined in: src/ethereum\_deployment.ts:65

## Properties

### abiArtifact

> **abiArtifact**: `"contracts/ethereum/NakamaProtocolFactory.abi.json"` \| `"contracts/ethereum/NakamaPolicyRegistry.abi.json"` \| `"contracts/ethereum/NakamaCoverageProtocol.abi.json"`

Defined in: src/ethereum\_deployment.ts:79

***

### abiSha256

> **abiSha256**: `string` \| `null`

Defined in: src/ethereum\_deployment.ts:83

***

### address

> **address**: `` `0x${string}` `` \| `null`

Defined in: src/ethereum\_deployment.ts:70

***

### contractName

> **contractName**: `"NakamaProtocolFactory"` \| `"NakamaPolicyRegistry"` \| `"NakamaCoverageProtocol"`

Defined in: src/ethereum\_deployment.ts:66

***

### creationBytecodeBytes

> **creationBytecodeBytes**: `number` \| `null`

Defined in: src/ethereum\_deployment.ts:74

***

### creationBytecodeHash

> **creationBytecodeHash**: `` `0x${string}` `` \| `null`

Defined in: src/ethereum\_deployment.ts:73

***

### deploymentKind

> **deploymentKind**: `"transaction-create"` \| `"factory-create"`

Defined in: src/ethereum\_deployment.ts:71

***

### factoryNonce

> **factoryNonce**: `1` \| `2` \| `null`

Defined in: src/ethereum\_deployment.ts:72

***

### immutableReferences

> **immutableReferences**: readonly [`EthereumImmutableReference`](EthereumImmutableReference.md)[]

Defined in: src/ethereum\_deployment.ts:78

***

### runtimeBytecodeBytes

> **runtimeBytecodeBytes**: `number` \| `null`

Defined in: src/ethereum\_deployment.ts:77

***

### runtimeBytecodeHash

> **runtimeBytecodeHash**: `` `0x${string}` `` \| `null`

Defined in: src/ethereum\_deployment.ts:75

***

### runtimeBytecodeTemplateHash

> **runtimeBytecodeTemplateHash**: `` `0x${string}` `` \| `null`

Defined in: src/ethereum\_deployment.ts:76

***

### verification

> **verification**: [`EthereumSourceVerification`](EthereumSourceVerification.md) \| `null`

Defined in: src/ethereum\_deployment.ts:84
