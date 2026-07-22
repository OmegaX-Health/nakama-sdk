import { createServer } from 'node:http';

import {
  ETHEREUM_MAINNET_CAIP2,
  ETHEREUM_MAINNET_CHAIN_ID,
  NAKAMA_ETHEREUM_MAINNET_DEPLOYMENT,
  NAKAMA_ETHEREUM_CONTRACT_ARTIFACT_METADATA,
  NakamaEthereumError,
  createEthereumPublicClient,
  validateEthereumDeploymentManifest,
} from '@nakama-health/protocol-sdk';

export function buildProtocolStatus() {
  const client = createEthereumPublicClient({
    rpcUrl: process.env.ETHEREUM_MAINNET_RPC_URL,
  });
  const deployment = validateEthereumDeploymentManifest(
    NAKAMA_ETHEREUM_MAINNET_DEPLOYMENT,
  );

  return {
    ok: true,
    role: 'health-or-hospital-backend',
    chainId: ETHEREUM_MAINNET_CHAIN_ID,
    caip2: ETHEREUM_MAINNET_CAIP2,
    rpcConfigured: Boolean(process.env.ETHEREUM_MAINNET_RPC_URL),
    clientChainId: client.chain?.id,
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

function errorPayload(error: unknown) {
  if (error instanceof NakamaEthereumError) {
    return {
      ok: false,
      code: error.code,
      message: error.message,
      details: error.details ?? null,
    };
  }
  return {
    ok: false,
    code: 'UNKNOWN_ERROR',
    message: error instanceof Error ? error.message : String(error),
  };
}

export function startServer(port = Number(process.env.PORT ?? '8787')) {
  const server = createServer((request, response) => {
    if (request.url !== '/status') {
      response.writeHead(404, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ ok: false, code: 'NOT_FOUND' }));
      return;
    }

    try {
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(JSON.stringify(buildProtocolStatus(), null, 2));
    } catch (error) {
      response.writeHead(500, { 'content-type': 'application/json' });
      response.end(JSON.stringify(errorPayload(error), null, 2));
    }
  });

  server.listen(port, () => {
    console.log(`Nakama status endpoint listening on :${port}/status`);
  });
  return server;
}

if (process.env.RUN_SERVER === '1') {
  startServer();
} else {
  console.log(JSON.stringify(buildProtocolStatus(), null, 2));
}
