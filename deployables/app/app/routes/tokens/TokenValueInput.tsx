import { useTokenBalances, type TokenBalance } from '@/balances-client'
import { invariant } from '@epic-web/invariant'
import {
  GhostButton,
  NumberInput,
  Select,
  type NumberInputProps,
} from '@zodiac/ui'
import { useEffect, useState } from 'react'
import { formatUnits, parseUnits } from 'viem'
import { Token } from './Token'

type TokenValueInputProps = Omit<
  NumberInputProps,
  'value' | 'onChange' | 'defaultValue' | 'after'
>

export const TokenValueInput = ({ name, ...props }: TokenValueInputProps) => {
  const [maxBalance, setMaxBalance] = useState<string | null>(null)
  const [tokenBalances] = useTokenBalances()
  const [selectedToken, setSelectedToken] = useState<TokenBalance | null>(null)

  const [amount, setAmount] = useState('')

  useEffect(() => {
    if (selectedToken == null) {
      return
    }

    setMaxBalance(
      formatUnits(BigInt(selectedToken.balance), selectedToken.decimals),
    )
  }, [selectedToken])

  return (
    <>
      <input
        type="hidden"
        name={name}
        value={
          selectedToken == null
            ? ''
            : parseUnits(amount, selectedToken.decimals).toString()
        }
      />

      <NumberInput
        {...props}
        value={amount}
        onChange={(ev) => setAmount(ev.target.value)}
        step="any"
        min={0}
        max={maxBalance == null ? undefined : maxBalance}
        after={
          <div className="mr-1 flex items-center gap-2">
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
              inline
              isMulti={false}
              label="Available tokens"
              placeholder="Select token"
              onChange={(value) => {
                if (value == null) {
                  return
                }

                const token = tokenBalances.find(
                  ({ name }) => name === value.value,
                )

                invariant(
                  token != null,
                  `Could not find a token for "${value.value}"`,
                )

                setSelectedToken(token)
              }}
              options={tokenBalances.map(({ name, token_address, logo }) => ({
                value: token_address,
                logo,
                name,
              }))}
            >
              {({ data: { logo, name } }) => <Token logo={logo}>{name}</Token>}
            </Select>
          </div>
        }
      />
    </>
  )
}
