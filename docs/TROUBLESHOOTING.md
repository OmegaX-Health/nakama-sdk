# Troubleshooting — `@nakama-health/protocol-sdk`

The canonical SDK targets Ethereum mainnet (`eip155:1`) through the schema-v3
factory deployment. Solana troubleshooting is retained below only for
migration users.

## Fast triage

1. Confirm Node is `>=20` and the runtime uses ESM imports.
2. Run the installed-package doctor against an Ethereum mainnet RPC:

```bash
npx @nakama-health/protocol-sdk doctor \
  --network mainnet \
  --rpc-url "$ETHEREUM_MAINNET_RPC_URL"
```

3. Inspect `NAKAMA_ETHEREUM_MAINNET_DEPLOYMENT`. Schema version must be `3`,
   chain ID must be `1`, and the entry contract must be
   `NakamaProtocolFactory`. A status of `unconfigured` intentionally leaves all
   three live addresses null and disables contract writes.
4. Confirm the factory, policy-registry, and protocol addresses come from the
   same deployment transaction, while `ReserveVault` remains addressless
   template metadata until the core deploys each vault with CREATE2.
5. In the SDK repo, verify generated artifact parity and runtime metadata:

```bash
npm run sync:ethereum-abi:check
npm run runtime:check
```

6. Import and regenerate bindings only when the canonical sibling
   `nakama-protocol` artifact changed:

```bash
npm run import:ethereum-contract
```

7. Run the integration gates:

```bash
npm run typecheck
npm run lint
npm run build
npm test
npm run examples:check
npm run templates:check
npm run dogfood:consumer
```

## Canonical Ethereum failures

### `NAKAMA_ETHEREUM_CONFIG_ERROR`

The RPC URL or required Ethereum configuration is missing or invalid. Supply an
HTTPS/WSS Ethereum mainnet endpoint through configuration rather than committing
credentials or provider tokens.

### `NAKAMA_ETHEREUM_WRONG_CHAIN`

The provider, CAIP identifier, or deployment manifest does not resolve to chain
ID `1`. Reject the operation and reconnect to Ethereum mainnet; the SDK does not
silently translate another chain into mainnet.

### `NAKAMA_ETHEREUM_CONTRACT_ERROR`

The schema-v3 manifest, factory-derived child addresses, the protocol's
`deploymentFactory()` back-pointer, cross-contract getters, bytecode templates,
or per-contract Sourcify evidence failed validation. Do not write through that
deployment. Recheck the factory receipt and nonce-derived addresses, then run
`validateEthereumContractDeployment(...)` against an archive-capable mainnet RPC
if deployment-block code is unavailable from the current provider.

### `NAKAMA_ETHEREUM_RECEIPT_ERROR`

The transaction reverted, is not included in the expected block, lacks the
required confirmations, or is ahead of the finalized safe head. Preserve the
transaction hash and expected intent, wait for finality, and rerun
`verifyEthereumReceipt(...)`; do not treat a pending or merely included receipt
as final.

### `NAKAMA_ETHEREUM_ATTESTATION_ERROR` or `NAKAMA_ETHEREUM_REPLAY`

ClaimRecipient authorization is malformed, expired, signed for the wrong policy
registry, invalid for its EOA/ERC-1271 signer, or already consumed. Rebuild the
exact EIP-712 payload with domain name `Nakama Policy Registry`, version `1`,
chain ID `1`, and the deployed policy-registry address. Production replay guards
must consume the authorization keys atomically in durable shared storage.

## Legacy Solana migration troubleshooting

Everything through the reserve/capital section below applies only to retained
Solana migration subpaths. New integrations should not configure a program ID,
derive PDAs, or broadcast through these legacy surfaces.

### Legacy typed SDK errors

Public failure paths that app builders can act on now throw typed errors from
`@nakama-health/protocol-sdk/errors`. Branch on `instanceof` or the stable `code`
field instead of parsing message text.

Common codes:

- `OMEGAX_CONFIG_ERROR`
- `OMEGAX_INVALID_PUBLIC_KEY`
- `OMEGAX_PROGRAM_MISMATCH`
- `OMEGAX_ACCOUNT_NOT_FOUND`
- `OMEGAX_ACCOUNT_OWNER_MISMATCH`
- `OMEGAX_TOKEN_ACCOUNT_PREFLIGHT`
- `OMEGAX_INSTRUCTION_BUILD`
- `OMEGAX_TRANSACTION_DECODE`
- `OMEGAX_RPC_ERROR`

See `docs/ERROR_CATALOG.md` for causes, fixes, and retry guidance.

### A legacy subpath reports a missing Solana package

The canonical package root installs only the Ethereum production dependency.
Legacy read and migration subpaths use optional peers, so consumers that still
need those explicit subpaths must install them themselves:

```bash
npm install @coral-xyz/anchor @solana/web3.js bn.js bs58 tweetnacl
```

Do not add these peers to a canonical Ethereum consumer. Before release, both
`npm run audit:prod` and `npm run audit:packed-consumer` must pass; the latter
installs the actual tarball in an isolated production-only project and rejects
every moderate-or-higher advisory.

