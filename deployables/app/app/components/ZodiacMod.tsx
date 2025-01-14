import {
  decodeRoleKey,
  SupportedZodiacModuleType,
  ZODIAC_MODULE_NAMES,
  type ZodiacModule,
} from '@zodiac/modules'
import type { Waypoints } from '@zodiac/schema'
import { TextInput } from '@zodiac/ui'
import { useEffect } from 'react'
import { useFetcher } from 'react-router'
import {
  AccountType,
  ConnectionType,
  splitPrefixedAddress,
  type PrefixedAddress,
} from 'ser-kit'
import { ModSelect, NO_MODULE_OPTION } from './ModSelect'

type ZodiacModProps = {
  waypoints: Waypoints
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
  const {
    load: loadSafes,
    state: safesState,
    data: safes = [],
  } = useFetcher<string[]>({
    key: 'available-safes',
  })
  const {
    load: loadDelegates,
    state: delegatesState,
    data: delegates = [],
  } = useFetcher<string[]>({
    key: 'delegates',
  })
  const {
    load: loadModules,
    state: modulesState,
    data: modules = [],
  } = useFetcher<ZodiacModule[]>({
    key: 'modules',
  })
  const [chainId] = splitPrefixedAddress(avatar)
  const pilotAddress = getPilotAddress(waypoints)

  useEffect(() => {
    if (pilotAddress == null) {
      return
    }

    loadSafes(`/${pilotAddress}/${chainId}/available-safes`)
    loadDelegates(`/${pilotAddress}/${chainId}/delegates`)
  }, [chainId, loadDelegates, loadSafes, pilotAddress])

  useEffect(() => {
    const [, address] = splitPrefixedAddress(avatar)

    loadModules(`/${address}/${chainId}/modules`)
  }, [avatar, chainId, loadModules])

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

  const isLoading =
    safesState === 'loading' ||
    delegatesState === 'loading' ||
    modulesState === 'loading'

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
          value={getRoleId(waypoints) ?? ''}
          placeholder="0"
        />
      )}

      {selectedModule?.type === SupportedZodiacModuleType.ROLES_V2 && (
        <TextInput
          label="Role Key"
          defaultValue={getRoleKey(waypoints) ?? ''}
          placeholder="Enter key as bytes32 hex string or in human-readable decoding"
        />
      )}
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

const getPilotAddress = (waypoints?: Waypoints) => {
  if (waypoints == null) {
    return null
  }

  const [startingPoint] = waypoints

  return startingPoint.account.address
}
