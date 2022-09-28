export const RPC = {
  1: 'https://mainnet.infura.io/v3/b81b456501e34bed8a85a3c2ff8f4577',
  4: 'https://rinkeby.infura.io/v3/b81b456501e34bed8a85a3c2ff8f4577',
  100: 'https://rpc.gnosischain.com/',
}

export const EXPLORER_URL = {
  1: 'https://etherscan.io',
  4: 'https://rinkeby.etherscan.io',
  100: 'https://gnosisscan.io',
}

export const EXPLORER_API_URL = {
  1: 'https://api.etherscan.io/api',
  4: 'https://api-rinkeby.etherscan.io/api',
  100: 'https://blockscout.com/xdai/mainnet/api',
  // 73799: 'https://volta-explorer.energyweb.org/api',
  // 246: 'https://explorer.energyweb.org/api',
  // 137: 'https://api.polygonscan.com/api',
  // 56: 'https://api.bscscan.com/api',
  // 42161: 'https://api.arbiscan.io/api',
}

export const NETWORK_PREFIX = {
  1: 'eth',
  4: 'rin',
  100: 'gno',
}

export const NETWORK_CURRENCY = {
  1: 'ETH',
  4: 'ETH',
  100: 'xDAI',
}

export type ChainId = keyof typeof EXPLORER_URL
