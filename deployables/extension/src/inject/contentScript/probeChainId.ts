import { sentry } from '@/sentry'
import { Chain } from '@zodiac/chains'

export const probeChainId = async (url: string) => {
  try {
    const knownChain = Object.entries(fastTrack).find(([urlPrefix]) =>
      url.startsWith(urlPrefix),
    )

    if (knownChain != null) {
      return knownChain[1]
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        method: 'eth_chainId',
        params: [],
        jsonrpc: '2.0',
        id: Math.floor(Math.random() * 100000000),
      }),
    })

    const json = await response.json()

    const chainId = parseInt(json.result)

    if (chainId != null && !isNaN(chainId)) {
      return chainId
    }
  } catch (e) {
    sentry.captureException(e)

    console.error('Failed to determine chainId for endpoint', url, e)
  }
}

const fastTrack = {
  'https://arbitrum-mainnet.infura.io/v3': Chain.ARB1,
  'https://arbitrum-sepolia.infura.io/v3': Chain.SEP,
  'https://avalanche-mainnet.infura.io/v3': Chain.AVAX,
  'https://base-mainnet.infura.io/v3': Chain.BASE,
  'https://celo-mainnet.infura.io/v3': Chain.CELO,
  'https://mainnet.infura.io/v3': Chain.ETH,
  'https://optimism-mainnet.infura.io/v3': Chain.OETH,
  'https://polygon-mainnet.infura.io/v3': Chain.MATIC,
}
