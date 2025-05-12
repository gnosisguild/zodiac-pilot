import { injectScript } from '@/utils'
import {
  createClientMessageHandler,
  InjectedProviderMessageTyp,
  PilotMessageType,
  RpcMessageType,
  type InjectedProviderMessage,
  type InjectedProviderResponse,
} from '@zodiac/messages'
import { probeChainId } from './probeChainId'

// The content script is injected on tab update events, which can be triggered multiple times for the same page load.
// That's why we need to check if the script has already been injected before injecting it again.

const alreadyInjected =
  '__zodiacPilotInjected' in document.documentElement.dataset

if (alreadyInjected === false) {
  document.documentElement.dataset.__zodiacPilotInjected = 'true'
  document.documentElement.dataset.__zodiacPilotConnected = 'true'

  injectScript('build/inject/injectedScript/main.js')

  // relay rpc requests from the InjectedProvider in the tab to the Eip1193Provider in the panel
  window.addEventListener(
    'message',
    async (event: MessageEvent<InjectedProviderMessage>) => {
      const message = event.data
      if (!message) return

      if (
        message.type === InjectedProviderMessageTyp.INJECTED_PROVIDER_REQUEST
      ) {
        // Prevent the same request from being handled multiple times through other instances of this content script
        event.stopImmediatePropagation()

        const { requestId, request } = message

        const logDetails = { request, response: '⏳' } as any
        const requestIndex = requestId.split('_').pop()
        console.debug(
          `🧑‍✈️ request #${requestIndex}: \x1B[34m${request.method}\x1B[m %O`,
          logDetails,
        )

        const responseMessage: InjectedProviderResponse | undefined =
          await chrome.runtime.sendMessage<InjectedProviderMessage>(message)

        // This can happen if the panel is closed before the response is received
        if (!responseMessage) return

        const { response } = responseMessage
        Object.assign(logDetails, { response })

        window.postMessage(responseMessage, '*')
      }
    },
  )

  chrome.runtime.onMessage.addListener(
    createClientMessageHandler(PilotMessageType.PILOT_DISCONNECT, () => {
      // when the panel is closed, we trigger an EIP1193 'disconnect' event

      console.debug('Pilot disconnected')
      window.postMessage(
        {
          type: InjectedProviderMessageTyp.INJECTED_PROVIDER_EVENT,
          eventName: 'disconnect',
          eventData: {
            error: {
              message: 'Zodiac Pilot disconnected',
              code: 4900,
            },
          },
        } as InjectedProviderMessage,
        '*',
      )
    }),
  )

  chrome.runtime.onMessage.addListener(
    createClientMessageHandler(
      InjectedProviderMessageTyp.INJECTED_PROVIDER_EVENT,
      (message) => {
        console.debug(
          `🧑‍✈️ event: \x1B[34m${message.eventName}\x1B[m %O`,
          message.eventData,
        )
        window.postMessage(message, '*')
      },
    ),
  )

  chrome.runtime.onMessage.addListener(
    createClientMessageHandler(
      RpcMessageType.PROBE_CHAIN_ID,
      ({ url }, { sendResponse }) => {
        console.debug(`Probing chain ID using URL "${url}"`)

        probeChainId(url).then(sendResponse)

        // without this the response won't be sent
        return true
      },
    ),
  )
}

export default {}
