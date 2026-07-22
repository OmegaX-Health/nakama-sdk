import {
  decodeFunctionData,
  isHex,
  keccak256,
  parseAbi,
  stringToHex,
  zeroAddress,
  type Address,
  type Hex,
} from 'viem';

import {
  assertRobinhoodDeploymentReady,
  getRobinhoodContractArtifact,
  getRobinhoodContractDeployment,
  type RobinhoodContractRole,
  type RobinhoodDeploymentManifest,
  type RobinhoodProtocolArtifactBundle,
  type VerifiedRobinhoodDeploymentRuntime,
} from './artifacts.js';

import {
  assertRobinhoodProviderChain,
  getRobinhoodCaip2,
  getRobinhoodChainId,
  getRobinhoodChainIdHex,
  normalizeRobinhoodAddress,
  parseRobinhoodCaip10,
  type RobinhoodCaip10,
  type RobinhoodEip1193Provider,
  type RobinhoodNetwork,
  type RobinhoodPublicClient,
} from './chains.js';
import { assertBytes32, assertUint, type Bytes32 } from './domain.js';
import {
  validateNakamaDecisionSigningPayload,
  type NakamaDecisionSigningPayload,
} from './decision.js';
import {
  NakamaRobinhoodAccountPolicyError,
  NakamaRobinhoodConfigError,
  NakamaRobinhoodSignatureError,
} from './errors.js';
import { isBuilderPreparedAction } from './action-integrity.js';
import { isVerifiedRobinhoodRuntime } from './runtime-integrity.js';
import { sealTrustedRobinhoodSubmission } from './submission-integrity.js';

export type RobinhoodActionName =
  | 'mark_program_reviewed'
  | 'mark_program_funded'
  | 'approve_activation_as_sponsor'
  | 'approve_activation_as_operator'
  | 'open_enrollment'
  | 'activate_program'
  | 'enter_runoff'
  | 'close_program'
  | 'approve_cancellation_as_sponsor'
  | 'approve_cancellation_as_operator'
  | 'cancel_before_promises'
  | 'approve_usdg'
  | 'fund_program'
  | 'claim_matured_refund'
  | 'activate_membership'
  | 'recover_membership_account'
  | 'expire_membership'
  | 'cancel_membership'
  | 'open_request'
  | 'update_evidence'
  | 'execute_initial_decision'
  | 'file_appeal'
  | 'execute_appeal_decision'
  | 'escalate_no_quorum'
  | 'escalate_information_timeout'
  | 'finalize_unappealed_denial'
  | 'settle_obligation'
  | 'grant_agent_authorization'
  | 'revoke_agent_authorization'
  | 'pause_scope'
  | 'approve_unpause_as_operator'
  | 'unpause_scope'
  | 'set_dependency_warning'
  | 'guardian_revoke_agent_authorization';

export const ROBINHOOD_MAX_ACTION_WINDOW_SECONDS = 15 * 60;
export const ROBINHOOD_DEFAULT_MAX_SIMULATION_AGE_SECONDS = 120;
export const ROBINHOOD_MAX_SMART_ACCOUNT_POLICY_SECONDS = 30 * 24 * 60 * 60;
export const ROBINHOOD_MAX_SMART_ACCOUNT_RATE_WINDOW_SECONDS = 24 * 60 * 60;
export const ROBINHOOD_PHASE0_SMART_ACCOUNT_ALLOWED_ACTIONS = Object.freeze([
  'expire_membership',
  'escalate_no_quorum',
  'escalate_information_timeout',
  'finalize_unappealed_denial',
] as const satisfies readonly RobinhoodActionName[]);

const MAX_UINT256 = (1n << 256n) - 1n;
const ZERO_BYTES32 = `0x${'00'.repeat(32)}`;
const ERC20_APPROVE_ABI = parseAbi([
  'function approve(address spender,uint256 amount) returns (bool)',
]);

