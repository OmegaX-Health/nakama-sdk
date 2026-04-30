# Troubleshooting — `@omegax/protocol-sdk`

This page maps common integration failures to likely causes in the canonical OmegaX model.

## Fast triage

1. Confirm Node version is `>=20`.
2. Confirm your runtime is using ESM imports.
3. Confirm `programId` and RPC cluster match the deployment you expect.
4. Regenerate bindings if the sibling protocol workspace changed:

```bash
npm run generate:protocol-bindings
```

5. Run local checks:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run build
npm test
```

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
  the submitted transaction.

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

- The `MemberPosition` is not eligible for the requested claim or payout.

Fix:

- Verify `fetchMemberPosition(...)` and `describeEligibilityStatus(...)`.

### `funding_exhausted`

Cause:

- The applicable funding line or reserve scope does not have enough free capital.

Fix:

- Inspect `fetchFundingLineLedger(...)`, `fetchPlanReserveLedger(...)`, and `recomputeReserveBalanceSheet(...)`.

### `allocation_frozen`

Cause:

- Allocation controls are in deallocation-only or freeze mode.

Fix:

- Check allocation and capital-class controls before attempting new utilization.

### `queue_only`

Cause:

- A capital surface is operating in queue-only mode.

Fix:

- Use `buildRequestRedemptionTx(...)` and wait for `buildProcessRedemptionQueueTx(...)` rather than expecting immediate exit.

### `invalid_claim_state`

Cause:

- The claim case or obligation is not in a state that permits the requested transition.

Fix:

- Inspect `fetchClaimCase(...)` or `fetchObligation(...)` and only apply valid state transitions.

## Builder and PDA issues

### `seed id must be 1..32 UTF-8 bytes`

Cause:

- A plan, series, funding-line, pool, class, or obligation identifier exceeds PDA seed limits.

Fix:

- Validate identifiers with `isSeedIdSafe(...)` or `assertSeedId(...)`.

### `account discriminator mismatch for ...`

Cause:

- The address does not point to the account type you tried to decode.

Fix:

- Re-derive the address with the canonical PDA helper.
- Confirm the `programId` and cluster are correct.
- Use `fetch...(...)` readers instead of ad hoc decoding where possible.

## Reserve and capital issues

### Capital subscriptions fail unexpectedly

Cause:

- The capital class may be paused, restricted, or credential gating may be missing.

Fix:

- Inspect `fetchCapitalClass(...)`.
- Check `describeCapitalRestriction(...)`.

### Redemptions do not process

Cause:

- The position may still be locked, queue-only controls may apply, or redeemable capital may be insufficient.

Fix:

- Inspect `fetchLPPosition(...)`, `fetchPoolClassLedger(...)`, and `fetchDomainAssetLedger(...)`.
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