### Transaction and submission issues

#### `missing_fee_payer` or `missing_required_signature`

Cause:

- The built transaction was not signed by the required signer.

Fix:

- Ensure your fee payer signs before serialization.
- Align the signer with the authority required by the instruction scope.

#### Simulation returns `signatureVerified: false`

Cause:

- The caller disabled `sigVerify`, or explicitly allowed fallback after the RPC
  rejected signature-verifying simulation arguments.

Fix:

- Treat the simulation as preflight-only.
- Re-sign and simulate with `sigVerify: true`.
- For claim or intake flows, call `validateSignedClaimTx(...)` before trusting
  the submitted transaction, and always pass the exact
  server-stored `expectedUnsignedTxBase64` transaction that the user was
  supposed to sign.

#### `rpc_timeout`

Cause:

- Confirmation took too long or the blockhash expired.

Fix:

- Fetch a fresh blockhash with `getRecentBlockhash()`.
- Rebuild, re-sign, and resubmit the transaction.

#### `network_error`

Cause:

- RPC transport or network connectivity interrupted submission.

Fix:

- Retry against a healthy RPC endpoint.
- Record simulation logs so you can distinguish transport failures from program failures.

### Legacy claim and obligation failures

These are normalized by `normalizeClaimSimulationFailure(...)` and `normalizeClaimRpcFailure(...)`.

#### `protocol_paused`

Cause:

- A protocol or plan-level control is blocking the claim flow.

Fix:

- Inspect governance, reserve-domain, health-plan, or capital-class pause state before retrying.

#### `claim_intake_paused`

Cause:

- Claim intake is paused for the relevant scope.

Fix:

- Resume intake or route the case through the correct plan and series.

#### `not_eligible`

Cause:

- The claim case is not eligible for the requested payout under the bound policy series.

Fix:

- Verify `fetchClaimCase(...)` state and `describeClaimStatus(...)`.

#### `funding_exhausted`

Cause:

- The applicable funding line or reserve scope does not have enough free capital.

Fix:

- Inspect `fetchFundingLineLedger(...)`, `fetchPlanReserveLedger(...)`, and `recomputeReserveBalanceSheet(...)`.

#### `invalid_claim_state`

Cause:

- The claim case or obligation is not in a state that permits the requested transition.

Fix:

- Inspect `fetchClaimCase(...)` or `fetchObligation(...)` and only apply valid state transitions.

### Builder and PDA issues

#### `seed id must be 1..32 UTF-8 bytes`

Cause:

- A domain, plan, series, funding-line, or obligation identifier exceeds PDA seed limits.

Fix:

- Validate identifiers with `isSeedIdSafe(...)` or `assertSeedId(...)`.

#### `account discriminator mismatch for ...`

Cause:

- The address does not point to the account type you tried to decode.

Fix:

- Re-derive the address with the canonical PDA helper.
- Confirm the `programId` and cluster are correct.
- Use `fetch...(...)` readers instead of ad hoc decoding where possible.

#### `ERR_PACKAGE_PATH_NOT_EXPORTED`

Cause:

- Your import uses a package subpath that is not part of the public export map.

Fix:

- Use one of the documented public subpaths such as
  `@nakama-health/protocol-sdk/protocol_models`,
  `@nakama-health/protocol-sdk/protocol_seeds`, or
  `@nakama-health/protocol-sdk/transactions`.
- Run `npm run dx:smoke` before release when adding docs that mention a new
  package subpath.

### Reserve and capital issues

#### Reserve capital deposits or returns fail unexpectedly

Cause:

- The reserve domain or health plan may be paused, or the funding line may be closed.

Fix:

- Inspect `fetchReserveDomain(...)` and `fetchFundingLine(...)`.
- Check `describeFundingLineType(...)` and the relevant pause flags.

#### Reserve balances look off

Cause:

- You may be reading gross vault balance instead of attributed ledger state.

Fix:

- Inspect `fetchFundingLineLedger(...)`, `fetchPlanReserveLedger(...)`, and `fetchDomainAssetLedger(...)`.
- Recompute the reserve sheet with `recomputeReserveBalanceSheet(...)`.

#### Sponsor budget or premium math looks wrong

Cause:

- You may be reading gross vault balance instead of attributed ledger state.

Fix:

- Treat free capital as ledger-derived, not raw token balance.
- Use `buildSponsorReadModel(...)` or `buildCapitalReadModel(...)` for higher-level views.

## Docs and protocol parity

If SDK docs or protocol artifacts changed, run:

```bash
npm run docs:check
npm run docs:sync:check
npm run sync:ethereum-abi:check
npm run runtime:check
```

If parity still fails:

- refresh bindings with `npm run generate:protocol-bindings`
- rerun `npm test`
- verify the sibling `nakama-protocol` workspace and all four standalone ABIs
  are the intended canonical inputs

## If issues persist

- Capture the Ethereum transaction hash and expected transaction intent.
- Preserve receipt, finalized-head, code, getter, and Sourcify evidence.
- Record the SDK version and protocol artifact SHA-256.
- Reduce the failure to the smallest exported Ethereum helper call that still
  reproduces the issue.
