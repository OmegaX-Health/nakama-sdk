# Nakama Node Backend Starter

Read-only Robinhood Chain starter for protection-product backends and
integration services. Set `ROBINHOOD_MAINNET_RPC_URL` to your own endpoint;
the smoke never submits a transaction and reports writes disabled while the
checked-in deployment is unconfigured.

```bash
npm install
npm run typecheck
npm run build
npm run smoke
```

Run a local status endpoint:

```bash
npm run start
```
