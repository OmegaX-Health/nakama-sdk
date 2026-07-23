[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / RobinhoodSmartAccountClient

# Interface: RobinhoodSmartAccountClient

Defined in: [src/robinhood/wallet.ts:458](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L458)

## Properties

### account

> `readonly` **account**: `` `0x${string}` ``

Defined in: [src/robinhood/wallet.ts:461](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L461)

***

### network

> `readonly` **network**: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md)

Defined in: [src/robinhood/wallet.ts:459](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L459)

***

### policy

> `readonly` **policy**: [`RobinhoodSmartAccountPolicy`](RobinhoodSmartAccountPolicy.md)

Defined in: [src/robinhood/wallet.ts:462](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L462)

***

### providerId

> `readonly` **providerId**: `string`

Defined in: [src/robinhood/wallet.ts:460](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L460)

## Methods

### simulate()

> **simulate**(`action`): `Promise`\<[`RobinhoodActionSimulation`](RobinhoodActionSimulation.md)\>

Defined in: [src/robinhood/wallet.ts:463](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L463)

#### Parameters

##### action

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

#### Returns

`Promise`\<[`RobinhoodActionSimulation`](RobinhoodActionSimulation.md)\>

***

### submit()

> **submit**(`action`): `Promise`\<[`RobinhoodSmartAccountSubmission`](RobinhoodSmartAccountSubmission.md)\>

Defined in: [src/robinhood/wallet.ts:464](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L464)

#### Parameters

##### action

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

#### Returns

`Promise`\<[`RobinhoodSmartAccountSubmission`](RobinhoodSmartAccountSubmission.md)\>
