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
  transactionData: string,
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
    if (proxyTarget) {
      return await fetchAbi(
        network,
        proxyTarget,
        transactionData,
        provider,
        blockExplorerApiKey
      )
    }

    // Try finding an entry at 4Bytes Directory as a last resort
    return await fetchFrom4ByteDirectory(transactionData)
  }

  // bring the JSON into ethers.js canonical form
  // (so we don't trigger unnecessary updates when looking at the same ABI in different forms)
  return new Interface(result).format(FormatTypes.json) as string
}

export default fetchAbi

const looksLikeAProxy = (abi: string) => {
  const iface = new Interface(abi)
  const signatures = Object.keys(iface.functions)
  return (
    signatures.length === 0 ||
    (signatures.length === 1 && signatures[0] === 'implementation()')
  )
}

const fetchFrom4ByteDirectory = async (data: string): Promise<string> => {
  if (data.length < 10) return ''
  const sighash = data.substring(0, 10)
  const calldata = `0x${data.substring(10)}`

  const res = await fetch(
    `https://api.4byte.directory/api/v1/signatures/?hex_signature=${sighash}&ordering=created_at`
  )
  if (!res.ok) {
    return ''
  }

  const { results = [] } = await res.json()
  const resultInterfaces = results.map(
    (result: any) => new Interface([`function ${result.text_signature}`])
  ) as Interface[]
  const matchingInterface = resultInterfaces.find((iface) => {
    try {
      iface.decodeFunctionData(sighash, calldata)
      return true
    } catch (e) {
      return false
    }
  })

  return matchingInterface
    ? (matchingInterface.format(FormatTypes.json) as string)
    : ''
}
