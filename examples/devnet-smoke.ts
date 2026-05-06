import {
  PROTOCOL_PROGRAM_ID,
  createConnection,
  createRpcClient,
  createSafeProtocolClient,
  deriveHealthPlanPda,
  deriveReserveDomainPda,
  getOmegaXNetworkInfo,
  listProtocolAccountNames,
  listProtocolInstructionNames,
} from '@omegax/protocol-sdk';

const network = 'devnet' as const;
const networkInfo = getOmegaXNetworkInfo(network);
const rpcUrl = process.env.SOLANA_RPC_URL ?? networkInfo.defaultRpcUrl;

const connection = createConnection({
  network,
  rpcUrl,
  commitment: 'confirmed',
});
const safeProtocol = createSafeProtocolClient(connection, {
  programId: PROTOCOL_PROGRAM_ID,
});
const rpc = createRpcClient(connection);

const reserveDomain = deriveReserveDomainPda({
  domainId: 'builder-demo-domain',
  programId: safeProtocol.getProgramId(),
});
const healthPlan = deriveHealthPlanPda({
  reserveDomain,
  planId: 'builder-demo-plan',
  programId: safeProtocol.getProgramId(),
});

const instructionNames = listProtocolInstructionNames();
const accountNames = listProtocolAccountNames();

if (instructionNames.length === 0 || accountNames.length === 0) {
  throw new Error('OmegaX protocol surface did not load.');
}

console.log(
  JSON.stringify(
    {
      ok: true,
      network: networkInfo.network,
      cluster: networkInfo.solanaCluster,
      rpcUrl,
      programId: safeProtocol.getProgramId().toBase58(),
      reserveDomain: reserveDomain.toBase58(),
      healthPlan: healthPlan.toBase58(),
      instructions: instructionNames.length,
      accounts: accountNames.length,
      canBroadcast: typeof rpc.broadcastSignedTx === 'function',
    },
    null,
    2,
  ),
);
