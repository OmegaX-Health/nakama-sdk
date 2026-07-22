[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / ROBINHOOD\_MAINNET

# Variable: ROBINHOOD\_MAINNET

> `const` **ROBINHOOD\_MAINNET**: `object`

Defined in: src/robinhood/chains.ts:32

## Type Declaration

### blockExplorers

> **blockExplorers**: `object`

Collection of block explorers

#### blockExplorers.default

> `readonly` **default**: `object`

#### blockExplorers.default.name

> `readonly` **name**: `"Robinhood Chain Blockscout"` = `'Robinhood Chain Blockscout'`

#### blockExplorers.default.url

> `readonly` **url**: `"https://robinhoodchain.blockscout.com"` = `'https://robinhoodchain.blockscout.com'`

### blockTime?

> `optional` **blockTime?**: `number`

Block time in milliseconds.

### contracts?

> `optional` **contracts?**: `object`

Collection of contracts

#### Index Signature

\[`key`: `string`\]: `ChainContract` \| \{\[`sourceId`: `number`\]: `ChainContract` \| `undefined`; \} \| `undefined`

#### contracts.ensRegistry?

> `optional` **ensRegistry?**: `ChainContract`

#### contracts.ensUniversalResolver?

> `optional` **ensUniversalResolver?**: `ChainContract`

#### contracts.erc6492Verifier?

> `optional` **erc6492Verifier?**: `ChainContract`

#### contracts.multicall3?

> `optional` **multicall3?**: `ChainContract`

### ~~custom?~~

> `optional` **custom?**: `Record`\<`string`, `unknown`\>

Custom chain data.

#### Deprecated

use `.extend` instead.

### ensTlds?

> `optional` **ensTlds?**: readonly `string`[]

Collection of ENS TLDs for the chain.

### experimental\_preconfirmationTime?

> `optional` **experimental\_preconfirmationTime?**: `number`

Preconfirmation time in milliseconds.

### extendSchema?

> `optional` **extendSchema?**: `Record`\<`string`, `unknown`\>

Extend schema.

### fees?

> `optional` **fees?**: `ChainFees`\<`undefined`\>

Modifies how fees are derived.

### formatters?

> `optional` **formatters?**: `undefined`

Modifies how data is formatted and typed (e.g. blocks and transactions)

### id

> **id**: `4663`

ID in number form

### name

> **name**: `"Robinhood Chain"`

Human-readable name

### nativeCurrency

> **nativeCurrency**: `object`

Currency used by chain

#### nativeCurrency.decimals

> `readonly` **decimals**: `18` = `18`

#### nativeCurrency.name

> `readonly` **name**: `"Ether"` = `'Ether'`

#### nativeCurrency.symbol

> `readonly` **symbol**: `"ETH"` = `'ETH'`

### prepareTransactionRequest?

> `optional` **prepareTransactionRequest?**: `PrepareTransactionRequestFn` \| \[`PrepareTransactionRequestFn`, `object`\]

Function to prepare a transaction request. Runs before the transaction is filled.

### rpcUrls

> **rpcUrls**: `object`

Collection of RPC endpoints

#### rpcUrls.default

> `readonly` **default**: `object`

#### rpcUrls.default.http

> `readonly` **http**: readonly \[`"https://rpc.mainnet.chain.robinhood.com"`\]

### serializers?

> `optional` **serializers?**: `ChainSerializers`\<`undefined`, `TransactionSerializable`\>

Modifies how data is serialized (e.g. transactions).

### sourceId?

> `optional` **sourceId?**: `number`

Source Chain ID (ie. the L1 chain)

### supportsTransactionReplacementDetection?

> `optional` **supportsTransactionReplacementDetection?**: `boolean`

Whether transaction replacement detection is supported.

#### Default

```ts
true
```

### testnet?

> `optional` **testnet?**: `boolean`

Flag for test networks

### verifyHash?

> `optional` **verifyHash?**: `ChainVerifyHashFn`

Chain-specific signature verification.
