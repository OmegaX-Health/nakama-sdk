[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / RobinhoodSmartAccountLifecycleAction

# Type Alias: RobinhoodSmartAccountLifecycleAction

> **RobinhoodSmartAccountLifecycleAction** = `Readonly`\<\{ `initialPasskeyCredentialCommitment`: `Hex`; `kind`: `"create_account"`; `ownerSignerCommitment`: `Hex`; `recoveryCommitment`: `Hex`; \}\> \| `Readonly`\<\{ `kind`: `"enroll_passkey"`; `passkeyCredentialCommitment`: `Hex`; \}\> \| `Readonly`\<\{ `kind`: `"rotate_signer"`; `nextOwnerSignerCommitment`: `Hex`; \}\> \| `Readonly`\<\{ `kind`: `"recover_account"`; `nextOwnerSignerCommitment`: `Hex`; `nextPasskeyCredentialCommitment`: `Hex`; `recoveryAuthorizationCommitment`: `Hex`; \}\>

Defined in: [src/robinhood/wallet.ts:306](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/wallet.ts#L306)
