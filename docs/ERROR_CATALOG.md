# Error Catalog - `@omegax/protocol-sdk`

Public SDK errors extend `OmegaXError` and include a stable `code`, optional
`details`, and optional `cause`. Branch on `instanceof` or `code`; do not parse
message strings.

## `OMEGAX_CONFIG_ERROR`

Meaning: SDK configuration is invalid or incomplete.

Likely causes:

- Unsupported network input.
- Missing oracle signer environment variable.
- Invalid oracle signer secret length.

Fix: correct network, env, or signer configuration before retrying.

Retry: no, unless configuration changed.

## `OMEGAX_INVALID_PUBLIC_KEY`

Meaning: a provided address cannot be normalized to a Solana public key.

Likely causes:

- Empty address.
- Typo in base58 string.
- Object with invalid `toBase58()` output.

Fix: validate the address at the application boundary.

Retry: no, unless input changed.

## `OMEGAX_PROGRAM_MISMATCH`

Meaning: the requested program ID does not match the canonical OmegaX program
for safe production flows.

Likely causes:

- Custom localnet/devnet program ID passed without unsafe opt-in.
- Builder call mixed two different program IDs.
- Token program is not the classic SPL Token program where required.

Fix: use `PROTOCOL_PROGRAM_ID` for product flows. Use
`unsafeAllowCustomProgramId` only for localnet, test, or explicitly unsafe
devnet workflows.

Retry: no, unless configuration changed.

## `OMEGAX_ACCOUNT_NOT_FOUND`

Meaning: an expected account was not found at the provided address.

Likely causes:

- Account has not been initialized.
- Wrong PDA seed or program ID.
- RPC points at the wrong cluster.

Fix: confirm network, program ID, seeds, and account creation state.

Retry: yes only after account creation or RPC/network correction.

## `OMEGAX_ACCOUNT_OWNER_MISMATCH`

Meaning: an account exists but is owned by an unexpected program.

Likely causes:

- Wrong cluster or address.
- Token account expected but a system/program account was supplied.
- Protocol account belongs to a different program ID.

Fix: inspect the address and expected owner before asking users to sign.

Retry: no, unless input changed.

## `OMEGAX_TOKEN_ACCOUNT_PREFLIGHT`

Meaning: a token custody account failed mint, owner, or layout preflight.

Likely causes:

- Recipient token account has wrong mint.
- Recipient owner does not match expected owner.
- Token account data is malformed or not a classic SPL Token account.

Fix: create or select the correct token account, then retry.

Retry: yes after token account correction.

## `OMEGAX_INSTRUCTION_BUILD`

Meaning: the SDK could not safely build the requested instruction or
transaction.

Likely causes:

- Missing required account.
- Fee payer could not be inferred.
- Required recent blockhash or fee payer missing for v0 compilation.
- Partial optional account scope supplied.

Fix: provide the complete account scope or use `createSafeProtocolClient(...)`
for guarded builders.

Retry: no, unless the builder input changed.

## `OMEGAX_TRANSACTION_DECODE`

Meaning: serialized transaction bytes could not be decoded.

Likely causes:

- Malformed base64.
- Truncated transaction.
- Invalid legacy or versioned transaction message.

Fix: preserve the original payload and validate serialization before submission.

Retry: no, unless the transaction payload changed.

## `OMEGAX_RPC_ERROR`

Meaning: an RPC call returned a malformed or failed response through SDK RPC
helpers.

Likely causes:

- RPC rejected simulation arguments.
- RPC returned no result payload.
- Transport or node behavior differs from Solana web3 expectations.

Fix: inspect RPC logs, endpoint health, and simulation options. Use
`allowSigVerifyFallback` only when the application explicitly accepts unverified
simulation fallback metadata.

Retry: yes for transport/node health failures; no for deterministic payload
failures.
