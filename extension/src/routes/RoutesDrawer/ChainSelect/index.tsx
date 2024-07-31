import React, { useMemo } from 'react'
import { ChainId } from 'ser-kit'
import { CHAIN_NAME } from '../../../chains'
import { Select } from '../../../components'

import classes from './style.module.css'
import NetworkIcon from '../../../components/NetworkIcon'
import { selectStyles } from '../../../components/Select'

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
  const styles = {
    ...selectStyles,
    control: (provided: React.CSSProperties, state: any) => ({
      ...provided,
      display: 'flex',
      padding: 0,
      alignItems: 'center',
      alignSelf: 'stretch',
      fontFamily: "'Roboto Mono', monospace",
      fontSize: '14px',
      borderRadius: '6px',
      background: 'rgba(217, 212, 173, 0.01)',
      borderColor: state.isFocused ? 'white' : 'rgba(217, 212, 173, 0.8)',
      border: '1px solid #B4B08F',
      boxShadow: 'none',
      cursor: 'pointer',
      '&:hover': {
        borderColor: 'white',
      },
    }),
  }

  const ChainOptionLabel: React.FC<Option> = ({ value, label }) => (
    <div className={classes.chainOption}>
      <div className={classes.chainLabel}>{label || `#${value}`}</div>
    </div>
  )
  const chainValue = useMemo(() => {
    const val = options.find((op) => op.value === value)
    if (val) {
      return {
        value: val.value,
        label: <NetworkIcon size={18} chainId={val.value} />,
      }
    }
  }, [value])

  return (
    <Select
      options={options}
      value={chainValue}
      onChange={(option: any) => onChange(option.value)}
      formatOptionLabel={ChainOptionLabel as any}
      styles={styles as any}
    />
  )
}

export default ChainSelect
