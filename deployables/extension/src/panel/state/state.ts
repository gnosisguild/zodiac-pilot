import type { MetaTransactionRequest } from '@zodiac/schema'
import type { ContractInfo } from '../utils'

export type UnconfirmedTransaction = MetaTransactionRequest & {
  id: string
  createdAt: Date
  contractInfo?: ContractInfo
}

export type ConfirmedTransaction = UnconfirmedTransaction & {
  snapshotId: string
  transactionHash: string
}

export type Transaction = UnconfirmedTransaction | ConfirmedTransaction

export type State = {
  pending: UnconfirmedTransaction[]
  confirmed: ConfirmedTransaction[]
  done: ConfirmedTransaction[]
  failed: ConfirmedTransaction[]
  reverted: ConfirmedTransaction[]

  rollback: ConfirmedTransaction | null

  refresh: boolean
}
