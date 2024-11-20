import {
  Blockie,
  Circle,
  RawAddress,
  selectStyles,
  TextInput,
} from '@/components'
import { validateAddress } from '@/utils'
import { getAddress } from 'ethers'
import { CSSProperties, useEffect, useState } from 'react'
import CreatableSelect from 'react-select/creatable'
import { Option } from './ModSelect'

interface Props {
  value: string
  availableSafes?: string[]
  onChange(value: string): void
}

const createSelectStyles = {
  ...selectStyles,
  dropdownIndicator: (provided: CSSProperties, state: any) => {
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
  indicatorSeparator: (provided: CSSProperties, state: any) => {
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
  indicatorContainer: (provided: CSSProperties) => ({
    ...provided,
    color: 'white',
  }),
}

export const AvatarInput = ({
  value,
  onChange,
  availableSafes = [],
}: Props) => {
  const [pendingValue, setPendingValue] = useState(value)

  useEffect(() => {
    setPendingValue(value)
  }, [value])

  const checksumAvatarAddress = validateAddress(pendingValue)

  return (
    <>
      {availableSafes.length > 0 || checksumAvatarAddress ? (
        <CreatableSelect
          blurInputOnSelect={true}
          isClearable
          formatOptionLabel={SafeOptionLabel}
          placeholder="Paste in Safe address or select from owned Safes"
          styles={createSelectStyles as any}
          value={
            checksumAvatarAddress !== ''
              ? {
                  value: checksumAvatarAddress,
                  label: checksumAvatarAddress,
                }
              : undefined
          }
          options={availableSafes.map((address) => {
            return { value: address, label: address }
          })}
          onChange={(option) => {
            if (option) {
              const sanitized = (option as Option).value
                .trim()
                .replace(/^[a-z]{3}:/g, '')
              if (validateAddress(sanitized)) {
                onChange(sanitized.toLowerCase())
              }
            } else {
              onChange('')
            }
          }}
          isValidNewOption={(option) => {
            return !!validateAddress(option)
          }}
        />
      ) : (
        <TextInput
          label="Piloted Safe"
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

const SafeOptionLabel = (option: Option) => {
  const checksumAddress = getAddress(option.value)

  return (
    <div className="flex items-center gap-4 py-3">
      <Circle>
        <Blockie address={option.value} className="size-10" />
      </Circle>

      <RawAddress>{checksumAddress}</RawAddress>
    </div>
  )
}
