[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / getRobinhoodChain

# Function: getRobinhoodChain()

> **getRobinhoodChain**(`network`): \{ `blockExplorers`: \{ `default`: \{ `name`: `"Robinhood Chain Blockscout"`; `url`: `"https://robinhoodchain.blockscout.com"`; \}; \}; `blockTime?`: `number`; `contracts?`: \{\[`key`: `string`\]: `ChainContract` \| \{\[`sourceId`: `number`\]: `ChainContract` \| `undefined`; \} \| `undefined`; `ensRegistry?`: `ChainContract`; `ensUniversalResolver?`: `ChainContract`; `erc6492Verifier?`: `ChainContract`; `multicall3?`: `ChainContract`; \}; `custom?`: `Record`\<`string`, `unknown`\>; `ensTlds?`: readonly `string`[]; `experimental_preconfirmationTime?`: `number`; `extendSchema?`: `Record`\<`string`, `unknown`\>; `fees?`: `ChainFees`\<`undefined`\>; `formatters?`: `undefined`; `id`: `4663`; `name`: `"Robinhood Chain"`; `nativeCurrency`: \{ `decimals`: `18`; `name`: `"Ether"`; `symbol`: `"ETH"`; \}; `prepareTransactionRequest?`: `PrepareTransactionRequestFn` \| \[`PrepareTransactionRequestFn`, `object`\]; `rpcUrls`: \{ `default`: \{ `http`: readonly \[`"https://rpc.mainnet.chain.robinhood.com"`\]; \}; \}; `serializers?`: `ChainSerializers`\<`undefined`, `TransactionSerializable`\>; `sourceId?`: `number`; `supportsTransactionReplacementDetection?`: `boolean`; `testnet?`: `boolean`; `verifyHash?`: `ChainVerifyHashFn`; \} \| \{ `blockExplorers`: \{ `default`: \{ `name`: `"Robinhood Chain Testnet Explorer"`; `url`: `"https://explorer.testnet.chain.robinhood.com"`; \}; \}; `blockTime?`: `number`; `contracts?`: \{\[`key`: `string`\]: `ChainContract` \| \{\[`sourceId`: `number`\]: `ChainContract` \| `undefined`; \} \| `undefined`; `ensRegistry?`: `ChainContract`; `ensUniversalResolver?`: `ChainContract`; `erc6492Verifier?`: `ChainContract`; `multicall3?`: `ChainContract`; \}; `custom?`: `Record`\<`string`, `unknown`\>; `ensTlds?`: readonly `string`[]; `experimental_preconfirmationTime?`: `number`; `extendSchema?`: `Record`\<`string`, `unknown`\>; `fees?`: `ChainFees`\<`undefined`\>; `formatters?`: `undefined`; `id`: `46630`; `name`: `"Robinhood Chain Testnet"`; `nativeCurrency`: \{ `decimals`: `18`; `name`: `"Ether"`; `symbol`: `"ETH"`; \}; `prepareTransactionRequest?`: `PrepareTransactionRequestFn` \| \[`PrepareTransactionRequestFn`, `object`\]; `rpcUrls`: \{ `default`: \{ `http`: readonly \[`"https://rpc.testnet.chain.robinhood.com"`\]; \}; \}; `serializers?`: `ChainSerializers`\<`undefined`, `TransactionSerializable`\>; `sourceId?`: `number`; `supportsTransactionReplacementDetection?`: `boolean`; `testnet`: `true`; `verifyHash?`: `ChainVerifyHashFn`; \}

Defined in: [src/robinhood/chains.ts:93](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/chains.ts#L93)

## Parameters

### network

[`RobinhoodNetwork`](../type-aliases/RobinhoodNetwork.md)

## Returns

### Type Literal

\{ `blockExplorers`: \{ `default`: \{ `name`: `"Robinhood Chain Blockscout"`; `url`: `"https://robinhoodchain.blockscout.com"`; \}; \}; `blockTime?`: `number`; `contracts?`: \{\[`key`: `string`\]: `ChainContract` \| \{\[`sourceId`: `number`\]: `ChainContract` \| `undefined`; \} \| `undefined`; `ensRegistry?`: `ChainContract`; `ensUniversalResolver?`: `ChainContract`; `erc6492Verifier?`: `ChainContract`; `multicall3?`: `ChainContract`; \}; `custom?`: `Record`\<`string`, `unknown`\>; `ensTlds?`: readonly `string`[]; `experimental_preconfirmationTime?`: `number`; `extendSchema?`: `Record`\<`string`, `unknown`\>; `fees?`: `ChainFees`\<`undefined`\>; `formatters?`: `undefined`; `id`: `4663`; `name`: `"Robinhood Chain"`; `nativeCurrency`: \{ `decimals`: `18`; `name`: `"Ether"`; `symbol`: `"ETH"`; \}; `prepareTransactionRequest?`: `PrepareTransactionRequestFn` \| \[`PrepareTransactionRequestFn`, `object`\]; `rpcUrls`: \{ `default`: \{ `http`: readonly \[`"https://rpc.mainnet.chain.robinhood.com"`\]; \}; \}; `serializers?`: `ChainSerializers`\<`undefined`, `TransactionSerializable`\>; `sourceId?`: `number`; `supportsTransactionReplacementDetection?`: `boolean`; `testnet?`: `boolean`; `verifyHash?`: `ChainVerifyHashFn`; \}

#### blockExplorers

> **blockExplorers**: `object`

Collection of block explorers

##### blockExplorers.default

> `readonly` **default**: `object`

##### blockExplorers.default.name

> `readonly` **name**: `"Robinhood Chain Blockscout"` = `'Robinhood Chain Blockscout'`

##### blockExplorers.default.url

> `readonly` **url**: `"https://robinhoodchain.blockscout.com"` = `'https://robinhoodchain.blockscout.com'`

#### blockTime?

> `optional` **blockTime?**: `number`

Block time in milliseconds.

#### contracts?

> `optional` **contracts?**: `object`

Collection of contracts

##### Index Signature

\[`key`: `string`\]: `ChainContract` \| \{\[`sourceId`: `number`\]: `ChainContract` \| `undefined`; \} \| `undefined`

##### contracts.ensRegistry?

> `optional` **ensRegistry?**: `ChainContract`

##### contracts.ensUniversalResolver?

> `optional` **ensUniversalResolver?**: `ChainContract`

##### contracts.erc6492Verifier?

> `optional` **erc6492Verifier?**: `ChainContract`

##### contracts.multicall3?

> `optional` **multicall3?**: `ChainContract`

#### ~~custom?~~

> `optional` **custom?**: `Record`\<`string`, `unknown`\>

Custom chain data.

##### Deprecated

use `.extend` instead.

#### ensTlds?

> `optional` **ensTlds?**: readonly `string`[]

Collection of ENS TLDs for the chain.

#### experimental\_preconfirmationTime?

> `optional` **experimental\_preconfirmationTime?**: `number`

Preconfirmation time in milliseconds.

#### extendSchema?

> `optional` **extendSchema?**: `Record`\<`string`, `unknown`\>

Extend schema.

#### fees?

> `optional` **fees?**: `ChainFees`\<`undefined`\>

Modifies how fees are derived.

#### formatters?

> `optional` **formatters?**: `undefined`

Modifies how data is formatted and typed (e.g. blocks and transactions)

#### id

> **id**: `4663`

ID in number form

#### name

> **name**: `"Robinhood Chain"`

Human-readable name

#### nativeCurrency

> **nativeCurrency**: `object`

Currency used by chain

##### nativeCurrency.decimals

> `readonly` **decimals**: `18` = `18`

##### nativeCurrency.name

> `readonly` **name**: `"Ether"` = `'Ether'`

##### nativeCurrency.symbol

> `readonly` **symbol**: `"ETH"` = `'ETH'`

#### prepareTransactionRequest?

> `optional` **prepareTransactionRequest?**: `PrepareTransactionRequestFn` \| \[`PrepareTransactionRequestFn`, `object`\]

Function to prepare a transaction request. Runs before the transaction is filled.

#### rpcUrls

> **rpcUrls**: `object`

Collection of RPC endpoints

##### rpcUrls.default

> `readonly` **default**: `object`

##### rpcUrls.default.http

> `readonly` **http**: readonly \[`"https://rpc.mainnet.chain.robinhood.com"`\]

#### serializers?

> `optional` **serializers?**: `ChainSerializers`\<`undefined`, `TransactionSerializable`\>

Modifies how data is serialized (e.g. transactions).

#### sourceId?

> `optional` **sourceId?**: `number`

Source Chain ID (ie. the L1 chain)

#### supportsTransactionReplacementDetection?

> `optional` **supportsTransactionReplacementDetection?**: `boolean`

Whether transaction replacement detection is supported.

##### Default

```ts
true
```

#### testnet?

> `optional` **testnet?**: `boolean`

Flag for test networks

#### verifyHash?

> `optional` **verifyHash?**: `ChainVerifyHashFn`

Chain-specific signature verification.

***

### Type Literal

\{ `blockExplorers`: \{ `default`: \{ `name`: `"Robinhood Chain Testnet Explorer"`; `url`: `"https://explorer.testnet.chain.robinhood.com"`; \}; \}; `blockTime?`: `number`; `contracts?`: \{\[`key`: `string`\]: `ChainContract` \| \{\[`sourceId`: `number`\]: `ChainContract` \| `undefined`; \} \| `undefined`; `ensRegistry?`: `ChainContract`; `ensUniversalResolver?`: `ChainContract`; `erc6492Verifier?`: `ChainContract`; `multicall3?`: `ChainContract`; \}; `custom?`: `Record`\<`string`, `unknown`\>; `ensTlds?`: readonly `string`[]; `experimental_preconfirmationTime?`: `number`; `extendSchema?`: `Record`\<`string`, `unknown`\>; `fees?`: `ChainFees`\<`undefined`\>; `formatters?`: `undefined`; `id`: `46630`; `name`: `"Robinhood Chain Testnet"`; `nativeCurrency`: \{ `decimals`: `18`; `name`: `"Ether"`; `symbol`: `"ETH"`; \}; `prepareTransactionRequest?`: `PrepareTransactionRequestFn` \| \[`PrepareTransactionRequestFn`, `object`\]; `rpcUrls`: \{ `default`: \{ `http`: readonly \[`"https://rpc.testnet.chain.robinhood.com"`\]; \}; \}; `serializers?`: `ChainSerializers`\<`undefined`, `TransactionSerializable`\>; `sourceId?`: `number`; `supportsTransactionReplacementDetection?`: `boolean`; `testnet`: `true`; `verifyHash?`: `ChainVerifyHashFn`; \}

#### blockExplorers

> **blockExplorers**: `object`

Collection of block explorers

##### blockExplorers.default

> `readonly` **default**: `object`

##### blockExplorers.default.name

> `readonly` **name**: `"Robinhood Chain Testnet Explorer"` = `'Robinhood Chain Testnet Explorer'`

##### blockExplorers.default.url

> `readonly` **url**: `"https://explorer.testnet.chain.robinhood.com"` = `'https://explorer.testnet.chain.robinhood.com'`

#### blockTime?

> `optional` **blockTime?**: `number`

Block time in milliseconds.

#### contracts?

> `optional` **contracts?**: `object`

Collection of contracts

##### Index Signature

\[`key`: `string`\]: `ChainContract` \| \{\[`sourceId`: `number`\]: `ChainContract` \| `undefined`; \} \| `undefined`

##### contracts.ensRegistry?

> `optional` **ensRegistry?**: `ChainContract`

##### contracts.ensUniversalResolver?

> `optional` **ensUniversalResolver?**: `ChainContract`

##### contracts.erc6492Verifier?

> `optional` **erc6492Verifier?**: `ChainContract`

##### contracts.multicall3?

> `optional` **multicall3?**: `ChainContract`

#### ~~custom?~~

> `optional` **custom?**: `Record`\<`string`, `unknown`\>

Custom chain data.

##### Deprecated

use `.extend` instead.

#### ensTlds?

> `optional` **ensTlds?**: readonly `string`[]

Collection of ENS TLDs for the chain.

#### experimental\_preconfirmationTime?

> `optional` **experimental\_preconfirmationTime?**: `number`

Preconfirmation time in milliseconds.

#### extendSchema?

> `optional` **extendSchema?**: `Record`\<`string`, `unknown`\>

Extend schema.

#### fees?

> `optional` **fees?**: `ChainFees`\<`undefined`\>

Modifies how fees are derived.

#### formatters?

> `optional` **formatters?**: `undefined`

Modifies how data is formatted and typed (e.g. blocks and transactions)

#### id

> **id**: `46630`

ID in number form

#### name

> **name**: `"Robinhood Chain Testnet"`

Human-readable name

#### nativeCurrency

> **nativeCurrency**: `object`

Currency used by chain

##### nativeCurrency.decimals

> `readonly` **decimals**: `18` = `18`

##### nativeCurrency.name

> `readonly` **name**: `"Ether"` = `'Ether'`

##### nativeCurrency.symbol

> `readonly` **symbol**: `"ETH"` = `'ETH'`

#### prepareTransactionRequest?

> `optional` **prepareTransactionRequest?**: `PrepareTransactionRequestFn` \| \[`PrepareTransactionRequestFn`, `object`\]

Function to prepare a transaction request. Runs before the transaction is filled.

#### rpcUrls

> **rpcUrls**: `object`

Collection of RPC endpoints

##### rpcUrls.default

> `readonly` **default**: `object`

##### rpcUrls.default.http

> `readonly` **http**: readonly \[`"https://rpc.testnet.chain.robinhood.com"`\]

#### serializers?

> `optional` **serializers?**: `ChainSerializers`\<`undefined`, `TransactionSerializable`\>

Modifies how data is serialized (e.g. transactions).

#### sourceId?

> `optional` **sourceId?**: `number`

Source Chain ID (ie. the L1 chain)

#### supportsTransactionReplacementDetection?

> `optional` **supportsTransactionReplacementDetection?**: `boolean`

Whether transaction replacement detection is supported.

##### Default

```ts
true
```

#### testnet

> **testnet**: `true`

Flag for test networks

#### verifyHash?

> `optional` **verifyHash?**: `ChainVerifyHashFn`

Chain-specific signature verification.
