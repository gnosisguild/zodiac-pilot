import BridgeIframe from './bridge/iframe'
declare let window: Window & { ethereum: BridgeIframe }

console.log('injected into', document.title)
window.ethereum = new BridgeIframe()

export {}
