import { getVnetTransactionList } from './getVnetTransactionList'
import { getVnetTxReceipt } from './getVnetTxReceipt'
import { processTransferLogs } from './helper'

export const getVnetTransactionDelta = async (
  vnetId: string,
  rpc: string,
  address: string,
) => {
  const txs = await getVnetTransactionList(vnetId)
  const deltas: Record<string, bigint> = {}
  const relevantTxs = txs.filter((tx) => {
    const method = tx.rpc_method
    return (
      (method === 'eth_sendTransaction' ||
        method === 'tenderly_sendTransaction') &&
      typeof tx.tx_hash === 'string'
    )
  })
  for (const tx of relevantTxs) {
    if (!tx.tx_hash) continue
    const receipt = await getVnetTxReceipt(rpc, tx.tx_hash)
    if (receipt?.logs) {
      processTransferLogs(receipt.logs, address, deltas)
    }
  }
  return deltas
}
