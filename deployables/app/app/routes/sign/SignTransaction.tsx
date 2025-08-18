import { sentry } from '@/sentry-client'
import { jsonRpcProvider } from '@/utils'
import { explorerUrl } from '@zodiac/chains'
import { useIsPending, useStableHandler } from '@zodiac/hooks'
import { CompanionAppMessageType, companionRequest } from '@zodiac/messages'
import { multisigTransactionUrl } from '@zodiac/safe'
import type { Hex, HexAddress } from '@zodiac/schema'
import { errorToast, PrimaryButton, successToast } from '@zodiac/ui'
import { useAccount, useConnectorClient } from '@zodiac/web3'
import type { Eip1193Provider } from 'ethers'
import { SquareArrowOutUpRight } from 'lucide-react'
import { useEffect } from 'react'
import {
  execute,
  ExecutionActionType,
  type ChainId,
  type ExecutionPlan,
  type ExecutionState,
} from 'ser-kit'

type MultiSigResult = {
  safeWalletUrl: string
}

type TransactionResult = {
  explorerUrl: string
}

type OnSignOptions = (MultiSigResult | TransactionResult) & {
  transactionHash: Hex
}

type SignTransactionProps = {
  chainId: ChainId
  walletAddress: HexAddress
  safeAddress: HexAddress
  executionPlan: ExecutionPlan | null

  disabled?: boolean
  intent?: string
  onSign?: (options: OnSignOptions) => void
}

export const SignTransaction = ({
  chainId,
  walletAddress,
  safeAddress,
  executionPlan,
  intent,
  disabled = false,
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

        companionRequest({ type: CompanionAppMessageType.SUBMIT_SUCCESS })

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

          const url = multisigTransactionUrl(chainId, safeAddress, safeTxHash)

          if (onSignRef.current) {
            onSignRef.current({
              safeWalletUrl: url.toString(),
              transactionHash: safeTxHash,
            })
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

            const url = new URL(`tx/${txHash}`, explorerUrl(chainId))

            if (onSignRef.current) {
              onSignRef.current({
                explorerUrl: url.toString(),
                transactionHash: txHash,
              })
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
    disabled ||
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
