import { getChainId, ZERO_ADDRESS, type ChainId } from '@zodiac/chains'
import {
  decodeRoleKey,
  encodeRoleKey,
  getPilotAddress,
  SupportedZodiacModuleType,
  ZODIAC_MODULE_NAMES,
  type ZodiacModule,
} from '@zodiac/modules'
import type { HexAddress, Waypoints } from '@zodiac/schema'
import { TextInput } from '@zodiac/ui'
import { useEffect, useState } from 'react'
import { useFetcher } from 'react-router'
import {
  AccountType,
  ConnectionType,
  parsePrefixedAddress,
  type PrefixedAddress,
} from 'ser-kit'
import { ModSelect, NO_MODULE_OPTION } from './ModSelect'

type ZodiacModProps = {
  waypoints?: Waypoints
  avatar: PrefixedAddress
  disabled?: boolean

  onSelect: (module: ZodiacModule | null) => void
}

export const ZodiacMod = ({
  avatar,
  disabled,
  waypoints,
  onSelect,
}: ZodiacModProps) => {
  const chainId = getChainId(avatar)
  const pilotAddress = waypoints == null ? null : getPilotAddress(waypoints)

  const hasAvatar = parsePrefixedAddress(avatar) !== ZERO_ADDRESS

  const [isLoadingSafes, safes] = useSafes(chainId, pilotAddress)
  const [isLoadingDelegates, delegates] = useDelegates(chainId, pilotAddress)
  const [isLoadingModules, modules] = useModules(chainId, avatar)

  if (!hasAvatar) {
    return null
  }

  const pilotIsOwner = safes.some(
    (safe) => safe.toLowerCase() === avatar.toLowerCase(),
  )
  const pilotIsDelegate =
    pilotAddress != null &&
    delegates.some(
      (delegate) => delegate.toLowerCase() === pilotAddress.toLowerCase(),
    )
  const defaultModOption =
    pilotIsOwner || pilotIsDelegate ? NO_MODULE_OPTION : undefined

  const moduleAddress = getModuleAddress(waypoints)

  const selectedModule = modules.find(
    (module) => module.moduleAddress === moduleAddress,
  )

  const isLoading = isLoadingSafes || isLoadingDelegates || isLoadingModules

  return (
    <>
      <ModSelect
        isMulti={false}
        label="Zodiac Mod"
        options={[
          ...(pilotIsOwner || pilotIsDelegate ? [NO_MODULE_OPTION] : []),
          ...modules.map((mod) => ({
            value: mod.moduleAddress,
            label: ZODIAC_MODULE_NAMES[mod.type],
          })),
        ]}
        onChange={async (selected) => {
          if (selected == null) {
            onSelect(null)

            return
          }

          const module = modules.find(
            ({ moduleAddress }) => moduleAddress === selected.value,
          )

          if (module == null) {
            onSelect(null)

            return
          }

          onSelect(module)
        }}
        value={
          selectedModule != null
            ? {
                value: selectedModule.moduleAddress,
                label: ZODIAC_MODULE_NAMES[selectedModule.type],
              }
            : defaultModOption != null
              ? defaultModOption
              : null
        }
        isDisabled={disabled || isLoading}
        placeholder={isLoading ? 'Loading modules...' : 'Select a module'}
        avatarAddress={avatar}
      />

      {selectedModule?.type === SupportedZodiacModuleType.ROLES_V1 && (
        <TextInput
          label="Role ID"
          name="roleId"
          defaultValue={getRoleId(waypoints) ?? ''}
          placeholder="0"
        />
      )}

      {selectedModule?.type === SupportedZodiacModuleType.ROLES_V2 && (
        <RoleKey waypoints={waypoints} />
      )}
    </>
  )
}

const useSafes = (chainId: ChainId, pilotAddress: HexAddress | null) => {
  const {
    load,
    state,
    data = [],
  } = useFetcher<string[]>({
    key: 'available-safes',
  })

  useEffect(() => {
    if (pilotAddress == null || pilotAddress === ZERO_ADDRESS) {
      return
    }

    load(`/${pilotAddress}/${chainId}/available-safes`)
  }, [chainId, load, pilotAddress])

  return [state === 'loading', data] as const
}

const useDelegates = (chainId: ChainId, pilotAddress: HexAddress | null) => {
  const {
    load,
    state,
    data = [],
  } = useFetcher<string[]>({
    key: 'delegates',
  })

  useEffect(() => {
    if (pilotAddress == null || pilotAddress === ZERO_ADDRESS) {
      return
    }

    load(`/${pilotAddress}/${chainId}/delegates`)
  }, [chainId, load, pilotAddress])

  return [state === 'loading', data] as const
}

const useModules = (chainId: ChainId, avatar: PrefixedAddress) => {
  const {
    load,
    state,
    data = [],
  } = useFetcher<ZodiacModule[]>({
    key: 'modules',
  })

  useEffect(() => {
    const address = parsePrefixedAddress(avatar)

    if (address === ZERO_ADDRESS) {
      return
    }

    load(`/${address}/${chainId}/modules`)
  }, [avatar, chainId, load])

  return [state === 'loading', data] as const
}

type RoleKeyProps = {
  waypoints?: Waypoints
}

const RoleKey = ({ waypoints }: RoleKeyProps) => {
  const [value, setValue] = useState(getRoleKey(waypoints) ?? '')

  return (
    <>
      <input type="hidden" name="roleId" value={encodeRoleKey(value)} />

      <TextInput
        label="Role Key"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Enter key as bytes32 hex string or in human-readable decoding"
      />
    </>
  )
}

const getModuleAddress = (waypoints?: Waypoints) => {
  const moduleWaypoint = getModuleWaypoint(waypoints)

  if (moduleWaypoint == null) {
    return null
  }

  return moduleWaypoint.account.address
}

const getRoleId = (waypoints?: Waypoints) => {
  const moduleWaypoint = getModuleWaypoint(waypoints)

  if (moduleWaypoint == null) {
    return null
  }

  if (moduleWaypoint.connection.type !== ConnectionType.IS_MEMBER) {
    return null
  }

  return moduleWaypoint.connection.roles[0]
}

const getRoleKey = (waypoints?: Waypoints) => {
  const roleId = getRoleId(waypoints)

  if (roleId == null) {
    return null
  }

  return decodeRoleKey(roleId)
}

const getModuleWaypoint = (waypoints?: Waypoints) => {
  if (waypoints == null) {
    return null
  }

  const [, ...waypointsToConsider] = waypoints

  const moduleWaypoint = waypointsToConsider.find(
    (waypoint) =>
      waypoint.account.type === AccountType.ROLES ||
      waypoint.account.type === AccountType.DELAY,
  )

  if (moduleWaypoint == null) {
    return null
  }

  return moduleWaypoint
}
