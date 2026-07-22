[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / decodeVirtualsLaunchPlan

# Function: decodeVirtualsLaunchPlan()

> **decodeVirtualsLaunchPlan**(`input`): [`VirtualsLaunchPlan`](../interfaces/VirtualsLaunchPlan.md)

Defined in: [src/robinhood/virtuals.ts:116](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/virtuals.ts#L116)

Parses and structurally validates a caller-supplied offline packet.

Passing validation does not prove Virtuals approval, legal eligibility,
beneficial-owner verification, or onchain truth. The function never reads a
chain, signs, or broadcasts.

## Parameters

### input

`unknown`

## Returns

[`VirtualsLaunchPlan`](../interfaces/VirtualsLaunchPlan.md)
