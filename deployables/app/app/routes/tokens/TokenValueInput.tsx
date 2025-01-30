import { useTokenBalances, type TokenBalance } from '@/balances-client'
import { invariant } from '@epic-web/invariant'
import {
  GhostButton,
  NumberInput,
  Select,
  type NumberInputProps,
} from '@zodiac/ui'
import { useEffect, useMemo, useState } from 'react'
import { formatUnits, parseUnits } from 'viem'
import { Token } from './Token'

type TokenValueInputProps = Omit<
  NumberInputProps,
  'value' | 'onChange' | 'defaultValue' | 'after'
>

export const TokenValueInput = ({ name, ...props }: TokenValueInputProps) => {
  const [maxBalance, setMaxBalance] = useState<string | null>(null)
  const [tokenBalances] = useTokenBalances()
  const [selectedTokenAddress, setSelectedTokenAddress] = useState<
    string | null
  >(null)

  const tokens = useMemo(
    () =>
      tokenBalances.reduce(
        (result, token) =>
          token.token_address == null
            ? result
            : { ...result, [token.token_address]: token },
        {} as Record<string, TokenBalance>,
      ),
    [tokenBalances],
  )

  const selectedToken =
    selectedTokenAddress == null ? null : tokens[selectedTokenAddress]

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
              value={
                selectedTokenAddress == null
                  ? undefined
                  : { value: selectedTokenAddress }
              }
              onChange={(value) => {
                if (value == null) {
                  return
                }

                setSelectedTokenAddress(value.value)
              }}
              options={tokenBalances
                .filter(({ token_address }) => token_address != null)
                .map(({ token_address }) => {
                  invariant(
                    token_address != null,
                    'Empty token address was not filtered out',
                  )

                  return { value: token_address }
                })}
            >
              {({ data: { value } }) => {
                const { logo, name } = tokens[value]
                return <Token logo={logo}>{name}</Token>
              }}
            </Select>
          </div>
        }
      />
    </>
  )
}
