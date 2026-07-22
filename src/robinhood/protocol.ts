import {
  decodeErrorResult,
  decodeEventLog,
  encodeFunctionData,
  isHex,
  parseAbi,
  zeroAddress,
  type Abi,
  type Address,
  type Hex,
} from 'viem';

import {
  assertRobinhoodDeploymentReady,
  getGeneratedRobinhoodArtifactBundle,
  getRobinhoodContractArtifact,
  getRobinhoodContractDeployment,
  ROBINHOOD_CONTRACT_ROLES,
  type RobinhoodContractRole,
  type RobinhoodDeploymentManifest,
  type RobinhoodProtocolArtifactBundle,
  type VerifiedRobinhoodDeploymentRuntime,
} from './artifacts.js';
import {
  assertSameRobinhoodAsset,
  createRobinhoodAssetAmount,
  requireRobinhoodUsdg,
  type RobinhoodAssetAmount,
} from './assets.js';
import {
  getRobinhoodCaip2,
  getRobinhoodChainId,
  normalizeRobinhoodAddress,
  toRobinhoodCaip10,
  type RobinhoodNetwork,
  type RobinhoodPublicClient,
} from './chains.js';
import {
  NAKAMA_DECISION_REVIEW_ROUND,
  createNakamaDecisionTypedData,
  type NakamaDecisionMessage,
} from './decision.js';
import {
  assertBytes32,
  assertUint,
  type Bytes32,
  type MembershipSnapshot,
  type ObligationSnapshot,
  type PauseScope,
  type PauseSnapshot,
  type ProgramAccountingSnapshot,
  type ProgramRole,
  type ProgramSnapshot,
  type RequestSnapshot,
  type RobinhoodRead,
  type RobinhoodReadContext,
  type RoleSnapshot,
} from './domain.js';
import {
  NakamaRobinhoodArtifactError,
  NakamaRobinhoodConfigError,
  NakamaRobinhoodContractError,
  NakamaRobinhoodSimulationError,
  NakamaRobinhoodWrongChainError,
} from './errors.js';
import {
  assertPreparedAction,
  hashPreparedRobinhoodAction,
  type PreparedRobinhoodAction,
  type RobinhoodActionName,
  type RobinhoodExpectedStateChange,
  type SimulatedRobinhoodAction,
} from './wallet.js';
import { sealBuilderPreparedAction } from './action-integrity.js';
import { isVerifiedRobinhoodRuntime } from './runtime-integrity.js';

const ERC20_APPROVE_ABI = parseAbi([
  'function approve(address spender,uint256 amount) returns (bool)',
]);
const ZERO_BYTES32 = `0x${'00'.repeat(32)}` as Bytes32;
const MAX_AGENT_AUTHORIZATION_DURATION = 30n * 24n * 60n * 60n;
const MAX_AGENT_PERIOD = 7n * 24n * 60n * 60n;
const MAX_AGENT_CALLS_PER_PERIOD = 1_000;
const MAX_PAUSE_DURATION = 7n * 24n * 60n * 60n;

export const ROBINHOOD_PROGRAM_STATE = Object.freeze({
  draft: 0,
  reviewed: 1,
  funded: 2,
  enrollmentOpen: 3,
  active: 4,
  runoff: 5,
  closed: 6,
  cancelled: 7,
} as const);

export const ROBINHOOD_MEMBERSHIP_STATE = Object.freeze({
  none: 0,
  active: 1,
  expired: 2,
  cancelled: 3,
} as const);

export const ROBINHOOD_REQUEST_STATE = Object.freeze({
  none: 0,
  pending: 1,
  informationRequested: 2,
  escalated: 3,
  deniedAppealable: 4,
  appealed: 5,
  approved: 6,
  finalDenied: 7,
  settled: 8,
} as const);

export const ROBINHOOD_PAUSE_SCOPE = Object.freeze({
  enrollment: 1,
  newRequests: 2,
  newObligations: 3,
  settlement: 4,
  agentActions: 5,
} as const);

export interface EligibilityAuthorization {
  programId: Bytes32;
  memberCommitment: Bytes32;
  account: Address;
  termsCommitment: Bytes32;
  privacyCommitment: Bytes32;
  nonce: bigint;
  validUntil: bigint;
}

export interface MembershipRecoveryAuthorization {
  programId: Bytes32;
  membershipId: Bytes32;
  newAccount: Address;
  nonce: bigint;
  validUntil: bigint;
}

export interface AgentAuthorization {
  principal: Address;
  target: Address;
  selector: Hex;
  maxNativeValue: bigint;
  asset: Address;
  maxAssetAmountPerAction: bigint;
  periodAssetLimit: bigint;
  periodSeconds: bigint;
  issuedAt: bigint;
  expiresAt: bigint;
  maxCallsPerPeriod: number;
  nonce: bigint;
  purposeCommitment: Bytes32;
}

export interface PrepareRobinhoodActionContext {
  account: string;
  intentId: string;
  preparedAt?: Date | string;
  expiresAt?: Date | string;
}

export interface RobinhoodReadClient {
  readonly network: RobinhoodNetwork;
  readonly programId: Bytes32;
  readProgram(): Promise<RobinhoodRead<ProgramSnapshot>>;
  readAccounting(): Promise<RobinhoodRead<ProgramAccountingSnapshot>>;
  readMembership(
    membershipId: Bytes32,
  ): Promise<RobinhoodRead<MembershipSnapshot>>;
  readRequest(requestId: Bytes32): Promise<RobinhoodRead<RequestSnapshot>>;
  readObligation(
    requestId: Bytes32,
  ): Promise<RobinhoodRead<ObligationSnapshot>>;
  readRole(role: ProgramRole): Promise<RobinhoodRead<RoleSnapshot>>;
  readPause(scope: PauseScope): Promise<RobinhoodRead<PauseSnapshot>>;
}

