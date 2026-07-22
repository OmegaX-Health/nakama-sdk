[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / RobinhoodPublicClientOptions

# Type Alias: RobinhoodPublicClientOptions

> **RobinhoodPublicClientOptions** = `object` & \{ `provider?`: `never`; `rpcUrl`: `string`; \} \| \{ `provider`: [`RobinhoodEip1193Provider`](../interfaces/RobinhoodEip1193Provider.md); `rpcUrl?`: `never`; \}

Defined in: src/robinhood/chains.ts:85

## Type Declaration

### network

> **network**: [`RobinhoodNetwork`](RobinhoodNetwork.md)

Network selection is mandatory; the SDK never falls back to chain 1.
