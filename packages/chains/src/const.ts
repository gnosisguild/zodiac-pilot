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
  UNICHAIN = 130,
  WORLDCHAIN = 480,
  BOB = 60808,
}

const airlock = 'https://airlock.gnosisguild.org/api/v1/'

export const RPC: Record<ChainId, URL> = {
  [Chain.ETH]: new URL(`${Chain.ETH}/rpc`, airlock),
  [Chain.OETH]: new URL(`${Chain.OETH}/rpc`, airlock),
  [Chain.GNO]: new URL(`${Chain.GNO}/rpc`, airlock),
  [Chain.MATIC]: new URL(`${Chain.MATIC}/rpc`, airlock),
  [Chain.BASE]: new URL(`${Chain.BASE}/rpc`, airlock),
  [Chain.ARB1]: new URL(`${Chain.ARB1}/rpc`, airlock),
  [Chain.AVAX]: new URL(`${Chain.AVAX}/rpc`, airlock),
  [Chain.SEP]: new URL(`${Chain.SEP}/rpc`, airlock),
  [Chain.CELO]: new URL('https://forno.celo.org'),
  [Chain.SONIC]: new URL('https://rpc.soniclabs.com'),
  [Chain.BERACHAIN]: new URL('https://rpc.berachain.com'),
  [Chain.UNICHAIN]: new URL('https://mainnet.unichain.org'),
  [Chain.WORLDCHAIN]: new URL(
    'https://worldchain-mainnet.g.alchemy.com/public',
  ),
  [Chain.BOB]: new URL('https://rpc.gobob.xyz'),
}

export const EXPLORER_URL: Record<ChainId, URL> = {
  [Chain.ETH]: new URL('https://etherscan.io'),
  [Chain.OETH]: new URL('https://optimistic.etherscan.io'),
  [Chain.GNO]: new URL('https://gnosisscan.io'),
  [Chain.MATIC]: new URL('https://polygonscan.com'),
  [Chain.BASE]: new URL('https://basescan.org'),
  [Chain.ARB1]: new URL('https://arbiscan.io'),
  [Chain.AVAX]: new URL('https://snowtrace.io'),
  [Chain.SEP]: new URL('https://sepolia.etherscan.io'),
  [Chain.CELO]: new URL('https://celoscan.io'),
  [Chain.SONIC]: new URL('https://sonicscan.org'),
  [Chain.BERACHAIN]: new URL('https://berascan.com'),
  [Chain.UNICHAIN]: new URL('https://uniscan.xyz'),
  [Chain.WORLDCHAIN]: new URL('https://worldscan.org'),
  [Chain.BOB]: new URL('https://explorer.gobob.xyz'),
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
  [Chain.UNICHAIN]: 'ETH',
  [Chain.WORLDCHAIN]: 'ETH',
  [Chain.BOB]: 'ETH',
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
  [Chain.UNICHAIN]: 'Unichain',
  [Chain.WORLDCHAIN]: 'World Chain',
  [Chain.BOB]: 'BOB',
}
