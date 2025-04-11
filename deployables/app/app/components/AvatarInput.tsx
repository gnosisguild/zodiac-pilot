import { ETH_ZERO_ADDRESS, getChainId, ZERO_ADDRESS } from '@zodiac/chains'
import type {
  ExecutionRoute,
  HexAddress,
  PrefixedAddress,
} from '@zodiac/schema'
import { AddressSelect, type AddressSelectProps } from '@zodiac/ui'
import { useEffect } from 'react'
import { useFetcher } from 'react-router'
import {
  prefixAddress,
  splitPrefixedAddress,
  unprefixAddress,
  type ChainId,
} from 'ser-kit'
import { KnownFromRoutes } from './KnownFromRoutes'

type Props = Omit<
  AddressSelectProps<true>,
  'allowCreate' | 'blurInputOnSelect' | 'options' | 'isDisabled'
> & {
  chainId: ChainId
  initiator?: PrefixedAddress
  knownRoutes?: ExecutionRoute[]
}

export const AvatarInput = ({
  chainId,
  initiator = ETH_ZERO_ADDRESS,
  knownRoutes = [],
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
          ? Array.from(
              new Set(
                knownRoutes
                  .filter((route) => getChainId(route.avatar) === chainId)
                  .map((route) => unprefixAddress(route.avatar)),
              ),
            )
          : data
      }
    >
      {({ data: { value }, isSelected }) =>
        isSelected != null && (
          <KnownFromRoutes
            routes={knownRoutes}
            address={prefixAddress(chainId, value)}
          />
        )
      }
    </AddressSelect>
  )
}
