import BridgeIframe from './bridge/iframe'
declare let window: Window & { ethereum: BridgeIframe }

// inject bridged ethereum provider
console.log('injected into', document.title)
window.ethereum = new BridgeIframe()

// establish message bridge for location requests
window.addEventListener('message', (ev: MessageEvent) => {
  const { transactionPilotHrefRequest } = ev.data
  if (transactionPilotHrefRequest) {
    if (!window.top) throw new Error('Must run inside iframe')
    window.top.postMessage(
      {
        transactionPilotHrefResponse: true,
        href: window.location.href,
      },
      '*'
    )
  }
})

export {}
