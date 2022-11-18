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

// react-select can't infer the type of Option here, so it expects unknown,
// hence the weird typing method below
const ModuleOptionLabel = (data: unknown) => {
  const props = data as LabelProps
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
