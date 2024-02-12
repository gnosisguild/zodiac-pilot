import { getAddress } from 'ethers/lib/utils'
import React from 'react'
import { Props as SelectProps } from 'react-select'

import { Select } from '../../../components'
import Blockie from '../../../components/Blockie'
import Box from '../../../components/Box'

import classes from './style.module.css'

export const NO_MODULE_OPTION = { value: '', label: '' }
export interface Option {
  value: string
  label: string
}

interface Props extends SelectProps {
  avatarAddress: string
}

const ModSelect: React.FC<Props> = (props) => {
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
        <Box rounded>
          <Blockie
            address={props.avatarAddress}
            className={classes.modBlockie}
          />
        </Box>
        <div className={classes.modLabel}>
          <p className={classes.type}>No Mod — Direct execution</p>
          <code className={classes.address}>
            Transactions submitted directly to the Safe
          </code>
        </div>
      </div>
    )
  }
  return (
    <Select
      {...props}
      formatOptionLabel={ModuleOptionLabel}
      noOptionsMessage={() => 'No modules are enabled on this Safe'}
    />
  )
}

export default ModSelect