const ROBINHOOD_ACTION_BINDINGS = {
  mark_program_reviewed: ['program', 'markReviewed'],
  mark_program_funded: ['program', 'markFunded'],
  approve_activation_as_sponsor: ['program', 'approveActivationAsSponsor'],
  approve_activation_as_operator: ['program', 'approveActivationAsOperator'],
  open_enrollment: ['program', 'openEnrollment'],
  activate_program: ['program', 'activate'],
  enter_runoff: ['program', 'enterRunoff'],
  close_program: ['program', 'close'],
  approve_cancellation_as_sponsor: ['program', 'approveCancellationAsSponsor'],
  approve_cancellation_as_operator: [
    'program',
    'approveCancellationAsOperator',
  ],
  cancel_before_promises: ['program', 'cancelBeforePromises'],
  approve_usdg: ['settlementAsset', 'approve'],
  fund_program: ['vault', 'fund'],
  claim_matured_refund: ['vault', 'claimMaturedRefund'],
  activate_membership: ['membershipRegistry', 'activateMembership'],
  recover_membership_account: [
    'membershipRegistry',
    'recoverMembershipAccount',
  ],
  expire_membership: ['membershipRegistry', 'expireMembership'],
  cancel_membership: ['membershipRegistry', 'cancelMembership'],
  open_request: ['requestManager', 'openRequest'],
  update_evidence: ['requestManager', 'updateEvidence'],
  execute_initial_decision: ['requestManager', 'executeInitialDecision'],
  file_appeal: ['requestManager', 'fileAppeal'],
  execute_appeal_decision: ['requestManager', 'executeAppealDecision'],
  escalate_no_quorum: ['requestManager', 'escalateNoQuorum'],
  escalate_information_timeout: [
    'requestManager',
    'escalateInformationTimeout',
  ],
  finalize_unappealed_denial: ['requestManager', 'finalizeUnappealedDenial'],
  settle_obligation: ['settlementModule', 'settle'],
  grant_agent_authorization: [
    'agentAuthorizationRegistry',
    'grantAuthorization',
  ],
  revoke_agent_authorization: [
    'agentAuthorizationRegistry',
    'revokeAuthorization',
  ],
  pause_scope: ['safetyGuardian', 'pause'],
  approve_unpause_as_operator: ['safetyGuardian', 'approveUnpauseAsOperator'],
  unpause_scope: ['safetyGuardian', 'unpause'],
  set_dependency_warning: ['safetyGuardian', 'setDependencyWarning'],
  guardian_revoke_agent_authorization: [
    'safetyGuardian',
    'revokeAgentAuthorization',
  ],
} as const satisfies Record<
  RobinhoodActionName,
  readonly [RobinhoodContractRole | 'settlementAsset', string]
>;

const ROBINHOOD_ACTION_NAMES = new Set(Object.keys(ROBINHOOD_ACTION_BINDINGS));
const ROBINHOOD_PHASE0_SMART_ACCOUNT_ALLOWED_ACTION_SET =
  new Set<RobinhoodActionName>(ROBINHOOD_PHASE0_SMART_ACCOUNT_ALLOWED_ACTIONS);

export interface RobinhoodExpectedStateChange {
  field: string;
  from?: string;
  to: string;
}

export interface PreparedRobinhoodAction {
  version: 1;
  network: RobinhoodNetwork;
  chainId: 4663 | 46630;
  caip2: 'eip155:4663' | 'eip155:46630';
  intentId: string;
  action: RobinhoodActionName;
  accountId: RobinhoodCaip10;
  programId: Bytes32;
  target: Address;
  selector: Hex;
  data: Hex;
  value: bigint;
  explanation: string;
  expectedStateChanges: readonly RobinhoodExpectedStateChange[];
  preparedAt: string;
  expiresAt: string;
}

export interface RobinhoodActionSimulation {
  success: boolean;
  blockNumber: bigint;
  gasEstimate: bigint;
  returnData: Hex;
  decodedError?: {
    name: string;
    args: readonly unknown[];
  };
}

export interface SimulatedRobinhoodAction {
  action: PreparedRobinhoodAction;
  simulation: RobinhoodActionSimulation;
  simulatedAt: string;
  actionCommitment: Hex;
}

export interface RobinhoodEip1193TransactionRequest {
  from: Address;
  to: Address;
  chainId: Hex;
  data: Hex;
  value: Hex;
  gas?: Hex;
}

export interface RobinhoodEip1193Submission {
  kind: 'transaction';
  network: RobinhoodNetwork;
  chainId: 4663 | 46630;
  caip2: 'eip155:4663' | 'eip155:46630';
  intentId: string;
  accountId: RobinhoodCaip10;
  txHash: Hex;
  from: Address;
  to: Address;
  calldataHash: Hex;
  value: bigint;
  actionCommitment: Hex;
  submittedAt: string;
}

