[**@omegax/protocol-sdk**](../README.md)

***

[@omegax/protocol-sdk](../README.md) / RewardSummary

# Type Alias: RewardSummary

> **RewardSummary** = `object`

Defined in: [src/types.ts:57](https://github.com/OmegaX-Health/omegax-sdk/blob/18eba6eebb5b732fec0b45b896a6b09b9c0e3cbc/src/types.ts#L57)

## Properties

### cycle

> **cycle**: `object`

Defined in: [src/types.ts:63](https://github.com/OmegaX-Health/omegax-sdk/blob/18eba6eebb5b732fec0b45b896a6b09b9c0e3cbc/src/types.ts#L63)

#### endIso

> **endIso**: `string`

#### id

> **id**: `string`

#### outcomesPassed

> **outcomesPassed**: `number`

#### outcomesTotal

> **outcomesTotal**: `number`

#### primaryGoalId

> **primaryGoalId**: `string` \| `null`

#### startIso

> **startIso**: `string`

#### status

> **status**: `"active"` \| `"completed"` \| `"abandoned"` \| `"paused"`

***

### rewards

> **rewards**: `object`

Defined in: [src/types.ts:72](https://github.com/OmegaX-Health/omegax-sdk/blob/18eba6eebb5b732fec0b45b896a6b09b9c0e3cbc/src/types.ts#L72)

#### asset

> **asset**: `string`

#### claimableRaw

> **claimableRaw**: `string`

#### claimableUi

> **claimableUi**: `string`

#### errorCode?

> `optional` **errorCode?**: `string` \| `null`

#### errorMessage?

> `optional` **errorMessage?**: `string` \| `null`

#### status

> **status**: `"eligible"` \| `"not_eligible"` \| `"pending"` \| `"claimed"` \| `"failed"`

***

### wallet

> **wallet**: `object`

Defined in: [src/types.ts:58](https://github.com/OmegaX-Health/omegax-sdk/blob/18eba6eebb5b732fec0b45b896a6b09b9c0e3cbc/src/types.ts#L58)

#### address

> **address**: `string` \| `null`

#### connected

> **connected**: `boolean`

#### provider

> **provider**: `string` \| `null`
