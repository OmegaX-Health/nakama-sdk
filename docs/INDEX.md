# Documentation Index — `@nakama-health/protocol-sdk`

Use this page as the navigation hub for builders and release maintainers.

> **Deployment status:** the canonical SDK surface is Ethereum mainnet, but the
> checked-in deployment remains unconfigured. Documentation and generated APIs
> do not imply that a reviewed production address exists.

## Start with Ethereum mainnet

- `../README.md` for deployment status, self-custodial signing, and the ABI seam
- `API_REFERENCE.md` for the supported Ethereum modules and fail-closed gates

## Start with your builder path

- Claim authorization relayers:
  - `GETTING_STARTED.md`
  - `WORKFLOWS.md`
  - `API_REFERENCE.md`
- Health / wallet / app builders:
  - `GETTING_STARTED.md`
  - `WORKFLOWS.md`
  - `TROUBLESHOOTING.md`
- Contract and reserve integrators:
  - `WORKFLOWS.md`
  - `API_REFERENCE.md`
  - `RELEASE_NOTES.md`

## Core docs

- `GETTING_STARTED.md` for mainnet client setup and self-custodial wallet requests
- `WORKFLOWS.md` for read, deployment-proof, wallet, finality, and authorization flows
- `TOP_APIS.md` for the shortest API list by builder lane
- `RECIPES.md` for Node, Next.js, oracle-worker, and read-only frontend snippets
- `ERROR_CATALOG.md` for stable `NAKAMA_*` errors and legacy compatibility codes
- `API_REFERENCE.md` for canonical Ethereum modules and the isolated legacy surface
- `generated/api/README.md` for generated TypeDoc markdown from the exported SDK surface
- `TROUBLESHOOTING.md` for canonical failure modes and remediation
- `../examples/README.md` for mainnet, calldata, and EIP-712 examples
- `RELEASE_NOTES.md` for versioned SDK changes and rollout notes
- `RELEASE.md` for local release gates and tag/publish steps
- `REPOSITORY_STRUCTURE.md` for source ownership, generated-output rules, and validation by change type
- `DOCS_SYNC_WORKFLOW.md` for SDK to `omegax-docs` parity
- `OMEGAX_DOCS_SYNC.json` for the machine-checkable portal sync record
- `CROSS_REPO_RELEASE_ORDER.md` for the protocol + docs + SDK publish sequence
- `../scripts/README.md` for script side effects and command ownership

## Parity assurance

- `../PROTOCOL_PARITY_CHECKLIST.md`
- `../contracts/ethereum/*.metadata.json` for the factory, registry, core, and
  ReserveVault artifact provenance
- `../tests/ethereum-generated.test.ts`
- `../tests/ethereum-contract.test.ts`

## Recommended reading order

1. `GETTING_STARTED.md`
2. `WORKFLOWS.md`
3. `TOP_APIS.md`
4. `RECIPES.md`
5. `ERROR_CATALOG.md`
6. `API_REFERENCE.md`
7. `RELEASE_NOTES.md`
8. `TROUBLESHOOTING.md`
