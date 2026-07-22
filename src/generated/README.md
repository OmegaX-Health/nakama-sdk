# Generated Protocol Bindings

This directory is script-owned. Do not edit these files by hand.

Authoritative refresh command:

```bash
npm run generate:protocol-bindings
```

The canonical command reads:

- ABI and metadata pairs for `NakamaProtocolFactory`,
  `NakamaPolicyRegistry`, `NakamaCoverageProtocol`, and `ReserveVault` under
  `contracts/ethereum/`
- `deployments/ethereum-mainnet.json`
- `deployments/ethereum-mainnet.final.schema.json`

It refreshes `src/generated/ethereum_protocol.ts`.

The old Anchor outputs (`omegax_protocol.idl.json`, `protocol_contract.ts`,
`protocol_types.ts`, and the test IDL fixture) are migration-only and are
refreshed by `npm run sync:legacy-solana-idl`.

After refreshing, run:

```bash
npm run protocol:artifact:check
npm run typecheck
npm test
```
