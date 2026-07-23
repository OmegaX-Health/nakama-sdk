[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / RobinhoodSmartAccountLifecycleState

# Type Alias: RobinhoodSmartAccountLifecycleState

> **RobinhoodSmartAccountLifecycleState** = `Readonly`\<\{ `account`: `Address`; `network`: [`RobinhoodNetwork`](RobinhoodNetwork.md); `ownerSignerCommitment`: `Hex`; `passkeyCredentialCommitments`: readonly `Hex`[]; `providerId`: `string`; `recoveryCommitment`: `Hex`; `recoveryEpoch`: `number`; `revision`: `number`; `status`: `"counterfactual"` \| `"active"` \| `"recovery_locked"`; \}\>

Defined in: [src/robinhood/wallet.ts:294](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L294)
