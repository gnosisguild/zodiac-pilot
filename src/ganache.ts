// Ganache and @ethereum/vm use eval and wasm-eval so we cannot run it in an extension page or a background script.
// We also cannot run in in a Sandbox page (https://developer.chrome.com/docs/extensions/mv3/manifest/sandbox/), because Indexed DB is not available there.
// So this script is injected via contentScripts.ts into an externally hosted page loaded in an iframe, communication happens via postMessage.

import EventEmitter from 'events'

import ganache from 'ganache'

interface JsonRpcRequest {
  method: string
  params?: Array<any>
}

// Ganache needs a provider for forking, we bridge to the host page's provider
class Eip1193Provider extends EventEmitter {
  private messageId = 0

  constructor() {
    super()
    if (!window.top) throw new Error('Must run inside iframe')

    window.top.postMessage(
      {
        zodiacPilotGanacheInit: true,
      },
      '*'
    )
  }

  request(request: JsonRpcRequest): Promise<any> {
    const currentMessageId = this.messageId
    this.messageId++

    return new Promise((resolve, reject) => {
      if (!window.top) throw new Error('Must run inside iframe')

      window.top.postMessage(
        {
          zodiacPilotRequestFromGanache: true,
          request,
          messageId: currentMessageId,
        },
        '*'
      )

      const handleMessage = (ev: MessageEvent) => {
        const { zodiacPilotResponseToGanache, messageId, error, response } =
          ev.data
        if (zodiacPilotResponseToGanache && messageId === currentMessageId) {
          window.removeEventListener('message', handleMessage)
          // console.debug('RES TO GANACHE', messageId, response)
          if (error) {
            reject(error)
          } else {
            resolve(response)
          }
        }
      }

      window.addEventListener('message', handleMessage)
    })
  }
}

const provider = ganache.provider({
  fork: {
    provider: new Eip1193Provider(),
  },
  chain: {
    chainId: 4,
  },
  wallet: {
    unlockedAccounts: ['0x87eb5f76c3785936406fa93654f39b2087fd8068'],
  },
})

// establish message bridge for ganache requests
window.addEventListener('message', async (ev: MessageEvent) => {
  const { zodiacPilotGanacheRequest, messageId, request } = ev.data
  if (zodiacPilotGanacheRequest) {
    if (!window.top) throw new Error('Must run inside iframe')
    console.debug('GAN REQ', messageId, request)

    // This is a fix for what seems to be a bug in either Ganache or Uniswap.
    // Uniswap sends the data param JSON stringified, and most providers can handle that.
    // Ganache requires the data to be the parsed object, though.
    if (request.method === 'eth_signTypedData_v4' && request.params) {
      request.params[1] = JSON.parse(request.params[1])
    }

    const response = await provider.request(request)

    window.top.postMessage(
      {
        zodiacPilotGanacheResponse: true,
        messageId,
        response,
      },
      '*'
    )
  }
})

if (!window.top) throw new Error('Must run inside iframe')
window.top.postMessage(
  {
    zodiacPilotGanacheInit: true,
  },
  '*'
)
