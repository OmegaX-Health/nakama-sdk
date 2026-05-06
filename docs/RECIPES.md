# SDK Recipes — `@omegax/protocol-sdk`

These recipes are copy-paste starting points for common external integrations.
Use `createSafeProtocolClient(...)` by default. Use raw builders, dynamic
instruction construction, or custom program IDs only for protocol-maintainer,
localnet, or test workflows.

## Node Backend

```ts
import {
  PROTOCOL_PROGRAM_ID,
  createConnection,
  createSafeProtocolClient,
  deriveReserveDomainPda,
  getOmegaXNetworkInfo,
} from '@omegax/protocol-sdk';

const networkInfo = getOmegaXNetworkInfo('devnet');
const connection = createConnection({
  network: 'devnet',
  rpcUrl: process.env.SOLANA_RPC_URL ?? networkInfo.defaultRpcUrl,
  commitment: 'confirmed',
});
const protocol = createSafeProtocolClient(connection, {
  programId: PROTOCOL_PROGRAM_ID,
});

export function reserveDomainAddress(domainId: string) {
  return deriveReserveDomainPda({
    domainId,
    programId: protocol.getProgramId(),
  }).toBase58();
}
```

## Next.js Server Route

```ts
import { NextResponse } from 'next/server';
import {
  PROTOCOL_PROGRAM_ID,
  createConnection,
  createSafeProtocolClient,
  listProtocolAccountNames,
  listProtocolInstructionNames,
} from '@omegax/protocol-sdk';

export async function GET() {
  const protocol = createSafeProtocolClient(
    createConnection({
      network: 'devnet',
      rpcUrl: process.env.SOLANA_RPC_URL,
    }),
    { programId: PROTOCOL_PROGRAM_ID },
  );

  return NextResponse.json({
    programId: protocol.getProgramId().toBase58(),
    instructions: listProtocolInstructionNames(),
    accounts: listProtocolAccountNames(),
  });
}
```

## Oracle Worker

```ts
import {
  PROTOCOL_PROGRAM_ID,
  attestProtocolOutcome,
  createOracleSignerFromEnv,
} from '@omegax/protocol-sdk';

const signer = createOracleSignerFromEnv();

export async function attestClaimOutcome(params: {
  healthPlan: string;
  fundingLine: string;
  claimCase: string;
  nonce: string;
}) {
  return await attestProtocolOutcome({
    userId: 'member-001',
    cycleId: 'claim-cycle-001',
    outcomeId: 'claim-supported',
    payload: {
      decision: 'support_approve',
      approvedAmountRaw: '150000000',
    },
    context: {
      network: 'devnet',
      programId: PROTOCOL_PROGRAM_ID,
      healthPlan: params.healthPlan,
      fundingLine: params.fundingLine,
      claimCase: params.claimCase,
      schemaKeyHashHex: 'ab'.repeat(32),
      audience: 'claim-intake-service',
      nonce: params.nonce,
      asOfIso: new Date().toISOString(),
      expiresAtIso: new Date(Date.now() + 5 * 60_000).toISOString(),
    },
    signer,
  });
}
```

## Read-Only Frontend

```ts
import {
  createConnection,
  deriveHealthPlanPda,
  deriveReserveDomainPda,
  getOmegaXNetworkInfo,
  listProtocolAccountNames,
} from '@omegax/protocol-sdk';

const networkInfo = getOmegaXNetworkInfo('devnet');
const connection = createConnection({
  network: 'devnet',
  rpcUrl: networkInfo.defaultRpcUrl,
});

const reserveDomain = deriveReserveDomainPda({ domainId: 'open-usdc-domain' });
const healthPlan = deriveHealthPlanPda({
  reserveDomain,
  planId: 'genesis-protect-acute',
});

console.log({
  rpcEndpoint: connection.rpcEndpoint,
  healthPlan: healthPlan.toBase58(),
  accountTypes: listProtocolAccountNames(),
});
```

## Typed Error Handling

```ts
import {
  OmegaXError,
  OmegaXProgramMismatchError,
  createConnection,
  createSafeProtocolClient,
} from '@omegax/protocol-sdk';

try {
  createSafeProtocolClient(createConnection(), {
    programId: '11111111111111111111111111111111',
  });
} catch (error) {
  if (error instanceof OmegaXProgramMismatchError) {
    console.error(error.code, error.details);
  } else if (error instanceof OmegaXError) {
    console.error(error.code, error.message);
  } else {
    throw error;
  }
}
```

## Dogfood Fixture

Run the tracked external-consumer fixture before release:

```bash
npm run dogfood:consumer
```

The fixture installs the packed SDK tarball into a temp project, typechecks,
builds, and runs a no-signature smoke.
