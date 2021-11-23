interface Request {
  method: string
  params?: Array<any>
}

export default class Eip1193BridgeIframe {
  private messageId = 0

  request(request: { method: string; params?: Array<any> }): Promise<any> {
    return this.send(request.method, request.params || [])
  }

  async send(method: string, params?: Array<any>): Promise<any> {
    const currentMessageId = this.messageId
    this.messageId++
    const request = { method, params }

    console.log('bridging...')

    return new Promise((resolve, reject) => {
      if (!window.top) throw new Error('Must run inside iframe')

      window.top.postMessage(
        {
          transactionSimulatorBridgeRequest: true,
          request,
          messageId: currentMessageId,
        },
        '*'
      )

      const handleMessage = (ev: MessageEvent) => {
        const { transactionSimulatorBridgeResponse, messageId, error, result } =
          ev.data
        if (
          transactionSimulatorBridgeResponse &&
          messageId === currentMessageId
        ) {
          window.removeEventListener('message', handleMessage)

          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        }
      }

      window.addEventListener('message', handleMessage)
    })
  }

  async enable() {
    console.log('enable was called')
  }

  isMetaMask = true
}
