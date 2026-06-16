import {
  PROTOCOL_PROGRAM_ID,
  createConnection,
  createSafeProtocolClient,
  deriveHealthPlanPda,
  deriveReserveDomainPda,
  getOmegaXNetworkInfo,
  listProtocolAccountNames,
  listProtocolInstructionNames,
} from '@nakama-health/protocol-sdk';

export function buildOmegaXStatus() {
  const networkInfo = getOmegaXNetworkInfo('devnet');
  const connection = createConnection({
    network: 'devnet',
    rpcUrl: process.env.SOLANA_RPC_URL ?? networkInfo.defaultRpcUrl,
  });
  const protocol = createSafeProtocolClient(connection, {
    programId: PROTOCOL_PROGRAM_ID,
  });
  const reserveDomain = deriveReserveDomainPda({
    domainId: 'app-builder-domain',
    programId: protocol.getProgramId(),
  });
  const healthPlan = deriveHealthPlanPda({
    reserveDomain,
    planId: 'app-builder-plan',
    programId: protocol.getProgramId(),
  });

  return {
    ok: true,
    role: 'health-app-route',
    network: networkInfo.network,
    programId: protocol.getProgramId().toBase58(),
    reserveDomain: reserveDomain.toBase58(),
    healthPlan: healthPlan.toBase58(),
    instructions: listProtocolInstructionNames().length,
    accounts: listProtocolAccountNames().length,
  };
}

export async function GET(): Promise<Response> {
  return Response.json(buildOmegaXStatus());
}
