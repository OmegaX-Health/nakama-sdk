[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / RobinhoodSmartAccountClient

# Interface: RobinhoodSmartAccountClient

Defined in: [src/robinhood/wallet.ts:348](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L348)

## Properties

### account

> `readonly` **account**: `` `0x${string}` ``

Defined in: [src/robinhood/wallet.ts:350](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L350)

***

### network

> `readonly` **network**: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md)

Defined in: [src/robinhood/wallet.ts:349](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L349)

***

### policy

> `readonly` **policy**: [`RobinhoodSmartAccountPolicy`](RobinhoodSmartAccountPolicy.md)

Defined in: [src/robinhood/wallet.ts:351](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L351)

## Methods

### simulate()

> **simulate**(`action`): `Promise`\<[`RobinhoodActionSimulation`](RobinhoodActionSimulation.md)\>

Defined in: [src/robinhood/wallet.ts:352](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L352)

#### Parameters

##### action

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

#### Returns

`Promise`\<[`RobinhoodActionSimulation`](RobinhoodActionSimulation.md)\>

***

### submit()

> **submit**(`action`): `Promise`\<[`RobinhoodSmartAccountSubmission`](RobinhoodSmartAccountSubmission.md)\>

Defined in: [src/robinhood/wallet.ts:353](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L353)

#### Parameters

##### action

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

#### Returns

`Promise`\<[`RobinhoodSmartAccountSubmission`](RobinhoodSmartAccountSubmission.md)\>
