import { validateAddress } from '@/utils'
import { ZERO_ADDRESS } from '@zodiac/chains'
import type { HexAddress } from '@zodiac/schema'
import { Blockie, Select, selectStyles, TextInput } from '@zodiac/ui'
import { useEffect, useState } from 'react'
import { useFetcher } from 'react-router'
import { type ChainId } from 'ser-kit'
import { getAddress } from 'viem'

type Props = {
  chainId: ChainId | null
  value?: HexAddress
  pilotAddress?: HexAddress | null
  name?: string
  required?: boolean
  onChange?(value: HexAddress | null): void
}

type Option = {
  value: HexAddress
  label: string
}

export const AvatarInput = ({
  value,
  chainId,
  pilotAddress,
  name,
  required,
  onChange,
}: Props) => {
  const [internalValue, setInternalValue] = useState<string>(
    value != null && value !== ZERO_ADDRESS ? value : '',
  )

  useEffect(() => {
    if (value != null && value !== ZERO_ADDRESS) {
      setInternalValue(value)
    }
  }, [value])
  const { load, state, data } = useFetcher<HexAddress[]>()

  useEffect(() => {
    if (pilotAddress == null || pilotAddress == ZERO_ADDRESS) {
      return
    }

    if (chainId == null) {
      return
    }

    load(`/${pilotAddress}/${chainId}/available-safes`)
  }, [chainId, load, pilotAddress])

  const checksumAvatarAddress = validateAddress(internalValue)

  const availableSafes = data ?? []

  if (availableSafes.length > 0 || checksumAvatarAddress) {
    return (
      <Select
        allowCreate
        blurInputOnSelect
        isClearable
        required={required}
        isMulti={false}
        isDisabled={state === 'loading'}
        label="Piloted Safe"
        clearLabel="Clear piloted Safe"
        dropdownLabel="View all available Safes"
        placeholder="Paste an address or select from the list"
        classNames={selectStyles<Option>()}
        name={name}
        value={
          checksumAvatarAddress != null
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
            const sanitized = option.value.trim().replace(/^[a-z]{3}:/g, '')

            if (onChange != null) {
              onChange(validateAddress(sanitized))
            }
          } else {
            setInternalValue('')

            if (onChange != null) {
              onChange(null)
            }
          }
        }}
        isValidNewOption={(option) => {
          return !!validateAddress(option)
        }}
      >
        {({ data: { value } }) => (
          <div className="flex items-center gap-4">
            <Blockie address={value} className="size-5 shrink-0" />

            <code className="overflow-hidden text-ellipsis whitespace-nowrap font-mono">
              {getAddress(value).toLowerCase()}
            </code>
          </div>
        )}
      </Select>
    )
  }

  return (
    <TextInput
      label="Piloted Safe"
      disabled={state === 'loading'}
      value={internalValue}
      name={name}
      placeholder="Paste in Safe address"
      onChange={(ev) => {
        const sanitized = ev.target.value.trim().replace(/^[a-z]{3}:/g, '')
        setInternalValue(sanitized)

        const validatedAddress = validateAddress(sanitized)

        if (validatedAddress != null && onChange != null) {
          onChange(validatedAddress)
        }
      }}
    />
  )
}
