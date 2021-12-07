import ganache from 'ganache'

import BridgeIframe from './bridge/iframe'

// Ganache and @ethereum/vm use eval and wasm-eval so we cannot run it in an extension page or a background script.
// The only way we can use it is via a Sandbox page (https://developer.chrome.com/docs/extensions/mv3/manifest/sandbox/).
// So this script is loaded from ganache.html which is embedded as an iframe into the extension page, communication happens via postMessage.
console.log('okokokok')

const bridge = new BridgeIframe()
const provider = ganache.provider()

const test = async () => {
  console.log(
    'GANACHE',
    await provider.request({
      method: 'eth_call',
      params: [
        {
          from: '0x8aff0a12f3e8d55cc718d36f84e002c335df2f4a',
          to: '0x5c7687810ce3eae6cda44d0e6c896245cd4f97c6',
          data: '0x6740d36c0000000000000000000000000000000000000000000000000000000000000005',
        },
        'latest',
      ],
    })
  )
}

test()
