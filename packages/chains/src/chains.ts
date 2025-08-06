import { defineChain } from 'viem'
import {
  arbitrum,
  avalanche,
  base,
  baseSepolia,
  berachain,
  bob,
  celo,
  gnosis,
  hemi,
  ink,
  linea,
  mainnet,
  mantle,
  optimism,
  polygon,
  polygonZkEvm,
  sepolia,
  sonic,
  unichain,
  worldchain,
  type Chain as ViemChain,
} from 'viem/chains'
import { rpc } from './rpc'

// Custom chains for missing viem chains
const katana = defineChain({
  id: 747474,
  name: 'Katana',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [rpc(747474).toString()] } },
  blockExplorers: {
    default: { name: 'Katana Explorer', url: 'https://explorer.katana.xyz' },
  },
})

export const chains: Record<Chain, ViemChain> = {
  [mainnet.id]: mainnet,
  [optimism.id]: optimism,
  [gnosis.id]: gnosis,
  [polygon.id]: polygon,
  [sepolia.id]: sepolia,
  [base.id]: base,
  [arbitrum.id]: arbitrum,
  [avalanche.id]: avalanche,
  [celo.id]: celo,
  [sonic.id]: sonic,
  [berachain.id]: berachain,
  [unichain.id]: unichain,
  [worldchain.id]: worldchain,
  [bob.id]: bob,
  [mantle.id]: mantle,
  [polygonZkEvm.id]: polygonZkEvm,
  [baseSepolia.id]: baseSepolia,
  [hemi.id]: hemi,
  [katana.id]: katana,
  [linea.id]: linea,
  [ink.id]: ink,
}

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

/**
 * As long as ser does not support querying routes for a chain, we hide it from the chain select field.
 * That way we can support chains as long as users manually import their route using https://github.com/gnosisguild/build-pilot-route, for example.
 **/
export const HIDDEN_CHAINS = [
  Chain.WORLDCHAIN,
  Chain.ZKEVM,
  Chain.HEMI,
  Chain.KATANA,
  Chain.LINEA,
]

export const isEnabledChain = (chain: number) => {
  if (!Object.values(Chain).includes(chain)) {
    return false
  }

  if (HIDDEN_CHAINS.includes(chain)) {
    return false
  }

  return true
}

export const getEnabledChains = () =>
  Object.values(Chain).reduce<Chain[]>((result, value) => {
    if (typeof value === 'string') {
      return result
    }

    if (isEnabledChain(value)) {
      return [...result, value]
    }

    return result
  }, [])
