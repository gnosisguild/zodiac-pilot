import { jsonRpcProvider } from '@/utils'
import { EXPLORER_URL } from '@zodiac/chains'
import { useIsPending } from '@zodiac/hooks'
import {
  CompanionAppMessageType,
  type CompanionAppMessage,
} from '@zodiac/messages'
import type { HexAddress, PrefixedAddress } from '@zodiac/schema'
import { errorToast, PrimaryButton, successToast } from '@zodiac/ui'
import type { Eip1193Provider } from 'ethers'
import { SquareArrowOutUpRight } from 'lucide-react'
import { useEffect } from 'react'
import {
  execute,
  ExecutionActionType,
  unprefixAddress,
  type ChainId,
  type ExecutionPlan,
  type ExecutionState,
} from 'ser-kit'
import { useAccount, useConnectorClient } from 'wagmi'

type SignTransactionProps = {
  chainId: ChainId
  walletAddress: HexAddress
  safeAddress: PrefixedAddress
  executionPlan: ExecutionPlan | null
}

export const SignTransaction = ({
  chainId,
  walletAddress,
  safeAddress,
  executionPlan,
}: SignTransactionProps) => {
  const walletAccount = useAccount()
  const { data: connectorClient } = useConnectorClient()

  useEffect(() => {
    if (executionPlan == null) {
      return
    }

    const executePlan = async () => {
      const state: ExecutionState = []
      try {
        await execute(
          executionPlan,
          state,
          connectorClient as Eip1193Provider,
          {
            origin: 'Zodiac Pilot',
          },
        )

        const safeTxHash =
          state[
            executionPlan.findIndex(
              (action) =>
                action.type === ExecutionActionType.PROPOSE_TRANSACTION,
            )
          ]

        if (safeTxHash != null) {
          console.debug(
            `Transaction batch has been proposed with safeTxHash ${safeTxHash}`,
          )

          const url = new URL('/transactions/tx', 'https://app.safe.global')

          url.searchParams.set('safe', safeAddress)
          url.searchParams.set(
            'id',
            `multisig_${unprefixAddress(safeAddress)}_${safeTxHash}`,
          )

          successToast({
            title: 'Transaction batch has been proposed for execution',
            message: (
              <a
                href={url.toString()}
                className="inline-flex items-center gap-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                <SquareArrowOutUpRight size={16} />
                {'View in Safe{Wallet}'}
              </a>
            ),
          })
        } else {
          const txHash =
            state[
              executionPlan.findLastIndex(
                (action) =>
                  action.type === ExecutionActionType.EXECUTE_TRANSACTION,
              )
            ]

          if (txHash) {
            console.debug(
              `Transaction batch has been submitted with transaction hash ${txHash}`,
            )
            const receipt =
              await jsonRpcProvider(chainId).waitForTransaction(txHash)

            console.debug(`Transaction ${txHash} has been executed`, receipt)

            successToast({
              title: 'Transaction batch has been executed',
              message: (
                <a
                  href={new URL(
                    `tx/${txHash}`,
                    EXPLORER_URL[chainId],
                  ).toString()}
                  className="inline-flex items-center gap-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SquareArrowOutUpRight size={16} />
                  View in block explorer
                </a>
              ),
            })
          }
        }

        window.postMessage({
          type: CompanionAppMessageType.SUBMIT_SUCCESS,
        } satisfies CompanionAppMessage)
      } catch (error) {
        console.debug({ error })
        errorToast({
          title: 'Error',
          message: 'Submitting the transaction batch failed',
        })
      }
    }

    executePlan()
  }, [chainId, connectorClient, executionPlan, safeAddress])

  const isSubmitting = useIsPending()

  if (
    walletAccount.chainId !== chainId ||
    walletAccount.address?.toLowerCase() !== walletAddress.toLowerCase() ||
    connectorClient == null
  ) {
    return <PrimaryButton disabled>Sign</PrimaryButton>
  }

  return (
    <PrimaryButton submit busy={isSubmitting}>
      Sign
    </PrimaryButton>
  )
}
