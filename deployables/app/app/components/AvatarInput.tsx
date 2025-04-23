import { ETH_ZERO_ADDRESS, ZERO_ADDRESS } from '@zodiac/chains'
import type { Account } from '@zodiac/db/schema'
import type { HexAddress, PrefixedAddress } from '@zodiac/schema'
import { AddressSelect, type AddressSelectProps } from '@zodiac/ui'
import { useEffect } from 'react'
import { useFetcher } from 'react-router'
import { splitPrefixedAddress, type ChainId } from 'ser-kit'

type Props = Omit<
  AddressSelectProps<true>,
  'allowCreate' | 'blurInputOnSelect' | 'options' | 'isDisabled'
> & {
  chainId: ChainId
  initiator?: PrefixedAddress
  knownAccounts?: Account[]
}

export const AvatarInput = ({
  chainId,
  initiator = ETH_ZERO_ADDRESS,
  knownAccounts = [],
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

  return (
    <AddressSelect
      key={`avatar-${state}`}
      clearLabel="Clear Safe Account"
      dropdownLabel="View all available Safes"
      placeholder="Paste an address or select from the list"
      {...props}
      allowCreate
      blurInputOnSelect
      isDisabled={state === 'loading'}
      options={
        data == null
          ? knownAccounts.filter((account) => account.chainId === chainId)
          : data.map((address) => {
              const account = knownAccounts.find(
                (account) =>
                  account.address === address && account.chainId === chainId,
              )

              if (account == null) {
                return address
              }

              return { label: account.label, address }
            })
      }
    />
  )
}
