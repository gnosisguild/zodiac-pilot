function inject(scriptPath: string) {
  const node = document.createElement('script')
  node.type = 'text/javascript'
  node.async = false
  node.src = chrome.runtime.getURL(scriptPath)

  const parent = document.head || document.documentElement
  if (parent.dataset.__zodiacPilotInjected) {
    // another installation of the extension has already injected itself
    // (this can happen when when loading unpacked extensions)
    return
  }
  parent.dataset.zodiacPilotInjected = 'true'
  parent.insertBefore(node, parent.children[0])
  node.remove()
}

console.log('ext id', chrome.runtime.id)
inject('build/injection.js')

// Provide the background script with the chainId of a given RPC endpoint on request
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (message.type === 'requestChainId') {
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

export {}
