// Chrome extensions are sandboxed from each other, so we cannot directly access Metamask (https://community.metamask.io/t/any-chance-to-open-metamask-chrome-extension-from-another-chrome-extension/19090)
// The solutions lies in using an iframe to load an externally hosted page where Metamask will inject the provider.
// We inject this script into that iframe window via contentScripts.ts, to establish a message bridge for communication.

import addBridgeMessageHandler from './addBridgeMessageHandler'

declare global {
  interface Window {
    ethereum?: any
  }
}

let tries = 0
const interval = window.setInterval(() => {
  if (!window.ethereum) {
    if (tries > 100) {
      window.clearInterval(interval)
      console.warn('Could not detect injected provider after 100ms')
    }
    tries++
    return
  }

  console.info('Detected injected provider, establishing message bridge')
  addBridgeMessageHandler({
    request: window.ethereum.request,
    on: window.ethereum.on,
  })
  window.clearInterval(interval)
}, 10)

export {}
