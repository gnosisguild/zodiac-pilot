import { getVnetTransactions } from './getVnetTransactions'
import { getVnetTxReceipt } from './getVnetTxReceipt'
import { processTransferLogs } from './helper'

export const getVnetTransactionDelta = async (
  vnetId: string,
  rpc: string,
  address: string,
) => {
  const transactions = await getVnetTransactions(vnetId)

  const relevantTransactions = transactions.filter(
    ({ rpc_method }) =>
      rpc_method === 'eth_sendTransaction' ||
      rpc_method === 'tenderly_sendTransaction',
  )

  const receipts = await Promise.all(
    relevantTransactions.map(({ tx_hash }) => {
      if (tx_hash == null) {
        return null
      }

      return getVnetTxReceipt(rpc, tx_hash)
    }),
  )

  return receipts.reduce((deltas, receipt) => {
    if (receipt == null) {
      return deltas
    }

    return processTransferLogs(deltas, receipt.logs, address)
  }, {})
}
