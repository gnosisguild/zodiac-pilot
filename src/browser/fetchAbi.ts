import { FormatTypes, Interface } from '@ethersproject/abi'
import { Provider } from '@ethersproject/abstract-provider'
import detectProxyTarget from 'ethers-proxies'

const EXPLORER_API_URLS = {
  1: 'https://api.etherscan.io/api',
  4: 'https://api-rinkeby.etherscan.io/api',
  100: 'https://blockscout.com/xdai/mainnet/api',
  73799: 'https://volta-explorer.energyweb.org/api',
  246: 'https://explorer.energyweb.org/api',
  137: 'https://api.polygonscan.com/api',
  56: 'https://api.bscscan.com/api',
  42161: 'https://api.arbiscan.io/api',
}

export type NetworkId = keyof typeof EXPLORER_API_URLS

const fetchAbi = async (
  network: NetworkId,
  contractAddress: string,
  provider: Provider,
  blockExplorerApiKey = ''
): Promise<string> => {
  const apiUrl = EXPLORER_API_URLS[network]
  const params = new URLSearchParams({
    module: 'contract',
    action: 'getAbi',
    address: contractAddress,
    apiKey: blockExplorerApiKey,
  })

  const response = await fetch(`${apiUrl}?${params}`)
  if (!response.ok) {
    return ''
  }

  const { result, status } = await response.json()

  if (status === '0' || looksLikeAProxy(result)) {
    // Is this a proxy contract?
    const proxyTarget = await detectProxyTarget(contractAddress, provider)
    return proxyTarget
      ? await fetchAbi(network, proxyTarget, provider, blockExplorerApiKey)
      : ''
  }

  // bring the JSON into ethers.js canonical form
  // (so we don't trigger unnecessary updates when looking at the same ABI in different forms)
  return new Interface(result).format(FormatTypes.json) as string
}

export default fetchAbi

const looksLikeAProxy = (abi: string) => {
  const iface = new Interface(abi)
  const signatures = Object.keys(iface.functions)
  return signatures.length === 0
}
