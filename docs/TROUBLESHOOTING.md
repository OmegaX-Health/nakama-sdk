# Troubleshooting — `@omegax/protocol-sdk`

This page maps common integration failures to likely causes in the canonical OmegaX model.

## Fast triage

1. Confirm Node version is `>=20`.
2. Confirm your runtime is using ESM imports.
3. Confirm `programId` and RPC cluster match the deployment you expect.
4. Confirm product/operator flows use `createSafeProtocolClient(...)` unless you
   are intentionally testing raw protocol builders.
5. Run the installed-package doctor:

```bash
npx @omegax/protocol-sdk doctor
```

6. In the SDK repo, run the no-signature smoke:

```bash
npm run example:smoke
```

7. Regenerate bindings if the sibling protocol workspace changed:

```bash
npm run generate:protocol-bindings
```

8. Run local checks:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run build
npm test
npm run docs:api:check
npm run examples:check
npm run dogfood:consumer
```

## Typed SDK errors

Public failure paths that app builders can act on now throw typed errors from
`@omegax/protocol-sdk/errors`. Branch on `instanceof` or the stable `code`
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

## Install warning: `uuid@8.3.2`

Some Solana dependency trees still print an install warning for `uuid@8.3.2`
when a consumer project installs the packed SDK or a scaffolded template. Treat
that warning as non-blocking for SDK integration.

Use `npm run audit:prod` as the authoritative production dependency gate for
this repository. It encodes the current reviewed Solana dependency posture and
must stay green before release.

## Transaction and submission issues

### `missing_fee_payer` or `missing_required_signature`

Cause:

- The built transaction was not signed by the required signer.

Fix:

- Ensure your fee payer signs before serialization.
- Align the signer with the authority required by the instruction scope.

### Simulation returns `signatureVerified: false`

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

### `rpc_timeout`

Cause:

- Confirmation took too long or the blockhash expired.

Fix:

- Fetch a fresh blockhash with `getRecentBlockhash()`.
- Rebuild, re-sign, and resubmit the transaction.

### `network_error`

Cause:

- RPC transport or network connectivity interrupted submission.

Fix:

- Retry against a healthy RPC endpoint.
- Record simulation logs so you can distinguish transport failures from program failures.

## Canonical claim and obligation failures

These are normalized by `normalizeClaimSimulationFailure(...)` and `normalizeClaimRpcFailure(...)`.

### `protocol_paused`

Cause:

- A protocol or plan-level control is blocking the claim flow.

Fix:

- Inspect governance, reserve-domain, health-plan, or capital-class pause state before retrying.

### `claim_intake_paused`

Cause:

- Claim intake is paused for the relevant scope.

Fix:

- Resume intake or route the case through the correct plan and series.

### `not_eligible`

Cause:

- The claim case is not eligible for the requested payout under the bound policy series.

Fix:

- Verify `fetchClaimCase(...)` state and `describeClaimStatus(...)`.

### `funding_exhausted`

Cause:

- The applicable funding line or reserve scope does not have enough free capital.

Fix:

- Inspect `fetchFundingLineLedger(...)`, `fetchPlanReserveLedger(...)`, and `recomputeReserveBalanceSheet(...)`.

### `invalid_claim_state`

Cause:

- The claim case or obligation is not in a state that permits the requested transition.

Fix:

- Inspect `fetchClaimCase(...)` or `fetchObligation(...)` and only apply valid state transitions.

## Builder and PDA issues

### `seed id must be 1..32 UTF-8 bytes`

Cause:

- A domain, plan, series, funding-line, or obligation identifier exceeds PDA seed limits.

Fix:

- Validate identifiers with `isSeedIdSafe(...)` or `assertSeedId(...)`.

### `account discriminator mismatch for ...`

Cause:

- The address does not point to the account type you tried to decode.

Fix:

- Re-derive the address with the canonical PDA helper.
- Confirm the `programId` and cluster are correct.
- Use `fetch...(...)` readers instead of ad hoc decoding where possible.

### `ERR_PACKAGE_PATH_NOT_EXPORTED`

Cause:

- Your import uses a package subpath that is not part of the public export map.

Fix:

- Use one of the documented public subpaths such as
  `@omegax/protocol-sdk/protocol_models`,
  `@omegax/protocol-sdk/protocol_seeds`, or
  `@omegax/protocol-sdk/transactions`.
- Run `npm run dx:smoke` before release when adding docs that mention a new
  package subpath.

## Reserve and capital issues

### Reserve capital deposits or returns fail unexpectedly

Cause:

- The reserve domain or health plan may be paused, or the funding line may be closed.

Fix:

- Inspect `fetchReserveDomain(...)` and `fetchFundingLine(...)`.
- Check `describeFundingLineType(...)` and the relevant pause flags.

### Reserve balances look off

Cause:

- You may be reading gross vault balance instead of attributed ledger state.

Fix:

- Inspect `fetchFundingLineLedger(...)`, `fetchPlanReserveLedger(...)`, and `fetchDomainAssetLedger(...)`.
- Recompute the reserve sheet with `recomputeReserveBalanceSheet(...)`.

### Sponsor budget or premium math looks wrong

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
npm run verify:protocol:local
```

If parity still fails:

- refresh bindings with `npm run generate:protocol-bindings`
- rerun `npm test`
- verify the sibling `omegax-protocol` workspace is the one you intended to target

## If issues persist

- Capture the transaction signature.
- Preserve simulation logs.
- Record SDK version, protocol commit, and docs sync manifest values.
- Reduce the failure to the smallest `build...Tx(...)` call that still reproduces the issue.
