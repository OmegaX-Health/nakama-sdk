[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / ClaimRecipientReplayGuard

# Interface: ClaimRecipientReplayGuard

Defined in: src/ethereum\_oracle.ts:89

A replay guard must atomically consume every key or consume none. Production
services should back this with their durable database, not process memory.

## Methods

### consume()

> **consume**(`keys`): `boolean` \| `Promise`\<`boolean`\>

Defined in: src/ethereum\_oracle.ts:90

#### Parameters

##### keys

readonly `` `0x${string}` ``[]

#### Returns

`boolean` \| `Promise`\<`boolean`\>
