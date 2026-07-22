# Error Catalog — `@nakama-health/protocol-sdk`

Canonical Ethereum errors extend `NakamaEthereumError` and expose a stable
`code`, optional `details`, and optional `cause`. Branch on `instanceof` or
`code`; message strings are explanatory, not an API.

## `NAKAMA_ETHEREUM_CONFIG_ERROR`

The RPC, signing payload, JSON-RPC quantity, fee fields, or caller configuration
is invalid. Correct the configuration or payload before retrying.

## `NAKAMA_ETHEREUM_ADDRESS_ERROR`

An Ethereum address could not be normalized or checksummed. Reject the input at
the application boundary; retry only with a corrected address.

## `NAKAMA_ETHEREUM_WRONG_CHAIN`

An RPC, wallet, CAIP identifier, EIP-1193 request, EIP-712 domain, or deployment
manifest does not target Ethereum mainnet chain ID `1`. Do not switch a user's
wallet silently; ask them to choose mainnet or replace the endpoint.

## `NAKAMA_ETHEREUM_CONTRACT_ERROR`

ABI encoding, event decoding, ERC-20 inspection, deployment schema, artifact
hash, runtime bytecode, creation receipt, source verification, or audit evidence
failed. This is deterministic until the input, deployment, or reviewed evidence
changes.

## `NAKAMA_ETHEREUM_RECEIPT_ERROR`

A transaction reverted, lacks confirmations, is outside safe head, has a
noncanonical block hash, or changed between receipt reads. Retry reads for
temporary confirmation depth; do not treat a reorged or reverted transaction as
successful.

## `NAKAMA_ETHEREUM_ATTESTATION_ERROR`

A claim-recipient typed-data domain, message, nonce, deadline, claimant, or
signature is invalid. Rebuild the canonical payload from trusted contract state
and ask the claimant to authorize that exact payload.

## `NAKAMA_ETHEREUM_REPLAY`

The authorization digest or contract/claim nonce was already consumed. Do not
retry the same authorization; read the current nonce and create a fresh payload.

## `NAKAMA_LEGACY_WRITE_DISABLED`

A caller attempted to construct a Solana instruction/transaction, use a legacy
safe-client write method, broadcast, or invoke a MagicBlock network/write
operation. Those paths are disabled in the Ethereum mainnet SDK. Migrate the
flow to an EIP-1193 wallet request and canonical Ethereum contract call.

## Legacy compatibility errors

`OMEGAX_CONFIG_ERROR`, `OMEGAX_INVALID_PUBLIC_KEY`,
`OMEGAX_PROGRAM_MISMATCH`, `OMEGAX_ACCOUNT_NOT_FOUND`,
`OMEGAX_ACCOUNT_OWNER_MISMATCH`, `OMEGAX_TOKEN_ACCOUNT_PREFLIGHT`,
`OMEGAX_INSTRUCTION_BUILD`, `OMEGAX_TRANSACTION_DECODE`, and
`OMEGAX_RPC_ERROR` remain stable for historical Solana reads, decoding,
simulation, and migration. New Ethereum integrations should use the Nakama
error classes above.
