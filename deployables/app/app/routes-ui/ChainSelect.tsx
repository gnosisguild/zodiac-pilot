import { invariant } from '@epic-web/invariant'
import { CHAIN_NAME, verifyChainId } from '@zodiac/chains'
import { Select } from '@zodiac/ui'
import type { ChainId } from 'ser-kit'
import { Chain } from './Chain'

type ChainSelectProps = {
  disabled?: boolean
  value?: ChainId | null
  defaultValue?: ChainId | null
  onChange?(chainId: ChainId): void
  name?: string
}

const options = Object.entries(CHAIN_NAME).map(([chainId, name]) => ({
  value: verifyChainId(parseInt(chainId)),
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
