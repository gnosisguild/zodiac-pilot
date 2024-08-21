import {
  REQUEST_CHAIN_ID,
  USER_WALLET_REQUEST,
  USER_WALLET_RESPONSE,
} from './messages'

function inject(scriptPath: string) {
  const node = document.createElement('script')
  node.type = 'text/javascript'
  node.async = false
  node.src = chrome.runtime.getURL(scriptPath)

  if (document.documentElement.dataset.__zodiacPilotInjected) {
    // another installation of the extension has already injected itself
    // (this can happen when when loading unpacked extensions)
    return
  }
  document.documentElement.dataset.__zodiacPilotInjected = 'true'

  const parent = document.head || document.documentElement
  parent.insertBefore(node, parent.children[0])
  node.remove()
}

function injectIframe(src: string) {
  const node = document.createElement('iframe')
  node.src = src
  node.style.display = 'none'

  if (document.documentElement.dataset.__zodiacPilotIframeInjected) {
    // another installation of the extension has already injected itself
    // (this can happen when when loading unpacked extensions)
    return
  }
  document.documentElement.dataset.__zodiacPilotIframeInjected = 'true'

  const parent = document.body || document.documentElement
  parent.append(node)

  return node.contentWindow
}

inject('build/injection/main.js')

// Render an invisible iframe to be able to connect with the injected provider from other wallet extensions
const iframe = injectIframe('https://vnet-api.pilot.gnosisguild.org/') // TODO replace with https://connect.pilot.gnosisguild.org/, also needs to be updated in manifest content_scripts

console.log('injected iframe', iframe)

chrome.runtime.onMessage.addListener((message, sender, respond) => {
  console.log('chrome.runtime.onMessage', message, { sender })
  if (sender.id !== chrome.runtime.id) return

  if (message.type === USER_WALLET_REQUEST) {
    if (!iframe) {
      throw new Error('cannot access connect iframe window')
    }

    // relay user wallet request to connect iframe so the connectInjection can receive it
    iframe.postMessage(message, '*') // TODO maybe use connect.pilot.gnosisguild.org instead of *?

    // wait for response
    const handleResponse = (event: MessageEvent<any>) => {
      console.log('message from connect iframe', event.data)

      if (event.data.type !== USER_WALLET_RESPONSE) return

      window.removeEventListener('message', handleResponse)
      respond(event.data)
    }
    window.addEventListener('message', handleResponse)

    return true // without this the response won't be sent
  }

  // Provide the background script with the chainId of a given RPC endpoint on request
  if (message.type === REQUEST_CHAIN_ID) {
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
