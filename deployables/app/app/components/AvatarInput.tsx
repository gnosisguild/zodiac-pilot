import { validateAddress } from '@/utils'
import type { HexAddress } from '@zodiac/schema'
import { Blockie, Select, selectStyles, TextInput } from '@zodiac/ui'
import { getAddress } from 'ethers'
import { useEffect, useState } from 'react'
import { useFetcher } from 'react-router'
import { splitPrefixedAddress, type PrefixedAddress } from 'ser-kit'

type Props = {
  value: PrefixedAddress
  pilotAddress: HexAddress | null
  onChange(value: string): void
}

type Option = {
  value: string
  label: string
}

export const AvatarInput = ({ value, pilotAddress, onChange }: Props) => {
  const [chainId, address] = splitPrefixedAddress(value)
  const [pendingValue, setPendingValue] = useState<string>(address)

  useEffect(() => {
    setPendingValue(address)
  }, [address])

  const { load, state, data } = useFetcher<string[]>({ key: 'available-safes' })

  useEffect(() => {
    if (pilotAddress == null) {
      return
    }

    if (chainId == null) {
      return
    }

    load(`/${pilotAddress}/${chainId}/available-safes`)
  }, [chainId, load, pilotAddress])

  const checksumAvatarAddress = validateAddress(pendingValue)

  const availableSafes = data ?? []

  if (availableSafes.length > 0 || checksumAvatarAddress) {
    return (
      <Select
        allowCreate
        blurInputOnSelect
        isClearable
        isMulti={false}
        isDisabled={state === 'loading'}
        label="Piloted Safe"
        clearLabel="Clear piloted Safe"
        dropdownLabel="View all available Safes"
        formatOptionLabel={SafeOptionLabel}
        placeholder="Paste an address or select from the list"
        classNames={selectStyles<Option>()}
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
            const sanitized = option.value.trim().replace(/^[a-z]{3}:/g, '')

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
      disabled={state === 'loading'}
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
