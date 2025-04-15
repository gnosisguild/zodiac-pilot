/* spell-checker: disable */
import type { HexAddress } from '@zodiac/schema'
import type { ChainId, PrefixedAddress } from 'ser-kit'

export type { ChainId } from 'ser-kit'

export const ZERO_ADDRESS: HexAddress =
  '0x0000000000000000000000000000000000000000'
export const ETH_ZERO_ADDRESS: PrefixedAddress =
  'eth:0x0000000000000000000000000000000000000000'
export const EOA_ZERO_ADDRESS: PrefixedAddress =
  'eoa:0x0000000000000000000000000000000000000000'

export enum Chain {
  ETH = 1,
  OETH = 10,
  GNO = 100,
  SEP = 11155111,
  MATIC = 137,
  ARB1 = 42161,
  AVAX = 43114,
  BASE = 8453,
  CELO = 42220,
  SONIC = 146,
  BERACHAIN = 80094,
}

export const RPC: Record<ChainId, string> = {
  [Chain.ETH]: 'https://airlock.gnosisguild.org/api/v1/1/rpc',
  [Chain.OETH]: 'https://airlock.gnosisguild.org/api/v1/10/rpc',
  [Chain.GNO]: 'https://airlock.gnosisguild.org/api/v1/100/rpc',
  [Chain.MATIC]: 'https://airlock.gnosisguild.org/api/v1/137/rpc',
  [Chain.BASE]: 'https://airlock.gnosisguild.org/api/v1/8453/rpc',
  [Chain.ARB1]: 'https://airlock.gnosisguild.org/api/v1/42161/rpc',
  [Chain.AVAX]: 'https://airlock.gnosisguild.org/api/v1/43114/rpc',
  [Chain.SEP]: 'https://airlock.gnosisguild.org/api/v1/11155111/rpc',
  [Chain.CELO]: 'https://forno.celo.org',
  [Chain.SONIC]: 'https://rpc.soniclabs.com',
  [Chain.BERACHAIN]: 'https://rpc.berachain.com',
}

export const EXPLORER_URL: Record<ChainId, string> = {
  [Chain.ETH]: 'https://etherscan.io',
  [Chain.OETH]: 'https://optimistic.etherscan.io',
  [Chain.GNO]: 'https://gnosisscan.io',
  [Chain.MATIC]: 'https://polygonscan.com',
  [Chain.BASE]: 'https://basescan.org',
  [Chain.ARB1]: 'https://arbiscan.io',
  [Chain.AVAX]: 'https://snowtrace.io',
  [Chain.SEP]: 'https://sepolia.etherscan.io',
  [Chain.CELO]: 'https://celoscan.io',
  [Chain.SONIC]: 'https://sonicscan.org',
  [Chain.BERACHAIN]: 'https://berascan.com',
}

export const CHAIN_PREFIX: Record<ChainId, string> = {
  [Chain.ETH]: 'eth',
  [Chain.OETH]: 'oeth',
  [Chain.GNO]: 'gno',
  [Chain.MATIC]: 'matic',
  [Chain.BASE]: 'base',
  [Chain.ARB1]: 'arb1',
  [Chain.AVAX]: 'avax',
  [Chain.SEP]: 'sep',
  [Chain.CELO]: 'celo',
  [Chain.SONIC]: 'sonic',
  [Chain.BERACHAIN]: 'berachain',
}

export const CHAIN_CURRENCY: Record<ChainId, string> = {
  [Chain.ETH]: 'ETH',
  [Chain.OETH]: 'ETH',
  [Chain.GNO]: 'xDAI',
  [Chain.MATIC]: 'MATIC',
  [Chain.BASE]: 'ETH',
  [Chain.ARB1]: 'ETH',
  [Chain.AVAX]: 'AVAX',
  [Chain.SEP]: 'ETH',
  [Chain.CELO]: 'CELO',
  [Chain.SONIC]: 'S',
  [Chain.BERACHAIN]: 'BERA',
}

export const CHAIN_NAME: Record<ChainId, string> = {
  [Chain.ETH]: 'Ethereum',
  [Chain.OETH]: 'Optimism',
  [Chain.GNO]: 'Gnosis',
  [Chain.MATIC]: 'Polygon',
  [Chain.BASE]: 'Base',
  [Chain.ARB1]: 'Arbitrum One',
  [Chain.AVAX]: 'Avalanche C-Chain',
  [Chain.SEP]: 'Sepolia',
  [Chain.CELO]: 'Celo',
  [Chain.SONIC]: 'Sonic',
  [Chain.BERACHAIN]: 'Berachain',
}
