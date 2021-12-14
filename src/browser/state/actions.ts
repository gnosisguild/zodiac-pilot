interface AppendCapturedTxAction {
  type: 'APPEND_CAPTURED_TX'
  payload: {
    to: string
    value: string
    data: string
    transactionHash: string
  }
}

export type Action = AppendCapturedTxAction