export interface RobinhoodSmartAccountPolicy {
  version: 1;
  network: RobinhoodNetwork;
  account: Address;
  programId: Bytes32;
  allowedActions: readonly RobinhoodActionName[];
  allowedCalls: readonly {
    target: Address;
    selectors: readonly Hex[];
    maximumNativeValue: bigint;
  }[];
  validAfter: bigint;
  validUntil: bigint;
  maximumCallsPerWindow: number;
  windowSeconds: number;
  maximumGasPerAction: bigint;
}

export interface RobinhoodSmartAccountSubmission {
  kind: 'user_operation';
  network: RobinhoodNetwork;
  intentId: string;
  accountId: RobinhoodCaip10;
  userOperationHash: Hex;
}

/** Provider-specific account implementation isolated from product code. */
export interface RobinhoodSmartAccountAdapter {
  readonly network: RobinhoodNetwork;
  readonly account: Address;
  simulate(params: {
    action: PreparedRobinhoodAction;
    policy: RobinhoodSmartAccountPolicy;
  }): Promise<RobinhoodActionSimulation>;
}

export interface RobinhoodSmartAccountClient {
  readonly network: RobinhoodNetwork;
  readonly account: Address;
  readonly policy: RobinhoodSmartAccountPolicy;
  simulate(action: PreparedRobinhoodAction): Promise<RobinhoodActionSimulation>;
  submit(
    action: PreparedRobinhoodAction,
  ): Promise<RobinhoodSmartAccountSubmission>;
}

export async function requestRobinhoodAction(
  provider: RobinhoodEip1193Provider,
  simulated: SimulatedRobinhoodAction,
  options: {
    client: RobinhoodPublicClient;
    manifest: RobinhoodDeploymentManifest;
    bundle: RobinhoodProtocolArtifactBundle;
    runtime: VerifiedRobinhoodDeploymentRuntime;
    gas?: bigint;
    now?: Date | number | bigint;
    maximumSimulationAgeSeconds?: number;
  },
): Promise<RobinhoodEip1193Submission> {
  const { action, simulation } = simulated;
  assertPreparedAction(action, options.now);
  assertSimulatedRobinhoodAction(simulated, {
    now: options.now,
    maximumAgeSeconds: options.maximumSimulationAgeSeconds,
  });
  if (!simulation.success) {
    throw new NakamaRobinhoodConfigError(
      'A failed simulation cannot be submitted.',
      { details: { decodedError: simulation.decodedError } },
    );
  }
  assertActionBoundToVerifiedDeployment({
    action,
    manifest: options.manifest,
    bundle: options.bundle,
    runtime: options.runtime,
    now: options.now,
  });
  const publicChainId = await options.client.getChainId();
  if (publicChainId !== action.chainId) {
    throw new NakamaRobinhoodConfigError(
      'Submission simulation client is on the wrong chain.',
      { details: { publicChainId, expectedChainId: action.chainId } },
    );
  }
  await assertRobinhoodProviderChain({
    provider,
    network: action.network,
  });
  const from = parseRobinhoodCaip10({
    network: action.network,
    accountId: action.accountId,
  });
  const blockNumber = await options.client.getBlockNumber();
  let freshGasEstimate: bigint;
  try {
    const [, estimate] = await Promise.all([
      options.client.call({
        account: from,
        to: action.target,
        data: action.data,
        value: action.value,
        blockNumber,
      }),
      options.client.estimateGas({
        account: from,
        to: action.target,
        data: action.data,
        value: action.value,
        blockNumber,
      }),
    ]);
    freshGasEstimate = estimate;
  } catch (error) {
    throw new NakamaRobinhoodConfigError(
      'Exact action failed the mandatory pre-submission simulation.',
      { cause: error, details: { blockNumber: blockNumber.toString(10) } },
    );
  }
  if (options.gas != null) {
    assertUint(options.gas, 'gas');
    if (options.gas < freshGasEstimate) {
      throw new NakamaRobinhoodConfigError(
        'Explicit gas is below the fresh simulation estimate.',
        {
          details: {
            gas: options.gas.toString(10),
            freshGasEstimate: freshGasEstimate.toString(10),
          },
        },
      );
    }
  }
  const request: RobinhoodEip1193TransactionRequest = {
    from,
    to: action.target,
    chainId: getRobinhoodChainIdHex(action.network),
    data: action.data,
    value: toRpcQuantity(action.value),
    ...(options.gas == null ? {} : { gas: toRpcQuantity(options.gas) }),
  };
  const response = await provider.request({
    method: 'eth_sendTransaction',
    params: [request],
  });
  const txHash = requireTransactionHash(response, 'eth_sendTransaction result');
  return sealTrustedRobinhoodSubmission({
    kind: 'transaction',
    network: action.network,
    chainId: action.chainId,
    caip2: action.caip2,
    intentId: action.intentId,
    accountId: action.accountId,
    txHash,
    from,
    to: action.target,
    calldataHash: keccak256(action.data),
    value: action.value,
    actionCommitment: simulated.actionCommitment,
    submittedAt: new Date().toISOString(),
  });
}

