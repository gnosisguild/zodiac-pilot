import type { Hex, MetaTransactionRequest } from '@zodiac/schema'

type AbiFragment = object

export interface ContractInfo {
  address: Hex
  proxyTo?: Hex
  verified: boolean
  name?: string
  abi?: AbiFragment[]
}

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
