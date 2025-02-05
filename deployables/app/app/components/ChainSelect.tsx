import { invariant } from '@epic-web/invariant'
import { CHAIN_NAME } from '@zodiac/chains'
import { Select } from '@zodiac/ui'
import type { ChainId } from 'ser-kit'

export interface Props {
  value?: ChainId | null
  onChange?(chainId: ChainId): void
  name?: string
}

const options = Object.entries(CHAIN_NAME).map(([chainId, name]) => ({
  value: parseInt(chainId) as ChainId,
  label: name,
}))

export const ChainSelect = ({ value, name, onChange }: Props) => (
  <Select
    label="Chain"
    dropdownLabel="Select a different chain"
    isMulti={false}
    options={options}
    name={name}
    value={options.find((op) => op.value === value)}
    onChange={(option) => {
      invariant(option != null, 'Empty value selected as chain')

      if (onChange != null) {
        onChange(option.value)
      }
    }}
  >
    {({ data: { label, value } }) => (
      <div className="flex items-center gap-4">
        <div className="pl-1">{label || `#${value}`}</div>
      </div>
    )}
  </Select>
)
