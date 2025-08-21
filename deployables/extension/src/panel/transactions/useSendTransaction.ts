import { useAccount } from '@/accounts'
import { useOptionalExecutionRoute } from '@/execution-routes'
import type { ExecutionRoute, HexAddress } from '@zodiac/schema'
import { AbiCoder, BrowserProvider, id, TransactionReceipt } from 'ethers'
import { useCallback } from 'react'
import { TransactionResult } from '../providers/fork-provider/ForkProvider'
import {
  getSimulationModuleAddress,
  useForkProvider,
} from './ProvideForkProvider'
import { useDispatch } from './TransactionsContext'
import {
  confirmTransaction,
  failTransaction,
  finishTransaction,
  revertTransaction,
} from './actions'
import type { UnconfirmedTransaction } from './state'

export const useSendTransaction = () => {
  const provider = useForkProvider()
  const dispatch = useDispatch()
  const { address } = useAccount()
  const route = useOptionalExecutionRoute()

  return useCallback(
    async (transaction: UnconfirmedTransaction) => {
      let result: TransactionResult
      try {
        result = await provider.sendMetaTransaction(transaction)
        provider.emit('transactionEnd', transaction, { hash: result.hash })
      } catch (error) {
        console.error(`Error executing transaction ${transaction.id}`, {
          error,
        })
        const message = error instanceof Error ? error.message : String(error)
        provider.emit('transactionEnd', transaction, {
          hash: null,
          error: message,
        })
        return
      }

      const { checkpointId, hash } = result

      dispatch(
        confirmTransaction({
          id: transaction.id,
          snapshotId: checkpointId,
          transactionHash: hash,
        }),
      )

      try {
        const receipt = await new BrowserProvider(
          provider,
        ).getTransactionReceipt(hash)

        if (receipt == null || receipt.status == null) {
          dispatch(failTransaction({ id: transaction.id }))

          return
        }

        if (
          isExecutionFailure(
            receipt.logs[receipt.logs.length - 1],
            address,
            route,
          )
        ) {
          dispatch(revertTransaction({ id: transaction.id }))
        } else {
          dispatch(finishTransaction({ id: transaction.id }))
        }
      } catch (error) {
        console.error(`Transaction ${transaction.id} failed`, { error })
        dispatch(failTransaction({ id: transaction.id }))
      }
    },
    [dispatch, address, route, provider],
  )
}

const isExecutionFailure = (
  log: TransactionReceipt['logs'][0],
  avatarAddress: HexAddress,
  route: ExecutionRoute | null,
) => {
  if (log.address.toLowerCase() !== avatarAddress.toLowerCase()) {
    return false
  }

  const simulationModuleAddress = getSimulationModuleAddress(route)

  if (simulationModuleAddress) {
    return (
      log.topics[0] === id('ExecutionFromModuleFailure(address)') &&
      log.topics[1] ===
        AbiCoder.defaultAbiCoder().encode(
          ['address'],
          [simulationModuleAddress],
        )
    )
  }

  return log.topics[0] === id('ExecutionFailure(bytes32, uint256)')
}
