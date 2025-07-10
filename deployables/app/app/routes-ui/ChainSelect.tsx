import { invariant } from '@epic-web/invariant'
import { Chain, HIDDEN_CHAINS, chainName, verifyChainId } from '@zodiac/chains'
import { Select } from '@zodiac/ui'
import type { ChainId } from 'ser-kit'
import { Chain as ChainComponent } from './Chain'

type ChainSelectProps = {
  disabled?: boolean
  value?: ChainId | null
  defaultValue?: ChainId | null
  onChange?(chainId: ChainId): void
  name?: string
}

const allOptions = Object.values(Chain)
  .filter((value): value is ChainId => typeof value === 'number')
  .map((chainId) => ({
    value: verifyChainId(chainId),
    label: chainName(chainId),
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
      options={options.toSorted((a, b) => a.label.localeCompare(b.label))}
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
      {({ data: { value } }) => <ChainComponent chainId={value} />}
    </Select>
  )
}
