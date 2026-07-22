import {
  claimRecipientNonceReplayKey,
  createClaimRecipientAuthorizationSigningPayload,
  hashClaimRecipientAuthorization,
} from '@nakama-health/protocol-sdk/ethereum_oracle';

const payload = createClaimRecipientAuthorizationSigningPayload({
  account: '0x0000000000000000000000000000000000000001',
  // ClaimRecipient EIP-712 signatures are verified by NakamaPolicyRegistry.
  verifyingContract: '0x0000000000000000000000000000000000000002',
  message: {
    claimId: `0x${'11'.repeat(32)}` as `0x${string}`,
    recipient: '0x0000000000000000000000000000000000000003',
    nonce: 0n,
    deadline: 2_000_000_000n,
  },
});

console.log(
  JSON.stringify(
    {
      ok: true,
      kind: payload.kind,
      chainId: payload.chainId,
      accountId: payload.accountId,
      digest: hashClaimRecipientAuthorization(payload.typedData),
      nonceReplayKey: claimRecipientNonceReplayKey(payload.typedData),
      walletMethod: 'eth_signTypedData_v4',
    },
    null,
    2,
  ),
);
