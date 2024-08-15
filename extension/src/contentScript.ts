function inject(windowName: string, scriptPath: string) {
  if (window.name === windowName) {
    const node = document.createElement('script')
    node.src = chrome.runtime.getURL(scriptPath)

    const parent = document.head || document.documentElement
    if (parent.dataset.__zodiacPilotInjected) {
      // another installation of the extension has already injected itself
      // (this can happen when when loading unpacked extensions)
      return
    }
    parent.dataset.zodiacPilotInjected = 'true'
    parent.insertBefore(node, parent.children[0])
    node.onload = function () {
      node.remove()
    }
  }
}

inject('pilot-frame', 'build/injection.js')

// Provide the background script with the chainId of a given RPC endpoint on request
if (window.name === 'pilot-frame') {
  chrome.runtime.onMessage.addListener((message, sender, respond) => {
    if (message.type === 'requestChainId') {
      fetch(message.url, {
        method: 'POST',
        body: JSON.stringify({
          method: 'eth_chainId',
          params: [],
          jsonrpc: '2.0',
          id: 1,
        }),
      })
        .then((res) => res.json())
        .then((json) => {
          const networkId = parseInt(json.result)
          respond(networkId && !isNaN(networkId) ? networkId : undefined)
        })

      return true // without this the response won't be sent
    }
  })
}

export {}
