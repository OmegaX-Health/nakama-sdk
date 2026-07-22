import { createServer } from 'node:http';

import {
  ROBINHOOD_CONTRACT_ROLES,
  ROBINHOOD_MAINNET_CAIP2,
  ROBINHOOD_MAINNET_CHAIN_ID,
  NakamaRobinhoodError,
  createRobinhoodPublicClient,
  getGeneratedRobinhoodArtifactBundle,
  validateRobinhoodDeploymentManifest,
} from '@nakama-health/protocol-sdk';

export function buildProtocolStatus() {
  const bundle = getGeneratedRobinhoodArtifactBundle();
  const deployment = validateRobinhoodDeploymentManifest(
    bundle.deployments.mainnet,
    'mainnet',
  );
  const rpcUrl = process.env.ROBINHOOD_MAINNET_RPC_URL;
  const client = rpcUrl
    ? createRobinhoodPublicClient({ network: 'mainnet', rpcUrl })
    : null;

  return {
    ok: true,
    role: 'protection-program-backend',
    chainId: ROBINHOOD_MAINNET_CHAIN_ID,
    caip2: ROBINHOOD_MAINNET_CAIP2,
    rpcConfigured: client != null,
    clientChainId: client?.chain?.id ?? null,
    artifactStatus: bundle.status,
    artifactSha256: bundle.sourceArtifactSha256,
    deploymentStatus: deployment.status,
    settlementAsset: deployment.settlementAsset,
    contracts: Object.fromEntries(
      ROBINHOOD_CONTRACT_ROLES.map((role) => [
        role,
        {
          contractName: bundle.contracts[role]?.contractName ?? null,
          abiSha256: bundle.contracts[role]?.abiSha256 ?? null,
          address: deployment.contracts[role]?.address ?? null,
        },
      ]),
    ),
    writesEnabled: false,
    next: 'Enable writes only after an audited generated deployment and finalized runtime verification.',
  };
}

function errorPayload(error: unknown) {
  if (error instanceof NakamaRobinhoodError) {
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
