# Nakama SDK documentation

The package root and `@nakama-health/protocol-sdk/robinhood` are the canonical
Robinhood Chain surface. Both deployment manifests are deliberately
`unconfigured`: the SDK, templates, and examples are implementation-ready, but
production reads and writes remain blocked until the 12-contract deployment is
audited, approved, published, and verified against live bytecode.

## Start here

1. [Getting started](GETTING_STARTED.md) establishes chain, RPC, deployment,
   USDG, read, action, signature, and finality boundaries.
2. [API reference](API_REFERENCE.md) explains the supported Robinhood modules
   and their fail-closed behavior.
3. [Workflows](WORKFLOWS.md) maps product operations to the safe runtime order.
4. [Robinhood and Virtuals](ROBINHOOD_VIRTUALS.md) separates the health product
   from the offline launch-packet checker and the official Virtuals launch
   process.

## Build and operate

- [Top APIs](TOP_APIS.md) is the shortest route to the public surface.
- [Recipes](RECIPES.md) contains minimal integration patterns.
- [Error catalog](ERROR_CATALOG.md) maps typed failures to safe remediation.
- [Troubleshooting](TROUBLESHOOTING.md) starts from the current fail-closed
  deployment state and works outward.
- [Repository structure](REPOSITORY_STRUCTURE.md) identifies generated,
  handwritten, canonical, and legacy areas.
- [SDK quality contract](../SDK_QUALITY.md) defines the release invariants.
- [Release procedure](RELEASE.md) describes how an audited deployment becomes a
  publishable package without weakening the safety gates.

## Generated and machine-readable references

- [Generated TypeDoc](generated/api/README.md) is built from the canonical root.
- [`SDK_RUNTIME.json`](../SDK_RUNTIME.json) is the machine-readable declaration
  of networks, ABI roles, artifact commitments, subpaths, and safety boundaries.
- [`contracts/robinhood/`](../contracts/robinhood/) contains the exact 12 ABIs
  and imported protocol artifact.
- [`deployments/`](../deployments/) contains the Robinhood mainnet/testnet
  manifests and their closed JSON schema.

## Legacy surfaces

Ethereum-mainnet and Solana modules remain available through explicit package
subpaths for migration. They are absent from the root, do not act as fallbacks,
and are not the architecture for a new integration. Historical release notes
remain in [release notes](RELEASE_NOTES.md) for provenance.
