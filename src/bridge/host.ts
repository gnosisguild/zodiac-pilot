import { Eip1193Provider } from './Eip1193Provider'

interface Request {
  method: string
  params?: Array<any>
}

type Listener = (...args: any[]) => void

export default class BridgeHost {
  private provider: Eip1193Provider
  private bridgedEvents: { [type: string]: Listener }
  private source: WindowProxy | undefined

  constructor(provider: Eip1193Provider) {
    this.bridgedEvents = {}
    this.provider = provider
  }

  removeAllListeners() {
    Object.entries(this.bridgedEvents).forEach(([type, listener]) => {
      this.provider.removeListener(type, listener)
    })
    this.bridgedEvents = {}
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
    console.log('INIT')
    this.removeAllListeners()
  }

  private assertConsistentSource(event: MessageEvent<any>) {
    if (event.source !== this.source) {
      throw new Error('unexpected message source')
    }
  }

  private async handleRequest(request: Request, messageId: number) {
    console.log('request', messageId, request)
    const response = await this.provider.request(request)

    if (!this.source) throw new Error('source must be set')
    this.source.postMessage(
      {
        transactionSimulatorBridgeResponse: true,
        messageId,
        response,
      },
      '*'
    )
  }

  private handleEventListen(type: string) {
    console.log('subscribe', type)

    // only bridge each event once
    if (!this.bridgedEvents[type]) {
      if (!this.source) throw new Error('source must be set')
      this.bridgedEvents[type] = (...args: any[]) => {
        if (!this.source) throw new Error('source must be set')
        console.log(`bridged ${type} event emitted`)
        this.source.postMessage(
          {
            transactionSimulatorBridgeEventEmit: true,
            type,
            args,
          },
          '*'
        )
      }
      this.provider.on(type, this.bridgedEvents[type])
    }
  }

  handleMessage(ev: MessageEvent<any>) {
    const {
      transactionSimulatorBridgeInit,

      transactionSimulatorBridgeRequest,
      messageId,
      request,

      transactionSimulatorBridgeEventListen,
      type,
    } = ev.data

    if (transactionSimulatorBridgeInit) {
      this.initBridge(ev)
      return
    }

    console.log('message', ev.data, ev.source, this.source)

    if (transactionSimulatorBridgeRequest) {
      this.assertConsistentSource(ev)
      this.handleRequest(request, messageId)
    }

    if (transactionSimulatorBridgeEventListen) {
      this.assertConsistentSource(ev)
      this.handleEventListen(type)
    }
  }
}
