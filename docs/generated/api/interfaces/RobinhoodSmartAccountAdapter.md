[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / RobinhoodSmartAccountAdapter

# Interface: RobinhoodSmartAccountAdapter

Defined in: [src/robinhood/wallet.ts:339](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L339)

Provider-specific account implementation isolated from product code.

## Properties

### account

> `readonly` **account**: `` `0x${string}` ``

Defined in: [src/robinhood/wallet.ts:341](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L341)

***

### network

> `readonly` **network**: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md)

Defined in: [src/robinhood/wallet.ts:340](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L340)

## Methods

### simulate()

> **simulate**(`params`): `Promise`\<[`RobinhoodActionSimulation`](RobinhoodActionSimulation.md)\>

Defined in: [src/robinhood/wallet.ts:342](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L342)

#### Parameters

##### params

###### action

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

###### policy

[`RobinhoodSmartAccountPolicy`](RobinhoodSmartAccountPolicy.md)

#### Returns

`Promise`\<[`RobinhoodActionSimulation`](RobinhoodActionSimulation.md)\>
