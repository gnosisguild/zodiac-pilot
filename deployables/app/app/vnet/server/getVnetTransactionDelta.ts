import type { TokenBalance } from '@/balances-server'
import type { HexAddress } from '@zodiac/schema'
import { createPublicClient, http } from 'viem'
import { computeNativeDiff } from './computeNativeDiff'
import { getVnetTransactions } from './getVnetTransactions'
import { getVnetTxReceipt } from './getVnetTxReceipt'
import { processTransferLogs } from './processTransferLogs'

export const getVnetTransactionDelta = async (
  vnetId: string,
  rpc: string,
  address: HexAddress,
  baselineBalances: TokenBalance[],
  chain: string,
) => {
  const transactions = await getVnetTransactions(vnetId)

  const relevantTransactions = transactions.filter(
    ({ rpc_method }) =>
      rpc_method === 'eth_sendTransaction' ||
      rpc_method === 'tenderly_addErc20Balance' ||
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

  const erc20Deltas = receipts.reduce<Record<string, bigint>>(
    (acc, receipt) => {
      if (!receipt) return acc
      return processTransferLogs(acc, receipt.logs, address)
    },
    {},
  )

  const client = createPublicClient({ transport: http(rpc) })
  const forkNativeBalance = await client.getBalance({ address })

  const baselineNative = baselineBalances.find(
    (b) => b.contractId.toLowerCase() === chain.toLowerCase(),
  )

  if (baselineNative) {
    const diff = computeNativeDiff(baselineNative, forkNativeBalance)
    if (diff !== 0n) {
      erc20Deltas[chain.toLowerCase()] =
        (erc20Deltas[chain.toLowerCase()] ?? 0n) + diff
    }
  }
  return erc20Deltas
}
