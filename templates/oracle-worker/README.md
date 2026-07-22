# Nakama Claim Authorization Relayer Starter

Builds the policy registry's exact Ethereum mainnet `ClaimRecipient` EIP-712 payload,
digest, and replay key. The starter never handles a private key; the claimant's
EIP-1193 wallet signs, and a production relayer must use a durable atomic replay
store before submission.

Set `POLICY_REGISTRY_ADDRESS` to the published
`liveContracts.policyRegistry.address`; the core protocol address is not the
EIP-712 verifying contract.

```bash
npm install
npm run typecheck
npm run build
npm run smoke
```
