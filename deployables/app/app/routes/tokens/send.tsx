import { getHexString, getString } from '@zodiac/form-data'
import {
  AddressInput,
  PilotType,
  PrimaryButton,
  ZodiacOsPlain,
} from '@zodiac/ui'
import { Form } from 'react-router'
import { parseEther } from 'viem'
import { useSendTransaction } from 'wagmi'
import { TokenValueInput } from './TokenValueInput'

const Send = () => {
  const { sendTransaction, isPending } = useSendTransaction()

  return (
    <div className="flex h-full flex-col">
      <header className="mx-auto my-16 flex w-3/4 items-center justify-between gap-4 md:w-1/2 2xl:w-1/4">
        <div className="flex items-center gap-4">
          <ZodiacOsPlain className="h-6 lg:h-8" />
          <PilotType className="h-8 lg:h-10 dark:invert" />
        </div>

        <h1 className="text-3xl font-extralight">Send tokens</h1>
      </header>

      <main
        role="main"
        className="mx-auto flex w-3/4 flex-1 flex-col gap-4 md:w-1/2 2xl:w-1/4"
      >
        <Form
          method="POST"
          className="flex flex-col gap-4"
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

          <TokenValueInput required label="Amount" name="amount" />

          <PrimaryButton submit disabled={isPending}>
            Send
          </PrimaryButton>
        </Form>
      </main>
    </div>
  )
}

export default Send