export async function requestNakamaDecisionSignature(
  provider: RobinhoodEip1193Provider,
  payload: NakamaDecisionSigningPayload,
): Promise<Hex> {
  const canonical = validateNakamaDecisionSigningPayload(payload);
  await assertRobinhoodProviderChain({
    provider,
    network: canonical.network,
  });
  const account = parseRobinhoodCaip10({
    network: canonical.network,
    accountId: canonical.accountId,
  });
  const response = await provider.request({
    method: 'eth_signTypedData_v4',
    params: [
      account,
      JSON.stringify(canonical.typedData, (_key, value) =>
        typeof value === 'bigint' ? value.toString(10) : value,
      ),
    ],
  });
  if (typeof response !== 'string' || !isHex(response) || response === '0x') {
    throw new NakamaRobinhoodSignatureError(
      'eth_signTypedData_v4 returned an invalid signature.',
    );
  }
  return response;
}

export function createRobinhoodSmartAccountClient(params: {
  adapter: RobinhoodSmartAccountAdapter;
  policy: RobinhoodSmartAccountPolicy;
  manifest: RobinhoodDeploymentManifest;
  bundle: RobinhoodProtocolArtifactBundle;
  runtime: VerifiedRobinhoodDeploymentRuntime;
}): RobinhoodSmartAccountClient {
  const account = normalizeRobinhoodAddress(params.adapter.account);
  validateRobinhoodSmartAccountPolicy(params.policy);
  assertRobinhoodDeploymentReady(params.manifest, params.bundle);
  if (
    params.adapter.network !== params.policy.network ||
    account !== normalizeRobinhoodAddress(params.policy.account) ||
    params.policy.network !== params.manifest.network ||
    params.policy.programId.toLowerCase() !==
      params.runtime.programId.toLowerCase()
  ) {
    throw new NakamaRobinhoodAccountPolicyError(
      'Smart-account adapter identity does not match its policy.',
    );
  }
  return {
    network: params.adapter.network,
    account,
    policy: params.policy,
    async simulate(action) {
      assertActionAllowedBySmartAccountPolicy({
        action,
        policy: params.policy,
        manifest: params.manifest,
        bundle: params.bundle,
        runtime: params.runtime,
      });
      return await params.adapter.simulate({
        action,
        policy: params.policy,
      });
    },
    async submit(action) {
      assertActionAllowedBySmartAccountPolicy({
        action,
        policy: params.policy,
        manifest: params.manifest,
        bundle: params.bundle,
        runtime: params.runtime,
      });
      throw new NakamaRobinhoodAccountPolicyError(
        'Phase 0 smart-account submission is disabled until an independent finalized onchain module verifier is implemented.',
      );
    },
  };
}

