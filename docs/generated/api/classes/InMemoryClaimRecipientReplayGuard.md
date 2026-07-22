[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / InMemoryClaimRecipientReplayGuard

# Class: InMemoryClaimRecipientReplayGuard

Defined in: src/ethereum\_oracle.ts:93

A replay guard must atomically consume every key or consume none. Production
services should back this with their durable database, not process memory.

## Implements

- [`ClaimRecipientReplayGuard`](../interfaces/ClaimRecipientReplayGuard.md)

## Constructors

### Constructor

> **new InMemoryClaimRecipientReplayGuard**(): `InMemoryClaimRecipientReplayGuard`

#### Returns

`InMemoryClaimRecipientReplayGuard`

## Methods

### consume()

> **consume**(`keys`): `boolean`

Defined in: src/ethereum\_oracle.ts:96

#### Parameters

##### keys

readonly `` `0x${string}` ``[]

#### Returns

`boolean`

#### Implementation of

[`ClaimRecipientReplayGuard`](../interfaces/ClaimRecipientReplayGuard.md).[`consume`](../interfaces/ClaimRecipientReplayGuard.md#consume)
