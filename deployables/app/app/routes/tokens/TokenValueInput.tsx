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

type TokenValueInputProps = Omit<
  NumberInputProps,
  'value' | 'onChange' | 'defaultValue' | 'after'
>

export const TokenValueInput = (props: TokenValueInputProps) => {
  const [maxBalance, setMaxBalance] = useState<string | null>(null)
  const [tokenBalances] = useTokenBalances()

  const [amount, setAmount] = useState('')

  return (
    <NumberInput
      {...props}
      value={amount}
      onChange={(ev) => setAmount(ev.target.value)}
      step="any"
      min={0}
      max={maxBalance == null ? undefined : maxBalance}
      after={
        <div className="mr-1">
          <GhostButton
            size="tiny"
            disabled={maxBalance == null}
            onClick={() => {
              invariant(maxBalance != null, 'Balance is not loaded')
              setAmount(maxBalance)
            }}
          >
            Max
          </GhostButton>

          <Select
            isMulti={false}
            label="Available tokens"
            onChange={(value) => {
              if (value == null) {
                return
              }

              const balance = tokenBalances.find(
                ({ name }) => name === value.value,
              )

              invariant(
                balance != null,
                `Could not find a token balance for "${value.value}"`,
              )

              setMaxBalance(
                formatUnits(BigInt(balance.balance), balance.decimals),
              )
            }}
            options={tokenBalances.map(({ name }) => ({
              value: name,
              label: name,
            }))}
          />
        </div>
      }
    />
  )
}
