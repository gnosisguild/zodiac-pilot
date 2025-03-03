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
  const relevantTxs = txs.filter(
    (tx) =>
      tx.rpc_method === 'eth_sendTransaction' ||
      tx.rpc_method === 'tenderly_sendTransaction',
  )
  for (const tx of relevantTxs) {
    const receipt = await getVnetTxReceipt(rpc, tx.tx_hash)
    if (receipt?.logs) {
      processTransferLogs(receipt.logs, address, deltas)
    }
  }
  return deltas
}
