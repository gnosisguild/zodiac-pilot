// This function acts as the counterpart to the providers/IframeBridgeProvider.ts:
// Its adds a message handler to the window object that will be called when a message is received from the parent frame.

import { JsonRpcRequest } from '../types'

type RequestHandler = (request: JsonRpcRequest) => Promise<any>

export default function addBridgeMessageHandler(
  requestHandler: RequestHandler
) {
  // establish message bridge for ganache requests
  window.addEventListener('message', async (ev: MessageEvent) => {
    const { zodiacPilotIframeBridgeRequest, bridgeId, messageId, request } =
      ev.data

    if (zodiacPilotIframeBridgeRequest) {
      if (!window.top) throw new Error('Must run inside iframe')
      console.debug('iframe bridge request', bridgeId, messageId, request)

      const response = await requestHandler(request)

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
  })

  if (!window.top) throw new Error('Must run inside iframe')
  window.top.postMessage(
    {
      zodiacPilotIframeBridgeInit: true,
    },
    '*'
  )
}
