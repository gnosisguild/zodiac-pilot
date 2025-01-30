import { getHexString, getString } from '@zodiac/form-data'
import {
  AddressInput,
  Error as ErrorAlert,
  Form,
  PrimaryButton,
} from '@zodiac/ui'
import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useSendTransaction } from 'wagmi'
import type { Route } from './+types/send'
import { TokenValueInput } from './TokenValueInput'

export const meta: Route.MetaFunction = () => [{ title: 'Pilot | Send tokens' }]

const Send = () => {
  const { sendTransaction, isPending, error, isSuccess } = useSendTransaction()
  const navigate = useNavigate()

  useEffect(() => {
    if (isSuccess) {
      navigate('../balances')
    }
  }, [isSuccess, navigate])

  return (
    <Form
      onSubmit={(ev) => {
        const data = new FormData(ev.currentTarget)

        sendTransaction({
          to: getHexString(data, 'recipient'),
          value: BigInt(getString(data, 'amount')),
        })

        ev.preventDefault()
        ev.stopPropagation()
      }}
    >
      <AddressInput required label="Recipient" name="recipient" />

      <TokenValueInput required label="Amount" name="amount" />

      <Form.Actions>
        <PrimaryButton fluid submit disabled={isPending}>
          {isPending ? 'Sending...' : 'Send'}
        </PrimaryButton>
      </Form.Actions>

      {error && <ErrorAlert title={error.message}>{error.stack}</ErrorAlert>}
    </Form>
  )
}

export default Send

export const ErrorBoundary = ({ error }: Route.ErrorBoundaryProps) => {
  if (error instanceof Error) {
    return (
      <ErrorAlert title="Sending tokens is not possible">
        {error.message}
      </ErrorAlert>
    )
  }
}
