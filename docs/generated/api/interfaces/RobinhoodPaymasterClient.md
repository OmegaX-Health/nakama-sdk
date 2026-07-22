[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / RobinhoodPaymasterClient

# Interface: RobinhoodPaymasterClient

Defined in: [src/robinhood/wallet.ts:429](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L429)

## Properties

### network

> `readonly` **network**: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md)

Defined in: [src/robinhood/wallet.ts:431](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L431)

***

### policy

> `readonly` **policy**: [`RobinhoodPaymasterPolicy`](RobinhoodPaymasterPolicy.md)

Defined in: [src/robinhood/wallet.ts:432](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L432)

***

### providerId

> `readonly` **providerId**: `string`

Defined in: [src/robinhood/wallet.ts:430](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L430)

## Methods

### quote()

> **quote**(`action`, `options?`): `Promise`\<[`RobinhoodPaymasterQuote`](RobinhoodPaymasterQuote.md)\>

Defined in: [src/robinhood/wallet.ts:433](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L433)

#### Parameters

##### action

[`PreparedRobinhoodAction`](PreparedRobinhoodAction.md)

##### options?

###### now?

`number` \| `bigint` \| `Date`

#### Returns

`Promise`\<[`RobinhoodPaymasterQuote`](RobinhoodPaymasterQuote.md)\>
