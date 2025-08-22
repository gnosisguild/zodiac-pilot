import { ETH_ZERO_ADDRESS, ZERO_ADDRESS } from '@zodiac/chains'
import type { HexAddress, PrefixedAddress } from '@zodiac/schema'
import { AddressSelect, type AddressSelectProps } from '@zodiac/web3'
import { useEffect } from 'react'
import { useFetcher } from 'react-router'
import { splitPrefixedAddress, unprefixAddress, type ChainId } from 'ser-kit'

type Props = Omit<
  AddressSelectProps<true>,
  'allowCreate' | 'blurInputOnSelect' | 'options' | 'isDisabled'
> & {
  chainId: ChainId
  initiator?: PrefixedAddress
}

export const AvatarInput = ({
  chainId,
  initiator = ETH_ZERO_ADDRESS,
  value,
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

  // make sure the current value is at the top of the list
  let options = data ?? []
  const currentValue = value ?? defaultValue
  const currentValueUnprefixed = currentValue && unprefixAddress(currentValue)
  if (
    currentValueUnprefixed != null &&
    !options.includes(currentValueUnprefixed)
  ) {
    options = [currentValueUnprefixed, ...options]
  }

  return (
    <AddressSelect
      key={`avatar-${state}`}
      clearLabel="Clear Safe Account"
      dropdownLabel="View all available Safes"
      placeholder="Paste an address or select from the list"
      value={value}
      defaultValue={defaultValue}
      {...props}
      allowCreate
      blurInputOnSelect
      isDisabled={state === 'loading'}
      options={options}
    />
  )
}
