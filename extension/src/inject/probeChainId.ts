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

    const networkId = parseInt(json.result)

    if (networkId != null && !isNaN(networkId)) {
      return networkId
    }
  } catch (e) {
    console.error('Failed to determine chainId for endpoint', url, e)
  }
}
