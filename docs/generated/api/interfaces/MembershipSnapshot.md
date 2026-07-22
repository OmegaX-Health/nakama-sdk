[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / MembershipSnapshot

# Interface: MembershipSnapshot

Defined in: src/robinhood/domain.ts:123

## Properties

### account

> **account**: `` `0x${string}` `` \| `null`

Defined in: src/robinhood/domain.ts:126

***

### activatedAt

> **activatedAt**: `bigint`

Defined in: src/robinhood/domain.ts:127

***

### expiresAt

> **expiresAt**: `bigint`

Defined in: src/robinhood/domain.ts:128

***

### memberCommitment

> **memberCommitment**: `` `0x${string}` ``

Defined in: src/robinhood/domain.ts:125

***

### programId

> **programId**: `` `0x${string}` ``

Defined in: src/robinhood/domain.ts:124

***

### remainingBenefit

> **remainingBenefit**: [`RobinhoodAssetAmount`](RobinhoodAssetAmount.md)

Defined in: src/robinhood/domain.ts:130

Current onchain liability remaining; historical consumption needs indexed events.

***

### state

> **state**: [`MembershipState`](../type-aliases/MembershipState.md)

Defined in: src/robinhood/domain.ts:131
