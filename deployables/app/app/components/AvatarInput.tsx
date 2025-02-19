import { validateAddress } from '@/utils'
import { ZERO_ADDRESS } from '@zodiac/chains'
import type { HexAddress } from '@zodiac/schema'
import { Address, AddressInput, Select, selectStyles } from '@zodiac/ui'
import { useEffect } from 'react'
import { useFetcher } from 'react-router'
import { type ChainId } from 'ser-kit'

type Props = {
  chainId: ChainId | null
  pilotAddress?: HexAddress | null
  name?: string
  defaultValue?: HexAddress
  required?: boolean
}

type Option = {
  value: HexAddress
  label: string
}

export const AvatarInput = ({
  chainId,
  pilotAddress,
  name,
  required,
  defaultValue,
}: Props) => {
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

  const availableSafes = data ?? []

  if (availableSafes.length > 0 || defaultValue) {
    return (
      <Select
        allowCreate
        blurInputOnSelect
        isClearable
        required={required}
        isMulti={false}
        isDisabled={state === 'loading'}
        label="Avatar"
        clearLabel="Clear piloted Safe"
        dropdownLabel="View all available Safes"
        placeholder="Paste an address or select from the list"
        classNames={selectStyles<Option>()}
        name={name}
        value={
          defaultValue == null
            ? undefined
            : {
                value: defaultValue,
                label: defaultValue,
              }
        }
        options={availableSafes.map((address) => ({
          value: address,
          label: address,
        }))}
        isValidNewOption={(option) => {
          return !!validateAddress(option)
        }}
      >
        {({ data: { value } }) => <Address>{value}</Address>}
      </Select>
    )
  }

  return (
    <AddressInput
      label="Avatar"
      disabled={state === 'loading'}
      defaultValue={defaultValue}
      name={name}
      placeholder="Paste in a Safe address"
    />
  )
}
