[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / RobinhoodSmartAccountLifecycleAdapter

# Interface: RobinhoodSmartAccountLifecycleAdapter

Defined in: [src/robinhood/wallet.ts:341](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L341)

## Properties

### account

> `readonly` **account**: `` `0x${string}` ``

Defined in: [src/robinhood/wallet.ts:344](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L344)

***

### network

> `readonly` **network**: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md)

Defined in: [src/robinhood/wallet.ts:343](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L343)

***

### providerId

> `readonly` **providerId**: `string`

Defined in: [src/robinhood/wallet.ts:342](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L342)

## Methods

### execute()

> **execute**(`request`): `Promise`\<`Readonly`\<\{ `account`: `` `0x${string}` ``; `network`: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md); `ownerSignerCommitment`: `` `0x${string}` ``; `passkeyCredentialCommitments`: readonly `` `0x${string}` ``[]; `providerId`: `string`; `recoveryCommitment`: `` `0x${string}` ``; `recoveryEpoch`: `number`; `revision`: `number`; `status`: `"active"` \| `"counterfactual"` \| `"recovery_locked"`; \}\>\>

Defined in: [src/robinhood/wallet.ts:347](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L347)

Must atomically enforce requestCommitment and expectedRevision.

#### Parameters

##### request

[`RobinhoodSmartAccountLifecycleRequest`](RobinhoodSmartAccountLifecycleRequest.md)

#### Returns

`Promise`\<`Readonly`\<\{ `account`: `` `0x${string}` ``; `network`: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md); `ownerSignerCommitment`: `` `0x${string}` ``; `passkeyCredentialCommitments`: readonly `` `0x${string}` ``[]; `providerId`: `string`; `recoveryCommitment`: `` `0x${string}` ``; `recoveryEpoch`: `number`; `revision`: `number`; `status`: `"active"` \| `"counterfactual"` \| `"recovery_locked"`; \}\>\>

***

### readState()

> **readState**(): `Promise`\<`Readonly`\<\{ `account`: `` `0x${string}` ``; `network`: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md); `ownerSignerCommitment`: `` `0x${string}` ``; `passkeyCredentialCommitments`: readonly `` `0x${string}` ``[]; `providerId`: `string`; `recoveryCommitment`: `` `0x${string}` ``; `recoveryEpoch`: `number`; `revision`: `number`; `status`: `"active"` \| `"counterfactual"` \| `"recovery_locked"`; \}\>\>

Defined in: [src/robinhood/wallet.ts:345](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L345)

#### Returns

`Promise`\<`Readonly`\<\{ `account`: `` `0x${string}` ``; `network`: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md); `ownerSignerCommitment`: `` `0x${string}` ``; `passkeyCredentialCommitments`: readonly `` `0x${string}` ``[]; `providerId`: `string`; `recoveryCommitment`: `` `0x${string}` ``; `recoveryEpoch`: `number`; `revision`: `number`; `status`: `"active"` \| `"counterfactual"` \| `"recovery_locked"`; \}\>\>
