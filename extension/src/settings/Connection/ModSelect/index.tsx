import { getAddress } from 'ethers/lib/utils'
import React from 'react'
import { Props } from 'react-select'

import { Select } from '../../../components'
import Blockie from '../../../components/Blockie'
import Box from '../../../components/Box'

import classes from './style.module.css'

export const NO_MODULE_OPTION = { value: '', label: '' }
interface Option {
  value: string
  label: string
}

const ModuleOptionLabel: React.FC<unknown> = (props) => {
  const option = props as Option
  if (!option.value) return <NoModuleOptionLabel />

  const checksumAddress = getAddress(option.value)
  return (
    <div className={classes.modOption}>
      <Box rounded>
        <Blockie address={option.value} className={classes.modBlockie} />
      </Box>
      <div className={classes.modLabel}>
        <p className={classes.type}>{option.label}</p>
        <code className={classes.address}>{checksumAddress}</code>
      </div>
    </div>
  )
}

const NoModuleOptionLabel = () => {
  return (
    <div className={classes.modOption}>
      <div className={classes.modLabel}>
        <p className={classes.type}>&lt;No mod&gt;</p>
        <code className={classes.address}>Direct execution</code>
      </div>
    </div>
  )
}

const ModSelect: React.FC<Props> = (props) => {
  return (
    <Select
      {...props}
      formatOptionLabel={ModuleOptionLabel}
      noOptionsMessage={() => 'No modules are enabled on this Safe'}
    />
  )
}

export default ModSelect
