import {
  ETHEREUM_MAINNET_CAIP2,
  ETHEREUM_MAINNET_CHAIN_ID,
  NAKAMA_ETHEREUM_MAINNET_DEPLOYMENT,
  NAKAMA_ETHEREUM_CONTRACT_ARTIFACT_METADATA,
  validateEthereumDeploymentManifest,
} from '@nakama-health/protocol-sdk';

export function buildNakamaStatus() {
  const deployment = validateEthereumDeploymentManifest(
    NAKAMA_ETHEREUM_MAINNET_DEPLOYMENT,
  );

  return {
    ok: true,
    role: 'health-app-route',
    chainId: ETHEREUM_MAINNET_CHAIN_ID,
    caip2: ETHEREUM_MAINNET_CAIP2,
    entryContract: deployment.entryContract,
    deploymentStatus: deployment.status,
    factoryAddress: deployment.liveContracts.factory.address,
    policyRegistryAddress: deployment.liveContracts.policyRegistry.address,
    protocolAddress: deployment.liveContracts.protocol.address,
    contracts: Object.fromEntries(
      Object.entries(NAKAMA_ETHEREUM_CONTRACT_ARTIFACT_METADATA).map(
        ([contractName, metadata]) => [
          contractName,
          {
            abiSha256: metadata.abiSha256,
            creationBytecodeBytes: metadata.creationBytecodeBytes,
            runtimeBytecodeBytes: metadata.runtimeBytecodeBytes,
          },
        ],
      ),
    ),
  };
}

export async function GET(): Promise<Response> {
  return Response.json(buildNakamaStatus());
}
