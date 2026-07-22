import {
  formatUnits,
  keccak256,
  parseAbi,
  parseUnits,
  type Address,
  type Hex,
} from 'viem';

import {
  ROBINHOOD_MAINNET_CAIP2,
  ROBINHOOD_MAINNET_CHAIN_ID,
  ROBINHOOD_TESTNET_CAIP2,
  ROBINHOOD_TESTNET_CHAIN_ID,
  normalizeRobinhoodAddress,
  type RobinhoodCaip2,
  type RobinhoodChainId,
  type RobinhoodNetwork,
  type RobinhoodPublicClient,
} from './chains.js';
import {
  NakamaRobinhoodAssetError,
  NakamaRobinhoodWrongChainError,
} from './errors.js';

export const ROBINHOOD_USDG_MAINNET_ADDRESS =
  '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168' as Address;
export const ROBINHOOD_USDG_DECIMALS = 6 as const;
export const ROBINHOOD_USDG_SYMBOL = 'USDG' as const;
export const ROBINHOOD_USDG_NAME = 'Global Dollar' as const;

export interface RobinhoodSettlementAsset {
  network: RobinhoodNetwork;
  chainId: RobinhoodChainId;
  caip2: RobinhoodCaip2;
  address: Address | null;
  name: typeof ROBINHOOD_USDG_NAME;
  symbol: typeof ROBINHOOD_USDG_SYMBOL;
  decimals: typeof ROBINHOOD_USDG_DECIMALS;
  status: 'verified' | 'unconfigured';
}

/**
 * Canonical settlement-asset metadata. Mainnet is verified; testnet remains
 * deliberately unconfigured until a release manifest provides an address.
 */
export const ROBINHOOD_USDG = Object.freeze({
  mainnet: Object.freeze({
    network: 'mainnet',
    chainId: ROBINHOOD_MAINNET_CHAIN_ID,
    caip2: ROBINHOOD_MAINNET_CAIP2,
    address: ROBINHOOD_USDG_MAINNET_ADDRESS,
    name: ROBINHOOD_USDG_NAME,
    symbol: ROBINHOOD_USDG_SYMBOL,
    decimals: ROBINHOOD_USDG_DECIMALS,
    status: 'verified',
  }),
  testnet: Object.freeze({
    network: 'testnet',
    chainId: ROBINHOOD_TESTNET_CHAIN_ID,
    caip2: ROBINHOOD_TESTNET_CAIP2,
    address: null,
    name: ROBINHOOD_USDG_NAME,
    symbol: ROBINHOOD_USDG_SYMBOL,
    decimals: ROBINHOOD_USDG_DECIMALS,
    status: 'unconfigured',
  }),
} as const satisfies Record<RobinhoodNetwork, RobinhoodSettlementAsset>);

export interface RobinhoodAssetAmount {
  units: bigint;
  asset: {
    chainId: RobinhoodChainId;
    caip2: RobinhoodCaip2;
    address: Address;
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface VerifiedRobinhoodUsdg extends RobinhoodSettlementAsset {
  address: Address;
  status: 'verified';
  runtimeBytecodeHash: Hex;
  verifiedAtBlock: bigint;
}

const USDG_METADATA_ABI = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
]);

export function requireRobinhoodUsdg(
  network: RobinhoodNetwork,
  override?: RobinhoodSettlementAsset,
): RobinhoodSettlementAsset & { address: Address; status: 'verified' } {
  const asset = override ?? ROBINHOOD_USDG[network];
  if (
    asset.network !== network ||
    asset.chainId !==
      (network === 'mainnet'
        ? ROBINHOOD_MAINNET_CHAIN_ID
        : ROBINHOOD_TESTNET_CHAIN_ID) ||
    asset.caip2 !==
      (network === 'mainnet'
        ? ROBINHOOD_MAINNET_CAIP2
        : ROBINHOOD_TESTNET_CAIP2) ||
    asset.address == null ||
    asset.status !== 'verified'
  ) {
    throw new NakamaRobinhoodAssetError(
      `USDG is not configured and verified for Robinhood ${network}.`,
      { details: { network, status: asset.status } },
    );
  }
  const address = normalizeRobinhoodAddress(asset.address);
  if (
    network === 'mainnet' &&
    address.toLowerCase() !== ROBINHOOD_USDG_MAINNET_ADDRESS.toLowerCase()
  ) {
    throw new NakamaRobinhoodAssetError(
      'Robinhood mainnet settlement must use the canonical USDG contract address.',
      {
        details: {
          actualAddress: address,
          expectedAddress: ROBINHOOD_USDG_MAINNET_ADDRESS,
        },
      },
    );
  }
  if (
    asset.name !== ROBINHOOD_USDG_NAME ||
    asset.symbol !== ROBINHOOD_USDG_SYMBOL ||
    asset.decimals !== ROBINHOOD_USDG_DECIMALS
  ) {
    throw new NakamaRobinhoodAssetError(
      'Settlement asset metadata must identify Global Dollar (USDG) with six decimals.',
      {
        details: {
          network,
          name: asset.name,
          symbol: asset.symbol,
          decimals: asset.decimals,
        },
      },
    );
  }

  return Object.freeze({
    ...asset,
    address,
    status: 'verified',
  });
}