export interface RobinhoodActionBuilder {
  readonly network: RobinhoodNetwork;
  readonly programId: Bytes32;
  markProgramReviewed(
    context: PrepareRobinhoodActionContext,
  ): PreparedRobinhoodAction;
  markProgramFunded(
    context: PrepareRobinhoodActionContext,
  ): PreparedRobinhoodAction;
  approveActivationAsSponsor(
    context: PrepareRobinhoodActionContext,
  ): PreparedRobinhoodAction;
  approveActivationAsOperator(
    context: PrepareRobinhoodActionContext,
  ): PreparedRobinhoodAction;
  openEnrollment(
    context: PrepareRobinhoodActionContext,
  ): PreparedRobinhoodAction;
  activateProgram(
    context: PrepareRobinhoodActionContext,
  ): PreparedRobinhoodAction;
  enterRunoff(context: PrepareRobinhoodActionContext): PreparedRobinhoodAction;
  closeProgram(context: PrepareRobinhoodActionContext): PreparedRobinhoodAction;
  approveCancellationAsSponsor(
    context: PrepareRobinhoodActionContext,
  ): PreparedRobinhoodAction;
  approveCancellationAsOperator(
    context: PrepareRobinhoodActionContext,
  ): PreparedRobinhoodAction;
  cancelBeforePromises(
    context: PrepareRobinhoodActionContext,
  ): PreparedRobinhoodAction;
  approveExactUsdg(
    params: PrepareRobinhoodActionContext & { amount: RobinhoodAssetAmount },
  ): PreparedRobinhoodAction;
  fundProgram(
    params: PrepareRobinhoodActionContext & {
      amount: RobinhoodAssetAmount;
      fundingReference: Bytes32;
    },
  ): PreparedRobinhoodAction;
  claimMaturedRefund(
    params: PrepareRobinhoodActionContext & { recipient: string },
  ): PreparedRobinhoodAction;
  activateMembership(
    params: PrepareRobinhoodActionContext & {
      eligibility: EligibilityAuthorization;
      signature: Hex;
    },
  ): PreparedRobinhoodAction;
  recoverMembershipAccount(
    params: PrepareRobinhoodActionContext & {
      authorization: MembershipRecoveryAuthorization;
      signature: Hex;
    },
  ): PreparedRobinhoodAction;
  expireMembership(
    params: PrepareRobinhoodActionContext & { membershipId: Bytes32 },
  ): PreparedRobinhoodAction;
  cancelMembership(
    params: PrepareRobinhoodActionContext & { membershipId: Bytes32 },
  ): PreparedRobinhoodAction;
  openRequest(
    params: PrepareRobinhoodActionContext & {
      membershipId: Bytes32;
      evidenceManifestCommitment: Bytes32;
      recipientCommitment: Bytes32;
      requestedAmount: RobinhoodAssetAmount;
    },
  ): PreparedRobinhoodAction;
  updateEvidence(
    params: PrepareRobinhoodActionContext & {
      requestId: Bytes32;
      evidenceManifestCommitment: Bytes32;
    },
  ): PreparedRobinhoodAction;
  executeInitialDecision(
    params: PrepareRobinhoodActionContext & {
      decision: NakamaDecisionMessage;
      payoutRecipient: string;
      recipientSalt: Bytes32;
      signature: Hex;
    },
  ): PreparedRobinhoodAction;
  fileAppeal(
    params: PrepareRobinhoodActionContext & {
      requestId: Bytes32;
      appealManifestCommitment: Bytes32;
    },
  ): PreparedRobinhoodAction;
  executeAppealDecision(
    params: PrepareRobinhoodActionContext & {
      decision: NakamaDecisionMessage;
      payoutRecipient: string;
      recipientSalt: Bytes32;
      signature: Hex;
    },
  ): PreparedRobinhoodAction;
  escalateNoQuorum(
    params: PrepareRobinhoodActionContext & { requestId: Bytes32 },
  ): PreparedRobinhoodAction;
  escalateInformationTimeout(
    params: PrepareRobinhoodActionContext & { requestId: Bytes32 },
  ): PreparedRobinhoodAction;
  finalizeUnappealedDenial(
    params: PrepareRobinhoodActionContext & { requestId: Bytes32 },
  ): PreparedRobinhoodAction;
  settleObligation(
    params: PrepareRobinhoodActionContext & { requestId: Bytes32 },
  ): PreparedRobinhoodAction;
  grantAgentAuthorization(
    params: PrepareRobinhoodActionContext & {
      authorization: AgentAuthorization;
    },
  ): PreparedRobinhoodAction;
  revokeAgentAuthorization(
    params: PrepareRobinhoodActionContext & {
      authorizationId: Bytes32;
      reasonCode: Bytes32;
    },
  ): PreparedRobinhoodAction;
  pauseScope(
    params: PrepareRobinhoodActionContext & {
      scope: PauseScope;
      incidentId: Bytes32;
      reasonCode: Bytes32;
      reviewRequiredAt: bigint;
    },
  ): PreparedRobinhoodAction;
  approveUnpauseAsOperator(
    params: PrepareRobinhoodActionContext & {
      scope: PauseScope;
      incidentId: Bytes32;
    },
  ): PreparedRobinhoodAction;
  unpauseScope(
    params: PrepareRobinhoodActionContext & {
      scope: PauseScope;
      incidentId: Bytes32;
    },
  ): PreparedRobinhoodAction;
  setDependencyWarning(
    params: PrepareRobinhoodActionContext & {
      dependencyId: Bytes32;
      active: boolean;
      reasonCode: Bytes32;
      incidentId: Bytes32;
    },
  ): PreparedRobinhoodAction;
  guardianRevokeAgentAuthorization(
    params: PrepareRobinhoodActionContext & {
      authorizationId: Bytes32;
      incidentId: Bytes32;
    },
  ): PreparedRobinhoodAction;
}

export const ROBINHOOD_EVENT_NAMES = Object.freeze([
  'ActivationApprovalRecorded',
  'AgentAuthorizationEmergencyRevoked',
  'AppealFiled',
  'AssetRegistered',
  'AssetStatusChanged',
  'AuthorityTransferStarted',
  'AuthorityTransferred',
  'AuthorizationBlocked',
  'AuthorizationConsumed',
  'AuthorizationGranted',
  'AuthorizationRevoked',
  'CancellationApprovalRecorded',
  'ClaimManagerBound',
  'DecisionConsumed',
  'DependencyWarningChanged',
  'EIP712DomainChanged',
  'EvidenceManifestUpdated',
  'MemberLiabilityChanged',
  'MembershipAccountRecovered',
  'MembershipActivated',
  'MembershipStateChanged',
  'ModulesBound',
  'ObligationApproved',
  'ObligationSettled',
  'OperatorUnpauseApproved',
  'PendingReservationChanged',
  'ProgramRegistered',
  'ProgramStateChanged',
  'ProgramSuiteDeployed',
  'RequestOpened',
  'RequestStateChanged',
  'SafetyGuardianBound',
  'ScopePaused',
  'ScopeUnpaused',
  'SettlementExecuted',
  'SettlementModuleBound',
  'SponsorFundingReceived',
  'SponsorRefundClaimed',
  'SponsorRefundMatured',
  'SuiteRegistered',
  'SuiteStatusChanged',
] as const);

export type RobinhoodEventName = (typeof ROBINHOOD_EVENT_NAMES)[number];

export interface RobinhoodEventLog {
  address: Address;
  data: Hex;
  topics: readonly Hex[];
  blockNumber?: bigint;
  blockHash?: Hex;
  transactionHash?: Hex;
  logIndex?: number;
}

export interface DecodedRobinhoodEvent {
  role: RobinhoodContractRole;
  eventName: RobinhoodEventName;
  args: Record<string, unknown> | readonly unknown[];
  log: RobinhoodEventLog;
}

export interface DecodedRobinhoodError {
  role: RobinhoodContractRole;
  errorName: string;
  args: readonly unknown[];
  data: Hex;
}

