import { useTokenBalances } from '@/balances-client'
import { invariant } from '@epic-web/invariant'
import type { HexAddress } from '@zodiac/schema'
import {
  GhostButton,
  NumberInput,
  Select,
  SkeletonText,
  type NumberInputProps,
} from '@zodiac/ui'
import { useEffect, useState } from 'react'
import { formatUnits, parseUnits } from 'viem'
import { Token } from '../Token'

type TokenValueInputProps = Omit<
  NumberInputProps,
  'value' | 'onChange' | 'defaultValue' | 'after'
> & {
  defaultToken?: HexAddress | null
}

export const TokenValueInput = ({
  name,
  required,
  defaultToken = null,
  ...props
}: TokenValueInputProps) => {
  const [maxBalance, setMaxBalance] = useState<string | null>(null)
  const [{ data: tokenBalances, tokenBalanceByAddress }, state] =
    useTokenBalances()
  const [selectedTokenAddress, setSelectedTokenAddress] = useState<
    string | null
  >(defaultToken)

  const selectedToken =
    selectedTokenAddress == null || state === 'loading'
      ? null
      : tokenBalanceByAddress[selectedTokenAddress]

  invariant(
    selectedToken == null || selectedToken.token_address != null,
    'Selected token does not have an address',
  )

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
                selectedToken == null
                  ? undefined
                  : { value: selectedToken.token_address }
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
                if (state === 'loading') {
                  return <SkeletonText />
                }

                const { logo, name } = tokenBalanceByAddress[value]
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
