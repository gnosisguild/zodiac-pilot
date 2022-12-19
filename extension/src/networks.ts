/* spell-checker: disable */

export const RPC = {
  1: 'https://mainnet.infura.io/v3/b81b456501e34bed8a85a3c2ff8f4577',
  4: 'https://rinkeby.infura.io/v3/b81b456501e34bed8a85a3c2ff8f4577',
  5: 'https://goerli.infura.io/v3/b81b456501e34bed8a85a3c2ff8f4577',
  10: 'https://mainnet.optimism.io',
  56: 'https://bsc-dataseed.binance.org',
  100: 'https://rpc.gnosischain.com',
  137: 'https://polygon-rpc.com',
  246: 'https://rpc.energyweb.org',
  42161: 'https://arb1.arbitrum.io/rpc',
  42220: 'https://forno.celo.org',
  73799: 'https://volta-rpc.energyweb.org',
  80001: 'https://rpc-mumbai.maticvigil.com',
}

export type ChainId = keyof typeof RPC

export const EXPLORER_URL: Record<ChainId, string> = {
  1: 'https://etherscan.io',
  4: 'https://rinkeby.etherscan.io',
  5: 'https://goerli.etherscan.io',
  10: 'https://optimistic.etherscan.io',
  56: 'https://bscscan.com',
  100: 'https://gnosisscan.io',
  137: 'https://polygonscan.com',
  246: 'https://explorer.energyweb.org',
  42161: 'https://arbiscan.io',
  42220: 'https://explorer.celo.org',
  73799: 'https://volta-explorer.energyweb.org',
  80001: 'https:/testnet.polygonscan.com',
}

export const EXPLORER_API_URL: Record<ChainId, string> = {
  1: 'https://api.etherscan.io/api',
  4: 'https://api-rinkeby.etherscan.io/api',
  5: 'https://api-goerli.etherscan.io/api',
  10: 'https://api-optimistic.etherscan.io/api',
  56: 'https://api.bscscan.com/api',
  100: 'https://blockscout.com/xdai/mainnet/api',
  137: 'https://api.polygonscan.com/api',
  246: 'https://explorer.energyweb.org/api',
  42161: 'https://api.arbiscan.io/api',
  42220: 'https://explorer.celo.org/api',
  73799: 'https://volta-explorer.energyweb.org/api',
  80001: 'https://api-testnet.polygonscan.com/api',
}

// attention: this relies on esbuild define, so destructing won't work here
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ''

export const EXPLORER_API_KEY: Record<ChainId, string> = {
  1: ETHERSCAN_API_KEY,
  4: ETHERSCAN_API_KEY,
  5: ETHERSCAN_API_KEY,
  10: '',
  56: '',
  100: '',
  137: '',
  246: '',
  42161: '',
  42220: '',
  73799: '',
  80001: '',
}

export const NETWORK_PREFIX: Record<ChainId, string> = {
  1: 'eth',
  4: 'rin',
  5: 'gor',
  10: 'oeth',
  56: 'bsc',
  100: 'gno',
  137: 'matic',
  246: 'ewt',
  42161: 'arb1',
  42220: 'celo',
  73799: 'vt',
  80001: 'maticmum',
}

export const NETWORK_CURRENCY: Record<ChainId, string> = {
  1: 'ETH',
  4: 'ETH',
  5: 'ETH',
  56: 'BNB',
  10: 'ETH',
  100: 'xDAI',
  137: 'MATIC',
  246: 'EWT',
  42161: 'ETH',
  42220: 'CELO',
  73799: 'VT',
  80001: 'MATIC',
}

export const NETWORK_NAME: Record<ChainId, string> = {
  1: 'Ethereum',
  4: 'Rinkeby',
  5: 'Görli',
  56: 'Binance Smart Chain',
  10: 'Optimism',
  100: 'Gnosis Chain',
  137: 'Polygon',
  246: 'Energy Web',
  42161: 'Arbitrum One',
  42220: 'Celo',
  73799: 'Volta Testnet',
  80001: 'Polygon Testnet',
}
