[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / RobinhoodPaymasterAdapter

# Interface: RobinhoodPaymasterAdapter

Defined in: [src/robinhood/wallet.ts:317](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L317)

Provider-specific paymaster behavior stays outside product code.

## Properties

### network

> `readonly` **network**: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md)

Defined in: [src/robinhood/wallet.ts:319](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L319)

***

### providerId

> `readonly` **providerId**: `string`

Defined in: [src/robinhood/wallet.ts:318](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L318)

## Methods

### quote()

> **quote**(`params`): `Promise`\<[`RobinhoodPaymasterQuote`](RobinhoodPaymasterQuote.md)\>

Defined in: [src/robinhood/wallet.ts:320](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L320)

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
