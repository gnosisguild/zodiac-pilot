import { validateAddress } from '@/utils'
import { Blockie, Select, selectStyles, TextInput } from '@zodiac/ui'
import { getAddress } from 'ethers'
import { useEffect, useState } from 'react'

type Props = {
  value: string
  availableSafes?: string[]
  onChange(value: string): void
}

type Option = {
  value: string
  label: string
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

  if (availableSafes.length > 0 || checksumAvatarAddress) {
    return (
      <Select
        allowCreate
        blurInputOnSelect
        isClearable
        label="Piloted Safe"
        clearLabel="Clear piloted Safe"
        dropdownLabel="View all available Safes"
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
        options={availableSafes.map((address) => ({
          value: address,
          label: address,
        }))}
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
    )
  }

  return (
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
  )
}

const SafeOptionLabel = (option: Option) => {
  const checksumAddress = getAddress(option.value).toLowerCase()

  return (
    <div className="flex items-center gap-4 py-2">
      <Blockie address={option.value} className="size-5 shrink-0" />

      <code className="overflow-hidden text-ellipsis whitespace-nowrap font-mono">
        {checksumAddress}
      </code>
    </div>
  )
}
