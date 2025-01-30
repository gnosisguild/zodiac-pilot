import { Page } from '@/components'
import { getHexString, getString } from '@zodiac/form-data'
import { AddressInput, Error, Form, PrimaryButton } from '@zodiac/ui'
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
    <Page>
      <Page.Header>Send tokens</Page.Header>

      <Page.Main>
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

          {error && <Error title={error.message}>{error.stack}</Error>}
        </Form>
      </Page.Main>
    </Page>
  )
}

export default Send
