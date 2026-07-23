[**@nakama-health/protocol-sdk**](../README.md)

***

[@nakama-health/protocol-sdk](../README.md) / DecodedRobinhoodFactoryConfigurationError

# Type Alias: DecodedRobinhoodFactoryConfigurationError

> **DecodedRobinhoodFactoryConfigurationError** = \{ `address`: `Address`; `data`: `Hex`; `errorName`: `"InvalidRole"`; `factoryRole`: [`RobinhoodFactoryRole`](RobinhoodFactoryRole.md); `role`: `"factory"`; `roleIndex`: `number`; \} \| \{ `address`: `Address`; `data`: `Hex`; `errorName`: `"DuplicateRole"`; `firstRole`: [`RobinhoodFactoryRole`](RobinhoodFactoryRole.md); `firstRoleIndex`: `number`; `role`: `"factory"`; `secondRole`: [`RobinhoodFactoryRole`](RobinhoodFactoryRole.md); `secondRoleIndex`: `number`; \} \| \{ `actualMajor`: `number`; `data`: `Hex`; `errorName`: `"IncompatibleSuiteVersion"`; `expectedMajor`: `number`; `role`: `"factory"`; \}

Defined in: [src/robinhood/protocol.ts:545](https://github.com/OmegaX-Health/nakama-sdk/blob/main/src/robinhood/protocol.ts#L545)