export function validateRobinhoodSmartAccountPolicy(
  policy: RobinhoodSmartAccountPolicy,
): void {
  if (policy.version !== 1) {
    throw new NakamaRobinhoodAccountPolicyError(
      'Smart-account policy version must be 1.',
    );
  }
  const account = normalizeRobinhoodAddress(policy.account);
  if (account === zeroAddress) {
    throw new NakamaRobinhoodAccountPolicyError(
      'Smart-account policy account cannot be the zero address.',
    );
  }
  if (policy.allowedActions.length === 0 || policy.allowedCalls.length === 0) {
    throw new NakamaRobinhoodAccountPolicyError(
      'Smart-account policy must enumerate actions and calls.',
    );
  }
  const programId = assertBytes32(policy.programId, 'programId');
  if (programId.toLowerCase() === ZERO_BYTES32) {
    throw new NakamaRobinhoodAccountPolicyError(
      'Smart-account policy programId cannot be zero.',
    );
  }
  if (
    new Set(policy.allowedActions).size !== policy.allowedActions.length ||
    policy.allowedActions.some((action) => !ROBINHOOD_ACTION_NAMES.has(action))
  ) {
    throw new NakamaRobinhoodAccountPolicyError(
      'Smart-account policy actions must be known and unique.',
    );
  }
  const interactiveOnly = policy.allowedActions.filter(
    (action) => !ROBINHOOD_PHASE0_SMART_ACCOUNT_ALLOWED_ACTION_SET.has(action),
  );
  if (interactiveOnly.length > 0) {
    throw new NakamaRobinhoodAccountPolicyError(
      'Phase 0 smart-account policies cannot authorize calls whose economic or privilege-bearing calldata is not enforced onchain.',
      { details: { interactiveOnly } },
    );
  }
  assertUint(policy.validAfter, 'validAfter');
  assertUint(policy.validUntil, 'validUntil');
  if (policy.validAfter < 0n || policy.validUntil <= policy.validAfter) {
    throw new NakamaRobinhoodAccountPolicyError(
      'Smart-account policy requires a bounded validity window.',
    );
  }
  if (
    policy.validUntil - policy.validAfter >
    BigInt(ROBINHOOD_MAX_SMART_ACCOUNT_POLICY_SECONDS)
  ) {
    throw new NakamaRobinhoodAccountPolicyError(
      'Smart-account policy validity exceeds the maximum bounded window.',
    );
  }
  if (
    !Number.isSafeInteger(policy.maximumCallsPerWindow) ||
    policy.maximumCallsPerWindow < 1 ||
    policy.maximumCallsPerWindow > 10_000 ||
    !Number.isSafeInteger(policy.windowSeconds) ||
    policy.windowSeconds < 1 ||
    policy.windowSeconds > ROBINHOOD_MAX_SMART_ACCOUNT_RATE_WINDOW_SECONDS ||
    policy.maximumGasPerAction < 1n
  ) {
    throw new NakamaRobinhoodAccountPolicyError(
      'Smart-account rate and gas caps must be positive.',
    );
  }
  assertUint(policy.maximumGasPerAction, 'maximumGasPerAction');
  const allowedCallPairs = new Set<string>();
  for (const call of policy.allowedCalls) {
    const target = normalizeRobinhoodAddress(call.target);
    if (target === zeroAddress) {
      throw new NakamaRobinhoodAccountPolicyError(
        'Allowed call target cannot be the zero address.',
      );
    }
    assertUint(call.maximumNativeValue, 'maximumNativeValue');
    if (call.selectors.length === 0 || call.maximumNativeValue < 0n) {
      throw new NakamaRobinhoodAccountPolicyError(
        'Allowed call requires selectors and a non-negative value cap.',
      );
    }
    for (const selector of call.selectors) {
      requireSelector(selector);
      const pair = `${target.toLowerCase()}:${selector.toLowerCase()}`;
      if (allowedCallPairs.has(pair)) {
        throw new NakamaRobinhoodAccountPolicyError(
          'Smart-account policy target and selector pairs must be unique.',
        );
      }
      allowedCallPairs.add(pair);
    }
  }
}

export function hashRobinhoodSmartAccountPolicy(
  policy: RobinhoodSmartAccountPolicy,
): Hex {
  validateRobinhoodSmartAccountPolicy(policy);
  return keccak256(stringToHex(canonicalJson(policy)));
}

