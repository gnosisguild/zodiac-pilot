import { ETH_ZERO_ADDRESS, ZERO_ADDRESS } from '@zodiac/chains'
import type { HexAddress, PrefixedAddress } from '@zodiac/schema'
import {
  AddressInput,
  AddressSelect,
  type AddressSelectProps,
} from '@zodiac/ui'
import { useEffect } from 'react'
import { useFetcher } from 'react-router'
import { splitPrefixedAddress, type ChainId } from 'ser-kit'

type Props = Omit<
  AddressSelectProps<true>,
  'allowCreate' | 'blurInputOnSelect' | 'isClearable' | 'options' | 'isDisabled'
> & {
  chainId: ChainId | null
  initiator?: PrefixedAddress
}

export const AvatarInput = ({
  chainId,
  initiator = ETH_ZERO_ADDRESS,
  name,
  required,
  defaultValue,
  ...props
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
      <AddressSelect
        clearLabel="Clear piloted Safe"
        dropdownLabel="View all available Safes"
        placeholder="Paste an address or select from the list"
        defaultValue={defaultValue}
        required={required}
        {...props}
        allowCreate
        blurInputOnSelect
        isClearable
        isDisabled={state === 'loading'}
        options={availableSafes}
      />
    )
  }

  return (
    <AddressInput
      required={required}
      label="Avatar"
      disabled={state === 'loading'}
      defaultValue={defaultValue}
      name={name}
      placeholder="Paste in a Safe address"
    />
  )
}
