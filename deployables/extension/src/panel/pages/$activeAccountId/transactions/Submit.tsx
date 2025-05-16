import { useAccount } from '@/accounts'
import { useCompanionAppUrl } from '@/companion'
import { useExecutionRoute } from '@/execution-routes'
import { useWindowId } from '@/providers-ui'
import { clearTransactions, useDispatch, useTransactions } from '@/state'
import { CompanionAppMessageType, useTabMessageHandler } from '@zodiac/messages'
import { encode, toMetaTransactionRequest } from '@zodiac/schema'
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
  const windowId = useWindowId()

  const transactions = useTransactions()
  const [submitPending, setSubmitPending] = useState(false)

  const companionAppUrl = useCompanionAppUrl()

  useTabMessageHandler(CompanionAppMessageType.SUBMIT_SUCCESS, () => {
    if (submitPending === false) {
      return
    }

    setSubmitPending(false)

    dispatch(clearTransactions())
  })

  if (route != null && route.initiator != null) {
    return (
      <>
        <PrimaryLinkButton
          fluid
          openInNewWindow
          to={
            account.remote
              ? `${companionAppUrl}/submit/account/${account.id}/${encode(transactions.map(toMetaTransactionRequest))}`
              : `${companionAppUrl}/submit/${encode(route)}/${encode(transactions.map(toMetaTransactionRequest))}`
          }
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
    )
  }

  return (
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
  <Modal open={isOpen} title="Sign the batch transaction" onClose={onClose}>
    <div className="flex items-center gap-2">
      <Spinner /> Awaiting your signature ...
    </div>
  </Modal>
)