export function createRobinhoodReadClient(params: {
  client: RobinhoodPublicClient;
  manifest: RobinhoodDeploymentManifest;
  bundle: RobinhoodProtocolArtifactBundle;
  runtime: VerifiedRobinhoodDeploymentRuntime;
  programId: Bytes32;
}): RobinhoodReadClient {
  assertRobinhoodDeploymentReady(params.manifest, params.bundle, {
    requireAudit: false,
  });
  const bundle = getGeneratedRobinhoodArtifactBundle();
  const manifest = bundle.deployments[params.manifest.network];
  assertRobinhoodDeploymentReady(manifest, bundle, { requireAudit: false });
  const programId = assertBytes32(params.programId, 'programId');
  assertVerifiedRuntimeTarget({
    manifest,
    runtime: params.runtime,
    programId,
  });
  const asset = requireRobinhoodUsdg(
    manifest.network,
    manifest.settlementAsset,
  );
  const read = async (
    role: RobinhoodContractRole,
    functionName: string,
    args: readonly unknown[] = [],
    blockNumber?: bigint,
  ): Promise<unknown> => {
    const deployment = getRobinhoodContractDeployment(manifest, role);
    const artifact = getRobinhoodContractArtifact(bundle, role);
    return await params.client.readContract({
      address: deployment.address,
      abi: artifact.abi,
      functionName,
      args,
      blockNumber,
    } as never);
  };
  const atBlock = async <T>(
    operation: (blockNumber: bigint) => Promise<T>,
  ): Promise<RobinhoodRead<T>> => {
    const actualChainId = await params.client.getChainId();
    if (actualChainId !== manifest.chainId) {
      throw new NakamaRobinhoodWrongChainError(
        'Read RPC chain does not match the verified Robinhood deployment.',
        {
          details: {
            actualChainId,
            expectedChainId: manifest.chainId,
          },
        },
      );
    }
    const blockNumber = await params.client.getBlockNumber();
    const value = await operation(blockNumber);
    return {
      value,
      context: await createReadContext(
        params.client,
        manifest.network,
        blockNumber,
      ),
    };
  };

  return {
    network: manifest.network,
    programId,
    async readProgram() {
      return await atBlock(async (blockNumber) => {
        const functionNames = [
          'programId',
          'suiteId',
          'sponsorLegalEntityCommitment',
          'metadataCommitment',
          'termsCommitment',
          'privacyCommitment',
          'operationsCommitment',
          'activationChecklistCommitment',
          'fundingAsset',
          'vault',
          'membershipRegistry',
          'claimManager',
          'decisionModule',
          'settlementModule',
          'enrollmentOpensAt',
          'activeAt',
          'runoffAt',
          'closesAt',
          'appealWindow',
          'initialDecisionWindow',
          'appealDecisionWindow',
          'perMemberCap',
          'aggregateCap',
          'maxMembers',
          'state',
        ] as const;
        const values = await Promise.all(
          functionNames.map((name) => read('program', name, [], blockNumber)),
        );
        const byName = Object.fromEntries(
          functionNames.map((name, index) => [name, values[index]]),
        );
        const actualProgramId = requireBytes32Value(
          byName.programId,
          'programId',
        );
        if (actualProgramId.toLowerCase() !== programId.toLowerCase()) {
          throw new NakamaRobinhoodContractError(
            'Program ID does not match the configured SDK target.',
          );
        }
        const actualSuiteId = requireBytes32Value(byName.suiteId, 'suiteId');
        if (
          actualSuiteId.toLowerCase() !== params.runtime.suiteId.toLowerCase()
        ) {
          throw new NakamaRobinhoodContractError(
            'Program suite does not match the verified runtime.',
          );
        }
        const fundingAsset = requireAddressValue(
          byName.fundingAsset,
          'fundingAsset',
        );
        const vault = requireAddressValue(byName.vault, 'vault');
        const membershipRegistry = requireAddressValue(
          byName.membershipRegistry,
          'membershipRegistry',
        );
        const requestManager = requireAddressValue(
          byName.claimManager,
          'claimManager',
        );
        const decisionModule = requireAddressValue(
          byName.decisionModule,
          'decisionModule',
        );
        const settlementModule = requireAddressValue(
          byName.settlementModule,
          'settlementModule',
        );
        assertProgramAddress(
          fundingAsset,
          manifest.settlementAsset.address,
          'fundingAsset',
        );
        assertProgramAddress(
          vault,
          getRobinhoodContractDeployment(manifest, 'vault').address,
          'vault',
        );
        assertProgramAddress(
          membershipRegistry,
          getRobinhoodContractDeployment(manifest, 'membershipRegistry')
            .address,
          'membershipRegistry',
        );
        assertProgramAddress(
          requestManager,
          getRobinhoodContractDeployment(manifest, 'requestManager').address,
          'claimManager',
        );
        assertProgramAddress(
          decisionModule,
          getRobinhoodContractDeployment(manifest, 'decisionModule').address,
          'decisionModule',
        );
        assertProgramAddress(
          settlementModule,
          getRobinhoodContractDeployment(manifest, 'settlementModule').address,
          'settlementModule',
        );
        return {
          address: getRobinhoodContractDeployment(manifest, 'program').address,
          programId: actualProgramId,
          suiteId: actualSuiteId,
          sponsorCommitment: requireBytes32Value(
            byName.sponsorLegalEntityCommitment,
            'sponsorLegalEntityCommitment',
          ),
          metadataCommitment: requireBytes32Value(
            byName.metadataCommitment,
            'metadataCommitment',
          ),
          termsCommitment: requireBytes32Value(
            byName.termsCommitment,
            'termsCommitment',
          ),
          privacyCommitment: requireBytes32Value(
            byName.privacyCommitment,
            'privacyCommitment',
          ),
          operationsCommitment: requireBytes32Value(
            byName.operationsCommitment,
            'operationsCommitment',
          ),
          activationChecklistCommitment: requireBytes32Value(
            byName.activationChecklistCommitment,
            'activationChecklistCommitment',
          ),
          fundingAsset,
          vault,
          membershipRegistry,
          requestManager,
          decisionModule,
          settlementModule,
          enrollmentOpensAt: requireBigInt(
            byName.enrollmentOpensAt,
            'enrollmentOpensAt',
          ),
          activeAt: requireBigInt(byName.activeAt, 'activeAt'),
          runoffAt: requireBigInt(byName.runoffAt, 'runoffAt'),
          closesAt: requireBigInt(byName.closesAt, 'closesAt'),
          appealWindow: requireBigInt(byName.appealWindow, 'appealWindow'),
          initialDecisionWindow: requireBigInt(
            byName.initialDecisionWindow,
            'initialDecisionWindow',
          ),
          appealDecisionWindow: requireBigInt(
            byName.appealDecisionWindow,
            'appealDecisionWindow',
          ),
          perMemberCap: createRobinhoodAssetAmount({
            units: requireBigInt(byName.perMemberCap, 'perMemberCap'),
            asset,
          }),
          aggregateCap: createRobinhoodAssetAmount({
            units: requireBigInt(byName.aggregateCap, 'aggregateCap'),
            asset,
          }),
          maxMembers: requireNumber(byName.maxMembers, 'maxMembers'),
          state: decodeProgramState(requireNumber(byName.state, 'state')),
        };
      });
    },
    async readAccounting() {
      return await atBlock(async (blockNumber) => {
        const [
          accountingRaw,
          actualAssetsRaw,
          freeLiquidityRaw,
          reconciledRaw,
        ] = await Promise.all([
          read('vault', 'accounting', [], blockNumber),
          read('vault', 'actualAssets', [], blockNumber),
          read('vault', 'freeLiquidity', [], blockNumber),
          read('vault', 'reconciled', [], blockNumber),
        ]);
        const amount = (units: bigint) =>
          createRobinhoodAssetAmount({ units, asset });
        return {
          vault: getRobinhoodContractDeployment(manifest, 'vault').address,
          actualAssets: amount(requireBigInt(actualAssetsRaw, 'actualAssets')),
          maximumRemainingMemberLiability: amount(
            requireBigInt(
              tupleField(accountingRaw, 'maximumRemainingMemberLiability', 3),
              'maximumRemainingMemberLiability',
            ),
          ),
          pendingRequestReservation: amount(
            requireBigInt(
              tupleField(accountingRaw, 'pendingRequestReservation', 4),
              'pendingRequestReservation',
            ),
          ),
          approvedUnpaidObligations: amount(
            requireBigInt(
              tupleField(accountingRaw, 'approvedUnpaidObligations', 5),
              'approvedUnpaidObligations',
            ),
          ),
          maturedRefunds: amount(
            requireBigInt(
              tupleField(accountingRaw, 'maturedRefunds', 6),
              'maturedRefunds',
            ),
          ),
          encumberedAssets: amount(
            requireBigInt(
              tupleField(accountingRaw, 'maximumRemainingMemberLiability', 3),
              'maximumRemainingMemberLiability',
            ) +
              requireBigInt(
                tupleField(accountingRaw, 'approvedUnpaidObligations', 5),
                'approvedUnpaidObligations',
              ) +
              requireBigInt(
                tupleField(accountingRaw, 'maturedRefunds', 6),
                'maturedRefunds',
              ),
          ),
          freeLiquidity: amount(
            requireBigInt(freeLiquidityRaw, 'freeLiquidity'),
          ),
          reconciled: requireBoolean(reconciledRaw, 'reconciled'),
        };
      });
    },
    async readMembership(membershipId) {
      const id = assertBytes32(membershipId, 'membershipId');
      return await atBlock(async (blockNumber) => {
        const [raw, remaining] = await Promise.all([
          read('membershipRegistry', 'membership', [id], blockNumber),
          read('vault', 'memberRemaining', [id], blockNumber),
        ]);
        const remainingUnits = requireBigInt(remaining, 'memberRemaining');
        return {
          programId,
          memberCommitment: requireBytes32Value(
            tupleField(raw, 'memberCommitment', 0),
            'memberCommitment',
          ),
          account: null,
          activatedAt: requireBigInt(
            tupleField(raw, 'activatedAt', 1),
            'activatedAt',
          ),
          expiresAt: requireBigInt(
            tupleField(raw, 'expiresAt', 2),
            'expiresAt',
          ),
          remainingBenefit: createRobinhoodAssetAmount({
            units: remainingUnits,
            asset,
          }),
          state: decodeMembershipState(
            requireNumber(tupleField(raw, 'state', 3), 'membership.state'),
          ),
        };
      });
    },
    async readRequest(requestId) {
      const id = assertBytes32(requestId, 'requestId');
      return await atBlock(async (blockNumber) => {
        const raw = await read('requestManager', 'request', [id], blockNumber);
        return decodeRequestSnapshot(raw, id, programId, asset);
      });
    },
    async readObligation(requestId) {
      const id = assertBytes32(requestId, 'requestId');
      return await atBlock(async (blockNumber) => {
        const [rawRequest, amountRaw] = await Promise.all([
          read('requestManager', 'request', [id], blockNumber),
          read('vault', 'obligationAmount', [id], blockNumber),
        ]);
        const request = decodeRequestSnapshot(rawRequest, id, programId, asset);
        const amountUnits = requireBigInt(amountRaw, 'obligationAmount');
        const approvedUnits = request.approvedAmount.units;
        const approvedUnpaid = request.state === 'approved';
        const settled = request.state === 'settled';
        const consistent = approvedUnpaid
          ? approvedUnits > 0n && amountUnits === approvedUnits
          : settled
            ? approvedUnits > 0n && amountUnits === 0n
            : approvedUnits === 0n && amountUnits === 0n;
        if (!consistent) {
          throw new NakamaRobinhoodContractError(
            'Vault obligation amount or retained approval contradicts the canonical request state.',
          );
        }
        const obligationUnits = settled ? approvedUnits : amountUnits;
        return {
          programId,
          requestId: id,
          decisionDigest: null,
          recipientCommitment: request.recipientCommitment,
          amount: createRobinhoodAssetAmount({
            units: obligationUnits,
            asset,
          }),
          createdAt: null,
          settledAt: null,
          settlementTransaction: null,
          state:
            request.state === 'settled'
              ? 'settled'
              : request.state === 'approved'
                ? 'approved_unpaid'
                : 'none',
        } satisfies ObligationSnapshot;
      });
    },
    async readRole(role) {
      return await atBlock(async (blockNumber) => {
        const functionName = roleFunctionName(role);
        const account = requireAddressValue(
          await read('program', functionName, [], blockNumber),
          functionName,
        );
        return { programId, role, account, active: true, validUntil: null };
      });
    },
    async readPause(scope) {
      return await atBlock(async (blockNumber) => {
        const raw = await read(
          'safetyGuardian',
          'pauseRecord',
          [pauseScopeCode(scope)],
          blockNumber,
        );
        return {
          programId,
          scope,
          incidentId: requireBytes32Value(
            tupleField(raw, 'incidentId', 0),
            'incidentId',
          ),
          publicReasonCode: requireBytes32Value(
            tupleField(raw, 'reasonCode', 1),
            'reasonCode',
          ),
          pausedAt: requireBigInt(tupleField(raw, 'openedAt', 2), 'openedAt'),
          reviewRequiredAt: requireBigInt(
            tupleField(raw, 'reviewRequiredAt', 3),
            'reviewRequiredAt',
          ),
          active: requireBoolean(tupleField(raw, 'active', 4), 'active'),
        };
      });
    },
  };
}

