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

  private assertConsistentSource(event: MessageEvent<any>) {
    if (event.source !== this.source) {
      throw new Error('unexpected message source')
    }
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
        transactionPilotBridgeResponse: true,
        messageId,
        response,
        error,
      },
      '*'
    )
  }

  handleMessage(ev: MessageEvent<any>) {
    const {
      transactionPilotBridgeInit,

      transactionPilotBridgeRequest,
      messageId,
      request,
    } = ev.data

    if (transactionPilotBridgeInit) {
      this.initBridge(ev)
      return
    }

    if (transactionPilotBridgeRequest) {
      this.assertConsistentSource(ev)
      this.handleRequest(request, messageId)
    }
  }
}
