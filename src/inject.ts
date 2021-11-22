import { Eip1193IframeBridge } from './Eip1193IframeBridge'
declare let window: Window & { ethereum: any }

console.log('injected', document.title)
window.ethereum = new Eip1193IframeBridge()

export {}
