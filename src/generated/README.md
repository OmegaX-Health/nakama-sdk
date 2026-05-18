# Generated Protocol Bindings

This directory is script-owned. Do not edit these files by hand.

Authoritative refresh command:

```bash
npm run generate:protocol-bindings
```

The command reads the canonical sibling `../omegax-protocol` workspace unless
`OMEGAX_PROTOCOL_REPO` points somewhere else. It refreshes:

- `src/generated/omegax_protocol.idl.json`
- `src/generated/protocol_contract.ts`
- `src/generated/protocol_types.ts`
- `tests/fixtures/omegax_protocol.idl.json`

After refreshing, run:

```bash
npm run protocol:artifact:check
npm run typecheck
npm test
```
