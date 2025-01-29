import { useCompanionAppUrl } from '@/companion'
import { useExecutionRoute } from '@/execution-routes'
import { useDispatch, useTransactions } from '@/state'
import {
  CompanionAppMessageType,
  type CompanionAppMessage,
} from '@zodiac/messages'
import { Modal, PrimaryLinkButton, Spinner } from '@zodiac/ui'
import { useState } from 'react'

export const Submit = () => {
  const route = useExecutionRoute()
  const dispatch = useDispatch()
  const { initiator } = route

  const transactions = useTransactions()
  const metaTransactions = transactions.map((tx) => tx.transaction)
  const [submitPending, setSubmitPending] = useState(false)

  const companionAppUrl = useCompanionAppUrl()

  const waitForSubmit = async () => {
    // if (!connected) {
    //   invariant(connect != null, 'No connect method present')

    //   const success = await connect()
    //   if (!success) {
    //     const chainName = CHAIN_NAME[chainId] || `#${chainId}`
    //     errorToast({
    //       title: 'Error',
    //       message: `Switch your wallet to ${chainName} to submit the transactions`,
    //     })
    //     return
    //   }
    // }

    // invariant(submitTransactions != null, 'Cannot submit transactions')

    setSubmitPending(true)

    const handleSubmitSuccess = (message: CompanionAppMessage) => {
      if (message.type === CompanionAppMessageType.SUBMIT_SUCCESS) {
        chrome.runtime.onMessage.removeListener(handleSubmitSuccess)

        setSubmitPending(false)

        dispatch({
          type: 'CLEAR_TRANSACTIONS',
        })
      }
    }
    chrome.runtime.onMessage.addListener(handleSubmitSuccess)

    // let result: {
    //   txHash?: `0x${string}`
    //   safeTxHash?: `0x${string}`
    // }
    // try {
    //   result = await submitTransactions()
    // } catch (e) {
    //   console.warn(e)
    //   setSubmitPending(false)
    //   const err = e as JsonRpcError

    //   errorToast({
    //     title: 'Submitting the transaction batch failed',
    //     message: name,
    //   })
    //   return
    // }
    // setSubmitPending(false)

    // const { txHash, safeTxHash } = result
    // if (txHash) {
    //   console.debug(
    //     `Transaction batch has been submitted with transaction hash ${txHash}`,
    //   )
    //   const receipt =
    //     await getReadOnlyProvider(chainId).waitForTransaction(txHash)
    //   console.debug(`Transaction ${txHash} has been executed`, receipt)

    //   successToast({
    //     title: 'Transaction batch has been executed',
    //     message: (
    //       <a
    //         href={`${EXPLORER_URL[chainId]}/tx/${txHash}`}
    //         className="inline-flex items-center gap-1"
    //         target="_blank"
    //         rel="noopener noreferrer"
    //       >
    //         <SquareArrowOutUpRight size={16} />
    //         View in block explorer
    //       </a>
    //     ),
    //   })
    // }

    // if (safeTxHash) {
    //   console.debug(
    //     `Transaction batch has been proposed with safeTxHash ${safeTxHash}`,
    //   )
    //   const avatarAddress = parsePrefixedAddress(avatar)
    //   successToast({
    //     title: 'Transaction batch has been proposed for execution',
    //     message: (
    //       <a
    //         href={`https://app.safe.global/transactions/tx?safe=${avatar}&id=multisig_${avatarAddress}_${safeTxHash}`}
    //         className="inline-flex items-center gap-1"
    //         target="_blank"
    //         rel="noopener noreferrer"
    //       >
    //         <SquareArrowOutUpRight size={16} />
    //         {'View in Safe{Wallet}'}
    //       </a>
    //     ),
    //   })

    //   // In case the other safe owners are quick enough to sign while the Pilot session is still open, we can show a toast with an execution confirmation
    //   const txHash = await waitForMultisigExecution(chainId, safeTxHash)
    //   console.debug(
    //     `Proposed transaction batch with safeTxHash ${safeTxHash} has been confirmed and executed with transaction hash ${txHash}`,
    //   )
    //   successToast({
    //     title: 'Proposed Safe transaction has been confirmed and executed',
    //     message: (
    //       <a
    //         href={`${EXPLORER_URL[chainId]}/tx/${txHash}`}
    //         className="inline-flex items-center gap-1"
    //         target="_blank"
    //         rel="noopener noreferrer"
    //       >
    //         <SquareArrowOutUpRight size={16} />
    //         View in block explorer
    //       </a>
    //     ),
    //   })
    // }
  }

  return (
    <>
      <PrimaryLinkButton
        fluid
        openInNewWindow
        to={`${companionAppUrl}/submit/${btoa(JSON.stringify(route))}/${btoa(
          JSON.stringify(metaTransactions, (_, value) => {
            if (typeof value === 'bigint') {
              return value.toString()
            }

            return value
          }),
        )}`}
        disabled={transactions.length === 0}
        onClick={waitForSubmit}
      >
        Submit
      </PrimaryLinkButton>

      {initiator && (
        <AwaitingSignatureModal
          isOpen={submitPending}
          onClose={() => setSubmitPending(false)}
        />
      )}
    </>
  )
}

type Props = {
  isOpen: boolean
  onClose(): void
}
const AwaitingSignatureModal = ({ isOpen, onClose }: Props) => (
  <Modal
    open={isOpen}
    title="Sign the batch transaction"
    closeLabel="Abort transaction"
    onClose={onClose}
  >
    <div className="flex items-center gap-2">
      <Spinner /> Awaiting your signature ...
    </div>
  </Modal>
)
