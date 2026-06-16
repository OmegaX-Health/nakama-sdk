# SDK Recipes — `@nakama-health/protocol-sdk`

These recipes are copy-paste starting points for common external integrations.
Use `createSafeProtocolClient(...)` by default. Use raw builders, dynamic
instruction construction, or custom program IDs only for protocol-maintainer,
localnet, or test workflows.

## Start With The CLI

```bash
npx @nakama-health/protocol-sdk doctor
npx @nakama-health/protocol-sdk scaffold node-backend --out nakama-provider-backend
npx @nakama-health/protocol-sdk scaffold next-route --out nakama-health-route
npx @nakama-health/protocol-sdk scaffold oracle-worker --out nakama-oracle-worker
```

Expected output: `doctor` should report passing checks without requiring a
funded wallet, private key, or transaction submission.

Next step: choose one scaffold and run `npm install`, `npm run typecheck`,
`npm run build`, and `npm run smoke` inside it.

## Node Backend

Install:

```bash
npx @nakama-health/protocol-sdk scaffold node-backend --out nakama-provider-backend
cd nakama-provider-backend
npm install
```

```ts
import {
  PROTOCOL_PROGRAM_ID,
  createConnection,
  createSafeProtocolClient,
  deriveReserveDomainPda,
  getOmegaXNetworkInfo,
} from '@nakama-health/protocol-sdk';

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

Expected output: a JSON status payload with `network`, `programId`,
`reserveDomain`, `healthPlan`, instruction count, and account count.

Next step: wire the status helper into your backend route and keep all
signing/funded flows behind explicit product review.

## Next.js Server Route

Install:

```bash
npx @nakama-health/protocol-sdk scaffold next-route --out nakama-health-route
```

```ts
import { NextResponse } from 'next/server';
import {
  PROTOCOL_PROGRAM_ID,
  createConnection,
  createSafeProtocolClient,
  listProtocolAccountNames,
  listProtocolInstructionNames,
} from '@nakama-health/protocol-sdk';

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

Expected output: the GET route returns protocol metadata without any signer.

Next step: move the generated route into `app/api/nakama/status/route.ts` and
swap demo IDs for your product IDs.

## Oracle Worker

Install:

```bash
npx @nakama-health/protocol-sdk scaffold oracle-worker --out nakama-oracle-worker
cd nakama-oracle-worker
npm install
```

```ts
import {
  PROTOCOL_PROGRAM_ID,
  attestProtocolOutcome,
  createOracleSignerFromEnv,
} from '@nakama-health/protocol-sdk';

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

Expected output: a protocol-bound attestation verifies locally and prints an
attestation ID plus digest.

Next step: replace the in-memory demo signer with KMS or secret-manager wiring
and keep signer material out of tracked files.

## Read-Only Frontend

Install:

```bash
npm install @nakama-health/protocol-sdk
```

```ts
import {
  createConnection,
  deriveHealthPlanPda,
  deriveReserveDomainPda,
  getOmegaXNetworkInfo,
  listProtocolAccountNames,
} from '@nakama-health/protocol-sdk';

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

Expected output: a read-only status object with an RPC endpoint, derived health
plan PDA, and known account types.

Next step: move RPC calls that need secrets, signing, or privileged context into
a backend route.

## Typed Error Handling

```ts
import {
  OmegaXError,
  OmegaXProgramMismatchError,
  createConnection,
  createSafeProtocolClient,
} from '@nakama-health/protocol-sdk';

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
