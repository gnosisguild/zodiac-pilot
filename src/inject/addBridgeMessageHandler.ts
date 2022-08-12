// This function acts as the counterpart to the providers/IframeBridgeProvider.ts:
// Its adds a message handler to the window object that will be called when a message is received from the parent frame.

import { JsonRpcRequest } from '../types'

type RequestHandler = (request: JsonRpcRequest) => Promise<any>

type Listener = (...args: any[]) => void
type EventListenHandler = (
  eventType: string | symbol,
  listener: Listener
) => Promise<any>
interface Props {
  request: RequestHandler
  on: EventListenHandler
}

export default function addBridgeMessageHandlers({ request, on }: Props) {
  // establish message bridge for ganache requests
  window.addEventListener('message', async (ev: MessageEvent) => {
    const {
      zodiacPilotIframeBridgeRequest,
      bridgeId,
      messageId,
      request: requestParams,
    } = ev.data

    if (zodiacPilotIframeBridgeRequest) {
      if (!window.top) throw new Error('Must run inside iframe')
      console.debug('iframe bridge request', bridgeId, messageId, request)

      const response = await request(requestParams)

      window.top.postMessage(
        {
          zodiacPilotIframeBridgeResponse: true,
          bridgeId,
          messageId,
          response,
        },
        '*'
      )
    }

    const { zodiacPilotIframeBridgeEventListen, eventType } = ev.data

    if (zodiacPilotIframeBridgeEventListen) {
      console.debug('iframe event listen', bridgeId, eventType)

      on(eventType, (...eventArgs: any[]) => {
        if (!window.top) throw new Error('Must run inside iframe')

        console.debug('iframe event emit', bridgeId, eventType, eventArgs)
        window.top.postMessage(
          {
            zodiacPilotIframeBridgeEventEmit: true,
            bridgeId,
            eventType,
            eventArgs,
          },
          '*'
        )
      })
    }
  })

  if (!window.top) throw new Error('Must run inside iframe')
  window.top.postMessage(
    {
      zodiacPilotIframeBridgeInit: true,
    },
    '*'
  )
}
