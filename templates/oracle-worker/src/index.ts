import {
  claimRecipientNonceReplayKey,
  createClaimRecipientAuthorizationSigningPayload,
  hashClaimRecipientAuthorization,
  normalizeEthereumAddress,
} from '@nakama-health/protocol-sdk';

const payload = createClaimRecipientAuthorizationSigningPayload({
  account:
    process.env.CLAIMANT_ADDRESS ??
    '0x0000000000000000000000000000000000000001',
  verifyingContract:
    process.env.POLICY_REGISTRY_ADDRESS ??
    '0x0000000000000000000000000000000000000002',
  message: {
    claimId: `0x${'11'.repeat(32)}` as `0x${string}`,
    recipient: normalizeEthereumAddress(
      process.env.RECIPIENT_ADDRESS ??
        '0x0000000000000000000000000000000000000003',
    ),
    nonce: 0n,
    deadline: 2_000_000_000n,
  },
});

console.log(
  JSON.stringify(
    {
      ok: true,
      role: 'claim-authorization-relayer',
      chainId: payload.chainId,
      claimant: payload.accountId,
      digest: hashClaimRecipientAuthorization(payload.typedData),
      nonceReplayKey: claimRecipientNonceReplayKey(payload.typedData),
      next: 'Ask the claimant wallet to sign with eth_signTypedData_v4.',
    },
    null,
    2,
  ),
);
