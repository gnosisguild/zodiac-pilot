import { CHAIN_NAME } from '@/chains'
import { invariant } from '@epic-web/invariant'
import { Select } from '@zodiac/ui'
import type { ChainId } from 'ser-kit'

export interface Props {
  value: ChainId
  onChange(chainId: ChainId): void
}

interface Option {
  value: ChainId
  label: string
}

const options = Object.entries(CHAIN_NAME).map(([chainId, name]) => ({
  value: parseInt(chainId) as ChainId,
  label: name,
}))

export const ChainSelect = ({ value, onChange }: Props) => (
  <Select
    label="Chain"
    isMulti={false}
    options={options}
    value={options.find((op) => op.value === value)}
    onChange={(option) => {
      invariant(option != null, 'Empty value selected as chain')

      onChange(option.value)
    }}
    formatOptionLabel={ChainOptionLabel as any}
  />
)

const ChainOptionLabel = ({ value, label }: Option) => (
  <div className="flex items-center gap-4 py-2">
    <div className="pl-1">{label || `#${value}`}</div>
  </div>
)
