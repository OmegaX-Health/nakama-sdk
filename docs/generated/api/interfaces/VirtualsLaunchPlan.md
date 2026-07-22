[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / VirtualsLaunchPlan

# Interface: VirtualsLaunchPlan

Defined in: [src/robinhood/virtuals.ts:59](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/virtuals.ts#L59)

## Properties

### allocations

> **allocations**: readonly [`VirtualsTokenAllocation`](VirtualsTokenAllocation.md)[]

Defined in: [src/robinhood/virtuals.ts:88](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/virtuals.ts#L88)

***

### assets

> **assets**: readonly [`VirtualsLaunchAsset`](VirtualsLaunchAsset.md)[]

Defined in: [src/robinhood/virtuals.ts:78](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/virtuals.ts#L78)

***

### beneficialOwners

> **beneficialOwners**: readonly [`VirtualsBeneficialOwner`](VirtualsBeneficialOwner.md)[]

Defined in: [src/robinhood/virtuals.ts:86](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/virtuals.ts#L86)

***

### caip2

> **caip2**: `"eip155:4663"`

Defined in: [src/robinhood/virtuals.ts:63](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/virtuals.ts#L63)

***

### chainId

> **chainId**: `4663`

Defined in: [src/robinhood/virtuals.ts:62](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/virtuals.ts#L62)

***

### contracts

> **contracts**: readonly [`VirtualsLaunchContractEvidence`](VirtualsLaunchContractEvidence.md)[]

Defined in: [src/robinhood/virtuals.ts:77](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/virtuals.ts#L77)

***

### fees

> **fees**: `object`

Defined in: [src/robinhood/virtuals.ts:79](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/virtuals.ts#L79)

#### acpFeeRecipientId

> **acpFeeRecipientId**: `string`

#### acpShareBasisPoints

> **acpShareBasisPoints**: `number`

#### creatorFeeRecipientId

> **creatorFeeRecipientId**: `string`

#### creatorShareBasisPoints

> **creatorShareBasisPoints**: `number`

#### tradingFeeBasisPoints

> **tradingFeeBasisPoints**: `number`

***

### finality

> **finality**: `object`

Defined in: [src/robinhood/virtuals.ts:99](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/virtuals.ts#L99)

#### chainHead

> **chainHead**: `bigint`

#### configReadBlock

> **configReadBlock**: `bigint`

#### finalizedBlock

> **finalizedBlock**: `bigint`

#### observedAt

> **observedAt**: `string`

#### safeBlock

> **safeBlock**: `bigint`

#### state

> **state**: `"finalized"`

***

### gates

> **gates**: `object`

Defined in: [src/robinhood/virtuals.ts:70](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/virtuals.ts#L70)

#### legalReviewPassed

> **legalReviewPassed**: `boolean`

#### malaysiaEligibilityResolved

> **malaysiaEligibilityResolved**: `boolean`

#### paidProductEvidencePassed

> **paidProductEvidencePassed**: `boolean`

#### platformEligibilityResolved

> **platformEligibilityResolved**: `boolean`

#### tokenUtilityGatePassed

> **tokenUtilityGatePassed**: `boolean`

***

### launchClass

> **launchClass**: [`VirtualsLaunchClass`](../type-aliases/VirtualsLaunchClass.md)

Defined in: [src/robinhood/virtuals.ts:64](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/virtuals.ts#L64)

***

### network

> **network**: `"mainnet"`

Defined in: [src/robinhood/virtuals.ts:61](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/virtuals.ts#L61)

***

### recipients

> **recipients**: readonly [`VirtualsKnownRecipient`](VirtualsKnownRecipient.md)[]

Defined in: [src/robinhood/virtuals.ts:87](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/virtuals.ts#L87)

***

### schemaVersion

> **schemaVersion**: `1`

Defined in: [src/robinhood/virtuals.ts:60](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/virtuals.ts#L60)

***

### simulation

> **simulation**: `object`

Defined in: [src/robinhood/virtuals.ts:89](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/virtuals.ts#L89)

#### blockHash

> **blockHash**: `` `0x${string}` ``

#### blockNumber

> **blockNumber**: `bigint`

#### chainId

> **chainId**: `4663`

#### configCommitment

> **configCommitment**: `` `0x${string}` ``

#### launchPacketCommitment

> **launchPacketCommitment**: `` `0x${string}` ``

#### passed

> **passed**: `boolean`

#### simulatedAt

> **simulatedAt**: `string`

#### verifiedContractCodeHashes

> **verifiedContractCodeHashes**: readonly `` `0x${string}` ``[]

***

### token

> **token**: `object`

Defined in: [src/robinhood/virtuals.ts:65](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/virtuals.ts#L65)

#### name

> **name**: `string`

#### symbol

> **symbol**: `string`

#### totalSupply

> **totalSupply**: `bigint`
