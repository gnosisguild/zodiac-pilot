import { vnetTransactionsListSchema } from '../types'
import { api } from './api'

export const getVnetTransactionList = async (vnetId: string) => {
  return api(`/${vnetId}/transactions`, { schema: vnetTransactionsListSchema })
}
