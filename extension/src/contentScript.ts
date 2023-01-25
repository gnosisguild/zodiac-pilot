function inject(windowName: string, scriptPath: string) {
  if (window.name === windowName) {
    const node = document.createElement('script')
    node.src = chrome.runtime.getURL(scriptPath)

    const parent = document.head || document.documentElement
    parent.appendChild(node)
    node.onload = function () {
      node.remove()
    }
  }
}

inject('pilot-frame', 'build/inject/pilot.js')
// inject('ganache-frame', 'build/inject/ganache.js')

// Provide the background script with the chainId of a given RPC endpoint on request
if (window.name === 'pilot-frame') {
  chrome.runtime.onMessage.addListener((message, sender, respond) => {
    if (message.type === 'requestChainId') {
      fetch(message.url, {
        method: 'POST',
        body: JSON.stringify([
          { method: 'eth_chainId', params: [], jsonrpc: '2.0' },
        ]),
      })
        .then((res) => res.json())
        .then((json) => {
          const networkId =
            Array.isArray(json) && json.length > 0 && parseInt(json[0].result)
          respond(networkId && !isNaN(networkId) ? networkId : undefined)
        })

      return true // without this the response won't be sent
    }
  })
}

export {}
