import { useTokenBalances } from '@/balances-client'
import { invariant } from '@epic-web/invariant'
import {
  GhostButton,
  NumberInput,
  Select,
  type NumberInputProps,
} from '@zodiac/ui'
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
  const [tokenBalances] = useTokenBalances()

  const [amount, setAmount] = useState('')

  return (
    <NumberInput
      {...props}
      value={amount}
      onChange={(ev) => setAmount(ev.target.value)}
      step="any"
      min={0}
      max={
        balance == null
          ? undefined
          : formatUnits(balance.value, balance.decimals)
      }
      after={
        <div className="mr-1">
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

          <Select
            label="Available tokens"
            options={tokenBalances.map(({ name }) => ({
              value: name,
            }))}
          />
        </div>
      }
    />
  )
}