export function createRobinhoodActionBuilder(params: {
  manifest: RobinhoodDeploymentManifest;
  bundle: RobinhoodProtocolArtifactBundle;
  runtime: VerifiedRobinhoodDeploymentRuntime;
  programId: Bytes32;
}): RobinhoodActionBuilder {
  assertRobinhoodDeploymentReady(params.manifest, params.bundle);
  const bundle = getGeneratedRobinhoodArtifactBundle();
  const manifest = bundle.deployments[params.manifest.network];
  assertRobinhoodDeploymentReady(manifest, bundle);
  const programId = assertBytes32(params.programId, 'programId');
  assertVerifiedRuntimeTarget({
    manifest,
    runtime: params.runtime,
    programId,
  });
  const asset = requireRobinhoodUsdg(
    manifest.network,
    manifest.settlementAsset,
  );
  const encode = (
    role: RobinhoodContractRole,
    functionName: string,
    args: readonly unknown[],
  ) => {
    const artifact = getRobinhoodContractArtifact(bundle, role);
    try {
      return encodeFunctionData({
        abi: artifact.abi,
        functionName,
        args,
      } as never);
    } catch (error) {
      throw new NakamaRobinhoodContractError(
        `Unable to encode ${artifact.contractName}.${functionName}.`,
        { cause: error, details: { role, functionName } },
      );
    }
  };
  const prepare = (input: {
    context: PrepareRobinhoodActionContext;
    action: RobinhoodActionName;
    role?: RobinhoodContractRole;
    target?: Address;
    abi?: Abi;
    functionName: string;
    args?: readonly unknown[];
    explanation: string;
    expectedStateChanges?: readonly RobinhoodExpectedStateChange[];
  }): PreparedRobinhoodAction => {
    const target =
      input.target ??
      getRobinhoodContractDeployment(manifest, input.role!).address;
    const data = input.abi
      ? encodeFunctionData({
          abi: input.abi,
          functionName: input.functionName,
          args: input.args ?? [],
        } as never)
      : encode(input.role!, input.functionName, input.args ?? []);
    return createPreparedAction({
      network: manifest.network,
      programId,
      context: input.context,
      action: input.action,
      target,
      data,
      explanation: input.explanation,
      expectedStateChanges: input.expectedStateChanges ?? [],
    });
  };
  const noArgs = (
    context: PrepareRobinhoodActionContext,
    action: RobinhoodActionName,
    functionName: string,
    explanation: string,
    state?: string,
  ) =>
    prepare({
      context,
      action,
      role: 'program',
      functionName,
      explanation,
      expectedStateChanges: state
        ? [{ field: 'program.state', to: state }]
        : [],
    });
  const ensureAmount = (amount: RobinhoodAssetAmount) => {
    const expected = createRobinhoodAssetAmount({ units: amount.units, asset });
    assertSameRobinhoodAsset(amount, expected);
    if (amount.units <= 0n) {
      throw new NakamaRobinhoodConfigError('USDG amount must be positive.');
    }
    assertUint(amount.units, 'USDG amount');
  };
  const normalizeEligibility = (
    input: PrepareRobinhoodActionContext & {
      eligibility: EligibilityAuthorization;
    },
  ): EligibilityAuthorization => {
    const account = requireNonZeroAddress(
      input.eligibility.account,
      'eligibility.account',
    );
    if (
      input.eligibility.programId.toLowerCase() !== programId.toLowerCase() ||
      account !== requireNonZeroAddress(input.account, 'account')
    ) {
      throw new NakamaRobinhoodConfigError(
        'Eligibility authorization must bind the action program and account.',
      );
    }
    assertUint(input.eligibility.nonce, 'eligibility.nonce');
    assertUint(input.eligibility.validUntil, 'eligibility.validUntil', 64);
    if (input.eligibility.validUntil <= actionContextUnixSeconds(input)) {
      throw new NakamaRobinhoodConfigError(
        'Eligibility authorization must remain valid at preparation time.',
      );
    }
    return {
      ...input.eligibility,
      programId,
      account,
      memberCommitment: requireNonZeroCommitment(
        input.eligibility.memberCommitment,
        'eligibility.memberCommitment',
      ),
      termsCommitment: requireNonZeroCommitment(
        input.eligibility.termsCommitment,
        'eligibility.termsCommitment',
      ),
      privacyCommitment: requireNonZeroCommitment(
        input.eligibility.privacyCommitment,
        'eligibility.privacyCommitment',
      ),
    };
  };
  const normalizeRecovery = (
    input: PrepareRobinhoodActionContext & {
      authorization: MembershipRecoveryAuthorization;
    },
  ): MembershipRecoveryAuthorization => {
    const newAccount = requireNonZeroAddress(
      input.authorization.newAccount,
      'authorization.newAccount',
    );
    if (
      input.authorization.programId.toLowerCase() !== programId.toLowerCase() ||
      newAccount !== requireNonZeroAddress(input.account, 'account')
    ) {
      throw new NakamaRobinhoodConfigError(
        'Recovery authorization must bind the action program and new account.',
      );
    }
    assertUint(input.authorization.nonce, 'authorization.nonce');
    assertUint(input.authorization.validUntil, 'authorization.validUntil', 64);
    if (input.authorization.validUntil <= actionContextUnixSeconds(input)) {
      throw new NakamaRobinhoodConfigError(
        'Recovery authorization must remain valid at preparation time.',
      );
    }
    return {
      ...input.authorization,
      programId,
      membershipId: requireNonZeroCommitment(
        input.authorization.membershipId,
        'authorization.membershipId',
      ),
      newAccount,
    };
  };
  const normalizeAgentAuthorization = (
    input: PrepareRobinhoodActionContext & {
      authorization: AgentAuthorization;
    },
  ): AgentAuthorization => {
    const authorization = input.authorization;
    const principal = requireNonZeroAddress(
      authorization.principal,
      'authorization.principal',
    );
    const target = requireNonZeroAddress(
      authorization.target,
      'authorization.target',
    );
    if (!/^0x[0-9a-f]{8}$/i.test(authorization.selector)) {
      throw new NakamaRobinhoodConfigError(
        'Agent authorization selector must be exactly four bytes.',
      );
    }
    if (
      authorization.selector.toLowerCase() === '0x00000000' ||
      authorization.selector.toLowerCase() === '0xffffffff'
    ) {
      throw new NakamaRobinhoodConfigError(
        'Agent authorization selector cannot be zero or wildcard-like.',
      );
    }
    const forbiddenTargets = new Set([
      ...Object.values(manifest.contracts).map(({ address }) =>
        address.toLowerCase(),
      ),
      manifest.settlementAsset.address?.toLowerCase(),
    ]);
    if (forbiddenTargets.has(target.toLowerCase())) {
      throw new NakamaRobinhoodConfigError(
        'Agent authorization target is a protected protocol or settlement address.',
      );
    }
    if (
      authorization.maxNativeValue !== 0n ||
      authorization.asset !== zeroAddress ||
      authorization.maxAssetAmountPerAction !== 0n ||
      authorization.periodAssetLimit !== 0n
    ) {
      throw new NakamaRobinhoodConfigError(
        'Phase 0 agent authorization must be strictly non-economic.',
      );
    }
    assertUint(authorization.issuedAt, 'authorization.issuedAt', 64);
    assertUint(authorization.expiresAt, 'authorization.expiresAt', 64);
    assertUint(authorization.periodSeconds, 'authorization.periodSeconds', 64);
    assertUint(authorization.nonce, 'authorization.nonce');
    const preparedAt = actionContextUnixSeconds(input);
    if (
      authorization.issuedAt > preparedAt ||
      authorization.expiresAt <= preparedAt ||
      authorization.expiresAt <= authorization.issuedAt ||
      authorization.expiresAt - authorization.issuedAt >
        MAX_AGENT_AUTHORIZATION_DURATION ||
      authorization.periodSeconds === 0n ||
      authorization.periodSeconds > MAX_AGENT_PERIOD ||
      !Number.isSafeInteger(authorization.maxCallsPerPeriod) ||
      authorization.maxCallsPerPeriod < 1 ||
      authorization.maxCallsPerPeriod > MAX_AGENT_CALLS_PER_PERIOD
    ) {
      throw new NakamaRobinhoodConfigError(
        'Agent authorization time and call bounds are invalid.',
      );
    }
    return {
      ...authorization,
      principal,
      target,
      asset: zeroAddress,
      purposeCommitment: requireNonZeroCommitment(
        authorization.purposeCommitment,
        'authorization.purposeCommitment',
      ),
    };
  };
  const decisionArgs = (
    input: {
      decision: NakamaDecisionMessage;
      payoutRecipient: string;
      recipientSalt: Bytes32;
      signature: Hex;
    },
    expectedRound: 1 | 2,
  ) => {
    const decision = createNakamaDecisionTypedData({
      network: manifest.network,
      decisionModule: getRobinhoodContractDeployment(manifest, 'decisionModule')
        .address,
      message: input.decision,
    }).message;
    if (
      decision.programId.toLowerCase() !== programId.toLowerCase() ||
      decision.reviewRound !== expectedRound
    ) {
      throw new NakamaRobinhoodConfigError(
        'Decision must bind the action program and expected review round.',
      );
    }
    return [
      decision,
      requireNonZeroAddress(input.payoutRecipient, 'payoutRecipient'),
      requireNonZeroCommitment(input.recipientSalt, 'recipientSalt'),
      requireNonEmptyHex(input.signature, 'signature'),
    ] as const;
  };

  return {
    network: manifest.network,
    programId,
    markProgramReviewed: (context) =>
      noArgs(
        context,
        'mark_program_reviewed',
        'markReviewed',
        'Mark the reviewed program configuration.',
        'reviewed',
      ),
    markProgramFunded: (context) =>
      noArgs(
        context,
        'mark_program_funded',
        'markFunded',
        'Verify exact USDG funding and mark the program funded.',
        'funded',
      ),
    approveActivationAsSponsor: (context) =>
      noArgs(
        context,
        'approve_activation_as_sponsor',
        'approveActivationAsSponsor',
        'Record sponsor approval for program activation.',
      ),
    approveActivationAsOperator: (context) =>
      noArgs(
        context,
        'approve_activation_as_operator',
        'approveActivationAsOperator',
        'Record operator approval for program activation.',
      ),
    openEnrollment: (context) =>
      noArgs(
        context,
        'open_enrollment',
        'openEnrollment',
        'Open member enrollment after funding and dual approval.',
        'enrollment_open',
      ),
    activateProgram: (context) =>
      noArgs(
        context,
        'activate_program',
        'activate',
        'Activate the funded protection program.',
        'active',
      ),
    enterRunoff: (context) =>
      noArgs(
        context,
        'enter_runoff',
        'enterRunoff',
        'Enter runoff while preserving outstanding member rights.',
        'runoff',
      ),
    closeProgram: (context) =>
      noArgs(
        context,
        'close_program',
        'close',
        'Close the program only after all rights and obligations clear.',
        'closed',
      ),
    approveCancellationAsSponsor: (context) =>
      noArgs(
        context,
        'approve_cancellation_as_sponsor',
        'approveCancellationAsSponsor',
        'Record sponsor approval to cancel before any member promises.',
      ),
    approveCancellationAsOperator: (context) =>
      noArgs(
        context,
        'approve_cancellation_as_operator',
        'approveCancellationAsOperator',
        'Record operator approval to cancel before any member promises.',
      ),
    cancelBeforePromises: (context) =>
      noArgs(
        context,
        'cancel_before_promises',
        'cancelBeforePromises',
        'Cancel the program before any member promise exists.',
        'cancelled',
      ),
    approveExactUsdg(input) {
      ensureAmount(input.amount);
      return prepare({
        context: input,
        action: 'approve_usdg',
        target: asset.address,
        abi: ERC20_APPROVE_ABI,
        functionName: 'approve',
        args: [
          getRobinhoodContractDeployment(manifest, 'vault').address,
          input.amount.units,
        ],
        explanation: `Approve exactly ${input.amount.units.toString(10)} USDG base units for this program vault.`,
        expectedStateChanges: [
          { field: 'usdg.allowance', to: input.amount.units.toString(10) },
        ],
      });
    },
    fundProgram(input) {
      ensureAmount(input.amount);
      return prepare({
        context: input,
        action: 'fund_program',
        role: 'vault',
        functionName: 'fund',
        args: [
          input.amount.units,
          requireNonZeroCommitment(input.fundingReference, 'fundingReference'),
        ],
        explanation: `Fund the segregated program vault with exactly ${input.amount.units.toString(10)} USDG base units.`,
        expectedStateChanges: [
          {
            field: 'vault.sponsorFunded',
            to: `+${input.amount.units.toString(10)}`,
          },
        ],
      });
    },
    claimMaturedRefund(input) {
      return prepare({
        context: input,
        action: 'claim_matured_refund',
        role: 'vault',
        functionName: 'claimMaturedRefund',
        args: [requireNonZeroAddress(input.recipient, 'recipient')],
        explanation:
          'Claim only the sponsor refund already matured by terminal program state.',
        expectedStateChanges: [{ field: 'vault.maturedRefunds', to: '0' }],
      });
    },
    activateMembership(input) {
      return prepare({
        context: input,
        action: 'activate_membership',
        role: 'membershipRegistry',
        functionName: 'activateMembership',
        args: [
          normalizeEligibility(input),
          requireNonEmptyHex(input.signature, 'signature'),
        ],
        explanation:
          'Activate this non-transferable membership against the exact program terms and privacy commitment.',
        expectedStateChanges: [{ field: 'membership.state', to: 'active' }],
      });
    },
    recoverMembershipAccount(input) {
      return prepare({
        context: input,
        action: 'recover_membership_account',
        role: 'membershipRegistry',
        functionName: 'recoverMembershipAccount',
        args: [
          normalizeRecovery(input),
          requireNonEmptyHex(input.signature, 'signature'),
        ],
        explanation:
          'Move an active membership to its authorized recovery account.',
        expectedStateChanges: [
          { field: 'membership.account', to: input.authorization.newAccount },
        ],
      });
    },
    expireMembership(input) {
      return prepare({
        context: input,
        action: 'expire_membership',
        role: 'membershipRegistry',
        functionName: 'expireMembership',
        args: [requireNonZeroCommitment(input.membershipId, 'membershipId')],
        explanation:
          'Expire a membership only after its term and requests have cleared.',
        expectedStateChanges: [{ field: 'membership.state', to: 'expired' }],
      });
    },
    cancelMembership(input) {
      return prepare({
        context: input,
        action: 'cancel_membership',
        role: 'membershipRegistry',
        functionName: 'cancelMembership',
        args: [requireNonZeroCommitment(input.membershipId, 'membershipId')],
        explanation:
          'Cancel this membership during enrollment while no request is open.',
        expectedStateChanges: [{ field: 'membership.state', to: 'cancelled' }],
      });
    },
    openRequest(input) {
      ensureAmount(input.requestedAmount);
      return prepare({
        context: input,
        action: 'open_request',
        role: 'requestManager',
        functionName: 'openRequest',
        args: [
          requireNonZeroCommitment(input.membershipId, 'membershipId'),
          requireNonZeroCommitment(
            input.evidenceManifestCommitment,
            'evidenceManifestCommitment',
          ),
          requireNonZeroCommitment(
            input.recipientCommitment,
            'recipientCommitment',
          ),
          input.requestedAmount.units,
        ],
        explanation:
          'Open a private-evidence request using only public-safe commitments onchain.',
        expectedStateChanges: [{ field: 'request.state', to: 'pending' }],
      });
    },
    updateEvidence(input) {
      return prepare({
        context: input,
        action: 'update_evidence',
        role: 'requestManager',
        functionName: 'updateEvidence',
        args: [
          requireNonZeroCommitment(input.requestId, 'requestId'),
          requireNonZeroCommitment(
            input.evidenceManifestCommitment,
            'evidenceManifestCommitment',
          ),
        ],
        explanation:
          'Commit a new private evidence-manifest version while the request is in InformationRequested.',
        expectedStateChanges: [{ field: 'request.evidenceVersion', to: '+1' }],
      });
    },
    executeInitialDecision(input) {
      return prepare({
        context: input,
        action: 'execute_initial_decision',
        role: 'requestManager',
        functionName: 'executeInitialDecision',
        args: decisionArgs(input, NAKAMA_DECISION_REVIEW_ROUND.initial),
        explanation:
          'Execute the exact initial human decision signed for the current request version.',
        expectedStateChanges: [
          { field: 'request.state', to: 'signed decision result' },
        ],
      });
    },
    fileAppeal(input) {
      return prepare({
        context: input,
        action: 'file_appeal',
        role: 'requestManager',
        functionName: 'fileAppeal',
        args: [
          requireNonZeroCommitment(input.requestId, 'requestId'),
          requireNonZeroCommitment(
            input.appealManifestCommitment,
            'appealManifestCommitment',
          ),
        ],
        explanation:
          'File an appeal with a new private evidence-manifest commitment.',
        expectedStateChanges: [{ field: 'request.state', to: 'appealed' }],
      });
    },
    executeAppealDecision(input) {
      return prepare({
        context: input,
        action: 'execute_appeal_decision',
        role: 'requestManager',
        functionName: 'executeAppealDecision',
        args: decisionArgs(input, NAKAMA_DECISION_REVIEW_ROUND.appeal),
        explanation:
          'Execute the exact independent appeal decision signed for the current request version.',
        expectedStateChanges: [
          { field: 'request.state', to: 'signed appeal result' },
        ],
      });
    },
    escalateNoQuorum(input) {
      return prepare({
        context: input,
        action: 'escalate_no_quorum',
        role: 'requestManager',
        functionName: 'escalateNoQuorum',
        args: [requireNonZeroCommitment(input.requestId, 'requestId')],
        explanation:
          'Escalate a missed decision deadline without automatically denying the request.',
        expectedStateChanges: [{ field: 'request.state', to: 'escalated' }],
      });
    },
    escalateInformationTimeout(input) {
      return prepare({
        context: input,
        action: 'escalate_information_timeout',
        role: 'requestManager',
        functionName: 'escalateInformationTimeout',
        args: [requireNonZeroCommitment(input.requestId, 'requestId')],
        explanation:
          'Escalate an expired information request while preserving its pending reserve.',
        expectedStateChanges: [{ field: 'request.state', to: 'escalated' }],
      });
    },
    finalizeUnappealedDenial(input) {
      return prepare({
        context: input,
        action: 'finalize_unappealed_denial',
        role: 'requestManager',
        functionName: 'finalizeUnappealedDenial',
        args: [requireNonZeroCommitment(input.requestId, 'requestId')],
        explanation:
          'Finalize a denial only after its appeal window has expired.',
        expectedStateChanges: [{ field: 'request.state', to: 'final_denied' }],
      });
    },
    settleObligation(input) {
      return prepare({
        context: input,
        action: 'settle_obligation',
        role: 'settlementModule',
        functionName: 'settle',
        args: [requireNonZeroCommitment(input.requestId, 'requestId')],
        explanation:
          'Settle the exact approved USDG obligation once, without changing its amount or recipient.',
        expectedStateChanges: [{ field: 'request.state', to: 'settled' }],
      });
    },
    grantAgentAuthorization(input) {
      return prepare({
        context: input,
        action: 'grant_agent_authorization',
        role: 'agentAuthorizationRegistry',
        functionName: 'grantAuthorization',
        args: [normalizeAgentAuthorization(input)],
        explanation:
          'Grant an expiring, selector-bound, non-economic agent authorization.',
      });
    },
    revokeAgentAuthorization(input) {
      return prepare({
        context: input,
        action: 'revoke_agent_authorization',
        role: 'agentAuthorizationRegistry',
        functionName: 'revokeAuthorization',
        args: [
          requireNonZeroCommitment(input.authorizationId, 'authorizationId'),
          requireNonZeroCommitment(input.reasonCode, 'reasonCode'),
        ],
        explanation:
          'Revoke a program agent authorization with a public-safe reason code.',
      });
    },
    pauseScope(input) {
      assertUint(input.reviewRequiredAt, 'reviewRequiredAt', 64);
      const preparedAt = actionContextUnixSeconds(input);
      if (
        input.reviewRequiredAt <= preparedAt ||
        input.reviewRequiredAt > preparedAt + MAX_PAUSE_DURATION
      ) {
        throw new NakamaRobinhoodConfigError(
          'Pause review deadline must be after preparation and within seven days.',
        );
      }
      return prepare({
        context: input,
        action: 'pause_scope',
        role: 'safetyGuardian',
        functionName: 'pause',
        args: [
          pauseScopeCode(input.scope),
          requireNonZeroCommitment(input.incidentId, 'incidentId'),
          requireNonZeroCommitment(input.reasonCode, 'reasonCode'),
          input.reviewRequiredAt,
        ],
        explanation: `Pause ${input.scope} for a bounded incident review window.`,
        expectedStateChanges: [{ field: `pause.${input.scope}`, to: 'active' }],
      });
    },
    approveUnpauseAsOperator(input) {
      return prepare({
        context: input,
        action: 'approve_unpause_as_operator',
        role: 'safetyGuardian',
        functionName: 'approveUnpauseAsOperator',
        args: [
          pauseScopeCode(input.scope),
          requireNonZeroCommitment(input.incidentId, 'incidentId'),
        ],
        explanation: `Record operator approval to unpause ${input.scope}.`,
      });
    },
    unpauseScope(input) {
      return prepare({
        context: input,
        action: 'unpause_scope',
        role: 'safetyGuardian',
        functionName: 'unpause',
        args: [
          pauseScopeCode(input.scope),
          requireNonZeroCommitment(input.incidentId, 'incidentId'),
        ],
        explanation: `Unpause ${input.scope} after operator approval and guardian review.`,
        expectedStateChanges: [
          { field: `pause.${input.scope}`, to: 'inactive' },
        ],
      });
    },
    setDependencyWarning(input) {
      return prepare({
        context: input,
        action: 'set_dependency_warning',
        role: 'safetyGuardian',
        functionName: 'setDependencyWarning',
        args: [
          requireNonZeroCommitment(input.dependencyId, 'dependencyId'),
          input.active,
          requireNonZeroCommitment(input.reasonCode, 'reasonCode'),
          requireNonZeroCommitment(input.incidentId, 'incidentId'),
        ],
        explanation: `${input.active ? 'Activate' : 'Clear'} a public-safe dependency warning.`,
      });
    },
    guardianRevokeAgentAuthorization(input) {
      return prepare({
        context: input,
        action: 'guardian_revoke_agent_authorization',
        role: 'safetyGuardian',
        functionName: 'revokeAgentAuthorization',
        args: [
          requireNonZeroCommitment(input.authorizationId, 'authorizationId'),
          requireNonZeroCommitment(input.incidentId, 'incidentId'),
        ],
        explanation:
          'Emergency-revoke an agent authorization for the named incident.',
      });
    },
  };
}

