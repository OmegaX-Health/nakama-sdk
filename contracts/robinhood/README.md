# Robinhood protocol artifacts

This directory is an import boundary, not an authored ABI source. The canonical
protocol release must provide:

- `protocol_contract.json`
- one `<ContractName>.abi.json` for each contract listed in the deployment
  schema

Run `npm run import:robinhood-contract` to copy and verify those files from
`../nakama-protocol/shared/robinhood`, then regenerate
`src/generated/robinhood_protocol.ts`. The 12 canonical ABIs and aggregate
artifact are present in this release. The import requires artifact schema 2,
protocol suite major 2, and economic-event schema 2; the PoolVault ABI contains
the sole canonical `EconomicActivity` event. Deployment manifests remain
`unconfigured`, so address-dependent reads and every write still fail closed.
