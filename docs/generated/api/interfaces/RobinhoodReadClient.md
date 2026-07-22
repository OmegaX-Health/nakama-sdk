[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / RobinhoodReadClient

# Interface: RobinhoodReadClient

Defined in: [src/robinhood/protocol.ts:162](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L162)

## Properties

### network

> `readonly` **network**: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md)

Defined in: [src/robinhood/protocol.ts:163](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L163)

***

### programId

> `readonly` **programId**: `` `0x${string}` ``

Defined in: [src/robinhood/protocol.ts:164](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L164)

## Methods

### readAccounting()

> **readAccounting**(): `Promise`\<[`RobinhoodRead`](RobinhoodRead.md)\<[`ProgramAccountingSnapshot`](ProgramAccountingSnapshot.md)\>\>

Defined in: [src/robinhood/protocol.ts:166](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L166)

#### Returns

`Promise`\<[`RobinhoodRead`](RobinhoodRead.md)\<[`ProgramAccountingSnapshot`](ProgramAccountingSnapshot.md)\>\>

***

### readMembership()

> **readMembership**(`membershipId`): `Promise`\<[`RobinhoodRead`](RobinhoodRead.md)\<[`MembershipSnapshot`](MembershipSnapshot.md)\>\>

Defined in: [src/robinhood/protocol.ts:167](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L167)

#### Parameters

##### membershipId

`` `0x${string}` ``

#### Returns

`Promise`\<[`RobinhoodRead`](RobinhoodRead.md)\<[`MembershipSnapshot`](MembershipSnapshot.md)\>\>

***

### readObligation()

> **readObligation**(`requestId`): `Promise`\<[`RobinhoodRead`](RobinhoodRead.md)\<[`ObligationSnapshot`](ObligationSnapshot.md)\>\>

Defined in: [src/robinhood/protocol.ts:171](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L171)

#### Parameters

##### requestId

`` `0x${string}` ``

#### Returns

`Promise`\<[`RobinhoodRead`](RobinhoodRead.md)\<[`ObligationSnapshot`](ObligationSnapshot.md)\>\>

***

### readPause()

> **readPause**(`scope`): `Promise`\<[`RobinhoodRead`](RobinhoodRead.md)\<[`PauseSnapshot`](PauseSnapshot.md)\>\>

Defined in: [src/robinhood/protocol.ts:175](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L175)

#### Parameters

##### scope

[`PauseScope`](../type-aliases/PauseScope.md)

#### Returns

`Promise`\<[`RobinhoodRead`](RobinhoodRead.md)\<[`PauseSnapshot`](PauseSnapshot.md)\>\>

***

### readProgram()

> **readProgram**(): `Promise`\<[`RobinhoodRead`](RobinhoodRead.md)\<[`ProgramSnapshot`](ProgramSnapshot.md)\>\>

Defined in: [src/robinhood/protocol.ts:165](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L165)

#### Returns

`Promise`\<[`RobinhoodRead`](RobinhoodRead.md)\<[`ProgramSnapshot`](ProgramSnapshot.md)\>\>

***

### readRequest()

> **readRequest**(`requestId`): `Promise`\<[`RobinhoodRead`](RobinhoodRead.md)\<[`RequestSnapshot`](RequestSnapshot.md)\>\>

Defined in: [src/robinhood/protocol.ts:170](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L170)

#### Parameters

##### requestId

`` `0x${string}` ``

#### Returns

`Promise`\<[`RobinhoodRead`](RobinhoodRead.md)\<[`RequestSnapshot`](RequestSnapshot.md)\>\>

***

### readRole()

> **readRole**(`role`): `Promise`\<[`RobinhoodRead`](RobinhoodRead.md)\<[`RoleSnapshot`](RoleSnapshot.md)\>\>

Defined in: [src/robinhood/protocol.ts:174](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L174)

#### Parameters

##### role

[`ProgramRole`](../type-aliases/ProgramRole.md)

#### Returns

`Promise`\<[`RobinhoodRead`](RobinhoodRead.md)\<[`RoleSnapshot`](RoleSnapshot.md)\>\>
