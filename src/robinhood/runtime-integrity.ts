import type { VerifiedRobinhoodDeploymentRuntime } from './artifacts.js';

const VERIFIED_RUNTIMES = new WeakSet<object>();

/** Internal capability marker; this module is intentionally not package-exported. */
export function sealVerifiedRobinhoodRuntime(
  input: VerifiedRobinhoodDeploymentRuntime,
): VerifiedRobinhoodDeploymentRuntime {
  const contracts = Object.freeze(
    Object.fromEntries(
      Object.entries(input.contracts).map(([role, contract]) => [
        role,
        Object.freeze({ ...contract }),
      ]),
    ),
  ) as VerifiedRobinhoodDeploymentRuntime['contracts'];
  const runtime = Object.freeze({
    ...input,
    settlementAsset: Object.freeze({ ...input.settlementAsset }),
    contracts,
  });
  VERIFIED_RUNTIMES.add(runtime);
  return runtime;
}

export function isVerifiedRobinhoodRuntime(
  input: VerifiedRobinhoodDeploymentRuntime,
): boolean {
  return VERIFIED_RUNTIMES.has(input) && Object.isFrozen(input);
}
