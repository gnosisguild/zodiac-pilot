import { invariant } from '@epic-web/invariant'
import { CHAIN_NAME, HIDDEN_CHAINS, verifyChainId } from '@zodiac/chains'
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

const allOptions = Object.entries(CHAIN_NAME).map(([chainId, name]) => ({
  value: verifyChainId(parseInt(chainId)),
  label: name,
}))

const visibleOptions = allOptions.filter(
  (op) => !HIDDEN_CHAINS.includes(op.value),
)

export const ChainSelect = ({
  defaultValue,
  value,
  disabled,
  name,
  onChange,
}: ChainSelectProps) => {
  const valueOption = allOptions.find((op) => op.value === value)
  const defaultValueOption = allOptions.find((op) => op.value === defaultValue)
  const optionToShow = valueOption ?? defaultValueOption
  const options =
    !optionToShow || visibleOptions.includes(optionToShow)
      ? visibleOptions
      : [...visibleOptions, optionToShow]

  return (
    <Select
      label="Chain"
      isDisabled={disabled}
      dropdownLabel="Select a different chain"
      isMulti={false}
      options={options}
      name={name}
      value={valueOption}
      defaultValue={defaultValueOption}
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
}
