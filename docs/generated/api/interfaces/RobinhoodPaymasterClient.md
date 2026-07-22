[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / RobinhoodPaymasterClient

# Interface: RobinhoodPaymasterClient

Defined in: [src/robinhood/wallet.ts:328](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L328)

## Properties

### network

> `readonly` **network**: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md)

Defined in: [src/robinhood/wallet.ts:330](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L330)

***

### policy

> `readonly` **policy**: [`RobinhoodPaymasterPolicy`](RobinhoodPaymasterPolicy.md)

Defined in: [src/robinhood/wallet.ts:331](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L331)

***

### providerId

> `readonly` **providerId**: `string`

Defined in: [src/robinhood/wallet.ts:329](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L329)

## Methods

### quote()

> **quote**(`action`, `options?`): `Promise`\<[`RobinhoodPaymasterQuote`](RobinhoodPaymasterQuote.md)\>

Defined in: [src/robinhood/wallet.ts:332](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L332)

#### Parameters

##### action

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

##### options?

###### now?

`number` \| `bigint` \| `Date`

#### Returns

`Promise`\<[`RobinhoodPaymasterQuote`](RobinhoodPaymasterQuote.md)\>
