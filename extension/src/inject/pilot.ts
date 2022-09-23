// This script will be injected via contentScripts.ts into the browser iframe running the Dapp.

import BridgeIframe from '../bridge/iframe'
declare let window: Window & { ethereum: BridgeIframe }

// inject bridged ethereum provider
console.log('injected into', document.title)
window.ethereum = new BridgeIframe()

// establish message bridge for location requests
window.addEventListener('message', (ev: MessageEvent) => {
  const { zodiacPilotHrefRequest } = ev.data
  if (zodiacPilotHrefRequest) {
    if (!window.top) throw new Error('Must run inside iframe')
    window.top.postMessage(
      {
        zodiacPilotHrefResponse: true,
        href: window.location.href,
      },
      '*'
    )
  }
})

export {}
