// Chrome extensions are sandboxed from each other, so we cannot directly access Metamask (https://community.metamask.io/t/any-chance-to-open-metamask-chrome-extension-from-another-chrome-extension/19090)
// The solutions lies in using an iframe to load an externally hosted page where Metamask will inject the provider.
// We inject this script into that iframe window via contentScripts.ts, to establish a message bridge for communication.

import addBridgeMessageHandler from './addBridgeMessageHandler'

declare global {
  interface Window {
    ethereum?: any
  }
}

// establish message bridge for location requests
if (window.ethereum) {
  addBridgeMessageHandler(window.ethereum.request)
}

export {}
