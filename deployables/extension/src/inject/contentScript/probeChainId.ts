import { sentry } from '@/sentry'

export const probeChainId = async (url: string) => {
  try {
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
