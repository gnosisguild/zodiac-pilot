import React from 'react'
import { Props } from 'react-select'

import { Select } from '..'
import Blockie from '../Blockie'
import Box from '../Box'

import classes from './style.module.css'

interface LabelProps {
  value: string
  label: string
}

const ModuleOptionLabel: React.FC<LabelProps> = ({ value, label }) => {
  return (
    <div className={classes.modOption}>
      <Box rounded>
        <Blockie address={value} className={classes.modBlockie} />
      </Box>
      <div className={classes.modLabel}>
        <p className={classes.type}>{label}</p>
        <p className={classes.address}>{value}</p>
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
