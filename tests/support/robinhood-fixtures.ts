import type { Address, Hex } from 'viem';

import { ROBINHOOD_PROTOCOL_ARTIFACT_BUNDLE_RAW } from '../../src/generated/robinhood_protocol.js';
import { installGeneratedRobinhoodArtifactSourceForTest } from '../../src/robinhood/generated-artifact-store.js';
import { sealVerifiedRobinhoodRuntime } from '../../src/robinhood/runtime-integrity.js';

import {
  ROBINHOOD_CONTRACT_IDENTITIES,
  ROBINHOOD_CONTRACT_ROLES,
  ROBINHOOD_USDG,
  getGeneratedRobinhoodArtifactBundle,
  type RobinhoodContractRole,
  type RobinhoodDeploymentManifest,
  type RobinhoodProtocolArtifactBundle,
  type VerifiedRobinhoodDeploymentRuntime,
} from '../../src/robinhood.js';

export const TEST_PROGRAM_ID = `0x${'11'.repeat(32)}` as Hex;
export const TEST_SUITE_ID = `0x${'12'.repeat(32)}` as Hex;
export const TEST_COMMITMENT = `0x${'22'.repeat(32)}` as Hex;
export const TEST_RUNTIME_HASH = `0x${'33'.repeat(32)}` as Hex;
export const TEST_TX_HASH = `0x${'44'.repeat(32)}` as Hex;
export const TEST_BLOCK_HASH = `0x${'55'.repeat(32)}` as Hex;
export const TEST_ACCOUNT =
  '0x00000000000000000000000000000000000000A1' as Address;

export function testRoleAddress(role: RobinhoodContractRole): Address {
  const index = ROBINHOOD_CONTRACT_ROLES.indexOf(role) + 1;
  return `0x${index.toString(16).padStart(40, '0')}` as Address;
}

export function createReadyRobinhoodFixture(): {
  manifest: RobinhoodDeploymentManifest & { status: 'deployed' };
  bundle: RobinhoodProtocolArtifactBundle & { status: 'ready' };
  runtime: VerifiedRobinhoodDeploymentRuntime;
} {
  const canonical = getGeneratedRobinhoodArtifactBundle();
  if (canonical.status !== 'ready' || canonical.sourceArtifactSha256 == null) {
    throw new Error('Canonical Robinhood fixture requires imported ABIs.');
  }
  const contracts = Object.fromEntries(
    ROBINHOOD_CONTRACT_ROLES.map((role) => [
      role,
      {
        contractName: ROBINHOOD_CONTRACT_IDENTITIES[role],
        address: testRoleAddress(role),
        abiSha256: canonical.contracts[role]!.abiSha256,
        runtimeBytecodeHash: TEST_RUNTIME_HASH,
        verificationUrl: `https://explorer.example.test/${role}`,
      },
    ]),
  ) as RobinhoodDeploymentManifest['contracts'];
  const manifest = {
    schemaVersion: 1,
    status: 'deployed',
    network: 'mainnet',
    chainId: 4663,
    caip2: 'eip155:4663',
    protocolRelease: 'robinhood-phase0-test',
    sourceCommit: 'c'.repeat(40),
    artifactBundleSha256: canonical.sourceArtifactSha256,
    deploymentTransaction: TEST_TX_HASH,
    deploymentBlock: 100,
    deploymentBlockHash: TEST_BLOCK_HASH,
    contracts,
    settlementAsset: ROBINHOOD_USDG.mainnet,
    verified: true,
    auditStatus: 'audited',
    auditReportSha256: 'd'.repeat(64),
    releaseApprovalSha256: 'e'.repeat(64),
  } as const satisfies RobinhoodDeploymentManifest;
  installTrustedRobinhoodManifestForTest(manifest);
  const bundle =
    getGeneratedRobinhoodArtifactBundle() as RobinhoodProtocolArtifactBundle & {
      status: 'ready';
    };
  const runtimeContracts = Object.fromEntries(
    ROBINHOOD_CONTRACT_ROLES.map((role) => [
      role,
      {
        ...contracts[role]!,
        actualRuntimeBytecodeHash: TEST_RUNTIME_HASH,
      },
    ]),
  ) as VerifiedRobinhoodDeploymentRuntime['contracts'];
  return {
    manifest,
    bundle,
    runtime: sealVerifiedRobinhoodRuntime({
      network: 'mainnet',
      chainId: 4663,
      chainHead: 105n,
      safeBlock: 104n,
      finalizedBlock: 103n,
      checkedAtBlock: 103n,
      checkedAtBlockHash: TEST_BLOCK_HASH,
      programId: TEST_PROGRAM_ID,
      suiteId: TEST_SUITE_ID,
      settlementAsset: {
        ...ROBINHOOD_USDG.mainnet,
        runtimeBytecodeHash: TEST_RUNTIME_HASH,
        verifiedAtBlock: 103n,
      },
      contracts: runtimeContracts,
    }),
  };
}

/** Test-only fixture hook: production code has no manifest trust override. */
export function installTrustedRobinhoodManifestForTest(
  manifest: RobinhoodDeploymentManifest,
): void {
  const raw = structuredClone(
    ROBINHOOD_PROTOCOL_ARTIFACT_BUNDLE_RAW,
  ) as unknown as {
    deployments: Record<'mainnet' | 'testnet', RobinhoodDeploymentManifest>;
  };
  raw.deployments[manifest.network] = structuredClone(manifest);
  installGeneratedRobinhoodArtifactSourceForTest(raw);
}
