import { invariant } from '@epic-web/invariant'
import { getHexString, getString } from '@zodiac/form-data'
import { AddressInput, GhostButton, PrimaryButton, TextInput } from '@zodiac/ui'
import { useState } from 'react'
import { Form } from 'react-router'
import { formatUnits, parseEther } from 'viem'
import { useAccount, useBalance, useSendTransaction } from 'wagmi'

const Send = () => {
  const { sendTransaction, isPending } = useSendTransaction()

  const { address } = useAccount()
  const { data: balance } = useBalance({ address })

  const [amount, setAmount] = useState('')

  return (
    <Form
      method="POST"
      onSubmit={(ev) => {
        const data = new FormData(ev.currentTarget)
        sendTransaction({
          to: getHexString(data, 'recipient'),
          value: parseEther(getString(data, 'amount')),
        })

        ev.preventDefault()
        ev.stopPropagation()
      }}
    >
      <AddressInput required label="Recipient" name="recipient" />
      <TextInput
        required
        label="Amount"
        name="amount"
        value={amount}
        onChange={(ev) => setAmount(ev.target.value)}
        after={
          <GhostButton
            size="small"
            disabled={balance == null}
            onClick={() => {
              invariant(balance != null, 'Balance is not loaded')
              setAmount(formatUnits(balance.value, balance.decimals))
            }}
          >
            Max
          </GhostButton>
        }
      />
      <PrimaryButton submit disabled={isPending}>
        Send
      </PrimaryButton>
    </Form>
  )
}

export default Send
