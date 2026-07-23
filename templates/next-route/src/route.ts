import {
  ROBINHOOD_CONTRACT_ROLES,
  ROBINHOOD_MAINNET_CAIP2,
  ROBINHOOD_MAINNET_CHAIN_ID,
  getGeneratedRobinhoodArtifactBundle,
  validateRobinhoodDeploymentManifest,
} from '@nakama-health/protocol-sdk';

export function buildNakamaStatus() {
  const bundle = getGeneratedRobinhoodArtifactBundle();
  const deployment = validateRobinhoodDeploymentManifest(
    bundle.deployments.mainnet,
    'mainnet',
  );

  return {
    ok: true,
    role: 'protection-program-route',
    chainId: ROBINHOOD_MAINNET_CHAIN_ID,
    caip2: ROBINHOOD_MAINNET_CAIP2,
    artifactStatus: bundle.status,
    artifactSha256: bundle.sourceArtifactSha256,
    deploymentStatus: deployment.status,
    settlementAsset: deployment.settlementAsset,
    contractRoles: ROBINHOOD_CONTRACT_ROLES,
    writesEnabled: false,
  };
}

export async function GET(): Promise<Response> {
  return Response.json(buildNakamaStatus());
}
