[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / EthereumReserveVaultTemplate

# Interface: EthereumReserveVaultTemplate

Defined in: src/ethereum\_deployment.ts:87

## Properties

### abiArtifact

> **abiArtifact**: `"contracts/ethereum/ReserveVault.abi.json"`

Defined in: src/ethereum\_deployment.ts:96

***

### abiSha256

> **abiSha256**: `string` \| `null`

Defined in: src/ethereum\_deployment.ts:97

***

### contractName

> **contractName**: `"ReserveVault"`

Defined in: src/ethereum\_deployment.ts:88

***

### creationBytecodeBytes

> **creationBytecodeBytes**: `number` \| `null`

Defined in: src/ethereum\_deployment.ts:92

***

### creationBytecodeHash

> **creationBytecodeHash**: `` `0x${string}` `` \| `null`

Defined in: src/ethereum\_deployment.ts:91

***

### deploymentKind

> **deploymentKind**: `"core-create2"`

Defined in: src/ethereum\_deployment.ts:89

***

### immutableReferences

> **immutableReferences**: readonly [`EthereumImmutableReference`](EthereumImmutableReference.md)[]

Defined in: src/ethereum\_deployment.ts:95

***

### runtimeBytecodeBytes

> **runtimeBytecodeBytes**: `number` \| `null`

Defined in: src/ethereum\_deployment.ts:94

***

### runtimeBytecodeTemplateHash

> **runtimeBytecodeTemplateHash**: `` `0x${string}` `` \| `null`

Defined in: src/ethereum\_deployment.ts:93

***

### saltDerivation

> **saltDerivation**: `"keccak256(abi.encode(domainId,assetToken))"`

Defined in: src/ethereum\_deployment.ts:90
