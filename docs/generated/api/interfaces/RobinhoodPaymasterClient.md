[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / RobinhoodPaymasterClient

# Interface: RobinhoodPaymasterClient

Defined in: [src/robinhood/wallet.ts:323](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L323)

## Properties

### network

> `readonly` **network**: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md)

Defined in: [src/robinhood/wallet.ts:325](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L325)

***

### policy

> `readonly` **policy**: [`RobinhoodPaymasterPolicy`](RobinhoodPaymasterPolicy.md)

Defined in: [src/robinhood/wallet.ts:326](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L326)

***

### providerId

> `readonly` **providerId**: `string`

Defined in: [src/robinhood/wallet.ts:324](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L324)

## Methods

### quote()

> **quote**(`action`, `options?`): `Promise`\<[`RobinhoodPaymasterQuote`](RobinhoodPaymasterQuote.md)\>

Defined in: [src/robinhood/wallet.ts:327](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L327)

#### Parameters

##### action

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

##### options?

###### now?

`number` \| `bigint` \| `Date`

#### Returns

`Promise`\<[`RobinhoodPaymasterQuote`](RobinhoodPaymasterQuote.md)\>
