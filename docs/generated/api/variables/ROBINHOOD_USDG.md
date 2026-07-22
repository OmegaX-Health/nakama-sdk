[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / ROBINHOOD\_USDG

# Variable: ROBINHOOD\_USDG

> `const` **ROBINHOOD\_USDG**: `Readonly`\<\{ `mainnet`: `Readonly`\<\{ `address`: `` `0x${string}` ``; `caip2`: `"eip155:4663"`; `chainId`: `4663`; `decimals`: `6`; `name`: `"Global Dollar"`; `network`: `"mainnet"`; `status`: `"verified"`; `symbol`: `"USDG"`; \}\>; `testnet`: `Readonly`\<\{ `address`: `null`; `caip2`: `"eip155:46630"`; `chainId`: `46630`; `decimals`: `6`; `name`: `"Global Dollar"`; `network`: `"testnet"`; `status`: `"unconfigured"`; `symbol`: `"USDG"`; \}\>; \}\>

Defined in: src/robinhood/assets.ts:47

Canonical settlement-asset metadata. Mainnet is verified; testnet remains
deliberately unconfigured until a release manifest provides an address.
