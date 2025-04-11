import type {
  ExecutionRoute,
  HexAddress,
  PrefixedAddress,
} from '@zodiac/schema'
import { AddressSelect, type AddressSelectProps } from '@zodiac/ui'
import { useEffect } from 'react'
import { useFetcher } from 'react-router'
import { prefixAddress, splitPrefixedAddress } from 'ser-kit'
import { KnownFromRoutes } from './KnownFromRoutes'

type InitiatorInputProps = Omit<
  AddressSelectProps<false>,
  'allowCreate' | 'options'
> & {
  avatar: PrefixedAddress
  knownRoutes?: ExecutionRoute[]
}

export const InitiatorInput = ({
  avatar,
  knownRoutes = [],
  ...props
}: InitiatorInputProps) => {
  const [chainId, address] = splitPrefixedAddress(avatar)

  const { load, state, data = [] } = useFetcher<HexAddress[]>()

  useEffect(() => {
    load(`/${address}/${chainId}/initiators`)
  }, [address, chainId, load])

  return (
    <AddressSelect
      key={`initiator-${state}`}
      isMulti={false}
      isDisabled={state === 'loading'}
      placeholder="Select an initiator"
      dropdownLabel="View possible initiators"
      {...props}
      options={data}
    >
      {({ data: { value }, isSelected }) =>
        isSelected != null && (
          <KnownFromRoutes
            routes={knownRoutes}
            address={prefixAddress(undefined, value)}
          />
        )
      }
    </AddressSelect>
  )
}
