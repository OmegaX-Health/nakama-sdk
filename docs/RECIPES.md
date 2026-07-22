# SDK Recipes — `@nakama-health/protocol-sdk`

These recipes use Ethereum mainnet, caller-owned RPC, self-custodial wallets,
and the generated factory, policy registry, core, and ReserveVault artifacts.

## Start with a scaffold

```bash
npx @nakama-health/protocol-sdk doctor
npx @nakama-health/protocol-sdk scaffold node-backend --out nakama-provider-backend
npx @nakama-health/protocol-sdk scaffold next-route --out nakama-health-route
npx @nakama-health/protocol-sdk scaffold oracle-worker --out nakama-claim-relayer
```

Each scaffold typechecks and runs without a funded wallet or live transaction.

## Encode a contract call

```ts
import {
  NAKAMA_POLICY_REGISTRY_ABI,
  encodeEthereumCalldata,
} from '@nakama-health/protocol-sdk';

const data = encodeEthereumCalldata({
  abi: NAKAMA_POLICY_REGISTRY_ABI,
  functionName: 'deriveClaimId',
  args: [positionId, claimant, nullifier],
});
```

The ABI is generated from the canonical compiled protocol artifact, so callers
do not maintain a parallel hand-written instruction schema.

## Inspect an ERC-20 before use

```ts
import { inspectErc20 } from '@nakama-health/protocol-sdk/ethereum_contract';

const asset = await inspectErc20(client, {
  token: tokenAddress,
  owner: claimant,
  spender: protocolAddress,
  expectedSymbol: 'USDC',
  expectedDecimals: 6,
  minimumBalance: amount,
  minimumAllowance: amount,
});
```

This proves contract code exists and checks metadata, balance, and allowance.
Token symbols are display metadata, so production configuration should also pin
the exact token address.

## Build claim-recipient typed data

```ts
import { createClaimRecipientAuthorizationSigningPayload } from '@nakama-health/protocol-sdk/ethereum_oracle';

const payload = createClaimRecipientAuthorizationSigningPayload({
  account: claimant,
  verifyingContract: policyRegistryAddress,
  message: { claimId, recipient, nonce: trustedNonce, deadline },
});
```

Send this through `requestSigningSubmissionV2(...)` with a server-issued intent
ID. The result is an `AuthorizationSubmissionV2`, so a transaction hash cannot
be substituted for the signature. A relayer should then call
`verifyAndConsumeClaimRecipientAuthorization(...)` with the original typed
data, trusted onchain nonce, and a durable atomic replay guard. Pass an Ethereum
public client for ERC-1271 smart-contract claimants.

## Handle typed failures

```ts
import {
  NakamaEthereumError,
  NakamaEthereumWrongChainError,
} from '@nakama-health/protocol-sdk/errors';

try {
  await verifyEthereumReceipt(client, { hash });
} catch (error) {
  if (error instanceof NakamaEthereumWrongChainError) {
    // Reject the endpoint or wallet configuration.
  } else if (error instanceof NakamaEthereumError) {
    console.error(error.code, error.details);
  } else {
    throw error;
  }
}
```

Run `npm run dogfood:consumer` before release to install the packed SDK into an
external fixture, compile every Ethereum subpath, and execute its safe smoke.
