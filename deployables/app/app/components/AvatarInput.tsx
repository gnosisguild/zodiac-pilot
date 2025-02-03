import { validateAddress } from '@/utils'
import { getChainId, ZERO_ADDRESS } from '@zodiac/chains'
import { getPilotAddress } from '@zodiac/modules'
import type { HexAddress, Waypoints } from '@zodiac/schema'
import { Blockie, Select, selectStyles, TextInput } from '@zodiac/ui'
import { useEffect, useState } from 'react'
import { useFetcher } from 'react-router'
import { unprefixAddress, type PrefixedAddress } from 'ser-kit'
import { getAddress } from 'viem'

type Props = {
  value: PrefixedAddress
  waypoints?: Waypoints
  onChange(value: HexAddress | null): void
}

type Option = {
  value: HexAddress
  label: string
}

export const AvatarInput = ({ value, waypoints, onChange }: Props) => {
  const address = unprefixAddress(value)
  const chainId = getChainId(value)
  const [pendingValue, setPendingValue] = useState<string>(
    address === ZERO_ADDRESS ? '' : address,
  )

  useEffect(() => {
    setPendingValue(address === ZERO_ADDRESS ? '' : address)
  }, [address])

  const { load, state, data } = useFetcher<HexAddress[]>()

  const pilotAddress = waypoints == null ? null : getPilotAddress(waypoints)

  useEffect(() => {
    if (pilotAddress == ZERO_ADDRESS) {
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
            setPendingValue('')
            onChange(null)
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
