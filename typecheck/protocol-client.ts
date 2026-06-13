import type { Connection } from '@solana/web3.js';

import {
  buildReserveObligationTx,
  buildSettleObligationTx,
  createProtocolClient,
  createSafeProtocolClient,
} from '../src/protocol.js';
import type { ProtocolClient } from '../src/types.js';

declare const connection: Connection;
declare const programId: string;
declare const authority: string;
declare const recentBlockhash: string;
declare const protocolGovernance: string;
declare const reserveDomain: string;
declare const healthPlan: string;
declare const fundingLine: string;
declare const assetMint: string;
declare const obligation: string;
declare const memberPosition: string;
declare const vaultTokenAccount: string;
declare const recipientTokenAccount: string;
declare const recipientOwner: string;
declare const tokenProgram: string;

function assertProtocolClient(protocol: ProtocolClient) {
  void protocol.buildCreateReserveDomainTx({
    args: {
      domain_id: 'typecheck-domain',
      display_name: 'Typecheck Domain',
      domain_admin: authority,
      settlement_mode: 0,
      legal_structure_hash: new Uint8Array(32),
      compliance_baseline_hash: new Uint8Array(32),
      allowed_rail_mask: 1,
      pause_flags: 0,
    },
    accounts: {
      authority,
      reserve_domain: reserveDomain,
    },
    recentBlockhash,
  });
}

const inferredProtocol = createProtocolClient(connection, programId);
assertProtocolClient(inferredProtocol);

const annotatedProtocol: ProtocolClient = createProtocolClient(
  connection,
  programId,
);
assertProtocolClient(annotatedProtocol);

void buildReserveObligationTx({
  authority,
  healthPlanAddress: healthPlan,
  reserveDomainAddress: reserveDomain,
  fundingLineAddress: fundingLine,
  assetMint,
  obligationAddress: obligation,
  recentBlockhash,
  amount: 1n,
});

void buildSettleObligationTx({
  authority,
  healthPlanAddress: healthPlan,
  reserveDomainAddress: reserveDomain,
  fundingLineAddress: fundingLine,
  assetMint,
  obligationAddress: obligation,
  recentBlockhash,
  nextStatus: 5,
  amount: 1n,
  memberPositionAddress: memberPosition,
  vaultTokenAccountAddress: vaultTokenAccount,
  recipientTokenAccountAddress: recipientTokenAccount,
  tokenProgramId: tokenProgram,
});

const safeProtocol = createSafeProtocolClient(connection);
void safeProtocol.buildSettleObligationTx({
  authority,
  healthPlanAddress: healthPlan,
  reserveDomainAddress: reserveDomain,
  fundingLineAddress: fundingLine,
  assetMint,
  obligationAddress: obligation,
  recentBlockhash,
  nextStatus: 5,
  amount: 1n,
  memberPositionAddress: memberPosition,
  vaultTokenAccountAddress: vaultTokenAccount,
  recipientTokenAccountAddress: recipientTokenAccount,
  recipientOwnerAddress: recipientOwner,
  tokenProgramId: tokenProgram,
});
