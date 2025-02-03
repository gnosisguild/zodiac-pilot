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
import { Token } from '../Token'

type TokenValueInputProps = Omit<
  NumberInputProps,
  'value' | 'onChange' | 'defaultValue' | 'after'
>

export const TokenValueInput = ({
  name,
  required,
  ...props
}: TokenValueInputProps) => {
  const [maxBalance, setMaxBalance] = useState<string | null>(null)
  const [tokenBalances, state] = useTokenBalances()
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

      <input
        type="hidden"
        name="token"
        value={selectedToken == null ? '' : selectedToken.token_address}
      />

      <NumberInput
        {...props}
        required={required}
        value={amount}
        description={
          selectedToken == null
            ? undefined
            : `Max: ${selectedToken.balance_formatted} ${selectedToken.symbol}`
        }
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
              required={required}
              isMulti={false}
              isSearchable={false}
              isDisabled={state === 'loading'}
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
                return (
                  <div className="text-xs">
                    <Token logo={logo}>{name}</Token>
                  </div>
                )
              }}
            </Select>
          </div>
        }
      />
    </>
  )
}