export function createRobinhoodAssetAmount(params: {
  units: bigint;
  asset: RobinhoodSettlementAsset & { address: Address };
}): RobinhoodAssetAmount {
  if (params.units < 0n) {
    throw new NakamaRobinhoodAssetError('Asset units cannot be negative.', {
      details: { units: params.units.toString(10) },
    });
  }
  return {
    units: params.units,
    asset: {
      chainId: params.asset.chainId,
      caip2: params.asset.caip2,
      address: normalizeRobinhoodAddress(params.asset.address),
      name: params.asset.name,
      symbol: params.asset.symbol,
      decimals: params.asset.decimals,
    },
  };
}

export function parseRobinhoodUsdg(
  value: string,
  network: RobinhoodNetwork,
  override?: RobinhoodSettlementAsset,
): RobinhoodAssetAmount {
  const asset = requireRobinhoodUsdg(network, override);
  const decimalPattern = new RegExp(
    `^(?:0|[1-9]\\d*)(?:\\.\\d{1,${asset.decimals}})?$`,
  );
  if (!decimalPattern.test(value)) {
    throw new NakamaRobinhoodAssetError(
      `Invalid ${ROBINHOOD_USDG_SYMBOL} decimal amount.`,
      { details: { value, decimals: asset.decimals } },
    );
  }
  try {
    return createRobinhoodAssetAmount({
      units: parseUnits(value, asset.decimals),
      asset,
    });
  } catch (error) {
    if (error instanceof NakamaRobinhoodAssetError) throw error;
    throw new NakamaRobinhoodAssetError(
      `Invalid ${ROBINHOOD_USDG_SYMBOL} decimal amount.`,
      { cause: error, details: { value, decimals: asset.decimals } },
    );
  }
}

export function formatRobinhoodAssetAmount(
  amount: RobinhoodAssetAmount,
): string {
  return formatUnits(amount.units, amount.asset.decimals);
}

export function assertSameRobinhoodAsset(
  left: RobinhoodAssetAmount,
  right: RobinhoodAssetAmount,
): void {
  if (
    left.asset.chainId !== right.asset.chainId ||
    left.asset.address.toLowerCase() !== right.asset.address.toLowerCase() ||
    left.asset.decimals !== right.asset.decimals ||
    left.asset.symbol !== right.asset.symbol
  ) {
    throw new NakamaRobinhoodAssetError(
      'Asset amounts refer to different chain-bound assets.',
      {
        details: {
          left: left.asset,
          right: right.asset,
        },
      },
    );
  }
}

export async function verifyRobinhoodUsdg(params: {
  client: RobinhoodPublicClient;
  network: RobinhoodNetwork;
  configuredAsset?: RobinhoodSettlementAsset;
  blockNumber?: bigint;
}): Promise<VerifiedRobinhoodUsdg> {
  const asset = requireRobinhoodUsdg(params.network, params.configuredAsset);
  const chainId = await params.client.getChainId();
  if (chainId !== asset.chainId) {
    throw new NakamaRobinhoodWrongChainError(
      'USDG verification RPC is connected to the wrong chain.',
      { details: { actualChainId: chainId, expectedChainId: asset.chainId } },
    );
  }
  const verifiedAtBlock =
    params.blockNumber ?? (await params.client.getBlockNumber());
  if (verifiedAtBlock <= 0n) {
    throw new NakamaRobinhoodAssetError(
      'USDG verification block must be positive.',
    );
  }
  const bytecode = await params.client.getBytecode({
    address: asset.address,
    blockNumber: verifiedAtBlock,
  });
  if (bytecode == null || bytecode === '0x') {
    throw new NakamaRobinhoodAssetError(
      'No runtime bytecode exists at the configured USDG address.',
      { details: { address: asset.address } },
    );
  }
  const [name, symbol, decimals] = await Promise.all([
    params.client.readContract({
      address: asset.address,
      abi: USDG_METADATA_ABI,
      functionName: 'name',
      blockNumber: verifiedAtBlock,
    }),
    params.client.readContract({
      address: asset.address,
      abi: USDG_METADATA_ABI,
      functionName: 'symbol',
      blockNumber: verifiedAtBlock,
    }),
    params.client.readContract({
      address: asset.address,
      abi: USDG_METADATA_ABI,
      functionName: 'decimals',
      blockNumber: verifiedAtBlock,
    }),
  ]);
  if (
    name !== ROBINHOOD_USDG_NAME ||
    symbol !== ROBINHOOD_USDG_SYMBOL ||
    decimals !== ROBINHOOD_USDG_DECIMALS
  ) {
    throw new NakamaRobinhoodAssetError(
      'Onchain settlement asset metadata does not identify six-decimal USDG.',
      { details: { address: asset.address, name, symbol, decimals } },
    );
  }
  return {
    ...asset,
    runtimeBytecodeHash: keccak256(bytecode),
    verifiedAtBlock,
  };
}
