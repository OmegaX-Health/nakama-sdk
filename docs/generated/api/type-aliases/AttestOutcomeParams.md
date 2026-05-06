[**@omegax/protocol-sdk**](../README.md)

***

[@omegax/protocol-sdk](../README.md) / AttestOutcomeParams

# Type Alias: AttestOutcomeParams

> **AttestOutcomeParams** = `object`

Defined in: [src/oracle.ts:27](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/oracle.ts#L27)

## Properties

### asOfIso

> **asOfIso**: `string`

Defined in: [src/oracle.ts:31](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/oracle.ts#L31)

***

### cycleId

> **cycleId**: `string`

Defined in: [src/oracle.ts:29](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/oracle.ts#L29)

***

### outcomeId

> **outcomeId**: `string`

Defined in: [src/oracle.ts:30](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/oracle.ts#L30)

***

### payload

> **payload**: `Record`\<`string`, `unknown`\>

Defined in: [src/oracle.ts:32](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/oracle.ts#L32)

***

### signer

> **signer**: [`OracleSigner`](OracleSigner.md)

Defined in: [src/oracle.ts:33](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/oracle.ts#L33)

***

### submitAttestation?

> `optional` **submitAttestation?**: (`attestation`) => `Promise`\<\{ `txSignature?`: `string`; \}\>

Defined in: [src/oracle.ts:34](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/oracle.ts#L34)

#### Parameters

##### attestation

[`OutcomeAttestation`](OutcomeAttestation.md)

#### Returns

`Promise`\<\{ `txSignature?`: `string`; \}\>

***

### userId

> **userId**: `string`

Defined in: [src/oracle.ts:28](https://github.com/OmegaX-Health/omegax-sdk/blob/main/src/oracle.ts#L28)
