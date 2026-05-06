[**@omegax/protocol-sdk**](../README.md)

***

[@omegax/protocol-sdk](../README.md) / AttestProtocolOutcomeParams

# Type Alias: AttestProtocolOutcomeParams

> **AttestProtocolOutcomeParams** = `object`

Defined in: [src/oracle.ts:44](https://github.com/OmegaX-Health/omegax-sdk/blob/18eba6eebb5b732fec0b45b896a6b09b9c0e3cbc/src/oracle.ts#L44)

## Properties

### context

> **context**: `Omit`\<[`ProtocolBoundAttestationContext`](ProtocolBoundAttestationContext.md), `"issuedAtIso"`\> & `object`

Defined in: [src/oracle.ts:49](https://github.com/OmegaX-Health/omegax-sdk/blob/18eba6eebb5b732fec0b45b896a6b09b9c0e3cbc/src/oracle.ts#L49)

#### Type Declaration

##### issuedAtIso?

> `optional` **issuedAtIso?**: `string`

***

### cycleId

> **cycleId**: `string`

Defined in: [src/oracle.ts:46](https://github.com/OmegaX-Health/omegax-sdk/blob/18eba6eebb5b732fec0b45b896a6b09b9c0e3cbc/src/oracle.ts#L46)

***

### outcomeId

> **outcomeId**: `string`

Defined in: [src/oracle.ts:47](https://github.com/OmegaX-Health/omegax-sdk/blob/18eba6eebb5b732fec0b45b896a6b09b9c0e3cbc/src/oracle.ts#L47)

***

### payload

> **payload**: `Record`\<`string`, `unknown`\>

Defined in: [src/oracle.ts:48](https://github.com/OmegaX-Health/omegax-sdk/blob/18eba6eebb5b732fec0b45b896a6b09b9c0e3cbc/src/oracle.ts#L48)

***

### signer

> **signer**: [`OracleSigner`](OracleSigner.md)

Defined in: [src/oracle.ts:52](https://github.com/OmegaX-Health/omegax-sdk/blob/18eba6eebb5b732fec0b45b896a6b09b9c0e3cbc/src/oracle.ts#L52)

***

### submitAttestation?

> `optional` **submitAttestation?**: (`attestation`) => `Promise`\<\{ `txSignature?`: `string`; \}\>

Defined in: [src/oracle.ts:53](https://github.com/OmegaX-Health/omegax-sdk/blob/18eba6eebb5b732fec0b45b896a6b09b9c0e3cbc/src/oracle.ts#L53)

#### Parameters

##### attestation

[`ProtocolBoundOutcomeAttestation`](ProtocolBoundOutcomeAttestation.md)

#### Returns

`Promise`\<\{ `txSignature?`: `string`; \}\>

***

### userId

> **userId**: `string`

Defined in: [src/oracle.ts:45](https://github.com/OmegaX-Health/omegax-sdk/blob/18eba6eebb5b732fec0b45b896a6b09b9c0e3cbc/src/oracle.ts#L45)