export async function simulateRobinhoodAction(params: {
  client: RobinhoodPublicClient;
  bundle: RobinhoodProtocolArtifactBundle;
  action: PreparedRobinhoodAction;
}): Promise<SimulatedRobinhoodAction> {
  assertPreparedAction(params.action);
  const actualChainId = await params.client.getChainId();
  if (actualChainId !== params.action.chainId) {
    throw new NakamaRobinhoodWrongChainError(
      'Simulation RPC chain does not match the prepared action.',
      { details: { actualChainId, expectedChainId: params.action.chainId } },
    );
  }
  const blockNumber = await params.client.getBlockNumber();
  try {
    const [call, gasEstimate] = await Promise.all([
      params.client.call({
        account: parseAccount(params.action),
        to: params.action.target,
        data: params.action.data,
        value: params.action.value,
        blockNumber,
      }),
      params.client.estimateGas({
        account: parseAccount(params.action),
        to: params.action.target,
        data: params.action.data,
        value: params.action.value,
        blockNumber,
      }),
    ]);
    return {
      action: params.action,
      simulation: {
        success: true,
        blockNumber,
        gasEstimate,
        returnData: call.data ?? '0x',
      },
      simulatedAt: new Date().toISOString(),
      actionCommitment: hashPreparedRobinhoodAction(params.action),
    };
  } catch (error) {
    const revertData = findHexData(error);
    const decoded = revertData
      ? decodeRobinhoodError(revertData, params.bundle)
      : null;
    return {
      action: params.action,
      simulation: {
        success: false,
        blockNumber,
        gasEstimate: 0n,
        returnData: revertData ?? '0x',
        ...(decoded == null
          ? {}
          : { decodedError: { name: decoded.errorName, args: decoded.args } }),
      },
      simulatedAt: new Date().toISOString(),
      actionCommitment: hashPreparedRobinhoodAction(params.action),
    };
  }
}

