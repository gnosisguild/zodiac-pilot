import { PROBE_CHAIN_ID } from '../messages'

chrome.runtime.onMessage.addListener((message, sender, respond) => {
  console.log('[inject/probeChainId] chrome.runtime.onMessage', message, {
    sender,
  })
  if (sender.id !== chrome.runtime.id) return

  // Provide the background script with the chainId of a given RPC endpoint on request
  if (message.type === PROBE_CHAIN_ID) {
    fetch(message.url, {
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
      .then((res) => res.json())
      .then((json) => {
        const networkId = parseInt(json.result)
        respond(networkId && !isNaN(networkId) ? networkId : undefined)
      })
      .catch((e) => {
        console.error(
          'Failed to determine chainId for endpoint',
          message.url,
          e
        )
        respond(undefined)
      })

    return true // without this the response won't be sent
  }
})
