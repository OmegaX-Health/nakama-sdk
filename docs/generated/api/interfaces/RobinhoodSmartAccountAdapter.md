[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / RobinhoodSmartAccountAdapter

# Interface: RobinhoodSmartAccountAdapter

Defined in: [src/robinhood/wallet.ts:334](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L334)

Provider-specific account implementation isolated from product code.

## Properties

### account

> `readonly` **account**: `` `0x${string}` ``

Defined in: [src/robinhood/wallet.ts:336](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L336)

***

### network

> `readonly` **network**: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md)

Defined in: [src/robinhood/wallet.ts:335](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L335)

## Methods

### simulate()

> **simulate**(`params`): `Promise`\<[`RobinhoodActionSimulation`](RobinhoodActionSimulation.md)\>

Defined in: [src/robinhood/wallet.ts:337](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L337)

#### Parameters

##### params

###### action

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

###### policy

[`RobinhoodSmartAccountPolicy`](RobinhoodSmartAccountPolicy.md)

#### Returns

`Promise`\<[`RobinhoodActionSimulation`](RobinhoodActionSimulation.md)\>
