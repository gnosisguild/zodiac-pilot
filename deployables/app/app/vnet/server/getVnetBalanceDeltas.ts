import { TokenBalance } from '@/balances-server'
import { type HexAddress } from '@zodiac/schema'
import { createPublicClient, http, parseUnits } from 'viem'
import { getVnetTransactions } from './getVnetTransactions'
import { getVnetTxReceipt } from './getVnetTxReceipt'
import { processTransferLogs } from './processTransferLogs'

export const getVnetErc20Deltas = async (
  vnetId: string,
  rpc: string,
  address: HexAddress,
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

  return erc20Deltas
}

export const getVnetNativeDelta = async (
  rpc: string,
  address: HexAddress,
  nativeTokenId: string,
  allBalances: TokenBalance[],
) => {
  const client = createPublicClient({ transport: http(rpc) })
  const forkBalance = await client.getBalance({ address })

  const nativeTokenBaselineBalance = parseUnits(
    allBalances.find(
      (b) => b.contractId.toLowerCase() === nativeTokenId.toLowerCase(),
    )?.amount ?? '0',
    18,
  )

  if (nativeTokenBaselineBalance == null) {
    return { [nativeTokenId]: forkBalance }
  }

  return { [nativeTokenId]: forkBalance - nativeTokenBaselineBalance }
}
