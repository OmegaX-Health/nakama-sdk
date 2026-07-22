import {
  ETHEREUM_MAINNET_CAIP2,
  ETHEREUM_MAINNET_CHAIN_ID,
  NAKAMA_ETHEREUM_MAINNET_DEPLOYMENT,
  NAKAMA_POLICY_REGISTRY_ABI,
  NAKAMA_POLICY_REGISTRY_ARTIFACT_METADATA,
} from '@nakama-health/protocol-sdk';
import { NakamaEthereumAddressError } from '@nakama-health/protocol-sdk/errors';
import {
  createEthereumPublicClient,
  normalizeEthereumAddress,
  toEthereumMainnetCaip10,
} from '@nakama-health/protocol-sdk/ethereum';
import {
  decodeEthereumCalldata,
  encodeEthereumCalldata,
  validateEthereumDeploymentManifest,
} from '@nakama-health/protocol-sdk/ethereum_contract';
import {
  claimRecipientNonceReplayKey,
  createClaimRecipientAuthorizationSigningPayload,
  hashClaimRecipientAuthorization,
} from '@nakama-health/protocol-sdk/ethereum_oracle';

const client = createEthereumPublicClient();
const deployment = validateEthereumDeploymentManifest(
  NAKAMA_ETHEREUM_MAINNET_DEPLOYMENT,
);
const claimant = '0x0000000000000000000000000000000000000001';
const calldata = encodeEthereumCalldata({
  abi: NAKAMA_POLICY_REGISTRY_ABI,
  functionName: 'deriveClaimId',
  args: [`0x${'11'.repeat(32)}`, claimant, `0x${'22'.repeat(32)}`],
});
const decoded = decodeEthereumCalldata({
  abi: NAKAMA_POLICY_REGISTRY_ABI,
  data: calldata,
});
const signingPayload = createClaimRecipientAuthorizationSigningPayload({
  account: claimant,
  verifyingContract: '0x0000000000000000000000000000000000000002',
  message: {
    claimId: `0x${'33'.repeat(32)}` as `0x${string}`,
    recipient: '0x0000000000000000000000000000000000000003',
    nonce: 0n,
    deadline: 2_000_000_000n,
  },
});

let typedErrorBranchWorked = false;
try {
  normalizeEthereumAddress('not-an-ethereum-address');
} catch (error) {
  typedErrorBranchWorked =
    error instanceof NakamaEthereumAddressError &&
    error.code === 'NAKAMA_ETHEREUM_ADDRESS_ERROR';
}
if (!typedErrorBranchWorked) {
  throw new Error('Expected invalid address failure to use a typed error.');
}

console.log(
  JSON.stringify(
    {
      ok: true,
      packageImport: '@nakama-health/protocol-sdk',
      chainId: ETHEREUM_MAINNET_CHAIN_ID,
      clientChainId: client.chain?.id,
      caip2: ETHEREUM_MAINNET_CAIP2,
      claimant: toEthereumMainnetCaip10(claimant),
      deploymentStatus: deployment.status,
      policyRegistryAddress: deployment.liveContracts.policyRegistry.address,
      runtimeBytecodeTemplateHash:
        NAKAMA_POLICY_REGISTRY_ARTIFACT_METADATA.runtimeBytecodeTemplateHash,
      decodedFunction: decoded.functionName,
      typedErrorBranchWorked,
      authorizationDigest: hashClaimRecipientAuthorization(
        signingPayload.typedData,
      ),
      nonceReplayKey: claimRecipientNonceReplayKey(signingPayload.typedData),
    },
    null,
    2,
  ),
);
