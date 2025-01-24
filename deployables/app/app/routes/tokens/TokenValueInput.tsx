import { invariant } from '@epic-web/invariant'
import { GhostButton, NumberInput, type NumberInputProps } from '@zodiac/ui'
import { useState } from 'react'
import { formatUnits } from 'viem'
import { useAccount, useBalance } from 'wagmi'

type TokenValueInputProps = Omit<
  NumberInputProps,
  'value' | 'onChange' | 'defaultValue' | 'after'
>

export const TokenValueInput = (props: TokenValueInputProps) => {
  const { address } = useAccount()
  const { data: balance } = useBalance({ address })

  const [amount, setAmount] = useState('')

  return (
    <NumberInput
      {...props}
      value={amount}
      onChange={(ev) => setAmount(ev.target.value)}
      after={
        <GhostButton
          size="tiny"
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
  )
}
