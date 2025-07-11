import { useAccount } from '@/accounts'
import { useOptionalExecutionRoute } from '@/execution-routes'
import type { HexAddress } from '@zodiac/schema'
import { AbiCoder, BrowserProvider, id, TransactionReceipt } from 'ethers'
import { useCallback } from 'react'
import { useProvider } from './ProvideForkProvider'
import { useDispatch } from './TransactionsContext'
import {
  confirmTransaction,
  failTransaction,
  finishTransaction,
  revertTransaction,
} from './actions'
import { getModuleAddress } from './getModuleAddress'
import type { UnconfirmedTransaction } from './state'

export const useSendTransaction = () => {
  const provider = useProvider()
  const dispatch = useDispatch()
  const { address } = useAccount()
  const route = useOptionalExecutionRoute()

  const moduleAddress = getModuleAddress(route)

  return useCallback(
    async (transaction: UnconfirmedTransaction) => {
      try {
        const { checkpointId, hash } =
          await provider.sendMetaTransaction(transaction)

        provider.emit('transactionEnd', transaction, hash)

        dispatch(
          confirmTransaction({
            id: transaction.id,
            snapshotId: checkpointId,
            transactionHash: hash,
          }),
        )

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
            moduleAddress,
          )
        ) {
          dispatch(revertTransaction({ id: transaction.id }))
        } else {
          dispatch(finishTransaction({ id: transaction.id }))
        }
      } catch (error) {
        console.debug(`Transaction ${transaction.id} failed`, { error })

        dispatch(failTransaction({ id: transaction.id }))
      }
    },
    [address, dispatch, moduleAddress, provider],
  )
}

const isExecutionFailure = (
  log: TransactionReceipt['logs'][0],
  avatarAddress: HexAddress,
  moduleAddress?: HexAddress,
) => {
  if (log.address.toLowerCase() !== avatarAddress.toLowerCase()) {
    return false
  }

  if (moduleAddress) {
    return (
      log.topics[0] === id('ExecutionFromModuleFailure(address)') &&
      log.topics[1] ===
        AbiCoder.defaultAbiCoder().encode(['address'], [moduleAddress])
    )
  }

  return log.topics[0] === id('ExecutionFailure(bytes32, uint256)')
}
