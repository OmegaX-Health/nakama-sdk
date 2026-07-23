[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / collectRobinhoodIndexerPages

# Function: collectRobinhoodIndexerPages()

> **collectRobinhoodIndexerPages**\<`Query`, `Item`\>(`params`): `Promise`\<[`RobinhoodIndexerCollection`](../interfaces/RobinhoodIndexerCollection.md)\<`Item`\>\>

Defined in: [src/robinhood/query.ts:71](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/query.ts#L71)

## Type Parameters

### Query

`Query`

### Item

`Item`

## Parameters

### params

#### adapter

[`RobinhoodPublicIndexerAdapter`](../interfaces/RobinhoodPublicIndexerAdapter.md)\<`Query`, `Item`\>

#### maximumPages?

`number`

#### maximumRetriesPerPage?

`number`

#### pageSize?

`number`

#### query

`Query`

#### waitBeforeRetry?

(`attempt`) => `Promise`\<`void`\>

## Returns

`Promise`\<[`RobinhoodIndexerCollection`](../interfaces/RobinhoodIndexerCollection.md)\<`Item`\>\>
