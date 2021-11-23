export const handleMessage = (ev: MessageEvent<any>) => {
  const { transactionSimulatorBridgeRequest, messageId, request } = ev.data
  if (!transactionSimulatorBridgeRequest) return

  console.log('message', messageId, request)

  if (!ev.source) throw new Error('Cannot post response')
  ev.source.postMessage({ transactionSimulatorBridgeResponse: true })
}
