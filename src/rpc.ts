import { Connection, type Commitment } from '@solana/web3.js';

import { OmegaXConfigError } from './errors.js';
import type {
  BroadcastSignedTxParams,
  BroadcastSignedTxResult,
  GetSignatureStatusParams,
  GetSignatureStatusResult,
  RpcClient,
  SimulateSignedTxParams,
  SimulateSignedTxResult,
} from './types.js';
import { simulateSignedTransactionViaConnection } from './internal/rpc.js';
import { normalizeClaimSimulationFailure } from './claims.js';
import {
  decodeSolanaTransaction,
  type SolanaTransaction,
} from './transactions.js';

function shouldRetrySignedSimulationWithoutSigVerify(params: {
  error: unknown;
  sigVerify: boolean;
  allowSigVerifyFallback: boolean;
}): boolean {
  const message =
    params.error instanceof Error ? params.error.message : String(params.error);
  return (
    params.sigVerify &&
    params.allowSigVerifyFallback &&
    /invalid arguments/i.test(message)
  );
}

function normalizeSimulationCommitment(
  commitment: Commitment | undefined,
): 'processed' | 'confirmed' | 'finalized' {
  switch (commitment) {
    case 'processed':
    case 'confirmed':
    case 'finalized':
      return commitment;
    default:
      return 'confirmed';
  }
}

function buildSimulationVerificationMetadata(params: {
  sigVerifyRequested: boolean;
  sigVerifyUsed: boolean;
  signatureVerified?: boolean;
  verificationDowngraded?: boolean;
}) {
  const verificationDowngraded =
    params.verificationDowngraded ??
    (params.sigVerifyRequested && !params.sigVerifyUsed);
  return {
    sigVerifyRequested: params.sigVerifyRequested,
    sigVerifyUsed: params.sigVerifyUsed,
    signatureVerified:
      params.signatureVerified ??
      (params.sigVerifyUsed && !verificationDowngraded),
    verificationDowngraded,
  };
}

export type OmegaXNetwork = 'devnet' | 'mainnet';
export type OmegaXNetworkInput = OmegaXNetwork | 'mainnet-beta';

export interface OmegaXConnectionOptions {
  network?: OmegaXNetworkInput;
  rpcUrl?: string;
  commitment?: Commitment;
  warnOnComingSoon?: boolean;
}

export interface OmegaXNetworkInfo {
  network: OmegaXNetwork;
  solanaCluster: 'devnet' | 'mainnet-beta';
  defaultRpcUrl: string;
  isAvailable: boolean;
  status: 'live' | 'coming_soon';
  statusMessage: string;
}

export const OMEGAX_NETWORKS: Record<OmegaXNetwork, OmegaXNetworkInfo> = {
  devnet: {
    network: 'devnet',
    solanaCluster: 'devnet',
    defaultRpcUrl: 'https://api.devnet.solana.com',
    isAvailable: true,
    status: 'live',
    statusMessage: 'OmegaX devnet beta is live.',
  },
  mainnet: {
    network: 'mainnet',
    solanaCluster: 'mainnet-beta',
    defaultRpcUrl: 'https://api.mainnet-beta.solana.com',
    isAvailable: false,
    status: 'coming_soon',
    statusMessage:
      'OmegaX mainnet support is coming soon. Please use devnet beta for now.',
  },
};

function normalizeOmegaXNetwork(
  input: OmegaXNetworkInput | undefined,
): OmegaXNetwork {
  const normalized = String(input ?? 'devnet')
    .trim()
    .toLowerCase();
  if (normalized === 'devnet') return 'devnet';
  if (normalized === 'mainnet' || normalized === 'mainnet-beta')
    return 'mainnet';
  throw new OmegaXConfigError(
    `Unsupported OmegaX network "${String(input)}". Supported networks: "devnet", "mainnet".`,
    {
      details: { network: input },
    },
  );
}

export function getOmegaXNetworkInfo(
  input: OmegaXNetworkInput = 'devnet',
): OmegaXNetworkInfo {
  const network = normalizeOmegaXNetwork(input);
  return { ...OMEGAX_NETWORKS[network] };
}

export function createConnection(
  rpcUrl: string,
  commitment?: Commitment,
): Connection;
export function createConnection(options?: OmegaXConnectionOptions): Connection;
export function createConnection(
  rpcUrlOrOptions: string | OmegaXConnectionOptions = { network: 'devnet' },
  commitment: Commitment = 'confirmed',
): Connection {
  if (typeof rpcUrlOrOptions === 'string') {
    return new Connection(rpcUrlOrOptions, commitment);
  }

  const options = rpcUrlOrOptions ?? {};
  const resolvedCommitment = options.commitment ?? 'confirmed';
  const networkInfo = getOmegaXNetworkInfo(options.network);

  if (!networkInfo.isAvailable && (options.warnOnComingSoon ?? true)) {
    console.warn(`[omegax-sdk] ${networkInfo.statusMessage}`);
  }

  const rpcUrl = options.rpcUrl ?? networkInfo.defaultRpcUrl;
  return new Connection(rpcUrl, resolvedCommitment);
}

