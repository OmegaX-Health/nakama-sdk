[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / RobinhoodPaymasterAdapter

# Interface: RobinhoodPaymasterAdapter

Defined in: [src/robinhood/wallet.ts:418](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L418)

Provider-specific paymaster behavior stays outside product code.

## Properties

### network

> `readonly` **network**: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md)

Defined in: [src/robinhood/wallet.ts:420](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L420)

***

### providerId

> `readonly` **providerId**: `string`

Defined in: [src/robinhood/wallet.ts:419](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L419)

## Methods

### quote()

> **quote**(`params`): `Promise`\<[`RobinhoodPaymasterQuote`](RobinhoodPaymasterQuote.md)\>

Defined in: [src/robinhood/wallet.ts:421](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L421)

#### Parameters

##### params

###### action

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

###### actionCommitment

`` `0x${string}` ``

###### policy

[`RobinhoodPaymasterPolicy`](RobinhoodPaymasterPolicy.md)

###### policyCommitment

`` `0x${string}` ``

#### Returns

`Promise`\<[`RobinhoodPaymasterQuote`](RobinhoodPaymasterQuote.md)\>
