/* spell-checker: disable */

export const RPC = {
  1: 'https://mainnet.infura.io/v3/b81b456501e34bed8a85a3c2ff8f4577',
  5: 'https://goerli.infura.io/v3/b81b456501e34bed8a85a3c2ff8f4577',
  10: 'https://mainnet.optimism.io',
  56: 'https://bsc-dataseed.binance.org',
  100: 'https://rpc.gnosischain.com',
  137: 'https://polygon-rpc.com',
  246: 'https://rpc.energyweb.org',
  8453: 'https://mainnet.base.org',
  42161: 'https://arb1.arbitrum.io/rpc',
  42220: 'https://forno.celo.org',
  73799: 'https://volta-rpc.energyweb.org',
  80001: 'https://rpc-mumbai.maticvigil.com',
  11155111: 'https://sepolia.infura.io/v3/b81b456501e34bed8a85a3c2ff8f4577',
}

export type ChainId = keyof typeof RPC

export const EXPLORER_URL: Record<ChainId, string> = {
  1: 'https://etherscan.io',
  5: 'https://goerli.etherscan.io',
  10: 'https://optimistic.etherscan.io',
  56: 'https://bscscan.com',
  100: 'https://gnosisscan.io',
  137: 'https://polygonscan.com',
  246: 'https://explorer.energyweb.org',
  8453: 'https://basescan.org',
  42161: 'https://arbiscan.io',
  42220: 'https://explorer.celo.org',
  73799: 'https://volta-explorer.energyweb.org',
  80001: 'https:/testnet.polygonscan.com',
  11155111: 'https://sepolia.etherscan.io',
}

export const EXPLORER_API_URL: Record<ChainId, string> = {
  1: 'https://api.etherscan.io/api',
  5: 'https://api-goerli.etherscan.io/api',
  10: 'https://api-optimistic.etherscan.io/api',
  56: 'https://api.bscscan.com/api',
  100: 'https://api.gnosisscan.io/api',
  137: 'https://api.polygonscan.com/api',
  246: 'https://explorer.energyweb.org/api',
  8453: 'https://api.basescan.org/api',
  42161: 'https://api.arbiscan.io/api',
  42220: 'https://explorer.celo.org/api',
  73799: 'https://volta-explorer.energyweb.org/api',
  80001: 'https://api-testnet.polygonscan.com/api',
  11155111: 'https://api-sepolia.etherscan.io/api',
}

export const EXPLORER_API_KEY: Record<ChainId, string> = {
  1: 'N53BKW6ABNX7CNUK8QIXGRAQS2NME92YAN',
  5: 'N53BKW6ABNX7CNUK8QIXGRAQS2NME92YAN',
  10: '',
  56: '',
  100: 'W575K6DTMSTVB7UFUSNW7GWQ4UWUARTJ7Z',
  137: '',
  246: '',
  8453: 'KCC7EQHE17IAQZA9TICUS6BQTJGZUDRNIY',
  42161: '',
  42220: '',
  73799: '',
  80001: '',
  11155111: 'N53BKW6ABNX7CNUK8QIXGRAQS2NME92YAN',
}

export const CHAIN_PREFIX: Record<ChainId, string> = {
  1: 'eth',
  5: 'gor',
  10: 'oeth',
  56: 'bsc',
  100: 'gno',
  137: 'matic',
  246: 'ewt',
  8453: 'base',
  42161: 'arb1',
  42220: 'celo',
  73799: 'vt',
  80001: 'maticmum',
  11155111: 'sep',
}

export const CHAIN_CURRENCY: Record<ChainId, string> = {
  1: 'ETH',
  5: 'ETH',
  56: 'BNB',
  10: 'ETH',
  100: 'xDAI',
  137: 'MATIC',
  246: 'EWT',
  8453: 'ETH',
  42161: 'ETH',
  42220: 'CELO',
  73799: 'VT',
  80001: 'MATIC',
  11155111: 'ETH',
}

export const CHAIN_NAME: Record<ChainId, string> = {
  1: 'Ethereum',
  5: 'Görli',
  56: 'Binance Smart Chain',
  10: 'Optimism',
  100: 'Gnosis Chain',
  137: 'Polygon',
  246: 'Energy Web',
  8453: 'Base',
  42161: 'Arbitrum One',
  42220: 'Celo',
  73799: 'Volta Testnet',
  80001: 'Polygon Testnet',
  11155111: 'Sepolia',
}
