# Test Fixtures

This directory stores script-owned fixtures used by parity and protocol contract
tests.

- `omegax_protocol.idl.json` mirrors the canonical IDL generated into
  `src/generated/`.
- Refresh it with `npm run generate:protocol-bindings` or
  `npm run sync:idl-fixture`.
- Do not hand-edit fixture JSON to make a failing test pass.

For protocol-facing changes, validate with:

```bash
npm run protocol:artifact:check
npm test
npm run verify:protocol:local
```
