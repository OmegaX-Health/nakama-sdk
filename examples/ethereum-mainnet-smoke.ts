import {
  NAKAMA_COVERAGE_PROTOCOL_ABI,
  NAKAMA_ETHEREUM_CONTRACT_ARTIFACT_METADATA,
  NAKAMA_ETHEREUM_MAINNET_DEPLOYMENT,
  NAKAMA_POLICY_REGISTRY_ABI,
  NAKAMA_PROTOCOL_FACTORY_ABI,
  NAKAMA_RESERVE_VAULT_ABI,
  validateEthereumDeploymentManifest,
} from '@nakama-health/protocol-sdk/ethereum_contract';
import {
  ETHEREUM_MAINNET_CAIP2,
  ETHEREUM_MAINNET_CHAIN_ID,
  toEthereumMainnetCaip10,
} from '@nakama-health/protocol-sdk/ethereum';

const deployment = validateEthereumDeploymentManifest(
  NAKAMA_ETHEREUM_MAINNET_DEPLOYMENT,
);
const contractAbis = {
  NakamaProtocolFactory: NAKAMA_PROTOCOL_FACTORY_ABI,
  NakamaPolicyRegistry: NAKAMA_POLICY_REGISTRY_ABI,
  NakamaCoverageProtocol: NAKAMA_COVERAGE_PROTOCOL_ABI,
  ReserveVault: NAKAMA_RESERVE_VAULT_ABI,
} as const;

console.log(
  JSON.stringify(
    {
      ok: true,
      chainId: ETHEREUM_MAINNET_CHAIN_ID,
      caip2: ETHEREUM_MAINNET_CAIP2,
      sampleAccount: toEthereumMainnetCaip10(
        '0x0000000000000000000000000000000000000001',
      ),
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
              runtimeBytecodeTemplateHash: metadata.runtimeBytecodeTemplateHash,
              runtimeBytecodeBytes: metadata.runtimeBytecodeBytes,
            },
          ],
        ),
      ),
      contractSurface: Object.fromEntries(
        Object.entries(contractAbis).map(([contractName, abi]) => [
          contractName,
          {
            functions: abi.filter((entry) => entry.type === 'function').length,
            events: abi.filter((entry) => entry.type === 'event').length,
          },
        ]),
      ),
    },
    null,
    2,
  ),
);
