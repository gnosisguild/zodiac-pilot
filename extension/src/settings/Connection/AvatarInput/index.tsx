import { getAddress } from 'ethers/lib/utils'
import React, { useEffect, useState } from 'react'
import CreatableSelect from 'react-select/creatable'

import { Box, Button } from '../../../components'
import Blockie from '../../../components/Blockie'
import { selectStyles } from '../../../components/Select'
import { validateAddress } from '../../../utils'
import { Option } from '../ModSelect'

import classes from './style.module.css'

interface Props {
  value: string
  availableSafes?: string[]
  onChange(value: string): void
}

const createSelectStyles = {
  ...selectStyles,
  dropdownIndicator: (provided: React.CSSProperties, state: any) => {
    if (state.options.length === 0) {
      return {
        ...provided,
        display: 'none',
      }
    }
    return {
      ...provided,
    }
  },
  indicatorSeparator: (provided: React.CSSProperties, state: any) => {
    if (state.options.length === 0) {
      return {
        ...provided,
        display: 'none',
      }
    }
    return {
      ...provided,
    }
  },
  indicatorContainer: (provided: React.CSSProperties) => ({
    ...provided,
    color: 'white',
  }),
}

const AvatarInput: React.FC<Props> = ({
  value,
  onChange,
  availableSafes = [],
}) => {
  const [pendingValue, setPendingValue] = useState(value)

  useEffect(() => {
    setPendingValue(value)
  }, [value])

  const checksumAvatarAddress = validateAddress(pendingValue)
  console.log('pending', pendingValue, checksumAvatarAddress)
  return (
    <>
      {availableSafes.length > 0 || checksumAvatarAddress ? (
        <CreatableSelect
          isClearable
          formatOptionLabel={SafeOptionLabel}
          placeholder="Paste in Safe address or select from owned Safes"
          styles={createSelectStyles as any}
          value={
            checksumAvatarAddress && {
              value: checksumAvatarAddress,
              label: checksumAvatarAddress,
            }
          }
          options={availableSafes.map((address) => {
            return { value: address, label: address }
          })}
          onChange={(opt) => {
            const option = opt as Option
            if (option) {
              const sanitized = option.value.trim().replace(/^[a-z]{3}:/g, '')
              if (validateAddress(sanitized)) {
                onChange(sanitized.toLowerCase())
              }
            } else {
              onChange('')
            }
          }}
          isValidNewOption={(value) => {
            console.log('initial value', value)
            if (value) {
              const sanitized = value.trim().replace(/^[a-z]{3}:/g, '')
              if (validateAddress(sanitized)) {
                console.log('valiudd')
                onChange(sanitized.toLowerCase())
              }
            }
            return false
          }}
        />
      ) : (
        <input
          type="text"
          value={pendingValue}
          placeholder="Paste in Safe address"
          onChange={(ev) => {
            const sanitized = ev.target.value.trim().replace(/^[a-z]{3}:/g, '')
            setPendingValue(sanitized)
            if (validateAddress(sanitized)) {
              onChange(sanitized.toLowerCase())
            }
          }}
        />
      )}
    </>
  )
}

const SafeOptionLabel: React.FC<unknown> = (opt) => {
  const option = opt as Option

  const checksumAddress = getAddress(option.value)
  return (
    <div className={classes.safeOption}>
      <Box rounded>
        <Blockie address={option.value} className={classes.safeBlockie} />
      </Box>
      <div className={classes.safeLabel}>
        <code className={classes.address}>{checksumAddress}</code>
      </div>
    </div>
  )
}

export default AvatarInput
