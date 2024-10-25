import { getChainId } from '@/chains'
import { Eip1193Provider } from '@/types'
import { useZodiacRoute } from '@/zodiac-routes'
import { invariant } from '@epic-web/invariant'
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import { AbiCoder, BrowserProvider, id, TransactionReceipt } from 'ethers'
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react'
import { ConnectionType, parsePrefixedAddress } from 'ser-kit'
import { ExecutionStatus, useDispatch } from '../state'
import { fetchContractInfo } from '../utils/abi'
import { ForkProvider } from './ForkProvider'
import { ProvideSubmitTransactionContext } from './SubmitTransactionContext'

const ProviderContext = createContext<
  (Eip1193Provider & { getTransactionLink(txHash: string): string }) | null
>(null)

export const ProvideProvider = ({ children }: PropsWithChildren) => {
  const route = useZodiacRoute()
  const chainId = getChainId(route.avatar)

  const dispatch = useDispatch()

  const [, avatarAddress] = parsePrefixedAddress(route.avatar)
  const avatarWaypoint = route.waypoints?.[route.waypoints.length - 1]
  const connectionType =
    avatarWaypoint &&
    'connection' in avatarWaypoint &&
    avatarWaypoint.connection.type
  const [, connectedFrom] =
    (avatarWaypoint &&
      'connection' in avatarWaypoint &&
      parsePrefixedAddress(avatarWaypoint.connection.from)) ||
    []

  const moduleAddress =
    connectionType === ConnectionType.IS_ENABLED ? connectedFrom : undefined
  const ownerAddress =
    connectionType === ConnectionType.OWNS ? connectedFrom : undefined

  const onBeforeTransactionSend = useCallback(
    async (id: string, transaction: MetaTransactionData) => {
      // Immediately update the state with the transaction so that the UI can show it as pending.
      dispatch({
        type: 'APPEND_TRANSACTION',
        payload: { transaction, id },
      })

      // Now we can take some time decoding the transaction and we update the state once that's done.
      const contractInfo = await fetchContractInfo(
        transaction.to as `0x${string}`,
        chainId
      )
      dispatch({
        type: 'DECODE_TRANSACTION',
        payload: {
          id,
          contractInfo,
        },
      })
    },
    [chainId, dispatch]
  )

  const onTransactionSent = useCallback(
    async (
      id: string,
      snapshotId: string,
      transactionHash: string,
      provider: Eip1193Provider
    ) => {
      dispatch({
        type: 'CONFIRM_TRANSACTION',
        payload: {
          id,
          snapshotId,
          transactionHash,
        },
      })

      const receipt = await new BrowserProvider(provider).getTransactionReceipt(
        transactionHash
      )
      if (!receipt?.status) {
        dispatch({
          type: 'UPDATE_TRANSACTION_STATUS',
          payload: {
            id,
            status: ExecutionStatus.FAILED,
          },
        })
        return
      }

      if (
        receipt.logs.length === 1 &&
        isExecutionFailure(receipt.logs[0], avatarAddress, moduleAddress)
      ) {
        dispatch({
          type: 'UPDATE_TRANSACTION_STATUS',
          payload: {
            id,
            status: ExecutionStatus.META_TRANSACTION_REVERTED,
          },
        })
      } else {
        dispatch({
          type: 'UPDATE_TRANSACTION_STATUS',
          payload: {
            id,
            status: ExecutionStatus.SUCCESS,
          },
        })
      }
    },
    [dispatch, avatarAddress, moduleAddress]
  )

  const forkProviderRef = useRef<ForkProvider | null>(null)

  // whenever anything changes in the connection settings, we delete the current fork and start afresh
  useEffect(() => {
    forkProviderRef.current = new ForkProvider({
      chainId,
      avatarAddress,
      moduleAddress,
      ownerAddress,
      onBeforeTransactionSend,
      onTransactionSent,
    })
    return () => {
      forkProviderRef.current?.deleteFork()
    }
  }, [
    chainId,
    avatarAddress,
    moduleAddress,
    ownerAddress,
    onBeforeTransactionSend,
    onTransactionSent,
  ])

  if (!forkProviderRef.current) {
    return null
  }

  return (
    <ProviderContext.Provider value={forkProviderRef.current}>
      <ProvideSubmitTransactionContext>
        {children}
      </ProvideSubmitTransactionContext>
    </ProviderContext.Provider>
  )
}

export const useProvider = () => {
  const provider = useContext(ProviderContext)

  invariant(
    provider != null,
    'useProvider() must be used within a <ProvideProvider/>'
  )

  return provider
}

const isExecutionFailure = (
  log: TransactionReceipt['logs'][0],
  avatarAddress: string,
  moduleAddress?: string
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
