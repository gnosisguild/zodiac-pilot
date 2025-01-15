import { validateAddress } from '@/utils'
import { ZERO_ADDRESS } from '@zodiac/chains'
import type { HexAddress, StartingWaypoint } from '@zodiac/schema'
import { Blockie, Select, selectStyles, TextInput } from '@zodiac/ui'
import { getAddress } from 'ethers'
import { useEffect, useState } from 'react'
import { useFetcher } from 'react-router'
import { splitPrefixedAddress, type PrefixedAddress } from 'ser-kit'

type Props = {
  value: PrefixedAddress
  startingWaypoint?: StartingWaypoint
  onChange(value: HexAddress | null): void
}

type Option = {
  value: HexAddress
  label: string
}

export const AvatarInput = ({ value, startingWaypoint, onChange }: Props) => {
  const [chainId, address] = splitPrefixedAddress(value)
  const [pendingValue, setPendingValue] = useState<string>(
    address === ZERO_ADDRESS ? '' : address,
  )

  useEffect(() => {
    setPendingValue(address === ZERO_ADDRESS ? '' : address)
  }, [address])

  const { load, state, data } = useFetcher<HexAddress[]>({
    key: 'available-safes',
  })

  useEffect(() => {
    if (startingWaypoint == null) {
      return
    }

    if (chainId == null) {
      return
    }

    load(`/${startingWaypoint.account.address}/${chainId}/available-safes`)
  }, [chainId, load, startingWaypoint])

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

            onChange(validateAddress(sanitized))
          } else {
            onChange(null)
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

        const validatedAddress = validateAddress(sanitized)

        if (validatedAddress != null) {
          onChange(validatedAddress)
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