export function assertActionAllowedBySmartAccountPolicy(params: {
  action: PreparedRobinhoodAction;
  policy: RobinhoodSmartAccountPolicy;
  manifest: RobinhoodDeploymentManifest;
  bundle: RobinhoodProtocolArtifactBundle;
  runtime: VerifiedRobinhoodDeploymentRuntime;
  now?: Date | number | bigint;
}): void {
  assertPreparedAction(params.action, params.now);
  assertActionBoundToVerifiedDeployment({
    action: params.action,
    manifest: params.manifest,
    bundle: params.bundle,
    runtime: params.runtime,
    now: params.now,
  });
  validateRobinhoodSmartAccountPolicy(params.policy);
  const now = toUnixSeconds(params.now);
  if (now < params.policy.validAfter || now > params.policy.validUntil) {
    throw new NakamaRobinhoodAccountPolicyError(
      'Smart-account policy is not active at the current time.',
    );
  }
  if (
    params.action.network !== params.policy.network ||
    parseRobinhoodCaip10({
      network: params.action.network,
      accountId: params.action.accountId,
    }) !== normalizeRobinhoodAddress(params.policy.account) ||
    params.action.programId.toLowerCase() !==
      params.policy.programId.toLowerCase() ||
    !params.policy.allowedActions.includes(params.action.action)
  ) {
    throw new NakamaRobinhoodAccountPolicyError(
      'Action identity is outside the smart-account policy.',
      { details: { action: params.action.action } },
    );
  }
  const call = params.policy.allowedCalls.find(
    (entry) =>
      normalizeRobinhoodAddress(entry.target) === params.action.target &&
      entry.selectors.some(
        (selector) =>
          selector.toLowerCase() === params.action.selector.toLowerCase(),
      ),
  );
  if (call == null || params.action.value > call.maximumNativeValue) {
    throw new NakamaRobinhoodAccountPolicyError(
      'Action target, selector, or value is outside the smart-account policy.',
      {
        details: {
          target: params.action.target,
          selector: params.action.selector,
          value: params.action.value.toString(10),
        },
      },
    );
  }
}

export function hashPreparedRobinhoodAction(
  action: PreparedRobinhoodAction,
): Hex {
  assertPreparedAction(action, new Date(action.preparedAt));
  return keccak256(stringToHex(canonicalJson(action)));
}

export function assertSimulatedRobinhoodAction(
  simulated: SimulatedRobinhoodAction,
  options: {
    now?: Date | number | bigint;
    maximumAgeSeconds?: number;
  } = {},
): void {
  assertPreparedAction(simulated.action, options.now);
  if (
    simulated.actionCommitment.toLowerCase() !==
    hashPreparedRobinhoodAction(simulated.action).toLowerCase()
  ) {
    throw new NakamaRobinhoodConfigError(
      'Simulation commitment does not match the prepared action.',
    );
  }
  const simulatedAt = parseStrictIsoTimestamp(
    simulated.simulatedAt,
    'simulatedAt',
  );
  const nowSeconds = toUnixSeconds(options.now);
  const simulatedAtSeconds = BigInt(Math.floor(simulatedAt / 1_000));
  const maximumAge =
    options.maximumAgeSeconds ?? ROBINHOOD_DEFAULT_MAX_SIMULATION_AGE_SECONDS;
  if (
    !Number.isSafeInteger(maximumAge) ||
    maximumAge < 1 ||
    maximumAge > ROBINHOOD_MAX_ACTION_WINDOW_SECONDS
  ) {
    throw new NakamaRobinhoodConfigError(
      'maximumSimulationAgeSeconds must be a positive bounded integer.',
    );
  }
  if (
    simulatedAtSeconds > nowSeconds ||
    nowSeconds - simulatedAtSeconds > BigInt(maximumAge)
  ) {
    throw new NakamaRobinhoodConfigError(
      'Action simulation is stale or dated in the future.',
    );
  }
  if (
    simulated.simulation.blockNumber <= 0n ||
    simulated.simulation.gasEstimate < 0n ||
    simulated.simulation.gasEstimate > MAX_UINT256 ||
    !isHex(simulated.simulation.returnData)
  ) {
    throw new NakamaRobinhoodConfigError(
      'Action simulation fields are invalid.',
    );
  }
}

