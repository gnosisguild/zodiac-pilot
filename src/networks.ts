export const EXPLORER_URL = {
  1: 'https://etherscan.io',
  4: 'https://rinkeby.etherscan.io',
  100: 'https://gnosisscan.io',
}

export const EXPLORER_API_URL = {
  1: 'https://api.etherscan.io/api',
  4: 'https://api-rinkeby.etherscan.io/api',
  100: 'https://api.gnosisscan.io/api',
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

export type ChainId = keyof typeof EXPLORER_URL
