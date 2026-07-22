[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / EthereumPublicClientOptions

# Interface: EthereumPublicClientOptions

Defined in: src/ethereum.ts:38

## Properties

### provider?

> `optional` **provider?**: [`Eip1193ProviderLike`](Eip1193ProviderLike.md)

Defined in: src/ethereum.ts:42

An injected EIP-1193 provider. Mutually exclusive with rpcUrl.

***

### rpcUrl?

> `optional` **rpcUrl?**: `string`

Defined in: src/ethereum.ts:40

HTTPS mainnet RPC, or explicit loopback HTTP for a local node.
