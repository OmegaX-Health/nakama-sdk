import { createServer } from 'node:http';

import {
  PROTOCOL_PROGRAM_ID,
  OmegaXError,
  createConnection,
  createSafeProtocolClient,
  deriveHealthPlanPda,
  deriveReserveDomainPda,
  getOmegaXNetworkInfo,
  listProtocolAccountNames,
  listProtocolInstructionNames,
} from '@nakama-health/protocol-sdk';

export function buildProtocolStatus() {
  const networkInfo = getOmegaXNetworkInfo('devnet');
  const connection = createConnection({
    network: 'devnet',
    rpcUrl: process.env.SOLANA_RPC_URL ?? networkInfo.defaultRpcUrl,
    commitment: 'confirmed',
  });
  const protocol = createSafeProtocolClient(connection, {
    programId: PROTOCOL_PROGRAM_ID,
  });
  const reserveDomain = deriveReserveDomainPda({
    domainId: process.env.OMEGAX_DOMAIN_ID ?? 'hospital-demo-domain',
    programId: protocol.getProgramId(),
  });
  const healthPlan = deriveHealthPlanPda({
    reserveDomain,
    planId: process.env.OMEGAX_PLAN_ID ?? 'hospital-demo-plan',
    programId: protocol.getProgramId(),
  });

  return {
    ok: true,
    role: 'health-or-hospital-backend',
    network: networkInfo.network,
    rpcUrl: connection.rpcEndpoint,
    programId: protocol.getProgramId().toBase58(),
    reserveDomain: reserveDomain.toBase58(),
    healthPlan: healthPlan.toBase58(),
    instructions: listProtocolInstructionNames().length,
    accounts: listProtocolAccountNames().length,
  };
}

function errorPayload(error: unknown) {
  if (error instanceof OmegaXError) {
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
