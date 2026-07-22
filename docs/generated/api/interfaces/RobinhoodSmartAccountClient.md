[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / RobinhoodSmartAccountClient

# Interface: RobinhoodSmartAccountClient

Defined in: [src/robinhood/wallet.ts:343](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L343)

## Properties

### account

> `readonly` **account**: `` `0x${string}` ``

Defined in: [src/robinhood/wallet.ts:345](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L345)

***

### network

> `readonly` **network**: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md)

Defined in: [src/robinhood/wallet.ts:344](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L344)

***

### policy

> `readonly` **policy**: [`RobinhoodSmartAccountPolicy`](RobinhoodSmartAccountPolicy.md)

Defined in: [src/robinhood/wallet.ts:346](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L346)

## Methods

### simulate()

> **simulate**(`action`): `Promise`\<[`RobinhoodActionSimulation`](RobinhoodActionSimulation.md)\>

Defined in: [src/robinhood/wallet.ts:347](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L347)

#### Parameters

##### action

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

#### Returns

`Promise`\<[`RobinhoodActionSimulation`](RobinhoodActionSimulation.md)\>

***

### submit()

> **submit**(`action`): `Promise`\<[`RobinhoodSmartAccountSubmission`](RobinhoodSmartAccountSubmission.md)\>

Defined in: [src/robinhood/wallet.ts:348](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L348)

#### Parameters

##### action

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

#### Returns

`Promise`\<[`RobinhoodSmartAccountSubmission`](RobinhoodSmartAccountSubmission.md)\>