export function assertActionBoundToVerifiedDeployment(params: {
  action: PreparedRobinhoodAction;
  manifest: RobinhoodDeploymentManifest;
  bundle: RobinhoodProtocolArtifactBundle;
  runtime: VerifiedRobinhoodDeploymentRuntime;
  now?: Date | number | bigint;
}): void {
  assertPreparedAction(params.action, params.now);
  if (!isBuilderPreparedAction(params.action)) {
    throw new NakamaRobinhoodConfigError(
      'Submission requires the exact frozen action returned by createRobinhoodActionBuilder.',
    );
  }
  assertRobinhoodDeploymentReady(params.manifest, params.bundle);
  if (
    !isVerifiedRobinhoodRuntime(params.runtime) ||
    params.runtime.network !== params.manifest.network ||
    params.runtime.chainId !== params.manifest.chainId ||
    params.action.network !== params.manifest.network ||
    params.action.programId.toLowerCase() !==
      params.runtime.programId.toLowerCase()
  ) {
    throw new NakamaRobinhoodConfigError(
      'Action, deployment, and verified runtime target different networks.',
    );
  }

  const [targetRole, expectedFunction] =
    ROBINHOOD_ACTION_BINDINGS[params.action.action];
  const target = normalizeRobinhoodAddress(params.action.target);
  const abi =
    targetRole === 'settlementAsset'
      ? ERC20_APPROVE_ABI
      : getRobinhoodContractArtifact(params.bundle, targetRole).abi;
  const expectedTarget =
    targetRole === 'settlementAsset'
      ? params.manifest.settlementAsset.address
      : getRobinhoodContractDeployment(params.manifest, targetRole).address;
  if (
    expectedTarget == null ||
    target !== normalizeRobinhoodAddress(expectedTarget)
  ) {
    throw new NakamaRobinhoodConfigError(
      'Prepared action target does not match its canonical action role.',
      { details: { action: params.action.action, targetRole, target } },
    );
  }
  if (params.action.value !== 0n) {
    throw new NakamaRobinhoodConfigError(
      'Canonical Robinhood protocol actions cannot transfer native value.',
    );
  }
  if (
    targetRole === 'settlementAsset' &&
    target.toLowerCase() !==
      params.runtime.settlementAsset.address.toLowerCase()
  ) {
    throw new NakamaRobinhoodConfigError(
      'Settlement action does not match the runtime-verified USDG asset.',
    );
  }
  if (targetRole !== 'settlementAsset') {
    const runtime = params.runtime.contracts[targetRole];
    const deployment = getRobinhoodContractDeployment(
      params.manifest,
      targetRole,
    );
    if (
      runtime.address !== deployment.address ||
      runtime.actualRuntimeBytecodeHash.toLowerCase() !==
        deployment.runtimeBytecodeHash.toLowerCase()
    ) {
      throw new NakamaRobinhoodConfigError(
        'Action target does not match verified runtime evidence.',
      );
    }
  }
  let decoded: { functionName: string; args?: readonly unknown[] };
  try {
    decoded = decodeFunctionData({ abi, data: params.action.data });
  } catch (error) {
    throw new NakamaRobinhoodConfigError(
      'Prepared action calldata is not canonical for its target role.',
      { cause: error },
    );
  }
  if (decoded.functionName !== expectedFunction) {
    throw new NakamaRobinhoodConfigError(
      'Prepared action name does not match the encoded contract function.',
      {
        details: {
          action: params.action.action,
          expectedFunction,
          actualFunction: decoded.functionName,
        },
      },
    );
  }
  if (params.action.action === 'approve_usdg') {
    const [spenderInput, amountInput] = decoded.args ?? [];
    if (typeof spenderInput !== 'string' || typeof amountInput !== 'bigint') {
      throw new NakamaRobinhoodConfigError(
        'USDG approval calldata must contain an address spender and uint256 amount.',
      );
    }
    const spender = normalizeRobinhoodAddress(spenderInput);
    const vault = getRobinhoodContractDeployment(
      params.manifest,
      'vault',
    ).address;
    if (
      spender.toLowerCase() !== vault.toLowerCase() ||
      amountInput <= 0n ||
      amountInput > MAX_UINT256
    ) {
      throw new NakamaRobinhoodConfigError(
        'USDG approval must grant a positive, bounded allowance only to the canonical program vault.',
        {
          details: {
            spender,
            expectedSpender: vault,
            amount: amountInput.toString(10),
          },
        },
      );
    }
    const expectedExplanation = `Approve exactly ${amountInput.toString(10)} USDG base units for this program vault.`;
    const expectedStateChanges = [
      { field: 'usdg.allowance', to: amountInput.toString(10) },
    ];
    if (
      params.action.explanation !== expectedExplanation ||
      JSON.stringify(params.action.expectedStateChanges) !==
        JSON.stringify(expectedStateChanges)
    ) {
      throw new NakamaRobinhoodConfigError(
        'USDG approval disclosure does not match its decoded spender and amount.',
      );
    }
  }
}

