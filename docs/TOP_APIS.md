# Top APIs — `@nakama-health/protocol-sdk`

## Ethereum identity and RPC

- `createEthereumPublicClient(...)`
- `normalizeEthereumAddress(...)`
- `toEthereumMainnetCaip10(...)`
- `parseEthereumMainnetCaip10(...)`
- `ETHEREUM_MAINNET_CHAIN_ID`
- `ETHEREUM_MAINNET_CAIP2`

## Self-custodial wallet requests

- `createEip1193TransactionSigningPayload(...)`
- `createEip712SigningPayload(...)`
- `validateSigningPayloadV2(...)`
- `requestSigningPayloadV2(...)`
- `requestSigningSubmissionV2(...)`
- `createReceiptSubmissionV2(...)`
- `createAuthorizationSubmissionV2(...)`
- `assertEip1193Mainnet(...)`

## Contract and asset safety

- `NAKAMA_COVERAGE_PROTOCOL_ABI`
- `NAKAMA_POLICY_REGISTRY_ABI`
- `NAKAMA_PROTOCOL_FACTORY_ABI`
- `NAKAMA_RESERVE_VAULT_ABI`
- `NAKAMA_COVERAGE_PROTOCOL_ARTIFACT_METADATA`
- `encodeEthereumCalldata(...)`
- `decodeEthereumCalldata(...)`
- `decodeEthereumEventLogs(...)`
- `decodeEthereumRevert(...)`
- `inspectErc20(...)`

## Deployment and finality

- `validateEthereumDeploymentManifest(...)`
- `validateEthereumContractDeployment(...)`
- `verifyEthereumSourcifyDeployment(...)`
- `waitForEthereumReceipt(...)`
- `verifyEthereumReceipt(...)`
- `verifyEthereumTransactionIntent(...)`

## Claim-recipient authorization

- `createClaimRecipientAuthorizationSigningPayload(...)`
- `verifyClaimRecipientAuthorization(...)`
- `verifyAndConsumeClaimRecipientAuthorization(...)`
- `claimRecipientNonceReplayKey(...)`

Generated symbol-level markdown is available at
`docs/generated/api/README.md`. Legacy Solana APIs are documented separately in
`docs/API_REFERENCE.md` for read and migration compatibility only.
