[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / RobinhoodPaymasterPolicy

# Interface: RobinhoodPaymasterPolicy

Defined in: [src/robinhood/wallet.ts:276](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L276)

Provider-neutral sponsorship policy. It authorizes quote validation only.

## Properties

### account

> **account**: `` `0x${string}` ``

Defined in: [src/robinhood/wallet.ts:280](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L280)

***

### allowedActions

> **allowedActions**: readonly [`RobinhoodActionName`](../type-aliases/RobinhoodActionName.md)[]

Defined in: [src/robinhood/wallet.ts:282](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L282)

***

### allowedCalls

> **allowedCalls**: readonly `object`[]

Defined in: [src/robinhood/wallet.ts:283](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L283)

***

### maximumSponsoredCallsPerWindow

> **maximumSponsoredCallsPerWindow**: `number`

Defined in: [src/robinhood/wallet.ts:290](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L290)

***

### maximumSponsoredGasPerAction

> **maximumSponsoredGasPerAction**: `bigint`

Defined in: [src/robinhood/wallet.ts:292](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L292)

***

### network

> **network**: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md)

Defined in: [src/robinhood/wallet.ts:278](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L278)

***

### programId

> **programId**: `` `0x${string}` ``

Defined in: [src/robinhood/wallet.ts:281](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L281)

***

### sponsor

> **sponsor**: `` `0x${string}` ``

Defined in: [src/robinhood/wallet.ts:279](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L279)

***

### validAfter

> **validAfter**: `bigint`

Defined in: [src/robinhood/wallet.ts:288](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L288)

***

### validUntil

> **validUntil**: `bigint`

Defined in: [src/robinhood/wallet.ts:289](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L289)

***

### version

> **version**: `1`

Defined in: [src/robinhood/wallet.ts:277](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L277)

***

### windowSeconds

> **windowSeconds**: `number`

Defined in: [src/robinhood/wallet.ts:291](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L291)