export function assertPreparedAction(
  action: PreparedRobinhoodAction,
  now?: Date | number | bigint,
): void {
  if (
    action.version !== 1 ||
    (action.network !== 'mainnet' && action.network !== 'testnet') ||
    action.chainId !== getRobinhoodChainId(action.network) ||
    action.caip2 !== getRobinhoodCaip2(action.network) ||
    !ROBINHOOD_ACTION_NAMES.has(action.action)
  ) {
    throw new NakamaRobinhoodConfigError(
      'Prepared action chain identity is invalid.',
    );
  }
  if (
    action.intentId.trim() === '' ||
    action.explanation.trim() === '' ||
    normalizeRobinhoodAddress(action.target) === zeroAddress
  ) {
    throw new NakamaRobinhoodConfigError(
      'Prepared action requires an intent, explanation, and non-zero target.',
    );
  }
  parseRobinhoodCaip10({
    network: action.network,
    accountId: action.accountId,
  });
  const programId = assertBytes32(action.programId, 'programId');
  if (programId.toLowerCase() === ZERO_BYTES32) {
    throw new NakamaRobinhoodConfigError(
      'Prepared action programId cannot be zero.',
    );
  }
  requireSelector(action.selector);
  if (!isHex(action.data) || action.data.length < 10) {
    throw new NakamaRobinhoodConfigError(
      'Prepared action calldata must contain a function selector.',
    );
  }
  if (
    action.data.slice(0, 10).toLowerCase() !== action.selector.toLowerCase()
  ) {
    throw new NakamaRobinhoodConfigError(
      'Prepared action selector does not match its calldata.',
    );
  }
  if (action.value < 0n || action.value > MAX_UINT256) {
    throw new NakamaRobinhoodConfigError(
      'Prepared action native value cannot be negative.',
    );
  }
  const preparedAt = parseStrictIsoTimestamp(action.preparedAt, 'preparedAt');
  const expiresAt = parseStrictIsoTimestamp(action.expiresAt, 'expiresAt');
  if (
    expiresAt <= preparedAt ||
    expiresAt - preparedAt > ROBINHOOD_MAX_ACTION_WINDOW_SECONDS * 1_000
  ) {
    throw new NakamaRobinhoodConfigError(
      'Prepared action requires a bounded timestamp window.',
    );
  }
  const nowSeconds = toUnixSeconds(now);
  if (BigInt(Math.floor(preparedAt / 1_000)) > nowSeconds) {
    throw new NakamaRobinhoodConfigError(
      'Prepared action cannot be dated in the future.',
    );
  }
  if (nowSeconds > BigInt(Math.floor(expiresAt / 1_000))) {
    throw new NakamaRobinhoodConfigError('Prepared action has expired.');
  }
}

function parseStrictIsoTimestamp(value: string, field: string): number {
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value) ||
    !Number.isFinite(Date.parse(value)) ||
    new Date(value).toISOString() !== value
  ) {
    throw new NakamaRobinhoodConfigError(
      `${field} must be a canonical UTC ISO timestamp.`,
    );
  }
  return Date.parse(value);
}

function requireSelector(value: unknown): asserts value is Hex {
  if (typeof value !== 'string' || !/^0x[0-9a-f]{8}$/i.test(value)) {
    throw new NakamaRobinhoodAccountPolicyError(
      'Function selector must contain exactly four bytes.',
    );
  }
}

function requireTransactionHash(value: unknown, field: string): Hex {
  if (
    typeof value !== 'string' ||
    !isHex(value) ||
    !/^0x[0-9a-f]{64}$/i.test(value)
  ) {
    throw new NakamaRobinhoodConfigError(
      `${field} must be a 32-byte transaction hash.`,
    );
  }
  return value;
}

function toRpcQuantity(value: bigint): Hex {
  if (value < 0n || value > MAX_UINT256) {
    throw new NakamaRobinhoodConfigError(
      'JSON-RPC quantity cannot be negative.',
    );
  }
  return `0x${value.toString(16)}`;
}

function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_key, current) => {
    if (typeof current === 'bigint') return `${current.toString(10)}n`;
    if (
      current != null &&
      typeof current === 'object' &&
      !Array.isArray(current)
    ) {
      return Object.fromEntries(
        Object.entries(current as Record<string, unknown>).sort(
          ([left], [right]) => left.localeCompare(right),
        ),
      );
    }
    return current;
  });
}

function toUnixSeconds(value: Date | number | bigint | undefined): bigint {
  if (value == null) return BigInt(Math.floor(Date.now() / 1_000));
  if (typeof value === 'bigint') return value;
  if (value instanceof Date) return BigInt(Math.floor(value.getTime() / 1_000));
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new NakamaRobinhoodConfigError(
      'now must be a Unix-second integer, bigint, or Date.',
    );
  }
  return BigInt(value);
}
