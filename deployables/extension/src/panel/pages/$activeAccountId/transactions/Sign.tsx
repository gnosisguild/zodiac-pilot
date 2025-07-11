import { useAccount } from '@/accounts'
import { useCompanionAppUrl } from '@/companion'
import { useWindowId } from '@/port-handling'
import { useClearTransactions, useTransactions } from '@/transactions'
import { useAfterSubmit, useIsPending } from '@zodiac/hooks'
import { CompanionAppMessageType, useTabMessageHandler } from '@zodiac/messages'
import {
  encode,
  toMetaTransactionRequest,
  type ExecutionRoute,
} from '@zodiac/schema'
import {
  Form,
  Modal,
  PrimaryButton,
  PrimaryLinkButton,
  Spinner,
} from '@zodiac/ui'
import { useState } from 'react'
import { Intent } from '../intents'

type SignProps = {
  route: ExecutionRoute | null
}

export const Sign = ({ route }: SignProps) => {
  const account = useAccount()
  const windowId = useWindowId()

  const transactions = useTransactions()
  const [signPending, setSignPending] = useState(false)
  const creatingProposal = useIsPending(Intent.CreateProposal)

  const companionAppUrl = useCompanionAppUrl()
  const clearTransactions = useClearTransactions()

  useTabMessageHandler(CompanionAppMessageType.SUBMIT_SUCCESS, () => {
    if (signPending === false) {
      return
    }

    setSignPending(false)

    clearTransactions()
  })

  useAfterSubmit(Intent.CreateProposal, () => setSignPending(true))

  if (route == null || route.initiator == null) {
    return (
      <Form
        context={{ accountId: account.id, windowId }}
        action={`/${account.id}`}
      >
        <PrimaryButton fluid submit intent={Intent.EditAccount}>
          Complete route setup to sign
        </PrimaryButton>
      </Form>
    )
  }

  if (account.remote) {
    return (
      <>
        <Form
          context={{
            transaction: encode(transactions.map(toMetaTransactionRequest)),
          }}
          action={`/${account.id}/${route.id}`}
        >
          <PrimaryButton
            submit
            fluid
            intent={Intent.CreateProposal}
            busy={creatingProposal}
            disabled={transactions.length === 0}
          >
            Sign
          </PrimaryButton>
        </Form>

        <AwaitingSignatureModal
          isOpen={signPending}
          onClose={() => setSignPending(false)}
        />
      </>
    )
  }

  return (
    <>
      <PrimaryLinkButton
        fluid
        openInNewWindow
        to={`${companionAppUrl}/submit/${encode(route)}/${encode(transactions.map(toMetaTransactionRequest))}`}
        disabled={transactions.length === 0}
        onClick={() => setSignPending(true)}
      >
        Sign
      </PrimaryLinkButton>

      <AwaitingSignatureModal
        isOpen={signPending}
        onClose={() => setSignPending(false)}
      />
    </>
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
