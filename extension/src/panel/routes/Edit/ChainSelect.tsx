import { CHAIN_NAME } from '@/chains'
import { Select } from '@/components'
import React from 'react'
import { ChainId } from 'ser-kit'

export interface Props {
  value: ChainId
  onChange(chainId: ChainId): void
}

interface Option {
  value: ChainId
  label: string
}

const options = Object.entries(CHAIN_NAME).map(([chainId, name]) => ({
  value: parseInt(chainId),
  label: name,
}))

export const ChainSelect = ({ value, onChange }: Props) => {
  const ChainOptionLabel: React.FC<Option> = ({ value, label }) => (
    <div className="flex items-center gap-4 py-3">
      <div className="pl-1 font-spectral">{label || `#${value}`}</div>
    </div>
  )

  return (
    <Select
      options={options}
      value={options.find((op) => op.value === value)}
      onChange={(option: any) => onChange(option.value)}
      formatOptionLabel={ChainOptionLabel as any}
    />
  )
}
