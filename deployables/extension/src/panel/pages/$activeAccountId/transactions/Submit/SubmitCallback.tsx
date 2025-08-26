import { useAccount } from '@/accounts'
import { AD_HOC_ROUTE_ID } from '@/execution-routes'
import { useClearTransactions, useTransactions } from '@/transactions'
import { invariant } from '@epic-web/invariant'
import { jsonStringify, toMetaTransactionRequest } from '@zodiac/schema'
import {
  errorToast,
  Modal,
  PrimaryButton,
  Spinner,
  successToast,
} from '@zodiac/ui'
import { useState } from 'react'

export const SubmitCallback = () => {
  const transactions = useTransactions()
  const [pending, setPending] = useState(false)

  const callback = useSubmitCallback()
  const clearTransactions = useClearTransactions()
  invariant(callback, 'callback is required')

  const submit = () => {
    setPending(true)

    fetch(callback, {
      method: 'POST',
      body: jsonStringify(
        transactions.map(toMetaTransactionRequest),
        undefined,
        {
          noInternalRepresentation: true,
        },
      ),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          errorToast({
            title: 'Submitting the transaction batch failed',
            message: `The callback service returned an error: ${response.statusText}`,
          })
          return
        }

        // successfully submitted the transaction batch
        successToast({
          title: 'Transaction batch submitted',
          message: 'Successfully submitted the transaction batch.',
        })
        clearTransactions()
      })
      .catch((error) => {
        console.error(error)
        let message = error instanceof Error ? error.message : undefined
        if (message === 'Failed to fetch') {
          message = `Could not connect to the callback service at ${callback}.`
        }

        errorToast({
          title: 'Submitting the transaction batch failed',
          message: message,
        })
      })
      .finally(() => setPending(false))
  }

  return (
    <>
      <PrimaryButton
        fluid
        disabled={transactions.length === 0}
        onClick={submit}
      >
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

/**
 * Returns the callback URL to which to send the transaction batch instead of proceeding with the default flow of taking the user to the sign page.
 * Returns null if no callback is to be used.
 * Callbacks are only active for ad-hoc routes and set via the `callback` query parameter.
 **/
export const useSubmitCallback = () => {
  const { id } = useAccount()
  const isUsingAdHocRoute = id === AD_HOC_ROUTE_ID

  if (!isUsingAdHocRoute) return null

  const url = new URL(window.location.href)
  return url.searchParams.get('callback') || null
}
