[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / RobinhoodPaymasterAdapter

# Interface: RobinhoodPaymasterAdapter

Defined in: [src/robinhood/wallet.ts:312](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L312)

Provider-specific paymaster behavior stays outside product code.

## Properties

### network

> `readonly` **network**: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md)

Defined in: [src/robinhood/wallet.ts:314](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L314)

***

### providerId

> `readonly` **providerId**: `string`

Defined in: [src/robinhood/wallet.ts:313](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L313)

## Methods

### quote()

> **quote**(`params`): `Promise`\<[`RobinhoodPaymasterQuote`](RobinhoodPaymasterQuote.md)\>

Defined in: [src/robinhood/wallet.ts:315](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L315)

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
