import {
  createPublicClient,
  custom,
  defineChain,
  getAddress,
  http,
  isAddress,
  isHex,
  type Address,
  type PublicClient,
} from 'viem';

import {
  NakamaRobinhoodAddressError,
  NakamaRobinhoodConfigError,
  NakamaRobinhoodWrongChainError,
} from './errors.js';

export const ROBINHOOD_MAINNET_CHAIN_ID = 4663 as const;
export const ROBINHOOD_TESTNET_CHAIN_ID = 46630 as const;
export const ROBINHOOD_MAINNET_CHAIN_ID_HEX = '0x1237' as const;
export const ROBINHOOD_TESTNET_CHAIN_ID_HEX = '0xb626' as const;
export const ROBINHOOD_MAINNET_CAIP2 = 'eip155:4663' as const;
export const ROBINHOOD_TESTNET_CAIP2 = 'eip155:46630' as const;

/** Public endpoints are rate-limited and should not be used in production. */
export const ROBINHOOD_PUBLIC_RPC_URLS = Object.freeze({
  mainnet: 'https://rpc.mainnet.chain.robinhood.com',
  testnet: 'https://rpc.testnet.chain.robinhood.com',
} as const);

export const ROBINHOOD_MAINNET = deepFreeze(
  defineChain({
    id: ROBINHOOD_MAINNET_CHAIN_ID,
    name: 'Robinhood Chain',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: [ROBINHOOD_PUBLIC_RPC_URLS.mainnet] },
    },
    blockExplorers: {
      default: {
        name: 'Robinhood Chain Blockscout',
        url: 'https://robinhoodchain.blockscout.com',
      },
    },
  }),
);

export const ROBINHOOD_TESTNET = deepFreeze(
  defineChain({
    id: ROBINHOOD_TESTNET_CHAIN_ID,
    name: 'Robinhood Chain Testnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: [ROBINHOOD_PUBLIC_RPC_URLS.testnet] },
    },
    blockExplorers: {
      default: {
        name: 'Robinhood Chain Testnet Explorer',
        url: 'https://explorer.testnet.chain.robinhood.com',
      },
    },
    testnet: true,
  }),
);

export type RobinhoodNetwork = 'mainnet' | 'testnet';
export type RobinhoodChainId =
  | typeof ROBINHOOD_MAINNET_CHAIN_ID
  | typeof ROBINHOOD_TESTNET_CHAIN_ID;
export type RobinhoodCaip2 =
  | typeof ROBINHOOD_MAINNET_CAIP2
  | typeof ROBINHOOD_TESTNET_CAIP2;
export type RobinhoodCaip10 = `${RobinhoodCaip2}:${Address}`;

export interface RobinhoodEip1193Provider {
  request(args: {
    method: string;
    params?: readonly unknown[] | Record<string, unknown>;
  }): Promise<unknown>;
}

export type RobinhoodPublicClient = PublicClient;

export type RobinhoodPublicClientOptions = {
  /** Network selection is mandatory; the SDK never falls back to chain 1. */
  network: RobinhoodNetwork;
} & (
  | { rpcUrl: string; provider?: never }
  | { provider: RobinhoodEip1193Provider; rpcUrl?: never }
);

export function getRobinhoodChain(network: RobinhoodNetwork) {
  return network === 'mainnet' ? ROBINHOOD_MAINNET : ROBINHOOD_TESTNET;
}

export function getRobinhoodChainId(
  network: RobinhoodNetwork,
): RobinhoodChainId {
  return network === 'mainnet'
    ? ROBINHOOD_MAINNET_CHAIN_ID
    : ROBINHOOD_TESTNET_CHAIN_ID;
}

export function getRobinhoodChainIdHex(
  network: RobinhoodNetwork,
):
  | typeof ROBINHOOD_MAINNET_CHAIN_ID_HEX
  | typeof ROBINHOOD_TESTNET_CHAIN_ID_HEX {
  return network === 'mainnet'
    ? ROBINHOOD_MAINNET_CHAIN_ID_HEX
    : ROBINHOOD_TESTNET_CHAIN_ID_HEX;
}

