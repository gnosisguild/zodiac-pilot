import { Connection, Eip1193Provider } from '../types'

interface Request {
  method: string
  params?: Array<any>
}

export default class Eip1193Bridge {
  private provider: Eip1193Provider
  private connection: Connection
  private source: WindowProxy | undefined

  constructor(provider: Eip1193Provider, connection: Connection) {
    this.provider = provider
    this.connection = connection
  }

  setProvider = (provider: Eip1193Provider) => {
    this.provider = provider
  }

  setConnection = (connection: Connection) => {
    if (connection.avatarAddress !== this.connection.avatarAddress) {
      this.emitBridgeEvent('accountsChanged', [[connection.avatarAddress]])
    }

    if (connection.chainId !== this.connection.chainId) {
      this.emitBridgeEvent('chainChanged', [connection.chainId])
    }

    this.connection = connection
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

  private emitBridgeEvent(event: string, args: any[]) {
    if (!this.source) throw new Error('source must be set')

    this.source.postMessage(
      {
        zodiacPilotBridgeEvent: true,
        event,
        args,
      },
      '*'
    )
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

    if (zodiacPilotBridgeRequest) {
      this.assertConsistentSource(ev)
      this.handleRequest(request, messageId)
    }
  }

  private assertConsistentSource(event: MessageEvent<any>) {
    if (event.source !== this.source) {
      throw new Error('unexpected message source')
    }
  }
}
