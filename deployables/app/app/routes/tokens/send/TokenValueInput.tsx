import { useTokenBalances } from '@/balances-client'
import { Token } from '@/components'
import { invariant } from '@epic-web/invariant'
import {
  GhostButton,
  NumberInput,
  Select,
  SkeletonText,
  type NumberInputProps,
} from '@zodiac/ui'
import { useEffect, useState } from 'react'
import { parseUnits } from 'viem'

type TokenValueInputProps = Omit<
  NumberInputProps,
  'value' | 'onChange' | 'defaultValue' | 'after'
> & {
  defaultToken?: string | null
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
    selectedToken == null || selectedToken.contractId != null,
    'Selected token does not have an address',
  )

  const [amount, setAmount] = useState('')

  useEffect(() => {
    if (selectedToken == null) {
      return
    }

    setMaxBalance(selectedToken.amount)
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
        value={selectedToken == null ? '' : selectedToken.contractId}
      />

      <NumberInput
        {...props}
        required={required}
        value={amount}
        description={
          selectedToken == null
            ? undefined
            : `Max: ${selectedToken.amount} ${selectedToken.symbol}`
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
              label="Available tokens"
              dropdownLabel="Show available tokens"
              placeholder={
                state === 'loading' ? 'Loading tokens...' : 'Select token'
              }
              value={
                selectedToken == null ? undefined : selectedToken.contractId
              }
              onChange={(value) => {
                if (value == null) {
                  return
                }

                setSelectedTokenAddress(value.value)
              }}
              options={tokenBalances.map(({ contractId }) => ({
                value: contractId,
              }))}
            >
              {({ data: { value } }) => {
                if (state === 'loading') {
                  return <SkeletonText />
                }

                const { logoUrl, name } = tokenBalanceByAddress[value]

                return (
                  <div className="text-xs">
                    <Token logoUrl={logoUrl}>{name}</Token>
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
