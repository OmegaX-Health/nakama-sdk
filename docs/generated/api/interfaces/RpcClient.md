[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / RpcClient

# Interface: RpcClient

Defined in: [src/types.ts:184](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/types.ts#L184)

## Methods

### broadcastSignedTx()

> **broadcastSignedTx**(`params`): `Promise`\<[`BroadcastSignedTxResult`](BroadcastSignedTxResult.md)\>

Defined in: [src/types.ts:186](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/types.ts#L186)

#### Parameters

##### params

[`BroadcastSignedTxParams`](BroadcastSignedTxParams.md)

#### Returns

`Promise`\<[`BroadcastSignedTxResult`](BroadcastSignedTxResult.md)\>

***

### getRecentBlockhash()

> **getRecentBlockhash**(): `Promise`\<`string`\>

Defined in: [src/types.ts:185](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/types.ts#L185)

#### Returns

`Promise`\<`string`\>

***

### getSignatureStatus()

> **getSignatureStatus**(`params`): `Promise`\<[`GetSignatureStatusResult`](GetSignatureStatusResult.md)\>

Defined in: [src/types.ts:192](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/types.ts#L192)

#### Parameters

##### params

[`GetSignatureStatusParams`](GetSignatureStatusParams.md)

#### Returns

`Promise`\<[`GetSignatureStatusResult`](GetSignatureStatusResult.md)\>

***

### simulateSignedTx()

> **simulateSignedTx**(`params`): `Promise`\<[`SimulateSignedTxResult`](SimulateSignedTxResult.md)\>

Defined in: [src/types.ts:189](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/types.ts#L189)

#### Parameters

##### params

[`SimulateSignedTxParams`](SimulateSignedTxParams.md)

#### Returns

`Promise`\<[`SimulateSignedTxResult`](SimulateSignedTxResult.md)\>
