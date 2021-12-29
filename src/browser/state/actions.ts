import { TransactionInput } from 'react-multisend'

interface AppendCapturedTxAction {
  type: 'APPEND_CAPTURED_TX'
  payload: {
    input: TransactionInput
    transactionHash: string
  }
}

export type Action = AppendCapturedTxAction
