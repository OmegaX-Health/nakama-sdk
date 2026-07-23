[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / RobinhoodSmartAccountLifecycleClient

# Interface: RobinhoodSmartAccountLifecycleClient

Defined in: [src/robinhood/wallet.ts:352](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L352)

## Properties

### account

> `readonly` **account**: `` `0x${string}` ``

Defined in: [src/robinhood/wallet.ts:355](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L355)

***

### network

> `readonly` **network**: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md)

Defined in: [src/robinhood/wallet.ts:354](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L354)

***

### providerId

> `readonly` **providerId**: `string`

Defined in: [src/robinhood/wallet.ts:353](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L353)

## Methods

### execute()

> **execute**(`request`, `options?`): `Promise`\<`Readonly`\<\{ `account`: `` `0x${string}` ``; `network`: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md); `ownerSignerCommitment`: `` `0x${string}` ``; `passkeyCredentialCommitments`: readonly `` `0x${string}` ``[]; `providerId`: `string`; `recoveryCommitment`: `` `0x${string}` ``; `recoveryEpoch`: `number`; `revision`: `number`; `status`: `"active"` \| `"counterfactual"` \| `"recovery_locked"`; \}\>\>

Defined in: [src/robinhood/wallet.ts:357](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L357)

#### Parameters

##### request

`Omit`\<[`RobinhoodSmartAccountLifecycleRequest`](RobinhoodSmartAccountLifecycleRequest.md), `"requestCommitment"`\>

##### options?

###### now?

`number` \| `bigint` \| `Date`

#### Returns

`Promise`\<`Readonly`\<\{ `account`: `` `0x${string}` ``; `network`: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md); `ownerSignerCommitment`: `` `0x${string}` ``; `passkeyCredentialCommitments`: readonly `` `0x${string}` ``[]; `providerId`: `string`; `recoveryCommitment`: `` `0x${string}` ``; `recoveryEpoch`: `number`; `revision`: `number`; `status`: `"active"` \| `"counterfactual"` \| `"recovery_locked"`; \}\>\>

***

### readState()

> **readState**(): `Promise`\<`Readonly`\<\{ `account`: `` `0x${string}` ``; `network`: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md); `ownerSignerCommitment`: `` `0x${string}` ``; `passkeyCredentialCommitments`: readonly `` `0x${string}` ``[]; `providerId`: `string`; `recoveryCommitment`: `` `0x${string}` ``; `recoveryEpoch`: `number`; `revision`: `number`; `status`: `"active"` \| `"counterfactual"` \| `"recovery_locked"`; \}\>\>

Defined in: [src/robinhood/wallet.ts:356](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L356)

#### Returns

`Promise`\<`Readonly`\<\{ `account`: `` `0x${string}` ``; `network`: [`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md); `ownerSignerCommitment`: `` `0x${string}` ``; `passkeyCredentialCommitments`: readonly `` `0x${string}` ``[]; `providerId`: `string`; `recoveryCommitment`: `` `0x${string}` ``; `recoveryEpoch`: `number`; `revision`: `number`; `status`: `"active"` \| `"counterfactual"` \| `"recovery_locked"`; \}\>\>
