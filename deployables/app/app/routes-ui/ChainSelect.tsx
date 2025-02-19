import { Token } from '@/components'
import { invariant } from '@epic-web/invariant'
import { CHAIN_NAME } from '@zodiac/chains'
import { Select } from '@zodiac/ui'
import type { PropsWithChildren } from 'react'
import type { ChainId } from 'ser-kit'
import { useChain } from './ChainContext'

type ChainSelectProps = {
  disabled?: boolean
  value?: ChainId | null
  defaultValue?: ChainId | null
  onChange?(chainId: ChainId): void
  name?: string
}

const options = Object.entries(CHAIN_NAME).map(([chainId, name]) => ({
  value: parseInt(chainId) as ChainId,
  label: name,
}))

export const ChainSelect = ({
  defaultValue,
  value,
  disabled,
  name,
  onChange,
}: ChainSelectProps) => (
  <Select
    label="Chain"
    isDisabled={disabled}
    dropdownLabel="Select a different chain"
    isMulti={false}
    options={options}
    name={name}
    value={options.find((op) => op.value === value)}
    defaultValue={options.find((op) => op.value === defaultValue)}
    onChange={(option) => {
      invariant(option != null, 'Empty value selected as chain')

      if (onChange != null) {
        onChange(option.value)
      }
    }}
  >
    {({ data: { label, value } }) => (
      <Chain chainId={value}>{label || `#${value}`}</Chain>
    )}
  </Select>
)

type ChainProps = PropsWithChildren<{
  chainId: ChainId
}>

const Chain = ({ chainId, children }: ChainProps) => {
  const chain = useChain(chainId)

  return <Token logo={chain?.logo_url}>{children}</Token>
}