export function decodeRobinhoodError(
  data: Hex,
  bundle: RobinhoodProtocolArtifactBundle,
): DecodedRobinhoodError | null {
  if (!isHex(data) || data === '0x') return null;
  for (const role of Object.keys(bundle.contracts) as RobinhoodContractRole[]) {
    const artifact = bundle.contracts[role];
    if (artifact == null) continue;
    try {
      const decoded = decodeErrorResult({ abi: artifact.abi, data });
      return {
        role,
        errorName: decoded.errorName,
        args: (decoded.args ?? []) as readonly unknown[],
        data,
      };
    } catch {
      // Try the next canonical ABI.
    }
  }
  return null;
}

export function decodeRobinhoodEvent(params: {
  log: RobinhoodEventLog;
  manifest: RobinhoodDeploymentManifest;
  bundle: RobinhoodProtocolArtifactBundle;
}): DecodedRobinhoodEvent {
  const role = Object.entries(params.manifest.contracts).find(
    ([, deployed]) =>
      deployed?.address.toLowerCase() === params.log.address.toLowerCase(),
  )?.[0] as RobinhoodContractRole | undefined;
  if (role == null) {
    throw new NakamaRobinhoodContractError(
      'Event address is not part of the deployment manifest.',
      { details: { address: params.log.address } },
    );
  }
  const artifact = getRobinhoodContractArtifact(params.bundle, role);
  try {
    const decoded = decodeEventLog({
      abi: artifact.abi,
      data: params.log.data,
      topics: params.log.topics as never,
      strict: true,
    }) as {
      eventName: string;
      args: Record<string, unknown> | readonly unknown[];
    };
    if (
      !ROBINHOOD_EVENT_NAMES.includes(decoded.eventName as RobinhoodEventName)
    ) {
      throw new NakamaRobinhoodContractError(
        `Decoded event ${decoded.eventName} is absent from the canonical event-name set.`,
      );
    }
    return {
      role,
      eventName: decoded.eventName as RobinhoodEventName,
      args: decoded.args,
      log: params.log,
    };
  } catch (error) {
    throw new NakamaRobinhoodContractError(
      `Unable to decode ${artifact.contractName} event.`,
      {
        cause: error,
        details: { transactionHash: params.log.transactionHash },
      },
    );
  }
}

