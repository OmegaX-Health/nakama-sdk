[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / RobinhoodSmartAccountClient

# Interface: RobinhoodSmartAccountClient

Defined in: src/robinhood/wallet.ts:267

## Properties

### account

> `readonly` **account**: `` `0x${string}` ``

Defined in: src/robinhood/wallet.ts:269

***

### network

> `readonly` **network**: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md)

Defined in: src/robinhood/wallet.ts:268

***

### policy

> `readonly` **policy**: [`RobinhoodSmartAccountPolicy`](RobinhoodSmartAccountPolicy.md)

Defined in: src/robinhood/wallet.ts:270

## Methods

### simulate()

> **simulate**(`action`): `Promise`\<[`RobinhoodActionSimulation`](RobinhoodActionSimulation.md)\>

Defined in: src/robinhood/wallet.ts:271

#### Parameters

##### action

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

#### Returns

`Promise`\<[`RobinhoodActionSimulation`](RobinhoodActionSimulation.md)\>

***

### submit()

> **submit**(`action`): `Promise`\<[`RobinhoodSmartAccountSubmission`](RobinhoodSmartAccountSubmission.md)\>

Defined in: src/robinhood/wallet.ts:272

#### Parameters

##### action

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

#### Returns

`Promise`\<[`RobinhoodSmartAccountSubmission`](RobinhoodSmartAccountSubmission.md)\>
