import {
  ROBINHOOD_MAINNET_CAIP2,
  ROBINHOOD_MAINNET_CHAIN_ID,
  ROBINHOOD_USDG_MAINNET_ADDRESS,
  getGeneratedRobinhoodArtifactBundle,
  parseRobinhoodUsdg,
  toRobinhoodCaip10,
  validateRobinhoodDeploymentManifest,
} from '@nakama-health/protocol-sdk';

const bundle = getGeneratedRobinhoodArtifactBundle();
const deployment = validateRobinhoodDeploymentManifest(
  bundle.deployments.mainnet,
  'mainnet',
);
const sampleAmount = parseRobinhoodUsdg('125.50', 'mainnet');

console.log(
  JSON.stringify(
    {
      ok: true,
      chainId: ROBINHOOD_MAINNET_CHAIN_ID,
      caip2: ROBINHOOD_MAINNET_CAIP2,
      sampleAccount: toRobinhoodCaip10(
        'mainnet',
        '0x0000000000000000000000000000000000000001',
      ),
      usdg: {
        address: ROBINHOOD_USDG_MAINNET_ADDRESS,
        units: sampleAmount.units.toString(),
        decimals: sampleAmount.asset.decimals,
      },
      artifactStatus: bundle.status,
      artifactContracts: Object.keys(bundle.contracts).length,
      deploymentStatus: deployment.status,
      writesEnabled: false,
      next: 'Require an audited deployed manifest, verify runtime code, simulate the exact typed action, then ask the user wallet to submit it.',
    },
    null,
    2,
  ),
);
