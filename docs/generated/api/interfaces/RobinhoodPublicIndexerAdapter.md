[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / RobinhoodPublicIndexerAdapter

# Interface: RobinhoodPublicIndexerAdapter\<Query, Item\>

Defined in: [src/robinhood/query.ts:36](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/query.ts#L36)

Provider-specific public indexers implement this isolated adapter.

## Type Parameters

### Query

`Query`

### Item

`Item`

## Properties

### network

> `readonly` **network**: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md)

Defined in: [src/robinhood/query.ts:38](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/query.ts#L38)

***

### providerId

> `readonly` **providerId**: `string`

Defined in: [src/robinhood/query.ts:37](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/query.ts#L37)

***

### scope

> `readonly` **scope**: `"public_protocol_state"`

Defined in: [src/robinhood/query.ts:39](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/query.ts#L39)

## Methods

### isRetryable()?

> `optional` **isRetryable**(`error`): `boolean`

Defined in: [src/robinhood/query.ts:45](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/query.ts#L45)

#### Parameters

##### error

`unknown`

#### Returns

`boolean`

***

### queryPage()

> **queryPage**(`params`): `Promise`\<[`RobinhoodIndexerPage`](RobinhoodIndexerPage.md)\<`Item`\>\>

Defined in: [src/robinhood/query.ts:40](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/query.ts#L40)

#### Parameters

##### params

###### cursor

`string` \| `null`

###### limit

`number`

###### query

`Query`

#### Returns

`Promise`\<[`RobinhoodIndexerPage`](RobinhoodIndexerPage.md)\<`Item`\>\>
