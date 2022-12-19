import { FormatTypes, Interface } from '@ethersproject/abi'
import { Provider } from '@ethersproject/abstract-provider'
import { loaders } from '@shazow/whatsabi'
import detectProxyTarget from 'ethers-proxies'

import { ChainId, EXPLORER_API_URL } from '../networks'

const fetchAbi = async (
  network: ChainId,
  contractAddress: string,
  transactionData: string,
  provider: Provider,
  blockExplorerApiKey = ''
): Promise<string> => {
  const abi = await abiForAddress(contractAddress, network, blockExplorerApiKey)
  if (!abi || looksLikeAProxy(abi)) {
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
  }

  if (abi) return abi

  // Try to find a matching entry at 4byte.directory or sig.eth.samczsun.com
  return await abiFromCalldata(transactionData)
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

const abiForAddress = async (
  address: string,
  network: ChainId,
  blockExplorerApiKey = ''
): Promise<string> => {
  const abiLoader = new loaders.MultiABILoader([
    // new loaders.SourcifyABILoader(), // doesn't work in the current version (v0.2.1)
    new loaders.EtherscanABILoader({
      apiKey: blockExplorerApiKey,
      baseURL: EXPLORER_API_URL[network],
    }),
  ])

  try {
    const json = await abiLoader.loadABI(address)
    return new Interface(json).format(FormatTypes.json) as string
  } catch (e) {
    return ''
  }
}

const signatureLookups: loaders.SignatureLookup[] = [
  new loaders.SamczunSignatureLookup(),
  new loaders.Byte4SignatureLookup(),
]

const abiFromCalldata = async (data: string): Promise<string> => {
  if (data.length < 10) return ''
  const sighash = data.substring(0, 10)
  const calldata = `0x${data.substring(10)}`

  const result = await Promise.any(
    signatureLookups.map(async (lookup) => {
      const signatures = await lookup.loadFunctions(sighash)
      const matchingInterface = signatures
        .map((signature) => new Interface([`function ${signature}`]))
        .find((iface) => {
          try {
            iface.decodeFunctionData(sighash, calldata)
            return true
          } catch (e) {
            return false
          }
        })
      if (!matchingInterface) throw new Error('No matching signature found')
      return matchingInterface
    })
  ).catch(() => null)

  return result ? (result.format(FormatTypes.json) as string) : ''
}
