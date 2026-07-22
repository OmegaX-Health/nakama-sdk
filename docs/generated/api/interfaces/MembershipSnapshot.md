[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / MembershipSnapshot

# Interface: MembershipSnapshot

Defined in: [src/robinhood/domain.ts:123](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/domain.ts#L123)

## Properties

### account

> **account**: `` `0x${string}` `` \| `null`

Defined in: [src/robinhood/domain.ts:126](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/domain.ts#L126)

***

### activatedAt

> **activatedAt**: `bigint`

Defined in: [src/robinhood/domain.ts:127](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/domain.ts#L127)

***

### expiresAt

> **expiresAt**: `bigint`

Defined in: [src/robinhood/domain.ts:128](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/domain.ts#L128)

***

### memberCommitment

> **memberCommitment**: `` `0x${string}` ``

Defined in: [src/robinhood/domain.ts:125](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/domain.ts#L125)

***

### programId

> **programId**: `` `0x${string}` ``

Defined in: [src/robinhood/domain.ts:124](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/domain.ts#L124)

***

### remainingBenefit

> **remainingBenefit**: [`RobinhoodAssetAmount`](RobinhoodAssetAmount.md)

Defined in: [src/robinhood/domain.ts:130](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/domain.ts#L130)

Current onchain liability remaining; historical consumption needs indexed events.

***

### state

> **state**: [`MembershipState`](../type-aliases/MembershipState.md)

Defined in: [src/robinhood/domain.ts:131](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/domain.ts#L131)
