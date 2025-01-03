import { Blockie, Input, Select, selectStyles, TextInput } from '@/components'
import { validateAddress } from '@/utils'
import { getAddress } from 'ethers'
import { useEffect, useState } from 'react'
import CreatableSelect from 'react-select/creatable'
import type { Option } from './ModSelect'

interface Props {
  value: string
  availableSafes?: string[]
  onChange(value: string): void
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
        <Input
          label="Piloted Safe"
          clearLabel="Clear piloted Safe"
          dropdownLabel="View all available Safes"
        >
          {({ inputId }) => (
            <CreatableSelect
              unstyled
              inputId={inputId}
              blurInputOnSelect
              isClearable
              components={{
                ClearIndicator: Select.ClearIndicator<Option, false>,
                DropdownIndicator: Select.DropdownIndicator,
              }}
              formatOptionLabel={SafeOptionLabel}
              placeholder="Paste an address or select from the list"
              classNames={selectStyles<{ value: string; label: string }>()}
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
          )}
        </Input>
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
    <div className="flex items-center gap-4 py-2">
      <Blockie address={option.value} className="size-5 shrink-0" />

      <code className="overflow-hidden text-ellipsis whitespace-nowrap font-mono">
        {checksumAddress}
      </code>
    </div>
  )
}