function createPreparedAction(params: {
  network: RobinhoodNetwork;
  programId: Bytes32;
  context: PrepareRobinhoodActionContext;
  action: RobinhoodActionName;
  target: Address;
  data: Hex;
  explanation: string;
  expectedStateChanges: readonly RobinhoodExpectedStateChange[];
}): PreparedRobinhoodAction {
  if (params.context.intentId.trim() === '') {
    throw new NakamaRobinhoodConfigError('intentId cannot be empty.');
  }
  const preparedAt = normalizeDate(
    params.context.preparedAt ?? new Date(),
    'preparedAt',
  );
  const expiresAt = normalizeDate(
    params.context.expiresAt ?? new Date(Date.parse(preparedAt) + 5 * 60_000),
    'expiresAt',
  );
  const account = normalizeRobinhoodAddress(params.context.account);
  if (account === zeroAddress || params.target === zeroAddress) {
    throw new NakamaRobinhoodConfigError(
      'Prepared action account and target must be non-zero.',
    );
  }
  const action: PreparedRobinhoodAction = {
    version: 1,
    network: params.network,
    chainId: getRobinhoodChainId(params.network),
    caip2: getRobinhoodCaip2(params.network),
    intentId: params.context.intentId,
    action: params.action,
    accountId: toRobinhoodCaip10(params.network, account),
    programId: params.programId,
    target: params.target,
    selector: params.data.slice(0, 10) as Hex,
    data: params.data,
    value: 0n,
    explanation: params.explanation,
    expectedStateChanges: params.expectedStateChanges,
    preparedAt,
    expiresAt,
  };
  assertPreparedAction(action, new Date(preparedAt));
  return sealBuilderPreparedAction(action);
}

async function createReadContext(
  client: RobinhoodPublicClient,
  network: RobinhoodNetwork,
  blockNumber: bigint,
): Promise<RobinhoodReadContext> {
  const [block, chainHead, safeBlock, finalizedBlock] = await Promise.all([
    client.getBlock({ blockNumber }),
    client.getBlockNumber(),
    getTaggedBlockNumber(client, 'safe'),
    getTaggedBlockNumber(client, 'finalized'),
  ]);
  return {
    network,
    chainId: getRobinhoodChainId(network),
    caip2: getRobinhoodCaip2(network),
    blockNumber,
    blockHash: block.hash,
    chainHead,
    safeBlock,
    finalizedBlock,
    confirmations:
      chainHead >= blockNumber
        ? Number(
            chainHead - blockNumber + 1n > BigInt(Number.MAX_SAFE_INTEGER)
              ? BigInt(Number.MAX_SAFE_INTEGER)
              : chainHead - blockNumber + 1n,
          )
        : 0,
    reconciliation: 'direct_chain_only',
    observedAt: new Date().toISOString(),
  };
}

async function getTaggedBlockNumber(
  client: RobinhoodPublicClient,
  blockTag: 'safe' | 'finalized',
): Promise<bigint | null> {
  try {
    return (await client.getBlock({ blockTag })).number;
  } catch {
    return null;
  }
}

function decodeRequestSnapshot(
  raw: unknown,
  requestId: Bytes32,
  programId: Bytes32,
  asset: ReturnType<typeof requireRobinhoodUsdg>,
): RequestSnapshot {
  return {
    programId,
    requestId,
    membershipId: requireBytes32Value(
      tupleField(raw, 'membershipId', 0),
      'membershipId',
    ),
    evidenceManifestCommitment: requireBytes32Value(
      tupleField(raw, 'evidenceManifestCommitment', 1),
      'evidenceManifestCommitment',
    ),
    recipientCommitment: requireBytes32Value(
      tupleField(raw, 'recipientCommitment', 2),
      'recipientCommitment',
    ),
    publicReasonCode: requireBytes32Value(
      tupleField(raw, 'publicReasonCode', 3),
      'publicReasonCode',
    ),
    requestedAmount: createRobinhoodAssetAmount({
      units: requireBigInt(
        tupleField(raw, 'requestedAmount', 5),
        'requestedAmount',
      ),
      asset,
    }),
    approvedAmount: createRobinhoodAssetAmount({
      units: requireBigInt(
        tupleField(raw, 'approvedAmount', 6),
        'approvedAmount',
      ),
      asset,
    }),
    openedAt: requireBigInt(tupleField(raw, 'openedAt', 7), 'openedAt'),
    decisionDeadline: requireBigInt(
      tupleField(raw, 'decisionDeadline', 8),
      'decisionDeadline',
    ),
    appealDueAt: requireBigInt(
      tupleField(raw, 'appealDeadline', 9),
      'appealDeadline',
    ),
    evidenceVersion: requireNumber(
      tupleField(raw, 'evidenceVersion', 10),
      'evidenceVersion',
    ),
    reviewRound: requireReviewRound(
      requireNumber(tupleField(raw, 'currentRound', 11), 'currentRound'),
    ),
    state: decodeRequestState(
      requireNumber(tupleField(raw, 'state', 12), 'request.state'),
    ),
  };
}

