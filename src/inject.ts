import BridgeIframe from './bridge/iframe'
declare let window: Window & { ethereum: BridgeIframe }

console.log('injected', document.title)
window.ethereum = new BridgeIframe()

export {}