export function getRobinhoodCaip2(network: RobinhoodNetwork): RobinhoodCaip2 {
  return network === 'mainnet'
    ? ROBINHOOD_MAINNET_CAIP2
    : ROBINHOOD_TESTNET_CAIP2;
}

export function robinhoodNetworkFromChainId(chainId: number): RobinhoodNetwork {
  if (chainId === ROBINHOOD_MAINNET_CHAIN_ID) return 'mainnet';
  if (chainId === ROBINHOOD_TESTNET_CHAIN_ID) return 'testnet';
  throw new NakamaRobinhoodWrongChainError(
    `Unsupported Robinhood Chain chainId ${chainId}.`,
    {
      details: {
        actualChainId: chainId,
        expectedChainIds: [
          ROBINHOOD_MAINNET_CHAIN_ID,
          ROBINHOOD_TESTNET_CHAIN_ID,
        ],
      },
    },
  );
}

export function normalizeRobinhoodAddress(value: string): Address {
  if (!isAddress(value, { strict: false })) {
    throw new NakamaRobinhoodAddressError(`Invalid EVM address "${value}".`, {
      details: { value },
    });
  }
  return getAddress(value);
}

export function toRobinhoodCaip10(
  network: RobinhoodNetwork,
  address: string,
): RobinhoodCaip10 {
  return `${getRobinhoodCaip2(network)}:${normalizeRobinhoodAddress(address)}`;
}

export function parseRobinhoodCaip10(params: {
  network: RobinhoodNetwork;
  accountId: string;
}): Address {
  const prefix = `${getRobinhoodCaip2(params.network)}:`;
  if (!params.accountId.startsWith(prefix)) {
    throw new NakamaRobinhoodWrongChainError(
      `Expected a Robinhood ${params.network} CAIP-10 account beginning with "${prefix}".`,
      {
        details: {
          accountId: params.accountId,
          expectedCaip2: getRobinhoodCaip2(params.network),
        },
      },
    );
  }
  return normalizeRobinhoodAddress(params.accountId.slice(prefix.length));
}

/** Creates a client only from an explicit network and explicit transport. */
export function createRobinhoodPublicClient(
  options: RobinhoodPublicClientOptions,
): RobinhoodPublicClient {
  const chain = getRobinhoodChain(options.network);
  const transport =
    options.rpcUrl != null
      ? http(assertSecureRobinhoodRpcUrl(options.rpcUrl))
      : custom(options.provider as never);

  return createPublicClient({ chain, transport }) as RobinhoodPublicClient;
}

export async function assertRobinhoodProviderChain(params: {
  provider: RobinhoodEip1193Provider;
  network: RobinhoodNetwork;
}): Promise<void> {
  const actual = await params.provider.request({ method: 'eth_chainId' });
  const expected = getRobinhoodChainId(params.network);
  if (
    typeof actual !== 'string' ||
    !isHex(actual) ||
    Number.parseInt(actual, 16) !== expected
  ) {
    throw new NakamaRobinhoodWrongChainError(
      `The connected provider must already be on Robinhood ${params.network}.`,
      {
        details: {
          actualChainId: actual,
          expectedChainId: getRobinhoodChainIdHex(params.network),
        },
      },
    );
  }
}

function deepFreeze<T>(value: T): T {
  if (value != null && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const nested of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nested);
    }
    Object.freeze(value);
  }
  return value;
}

function assertSecureRobinhoodRpcUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch (error) {
    throw new NakamaRobinhoodConfigError('RPC URL is not a valid URL.', {
      cause: error,
      details: { rpcUrl: value },
    });
  }

  const loopback =
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    url.hostname === '::1' ||
    url.hostname === '[::1]';
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback)) {
    throw new NakamaRobinhoodConfigError(
      'RPC URL must use HTTPS, except loopback development endpoints may use HTTP.',
      { details: { rpcUrl: value } },
    );
  }
  if (url.username || url.password) {
    throw new NakamaRobinhoodConfigError(
      'RPC credentials must not be embedded in the URL.',
      { details: { rpcUrl: redactUrl(value) } },
    );
  }
  return value;
}

function redactUrl(value: string): string {
  try {
    const url = new URL(value);
    url.username = '';
    url.password = '';
    return url.toString();
  } catch {
    return '[invalid URL]';
  }
}
