[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / RobinhoodSmartAccountAdapter

# Interface: RobinhoodSmartAccountAdapter

Defined in: src/robinhood/wallet.ts:258

Provider-specific account implementation isolated from product code.

## Properties

### account

> `readonly` **account**: `` `0x${string}` ``

Defined in: src/robinhood/wallet.ts:260

***

### network

> `readonly` **network**: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md)

Defined in: src/robinhood/wallet.ts:259

## Methods

### simulate()

> **simulate**(`params`): `Promise`\<[`RobinhoodActionSimulation`](RobinhoodActionSimulation.md)\>

Defined in: src/robinhood/wallet.ts:261

#### Parameters

##### params

###### action

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

###### policy

[`RobinhoodSmartAccountPolicy`](RobinhoodSmartAccountPolicy.md)

#### Returns

`Promise`\<[`RobinhoodActionSimulation`](RobinhoodActionSimulation.md)\>
