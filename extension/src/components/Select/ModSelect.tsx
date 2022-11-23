import React from 'react'
import { Props } from 'react-select'

import { Select } from '..'
import Blockie from '../Blockie'
import Box from '../Box'

import classes from './style.module.css'

export const NO_MODULE_OPTION = Symbol('no-module')
interface Option {
  value: string
  label: string
}

const ModuleOptionLabel = (data: unknown) => {
  if (data === NO_MODULE_OPTION) return <NoModuleOptionLabel />

  const props = data as Option
  return (
    <div className={classes.modOption}>
      <Box rounded>
        <Blockie address={props.value} className={classes.modBlockie} />
      </Box>
      <div className={classes.modLabel}>
        <p className={classes.type}>{props.label}</p>
        <code className={classes.address}>{props.value}</code>
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
