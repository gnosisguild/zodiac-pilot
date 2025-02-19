import { validateAddress } from '@/utils'
import { ETH_ZERO_ADDRESS, ZERO_ADDRESS } from '@zodiac/chains'
import type { HexAddress, PrefixedAddress } from '@zodiac/schema'
import { Address, AddressInput, Select, selectStyles } from '@zodiac/ui'
import { useEffect } from 'react'
import { useFetcher } from 'react-router'
import { splitPrefixedAddress, type ChainId } from 'ser-kit'

type Props = {
  chainId: ChainId | null
  initiator?: PrefixedAddress
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
  initiator = ETH_ZERO_ADDRESS,
  name,
  required,
  defaultValue,
}: Props) => {
  const { load, state, data } = useFetcher<HexAddress[]>()

  const [, initiatorAddress] = splitPrefixedAddress(initiator)

  useEffect(() => {
    if (initiatorAddress == ZERO_ADDRESS) {
      return
    }

    if (chainId == null) {
      return
    }

    load(`/${initiatorAddress}/${chainId}/available-safes`)
  }, [chainId, initiatorAddress, load])

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
        defaultValue={
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
