interface Request {
  method: string
  params?: Array<any>
}

export default class BridgeHost {
  private source: WindowProxy | undefined
  private bridgedEvents: Set<string>

  constructor() {
    this.bridgedEvents = new Set()
  }

  bridgeEvent = ({ type, data }: ProviderMessage) => {
    if (!this.source) throw new Error('source must be set')
    this.source.postMessage(
      {
        transactionSimulatorBridgeEventEmit: true,
        type,
        args: [data],
      },
      '*'
    )
  }

  removeAllListeners() {
    this.bridgedEvents.forEach((type) => {
      provider.removeListener(type, this.bridgeEvent)
    })
    this.bridgedEvents.clear()
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
    this.removeAllListeners()
  }

  private assertConsistentSource(event: MessageEvent<any>) {
    if (event.source !== this.source) {
      throw new Error('unexpected message source')
    }
  }

  private async handleRequest(request: Request, messageId: number) {
    console.log('request', messageId, request)
    const response = await provider.request(request)

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
    if (!this.bridgedEvents.has(type)) {
      this.bridgedEvents.add(type)
      provider.on(type, this.bridgeEvent)
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

    this.assertConsistentSource(ev)

    if (transactionSimulatorBridgeRequest) {
      this.handleRequest(request, messageId)
    }

    if (transactionSimulatorBridgeEventListen) {
      this.handleEventListen(type)
    }
  }
}
