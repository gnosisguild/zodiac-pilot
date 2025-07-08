import { useAccount } from '@/accounts'
import { useWindowId } from '@/port-handling'
import { useTransactions } from '@/transactions'
import { invariant } from '@epic-web/invariant'
import { toMetaTransactionRequest } from '@zodiac/schema'
import { errorToast, Modal, PrimaryButton, Spinner } from '@zodiac/ui'
import { useState } from 'react'
import { Intent } from '../intents'

export const SubmitCallback = () => {
  const account = useAccount()
  const windowId = useWindowId()

  const transactions = useTransactions()
  const [pending, setPending] = useState(false)

  const url = new URL(window.location.href)
  const callback = url.searchParams.get('callback')

  invariant(callback, 'callback is required')

  const submit = () => {
    setPending(true)

    fetch(callback, {
      method: 'POST',
      body: JSON.stringify({
        accountId: account.id,
        windowId,
        transactions: transactions.map(toMetaTransactionRequest),
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .catch((error) => {
        console.error(error)

        errorToast({
          title: 'Submitting the transaction batch failed',
          message: error instanceof Error ? error.message : undefined,
        })
      })
      .finally(() => setPending(false))
  }

  return (
    <>
      <PrimaryButton fluid onClick={submit} intent={Intent.SubmitCallback}>
        Submit
      </PrimaryButton>

      <SubmittingModal isOpen={pending} onClose={() => setPending(false)} />
    </>
  )
}

type Props = {
  isOpen: boolean
  onClose(): void
}
const SubmittingModal = ({ isOpen, onClose }: Props) => (
  <Modal
    open={isOpen}
    title="Submitting the batch transaction"
    onClose={onClose}
  >
    <div className="flex items-center gap-2">
      <Spinner /> Submitting ...
    </div>
  </Modal>
)
