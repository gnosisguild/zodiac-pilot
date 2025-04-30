import { sentry } from '@/sentry'
import { jsonRpcProvider } from '@/utils'
import { EXPLORER_URL } from '@zodiac/chains'
import { useIsPending, useStableHandler } from '@zodiac/hooks'
import {
  CompanionAppMessageType,
  type CompanionAppMessage,
} from '@zodiac/messages'
import type { HexAddress } from '@zodiac/schema'
import { errorToast, PrimaryButton, successToast } from '@zodiac/ui'
import type { Eip1193Provider } from 'ethers'
import { SquareArrowOutUpRight } from 'lucide-react'
import { useEffect } from 'react'
import {
  execute,
  ExecutionActionType,
  prefixAddress,
  type ChainId,
  type ExecutionPlan,
  type ExecutionState,
} from 'ser-kit'
import { useAccount, useConnectorClient } from 'wagmi'

type MultiSigResult = {
  safeWalletUrl: string
}

type TransactionResult = {
  explorerUrl: string
}

type OnSignOptions = MultiSigResult | TransactionResult

type SignTransactionProps = {
  chainId: ChainId
  walletAddress: HexAddress
  safeAddress: HexAddress
  executionPlan: ExecutionPlan | null

  intent?: string
  onSign?: (options: OnSignOptions) => void
}

export const SignTransaction = ({
  chainId,
  walletAddress,
  safeAddress,
  executionPlan,
  intent,
  onSign,
}: SignTransactionProps) => {
  const walletAccount = useAccount()
  const { data: connectorClient } = useConnectorClient()

  const onSignRef = useStableHandler(onSign)

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

          url.searchParams.set('safe', prefixAddress(chainId, safeAddress))
          url.searchParams.set('id', `multisig_${safeAddress}_${safeTxHash}`)

          if (onSignRef.current) {
            onSignRef.current({ safeWalletUrl: url.toString() })
          }

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

            const url = new URL(`tx/${txHash}`, EXPLORER_URL[chainId])

            if (onSignRef.current) {
              onSignRef.current({ explorerUrl: url.toString() })
            }

            successToast({
              title: 'Transaction batch has been executed',
              message: (
                <a
                  href={url.toString()}
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

        window.postMessage(
          {
            type: CompanionAppMessageType.SUBMIT_SUCCESS,
          } satisfies CompanionAppMessage,
          '*',
        )
      } catch (error) {
        console.debug({ error })

        sentry.captureException(error)

        errorToast({
          title: 'Signing the transaction batch failed',
          message: error instanceof Error ? error.message : undefined,
        })
      }
    }

    executePlan()
  }, [chainId, connectorClient, executionPlan, onSignRef, safeAddress])

  const isSubmitting = useIsPending()

  if (
    walletAccount.chainId !== chainId ||
    walletAccount.address?.toLowerCase() !== walletAddress.toLowerCase() ||
    connectorClient == null
  ) {
    return <PrimaryButton disabled>Sign</PrimaryButton>
  }

  return (
    <PrimaryButton submit intent={intent} busy={isSubmitting}>
      Sign
    </PrimaryButton>
  )
}