function tupleField(value: unknown, name: string, index: number): unknown {
  if (Array.isArray(value)) return value[index];
  if (value != null && typeof value === 'object') {
    return (value as Record<string, unknown>)[name];
  }
  throw new NakamaRobinhoodContractError(`Contract tuple is missing ${name}.`);
}

function requireBigInt(value: unknown, field: string): bigint {
  if (typeof value !== 'bigint') {
    throw new NakamaRobinhoodContractError(`${field} must decode as bigint.`);
  }
  return value;
}

function requireNumber(value: unknown, field: string): number {
  if (typeof value === 'number' && Number.isSafeInteger(value)) return value;
  if (
    typeof value === 'bigint' &&
    value >= 0n &&
    value <= BigInt(Number.MAX_SAFE_INTEGER)
  ) {
    return Number(value);
  }
  throw new NakamaRobinhoodContractError(
    `${field} must decode as a safe integer.`,
  );
}

function requireBoolean(value: unknown, field: string): boolean {
  if (typeof value !== 'boolean') {
    throw new NakamaRobinhoodContractError(`${field} must decode as boolean.`);
  }
  return value;
}

function requireAddressValue(value: unknown, field: string): Address {
  if (typeof value !== 'string') {
    throw new NakamaRobinhoodContractError(
      `${field} must decode as an address.`,
    );
  }
  return normalizeRobinhoodAddress(value);
}

function assertProgramAddress(
  actual: Address,
  expected: string | null,
  field: string,
): void {
  if (
    expected == null ||
    actual.toLowerCase() !== normalizeRobinhoodAddress(expected).toLowerCase()
  ) {
    throw new NakamaRobinhoodContractError(
      `Program ${field} does not match the generated deployment manifest.`,
    );
  }
}

function assertVerifiedRuntimeTarget(params: {
  manifest: RobinhoodDeploymentManifest;
  runtime: VerifiedRobinhoodDeploymentRuntime;
  programId: Bytes32;
}): void {
  if (
    !isVerifiedRobinhoodRuntime(params.runtime) ||
    params.runtime.network !== params.manifest.network ||
    params.runtime.chainId !== params.manifest.chainId ||
    params.runtime.programId.toLowerCase() !== params.programId.toLowerCase()
  ) {
    throw new NakamaRobinhoodArtifactError(
      'Verified runtime evidence does not match the operation target.',
    );
  }
  if (
    Object.keys(params.runtime.contracts).length !==
    ROBINHOOD_CONTRACT_ROLES.length
  ) {
    throw new NakamaRobinhoodArtifactError(
      'Verified runtime evidence is missing canonical contract roles.',
    );
  }
  for (const role of ROBINHOOD_CONTRACT_ROLES) {
    const runtimeContract = params.runtime.contracts[role];
    if (runtimeContract == null) {
      throw new NakamaRobinhoodArtifactError(
        `${role} runtime evidence is missing.`,
      );
    }
    const configured = getRobinhoodContractDeployment(params.manifest, role);
    if (
      runtimeContract.address.toLowerCase() !==
        configured.address.toLowerCase() ||
      runtimeContract.actualRuntimeBytecodeHash.toLowerCase() !==
        configured.runtimeBytecodeHash.toLowerCase()
    ) {
      throw new NakamaRobinhoodArtifactError(
        `${role} runtime evidence does not match the deployment manifest.`,
      );
    }
  }
}

function requireBytes32Value(value: unknown, field: string): Bytes32 {
  if (typeof value !== 'string') {
    throw new NakamaRobinhoodContractError(`${field} must decode as bytes32.`);
  }
  return assertBytes32(value, field);
}

function decodeProgramState(code: number): ProgramSnapshot['state'] {
  const states: ProgramSnapshot['state'][] = [
    'draft',
    'reviewed',
    'funded',
    'enrollment_open',
    'active',
    'runoff',
    'closed',
    'cancelled',
  ];
  const state = states[code];
  if (state == null) {
    throw new NakamaRobinhoodContractError(`Unknown program state ${code}.`);
  }
  return state;
}

function decodeMembershipState(code: number): MembershipSnapshot['state'] {
  const states: MembershipSnapshot['state'][] = [
    'inactive',
    'active',
    'expired',
    'cancelled',
  ];
  const state = states[code];
  if (state == null) {
    throw new NakamaRobinhoodContractError(`Unknown membership state ${code}.`);
  }
  return state;
}

function decodeRequestState(code: number): RequestSnapshot['state'] {
  const states: RequestSnapshot['state'][] = [
    'none',
    'pending',
    'information_requested',
    'escalated',
    'denied_appealable',
    'appealed',
    'approved',
    'final_denied',
    'settled',
  ];
  const state = states[code];
  if (state == null) {
    throw new NakamaRobinhoodContractError(`Unknown request state ${code}.`);
  }
  return state;
}

function requireReviewRound(value: number): 1 | 2 {
  if (value !== 1 && value !== 2) {
    throw new NakamaRobinhoodContractError(`Unknown review round ${value}.`);
  }
  return value;
}

function roleFunctionName(role: ProgramRole): string {
  return {
    sponsor: 'sponsor',
    operator: 'operator',
    initial_reviewer: 'initialReviewer',
    appeal_reviewer: 'appealReviewer',
    settlement: 'settlementRole',
    guardian: 'guardianRole',
    eligibility_attestor: 'eligibilityAttestor',
  }[role];
}

function pauseScopeCode(scope: PauseScope): number {
  return {
    enrollment: ROBINHOOD_PAUSE_SCOPE.enrollment,
    new_requests: ROBINHOOD_PAUSE_SCOPE.newRequests,
    new_obligations: ROBINHOOD_PAUSE_SCOPE.newObligations,
    settlement: ROBINHOOD_PAUSE_SCOPE.settlement,
    agent_actions: ROBINHOOD_PAUSE_SCOPE.agentActions,
  }[scope];
}

function parseAccount(action: PreparedRobinhoodAction): Address {
  const address = action.accountId.split(':').at(-1);
  if (address == null) {
    throw new NakamaRobinhoodSimulationError(
      'Prepared action account is invalid.',
    );
  }
  return normalizeRobinhoodAddress(address);
}

function findHexData(error: unknown, depth = 0): Hex | null {
  if (depth > 8 || error == null || typeof error !== 'object') return null;
  for (const key of ['data', 'cause', 'error']) {
    const value = (error as Record<string, unknown>)[key];
    if (typeof value === 'string' && isHex(value)) return value;
    const nested = findHexData(value, depth + 1);
    if (nested) return nested;
  }
  return null;
}

function requireNonEmptyHex(value: unknown, field: string): Hex {
  if (typeof value !== 'string' || !isHex(value) || value === '0x') {
    throw new NakamaRobinhoodConfigError(`${field} must be non-empty hex.`);
  }
  return value;
}

function requireNonZeroCommitment(value: string, field: string): Bytes32 {
  const commitment = assertBytes32(value, field);
  if (commitment.toLowerCase() === ZERO_BYTES32) {
    throw new NakamaRobinhoodConfigError(`${field} cannot be zero.`);
  }
  return commitment;
}

function requireNonZeroAddress(value: string, field: string): Address {
  const address = normalizeRobinhoodAddress(value);
  if (address === zeroAddress) {
    throw new NakamaRobinhoodConfigError(
      `${field} cannot be the zero address.`,
    );
  }
  return address;
}

function actionContextUnixSeconds(
  context: PrepareRobinhoodActionContext,
): bigint {
  const preparedAt = normalizeDate(
    context.preparedAt ?? new Date(),
    'preparedAt',
  );
  return BigInt(Math.floor(Date.parse(preparedAt) / 1_000));
}

function normalizeDate(value: Date | string, field: string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) {
    throw new NakamaRobinhoodConfigError(`${field} is invalid.`);
  }
  return date.toISOString();
}
