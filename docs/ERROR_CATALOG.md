# Robinhood error catalog

Canonical errors extend `NakamaRobinhoodError` and carry stable SDK error codes.
Catch the narrow type when remediation is safe; otherwise stop the operation and
surface the error rather than retrying a write blindly.

## `NakamaRobinhoodConfigError`

Network, RPC, deployment, timestamp, policy, or required configuration is
missing or inconsistent. Supply an explicit network/RPC and trusted current
configuration; do not add a permissive default.

## `NakamaRobinhoodAddressError`

An address or CAIP account is malformed, zero where forbidden, or on a different
Robinhood network. Re-resolve the identity from the authoritative source and
rebuild the operation.

## `NakamaRobinhoodWrongChainError`

The RPC or wallet reports a chain other than the selected `4663`/`46630` chain.
Abort and let the user reconnect; the SDK deliberately does not switch networks.

## `NakamaRobinhoodAssetError`

USDG metadata, address, decimals, chain, amount precision, or paired asset
identity is wrong. Mainnet accepts only the canonical USDG address and six
decimals; testnet is unavailable until a verified address is published.

## `NakamaRobinhoodArtifactError`

The imported source/ABI checksum, role mapping, deployment commitment, manifest,
or generated bundle differs from canonical evidence. Re-import from the reviewed
protocol artifact and inspect the diff; do not modify generated output manually.

## `NakamaRobinhoodContractError`

Live bytecode, suite topology, program binding, decoded calldata, event, or
contract state conflicts with the verified deployment. Treat this as a stopped
operation and investigate the deployment/RPC state before retrying.

## `NakamaRobinhoodSimulationError`

The exact prepared action reverted, was stale, changed, or was not simulated on
the selected verified network. Explain the decoded failure when available,
refresh state, rebuild, and simulate a new action.

## `NakamaRobinhoodReceiptError`

Receipt, transaction input, canonical block, provider agreement, L1 evidence,
or finality ordering is missing or contradictory. Preserve the explicit status;
do not translate disagreement, replacement, reorg, or timeout into success.

## `NakamaRobinhoodSignatureError`

The EIP-712 payload, signer, role/round/action combination, module, nonce,
expiry, digest, replay key, or EIP-1271 result is invalid. Rebuild from trusted
current request state and never reuse the failed payload.

## `NakamaRobinhoodAccountPolicyError`

An agent policy is too broad, expired, mismatched, unproven, or requests a
disabled submission. Keep the Phase-0 operation in simulation; adapter
self-attestation is not sufficient onchain policy evidence.

## `NakamaRobinhoodStaleStateError`

A write depends on stale, divergent, malformed, or offline-cached state. Refresh
the direct-chain pinned read, reconcile it, and require a safe context before
building a new action.

Legacy `NakamaEthereumError` and Solana-era errors remain available only through
their explicit migration subpaths and are not canonical Robinhood error types.
