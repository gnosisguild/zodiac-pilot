import { Select } from '@/components'
import React from 'react'
import { ChainId } from 'ser-kit'
import { CHAIN_NAME } from '../../../chains'

import classes from './style.module.css'

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

const ChainSelect: React.FC<Props> = ({ value, onChange }) => {
  const ChainOptionLabel: React.FC<Option> = ({ value, label }) => (
    <div className={classes.chainOption}>
      <div className={classes.chainLabel}>{label || `#${value}`}</div>
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

export default ChainSelect
