interface Request {
  method: string
  params?: Array<any>
}

export class Eip1193IframeBridge {
  private messageId = 0

  request(request: Request): Promise<any> {
    const currentMessageId = this.messageId
    this.messageId++

    console.log('bridging...', request)

    return new Promise((resolve, reject) => {
      window.parent.postMessage({
        transactionSimulatorBridgeSend: true,
        request,
        messageId: currentMessageId,
      })

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