export function createRpcClient(connection: Connection): RpcClient {
  return {
    async getRecentBlockhash() {
      const latest = await connection.getLatestBlockhash('confirmed');
      return latest.blockhash;
    },

    async broadcastSignedTx(
      params: BroadcastSignedTxParams,
    ): Promise<BroadcastSignedTxResult> {
      const raw = Buffer.from(params.signedTxBase64, 'base64');
      const signature = await connection.sendRawTransaction(raw, {
        skipPreflight: params.skipPreflight ?? false,
        maxRetries: params.maxRetries,
      });

      const commitment = params.commitment ?? 'confirmed';
      const confirmation = await connection.confirmTransaction(
        signature,
        commitment,
      );

      if (confirmation.value.err) {
        return {
          signature,
          status: 'failed',
          slot: confirmation.context.slot,
        };
      }

      return {
        signature,
        status: commitment === 'processed' ? 'submitted' : 'confirmed',
        slot: confirmation.context.slot,
      };
    },

    async simulateSignedTx(
      params: SimulateSignedTxParams,
    ): Promise<SimulateSignedTxResult> {
      const sigVerify = params.sigVerify ?? true;
      const defaultVerificationMetadata = buildSimulationVerificationMetadata({
        sigVerifyRequested: sigVerify,
        sigVerifyUsed: false,
        verificationDowngraded: false,
      });
      let tx: SolanaTransaction;
      try {
        tx = decodeSolanaTransaction(params.signedTxBase64);
      } catch (error) {
        return {
          ok: false,
          logs: [],
          unitsConsumed: null,
          err: error,
          failure: normalizeClaimSimulationFailure({ err: error, logs: [] }),
          ...defaultVerificationMetadata,
        };
      }

      const replaceRecentBlockhash =
        params.replaceRecentBlockhash ?? !sigVerify;
      const baseOptions = {
        commitment: normalizeSimulationCommitment(params.commitment),
        replaceRecentBlockhash,
        sigVerify,
      };
      let verificationMetadata = buildSimulationVerificationMetadata({
        sigVerifyRequested: sigVerify,
        sigVerifyUsed: sigVerify,
      });

      let result;
      try {
        result = await simulateSignedTransactionViaConnection(
          connection,
          tx,
          baseOptions,
        );
      } catch (error) {
        if (
          !shouldRetrySignedSimulationWithoutSigVerify({
            error,
            sigVerify,
            allowSigVerifyFallback: params.allowSigVerifyFallback ?? false,
          })
        ) {
          return {
            ok: false,
            logs: [],
            unitsConsumed: null,
            err: error,
            failure: normalizeClaimSimulationFailure({ err: error, logs: [] }),
            ...buildSimulationVerificationMetadata({
              sigVerifyRequested: sigVerify,
              sigVerifyUsed: sigVerify,
              signatureVerified: false,
            }),
          };
        }

        try {
          result = await simulateSignedTransactionViaConnection(
            connection,
            tx,
            {
              ...baseOptions,
              sigVerify: false,
            },
          );
          verificationMetadata = buildSimulationVerificationMetadata({
            sigVerifyRequested: sigVerify,
            sigVerifyUsed: false,
            verificationDowngraded: true,
          });
        } catch (retryError) {
          return {
            ok: false,
            logs: [],
            unitsConsumed: null,
            err: retryError,
            failure: normalizeClaimSimulationFailure({
              err: retryError,
              logs: [],
            }),
            ...buildSimulationVerificationMetadata({
              sigVerifyRequested: sigVerify,
              sigVerifyUsed: false,
              verificationDowngraded: true,
            }),
          };
        }
      }

      const logs = result.value.logs ?? [];
      const unitsConsumed =
        typeof result.value.unitsConsumed === 'number'
          ? result.value.unitsConsumed
          : null;
      if (result.value.err) {
        return {
          ok: false,
          logs,
          unitsConsumed,
          err: result.value.err,
          failure: normalizeClaimSimulationFailure({
            err: result.value.err,
            logs,
          }),
          ...verificationMetadata,
        };
      }

      return {
        ok: true,
        logs,
        unitsConsumed,
        err: null,
        failure: null,
        ...verificationMetadata,
      };
    },

    async getSignatureStatus(
      params: GetSignatureStatusParams,
    ): Promise<GetSignatureStatusResult> {
      const response = await connection.getSignatureStatuses(
        [params.signature],
        {
          searchTransactionHistory: params.searchTransactionHistory ?? true,
        },
      );
      const info = response.value[0];
      if (!info) {
        return {
          signature: params.signature,
          status: 'unknown',
          confirmations: null,
          slot: null,
          err: null,
        };
      }

      if (info.err) {
        return {
          signature: params.signature,
          status: 'failed',
          confirmations: info.confirmations ?? null,
          slot: info.slot ?? null,
          err: info.err,
        };
      }

      const confirmationStatus = info.confirmationStatus ?? 'processed';
      return {
        signature: params.signature,
        status: confirmationStatus,
        confirmations: info.confirmations ?? null,
        slot: info.slot ?? null,
        err: null,
      };
    },
  };
}
