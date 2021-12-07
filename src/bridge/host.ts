import { Eip1193Provider } from './Eip1193Provider'

interface Request {
  method: string
  params?: Array<any>
}

export default class BridgeHost {
  private provider: Eip1193Provider
  private source: WindowProxy | undefined

  constructor(provider: Eip1193Provider) {
    this.provider = provider
  }

  initBridge(event: MessageEvent<any>) {
    if (!event.source) throw new Error('Unable to get message source')
    if (
      event.source instanceof MessagePort ||
      event.source instanceof ServiceWorker
    ) {
      throw new Error('Expected message to originate from window')
    }
    this.source = event.source
  }

  private async handleRequest(request: Request, messageId: number) {
    console.debug('REQ', messageId, request)
    if (!this.source) throw new Error('source must be set')

    let response
    let error
    try {
      response = await this.provider.request(request)
    } catch (e) {
      error = e
    }

    this.source.postMessage(
      {
        zodiacPilotBridgeResponse: true,
        messageId,
        response,
        error,
      },
      '*'
    )
  }

  handleMessage(ev: MessageEvent<any>) {
    const {
      zodiacPilotBridgeInit,

      zodiacPilotBridgeRequest,
      messageId,
      request,
    } = ev.data

    if (zodiacPilotBridgeInit) {
      this.initBridge(ev)
      return
    }

    if (zodiacPilotBridgeRequest && ev.source === this.source) {
      this.handleRequest(request, messageId)
    }
  }
}
