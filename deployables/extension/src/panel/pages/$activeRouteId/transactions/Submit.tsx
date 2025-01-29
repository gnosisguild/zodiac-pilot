import { useCompanionAppUrl } from '@/companion'
import { useExecutionRoute } from '@/execution-routes'
import { useDispatch, useTransactions } from '@/state'
import {
  CompanionAppMessageType,
  type CompanionAppMessage,
} from '@zodiac/messages'
import { encode } from '@zodiac/schema'
import { Modal, PrimaryLinkButton, Spinner } from '@zodiac/ui'
import { useEffect, useState } from 'react'

export const Submit = () => {
  const route = useExecutionRoute()
  const dispatch = useDispatch()
  const { initiator } = route

  const transactions = useTransactions()
  const metaTransactions = transactions.map((tx) => tx.transaction)
  const [submitPending, setSubmitPending] = useState(false)

  const companionAppUrl = useCompanionAppUrl()

  useEffect(() => {
    if (submitPending === false) {
      return
    }

    const handleSubmitSuccess = (message: CompanionAppMessage) => {
      if (message.type !== CompanionAppMessageType.SUBMIT_SUCCESS) {
        return
      }

      setSubmitPending(false)

      dispatch({
        type: 'CLEAR_TRANSACTIONS',
      })
    }

    chrome.runtime.onMessage.addListener(handleSubmitSuccess)

    return () => {
      chrome.runtime.onMessage.removeListener(handleSubmitSuccess)
    }
  }, [dispatch, submitPending])

  return (
    <>
      <PrimaryLinkButton
        fluid
        openInNewWindow
        to={`${companionAppUrl}/submit/${encode(route)}/${encode(metaTransactions)}`}
        disabled={transactions.length === 0}
        onClick={() => setSubmitPending(true)}
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
