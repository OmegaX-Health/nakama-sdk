[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / RobinhoodSmartAccountAdapter

# Interface: RobinhoodSmartAccountAdapter

Defined in: [src/robinhood/wallet.ts:440](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L440)

Provider-specific account implementation isolated from product code.

## Properties

### account

> `readonly` **account**: `` `0x${string}` ``

Defined in: [src/robinhood/wallet.ts:443](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L443)

***

### network

> `readonly` **network**: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md)

Defined in: [src/robinhood/wallet.ts:442](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L442)

***

### providerId

> `readonly` **providerId**: `string`

Defined in: [src/robinhood/wallet.ts:441](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L441)

## Methods

### simulate()

> **simulate**(`params`): `Promise`\<[`RobinhoodActionSimulation`](RobinhoodActionSimulation.md)\>

Defined in: [src/robinhood/wallet.ts:444](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L444)

#### Parameters

##### params

###### action

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

###### policy

[`RobinhoodSmartAccountPolicy`](RobinhoodSmartAccountPolicy.md)

#### Returns

`Promise`\<[`RobinhoodActionSimulation`](RobinhoodActionSimulation.md)\>

***

### submit()

> **submit**(`params`): `Promise`\<[`RobinhoodSmartAccountSubmission`](RobinhoodSmartAccountSubmission.md)\>

Defined in: [src/robinhood/wallet.ts:449](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L449)

Submit only the exact action and simulation supplied by the SDK client.

#### Parameters

##### params

###### action

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

###### actionCommitment

`` `0x${string}` ``

###### policy

[`RobinhoodSmartAccountPolicy`](RobinhoodSmartAccountPolicy.md)

###### runtime

[`VerifiedRobinhoodSmartAccountRuntime`](VerifiedRobinhoodSmartAccountRuntime.md)

###### simulation

[`RobinhoodActionSimulation`](RobinhoodActionSimulation.md)

#### Returns

`Promise`\<[`RobinhoodSmartAccountSubmission`](RobinhoodSmartAccountSubmission.md)\>
