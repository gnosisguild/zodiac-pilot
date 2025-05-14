import { useAccount } from '@/accounts'
import { useExecutionRoute } from '@/execution-routes'
import {
  confirmTransaction,
  decodeTransaction,
  finishTransaction,
  revertTransaction,
  useDispatch,
  type UnconfirmedTransaction,
} from '@/state'
import type { HexAddress } from '@zodiac/schema'
import { AbiCoder, BrowserProvider, id, TransactionReceipt } from 'ethers'
import { useCallback } from 'react'
import { failTransaction } from '../state'
import { fetchContractInfo } from '../utils'
import { useProvider } from './ProvideProvider'
import { getModuleAddress } from './getModuleAddress'

export const useSendTransaction = () => {
  const provider = useProvider()
  const dispatch = useDispatch()
  const { chainId, address } = useAccount()
  const route = useExecutionRoute()

  const moduleAddress = getModuleAddress(route)

  return useCallback(
    async (transaction: UnconfirmedTransaction) => {
      dispatch(
        decodeTransaction({
          id: transaction.id,
          // Now we can take some time decoding the transaction and we update the state once that's done.
          contractInfo: await fetchContractInfo(transaction.to, chainId),
        }),
      )

      try {
        const { checkpointId, hash } =
          await provider.sendMetaTransaction(transaction)

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
    [address, chainId, dispatch, moduleAddress, provider],
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
