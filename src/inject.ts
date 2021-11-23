import Eip1193BridgeIframe from './eip1193Bridge/iframe'
declare let window: Window & { ethereum: any }

console.log('injected', document.title)
window.ethereum = new Eip1193BridgeIframe()

export {}
