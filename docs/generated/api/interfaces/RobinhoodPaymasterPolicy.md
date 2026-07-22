[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / RobinhoodPaymasterPolicy

# Interface: RobinhoodPaymasterPolicy

Defined in: [src/robinhood/wallet.ts:271](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L271)

Provider-neutral sponsorship policy. It authorizes quote validation only.

## Properties

### account

> **account**: `` `0x${string}` ``

Defined in: [src/robinhood/wallet.ts:275](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L275)

***

### allowedActions

> **allowedActions**: readonly [`RobinhoodActionName`](../type-aliases/RobinhoodActionName.md)[]

Defined in: [src/robinhood/wallet.ts:277](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L277)

***

### allowedCalls

> **allowedCalls**: readonly `object`[]

Defined in: [src/robinhood/wallet.ts:278](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L278)

***

### maximumSponsoredCallsPerWindow

> **maximumSponsoredCallsPerWindow**: `number`

Defined in: [src/robinhood/wallet.ts:285](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L285)

***

### maximumSponsoredGasPerAction

> **maximumSponsoredGasPerAction**: `bigint`

Defined in: [src/robinhood/wallet.ts:287](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L287)

***

### network

> **network**: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md)

Defined in: [src/robinhood/wallet.ts:273](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L273)

***

### programId

> **programId**: `` `0x${string}` ``

Defined in: [src/robinhood/wallet.ts:276](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L276)

***

### sponsor

> **sponsor**: `` `0x${string}` ``

Defined in: [src/robinhood/wallet.ts:274](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L274)

***

### validAfter

> **validAfter**: `bigint`

Defined in: [src/robinhood/wallet.ts:283](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L283)

***

### validUntil

> **validUntil**: `bigint`

Defined in: [src/robinhood/wallet.ts:284](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L284)

***

### version

> **version**: `1`

Defined in: [src/robinhood/wallet.ts:272](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L272)

***

### windowSeconds

> **windowSeconds**: `number`

Defined in: [src/robinhood/wallet.ts:286](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L286)
