[**@omegax/protocol-sdk**](../README.md)

***

[@omegax/protocol-sdk](../README.md) / RpcClient

# Interface: RpcClient

Defined in: [src/types.ts:256](https://github.com/OmegaX-Health/omegax-sdk/blob/18eba6eebb5b732fec0b45b896a6b09b9c0e3cbc/src/types.ts#L256)

## Methods

### broadcastSignedTx()

> **broadcastSignedTx**(`params`): `Promise`\<[`BroadcastSignedTxResult`](BroadcastSignedTxResult.md)\>

Defined in: [src/types.ts:258](https://github.com/OmegaX-Health/omegax-sdk/blob/18eba6eebb5b732fec0b45b896a6b09b9c0e3cbc/src/types.ts#L258)

#### Parameters

##### params

[`BroadcastSignedTxParams`](BroadcastSignedTxParams.md)

#### Returns

`Promise`\<[`BroadcastSignedTxResult`](BroadcastSignedTxResult.md)\>

***

### getRecentBlockhash()

> **getRecentBlockhash**(): `Promise`\<`string`\>

Defined in: [src/types.ts:257](https://github.com/OmegaX-Health/omegax-sdk/blob/18eba6eebb5b732fec0b45b896a6b09b9c0e3cbc/src/types.ts#L257)

#### Returns

`Promise`\<`string`\>

***

### getSignatureStatus()

> **getSignatureStatus**(`params`): `Promise`\<[`GetSignatureStatusResult`](GetSignatureStatusResult.md)\>

Defined in: [src/types.ts:264](https://github.com/OmegaX-Health/omegax-sdk/blob/18eba6eebb5b732fec0b45b896a6b09b9c0e3cbc/src/types.ts#L264)

#### Parameters

##### params

[`GetSignatureStatusParams`](GetSignatureStatusParams.md)

#### Returns

`Promise`\<[`GetSignatureStatusResult`](GetSignatureStatusResult.md)\>

***

### simulateSignedTx()

> **simulateSignedTx**(`params`): `Promise`\<[`SimulateSignedTxResult`](SimulateSignedTxResult.md)\>

Defined in: [src/types.ts:261](https://github.com/OmegaX-Health/omegax-sdk/blob/18eba6eebb5b732fec0b45b896a6b09b9c0e3cbc/src/types.ts#L261)

#### Parameters

##### params

[`SimulateSignedTxParams`](SimulateSignedTxParams.md)

#### Returns

`Promise`\<[`SimulateSignedTxResult`](SimulateSignedTxResult.md)\>
