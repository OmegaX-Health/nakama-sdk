[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / RobinhoodReadClient

# Interface: RobinhoodReadClient

Defined in: [src/robinhood/protocol.ts:284](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L284)

## Properties

### network

> `readonly` **network**: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md)

Defined in: [src/robinhood/protocol.ts:285](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L285)

***

### programId

> `readonly` **programId**: `` `0x${string}` ``

Defined in: [src/robinhood/protocol.ts:286](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L286)

## Methods

### readAccounting()

> **readAccounting**(): `Promise`\<[`RobinhoodRead`](RobinhoodRead.md)\<[`ProgramAccountingSnapshot`](ProgramAccountingSnapshot.md)\>\>

Defined in: [src/robinhood/protocol.ts:288](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L288)

#### Returns

`Promise`\<[`RobinhoodRead`](RobinhoodRead.md)\<[`ProgramAccountingSnapshot`](ProgramAccountingSnapshot.md)\>\>

***

### readAgentAuthorizationFailure()

> **readAgentAuthorizationFailure**(`params`): `Promise`\<[`RobinhoodRead`](RobinhoodRead.md)\<[`RobinhoodAgentAuthorizationFailureSnapshot`](RobinhoodAgentAuthorizationFailureSnapshot.md)\>\>

Defined in: [src/robinhood/protocol.ts:298](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L298)

#### Parameters

##### params

###### assetAmount

`bigint`

###### authorizationId

`` `0x${string}` ``

###### nativeValue

`bigint`

###### principal

`string`

###### selector

`` `0x${string}` ``

###### target

`string`

#### Returns

`Promise`\<[`RobinhoodRead`](RobinhoodRead.md)\<[`RobinhoodAgentAuthorizationFailureSnapshot`](RobinhoodAgentAuthorizationFailureSnapshot.md)\>\>

***

### readMembership()

> **readMembership**(`membershipId`): `Promise`\<[`RobinhoodRead`](RobinhoodRead.md)\<[`MembershipSnapshot`](MembershipSnapshot.md)\>\>

Defined in: [src/robinhood/protocol.ts:289](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L289)

#### Parameters

##### membershipId

`` `0x${string}` ``

#### Returns

`Promise`\<[`RobinhoodRead`](RobinhoodRead.md)\<[`MembershipSnapshot`](MembershipSnapshot.md)\>\>

***

### readObligation()

> **readObligation**(`requestId`): `Promise`\<[`RobinhoodRead`](RobinhoodRead.md)\<[`ObligationSnapshot`](ObligationSnapshot.md)\>\>

Defined in: [src/robinhood/protocol.ts:293](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L293)

#### Parameters

##### requestId

`` `0x${string}` ``

#### Returns

`Promise`\<[`RobinhoodRead`](RobinhoodRead.md)\<[`ObligationSnapshot`](ObligationSnapshot.md)\>\>

***

### readPause()

> **readPause**(`scope`): `Promise`\<[`RobinhoodRead`](RobinhoodRead.md)\<[`PauseSnapshot`](PauseSnapshot.md)\>\>

Defined in: [src/robinhood/protocol.ts:297](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L297)

#### Parameters

##### scope

[`PauseScope`](../type-aliases/PauseScope.md)

#### Returns

`Promise`\<[`RobinhoodRead`](RobinhoodRead.md)\<[`PauseSnapshot`](PauseSnapshot.md)\>\>

***

### readProgram()

> **readProgram**(): `Promise`\<[`RobinhoodRead`](RobinhoodRead.md)\<[`ProgramSnapshot`](ProgramSnapshot.md)\>\>

Defined in: [src/robinhood/protocol.ts:287](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L287)

#### Returns

`Promise`\<[`RobinhoodRead`](RobinhoodRead.md)\<[`ProgramSnapshot`](ProgramSnapshot.md)\>\>

***

### readRequest()

> **readRequest**(`requestId`): `Promise`\<[`RobinhoodRead`](RobinhoodRead.md)\<[`RequestSnapshot`](RequestSnapshot.md)\>\>

Defined in: [src/robinhood/protocol.ts:292](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L292)

#### Parameters

##### requestId

`` `0x${string}` ``

#### Returns

`Promise`\<[`RobinhoodRead`](RobinhoodRead.md)\<[`RequestSnapshot`](RequestSnapshot.md)\>\>

***

### readRole()

> **readRole**(`role`): `Promise`\<[`RobinhoodRead`](RobinhoodRead.md)\<[`RoleSnapshot`](RoleSnapshot.md)\>\>

Defined in: [src/robinhood/protocol.ts:296](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L296)

#### Parameters

##### role

[`ProgramRole`](../type-aliases/ProgramRole.md)

#### Returns

`Promise`\<[`RobinhoodRead`](RobinhoodRead.md)\<[`RoleSnapshot`](RoleSnapshot.md)\>\>
