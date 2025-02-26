import { useCompanionAppUrl } from '@/companion'
import { useExecutionRoute } from '@/execution-routes'
import { useDispatch, useTransactions } from '@/state'
import { CompanionAppMessageType, useMessageHandler } from '@zodiac/messages'
import { encode } from '@zodiac/schema'
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

  useMessageHandler(CompanionAppMessageType.SUBMIT_SUCCESS, () => {
    if (submitPending === false) {
      return
    }

    setSubmitPending(false)

    dispatch({
      type: 'CLEAR_TRANSACTIONS',
    })
  })

  return initiator != null ? (
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

      <AwaitingSignatureModal
        isOpen={submitPending}
        onClose={() => setSubmitPending(false)}
      />
    </>
  ) : (
    <PrimaryLinkButton
      fluid
      openInNewWindow
      to={`${companionAppUrl}/edit/${encode(route)}`}
    >
      Complete route setup to submit
    </PrimaryLinkButton>
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
