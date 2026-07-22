[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / NAKAMA\_PROTOCOL\_FACTORY\_ARTIFACT\_METADATA

# Variable: NAKAMA\_PROTOCOL\_FACTORY\_ARTIFACT\_METADATA

> `const` **NAKAMA\_PROTOCOL\_FACTORY\_ARTIFACT\_METADATA**: `object`

Defined in: src/generated/ethereum\_protocol.ts:48

## Type Declaration

### abiSha256

> `readonly` **abiSha256**: `"c80b950a24d135213403720b2d72eeafad0a509f046d08bed82d5988347bfe05"` = `'c80b950a24d135213403720b2d72eeafad0a509f046d08bed82d5988347bfe05'`

### canonicalChain

> `readonly` **canonicalChain**: `"eip155:1"` = `'eip155:1'`

### chainFamily

> `readonly` **chainFamily**: `"eip155"` = `'eip155'`

### compiler

> `readonly` **compiler**: `object`

#### compiler.evmVersion

> `readonly` **evmVersion**: `"cancun"` = `'cancun'`

#### compiler.optimizerRuns

> `readonly` **optimizerRuns**: `200` = `200`

#### compiler.version

> `readonly` **version**: `"0.8.28"` = `'0.8.28'`

#### compiler.viaIR

> `readonly` **viaIR**: `true` = `true`

### contractName

> `readonly` **contractName**: `"NakamaProtocolFactory"` = `'NakamaProtocolFactory'`

### creationBytecodeBytes

> `readonly` **creationBytecodeBytes**: `35934` = `35934`

### creationBytecodeHash

> `readonly` **creationBytecodeHash**: `"0xf9fccea78ffa1999c11b440abd8f99dcf1798c8c49568447e38119bfbd53dc17"` = `'0xf9fccea78ffa1999c11b440abd8f99dcf1798c8c49568447e38119bfbd53dc17'`

### deploymentPlan

> `readonly` **deploymentPlan**: `object`

#### deploymentPlan.entryContract

> `readonly` **entryContract**: `"NakamaProtocolFactory"` = `'NakamaProtocolFactory'`

#### deploymentPlan.factoryCreates

> `readonly` **factoryCreates**: readonly \[\{ `contractName`: `"NakamaPolicyRegistry"`; `nonce`: `1`; \}, \{ `contractName`: `"NakamaCoverageProtocol"`; `nonce`: `2`; \}\]

#### deploymentPlan.templates

> `readonly` **templates**: readonly \[\{ `contractName`: `"ReserveVault"`; `deploymentKind`: `"core-create2"`; `saltDerivation`: `"keccak256(abi.encode(domainId,assetToken))"`; \}\]

#### deploymentPlan.transactionCount

> `readonly` **transactionCount**: `1` = `1`

### immutableReferences

> `readonly` **immutableReferences**: readonly \[\{ `length`: `32`; `start`: `66`; \}, \{ `length`: `32`; `start`: `133`; \}\]

### runtimeBytecodeBytes

> `readonly` **runtimeBytecodeBytes**: `234` = `234`

### runtimeBytecodeTemplateHash

> `readonly` **runtimeBytecodeTemplateHash**: `"0xcc40ae6846256b678edd42124680c87886519cf7c1cf4f3bf32a17439a8791b9"` = `'0xcc40ae6846256b678edd42124680c87886519cf7c1cf4f3bf32a17439a8791b9'`

### schemaVersion

> `readonly` **schemaVersion**: `3` = `3`

### sourceAbi

> `readonly` **sourceAbi**: `"nakama-protocol/shared/ethereum/NakamaProtocolFactory.abi.json"` = `'nakama-protocol/shared/ethereum/NakamaProtocolFactory.abi.json'`

### sourceArtifact

> `readonly` **sourceArtifact**: `"nakama-protocol/shared/ethereum/protocol_contract.json"` = `'nakama-protocol/shared/ethereum/protocol_contract.json'`

### sourceArtifactSha256

> `readonly` **sourceArtifactSha256**: `"c894cb59f3bd83c4f55ea93a4896ba5b1b54a49965c6801ab06b506b716093e1"` = `'c894cb59f3bd83c4f55ea93a4896ba5b1b54a49965c6801ab06b506b716093e1'`
