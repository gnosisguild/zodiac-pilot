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
  ZKEVM = 1101,
  ARB1 = 42161,
  AVAX = 43114,
  BASE = 8453,
  BASESEP = 84532,
  CELO = 42220,
  SONIC = 146,
  BERACHAIN = 80094,
  UNICHAIN = 130,
  WORLDCHAIN = 480,
  BOB = 60808,
  MANTLE = 5000,
  HEMI = 43111,
  KATANA = 747474,
  LINEA = 59144,
  INK = 57073,
}

export const rpc = (chain: Chain) => new URL(`https://rpc.zodiacos.io/${chain}`)

export const EXPLORER_URL: Record<ChainId, URL> = {
  [Chain.ETH]: new URL('https://etherscan.io'),
  [Chain.OETH]: new URL('https://optimistic.etherscan.io'),
  [Chain.GNO]: new URL('https://gnosisscan.io'),
  [Chain.MATIC]: new URL('https://polygonscan.com'),
  [Chain.ZKEVM]: new URL('https://zkevm.polygonscan.com'),
  [Chain.BASE]: new URL('https://basescan.org'),
  [Chain.BASESEP]: new URL('https://sepolia.basescan.org'),
  [Chain.ARB1]: new URL('https://arbiscan.io'),
  [Chain.AVAX]: new URL('https://snowtrace.io'),
  [Chain.SEP]: new URL('https://sepolia.etherscan.io'),
  [Chain.CELO]: new URL('https://celoscan.io'),
  [Chain.SONIC]: new URL('https://sonicscan.org'),
  [Chain.BERACHAIN]: new URL('https://berascan.com'),
  [Chain.UNICHAIN]: new URL('https://uniscan.xyz'),
  [Chain.WORLDCHAIN]: new URL('https://worldscan.org'),
  [Chain.BOB]: new URL('https://explorer.gobob.xyz'),
  [Chain.MANTLE]: new URL('https://mantlescan.xyz'),
  [Chain.HEMI]: new URL('https://explorer.hemi.xyz'),
  [Chain.KATANA]: new URL('https://explorer.katanarpc.com'),
  [Chain.LINEA]: new URL('https://lineascan.build'),
  [Chain.INK]: new URL('https://explorer.inkonchain.com'),
}

export const CHAIN_CURRENCY: Record<ChainId, string> = {
  [Chain.ETH]: 'ETH',
  [Chain.OETH]: 'ETH',
  [Chain.GNO]: 'xDAI',
  [Chain.MATIC]: 'MATIC',
  [Chain.ZKEVM]: 'ETH',
  [Chain.BASE]: 'ETH',
  [Chain.BASESEP]: 'ETH',
  [Chain.ARB1]: 'ETH',
  [Chain.AVAX]: 'AVAX',
  [Chain.SEP]: 'ETH',
  [Chain.CELO]: 'CELO',
  [Chain.SONIC]: 'S',
  [Chain.BERACHAIN]: 'BERA',
  [Chain.UNICHAIN]: 'ETH',
  [Chain.WORLDCHAIN]: 'ETH',
  [Chain.BOB]: 'ETH',
  [Chain.MANTLE]: 'MNT',
  [Chain.HEMI]: 'ETH',
  [Chain.KATANA]: 'ETH',
  [Chain.LINEA]: 'ETH',
  [Chain.INK]: 'ETH',
}

export const CHAIN_NAME: Record<ChainId, string> = {
  [Chain.ETH]: 'Ethereum',
  [Chain.OETH]: 'Optimism',
  [Chain.GNO]: 'Gnosis',
  [Chain.MATIC]: 'Polygon',
  [Chain.ZKEVM]: 'Polygon zkEVM',
  [Chain.BASE]: 'Base',
  [Chain.BASESEP]: 'Base Sepolia',
  [Chain.ARB1]: 'Arbitrum One',
  [Chain.AVAX]: 'Avalanche C-Chain',
  [Chain.SEP]: 'Sepolia',
  [Chain.CELO]: 'Celo',
  [Chain.SONIC]: 'Sonic',
  [Chain.BERACHAIN]: 'Berachain',
  [Chain.UNICHAIN]: 'Unichain',
  [Chain.WORLDCHAIN]: 'World Chain',
  [Chain.BOB]: 'BOB',
  [Chain.MANTLE]: 'Mantle',
  [Chain.HEMI]: 'Hemi',
  [Chain.KATANA]: 'Katana',
  [Chain.LINEA]: 'Linea',
  [Chain.INK]: 'Ink',
}

/**
 * As long as ser does not support querying routes for a chain, we hide it from the chain select field.
 * That way we can support chains as long as users manually import their route using https://github.com/gnosisguild/build-pilot-route, for example.
 **/
export const HIDDEN_CHAINS = [
  Chain.WORLDCHAIN,
  Chain.ZKEVM,
  Chain.BASESEP,
  Chain.HEMI,
  Chain.KATANA,
  Chain.LINEA,
  Chain.INK,
]
