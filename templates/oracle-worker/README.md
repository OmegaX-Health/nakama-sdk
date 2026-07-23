# Nakama Human Review Payload Worker

Builds the Robinhood Chain program's exact `Decision` EIP-712 payload, human
preview, digest, and round-scoped replay key. It never handles a private key or
lets an AI agent sign a coverage decision. Set `DECISION_MODULE_ADDRESS` only
from the generated audited deployment after runtime verification.

```bash
npm install
npm run typecheck
npm run build
npm run smoke
```
