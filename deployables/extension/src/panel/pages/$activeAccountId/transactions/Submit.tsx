import { useAccount, useCompanionAppUrl } from '@/companion'
import { useExecutionRoute } from '@/execution-routes'
import { useWindowId } from '@/inject-bridge'
import { useDispatch, useTransactions } from '@/state'
import { CompanionAppMessageType, useTabMessageHandler } from '@zodiac/messages'
import { encode } from '@zodiac/schema'
import {
  Form,
  Modal,
  PrimaryButton,
  PrimaryLinkButton,
  Spinner,
} from '@zodiac/ui'
import { useState } from 'react'
import { Intent } from './intents'

export const Submit = () => {
  const account = useAccount()
  const route = useExecutionRoute()
  const dispatch = useDispatch()
  const { initiator } = route
  const windowId = useWindowId()

  const transactions = useTransactions()
  const metaTransactions = transactions.map((tx) => tx.transaction)
  const [submitPending, setSubmitPending] = useState(false)

  const companionAppUrl = useCompanionAppUrl()

  useTabMessageHandler(CompanionAppMessageType.SUBMIT_SUCCESS, () => {
    if (submitPending === false) {
      return
    }

    setSubmitPending(false)

    if (transactions.length > 0) {
      dispatch({
        type: 'CLEAR_TRANSACTIONS',
        payload: { id: transactions[0].id },
      })
    }
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
    <Form context={{ accountId: account.id, windowId }}>
      <PrimaryButton fluid submit intent={Intent.EditAccount}>
        Complete route setup to submit
      </PrimaryButton>
    </Form>
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
