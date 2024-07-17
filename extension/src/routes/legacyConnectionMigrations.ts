import { KnownContracts } from '@gnosis.pm/zodiac'
import {
  AccountType,
  ConnectionType,
  Delay,
  formatPrefixedAddress,
  parsePrefixedAddress,
  Roles,
  Waypoint,
} from 'ser-kit'
import {
  MULTISEND,
  MULTISEND_CALL_ONLY,
  queryRolesV1MultiSend,
  queryRolesV2MultiSend,
} from '../integrations/zodiac/rolesMultisend'
import { Route, LegacyConnection, ProviderType } from '../types'
import { validateAddress } from '../utils'

type LegacyConnectionStateMigration = (
  connection: LegacyConnection
) => LegacyConnection | Promise<LegacyConnection>

// If the LegacyConnection state structure changes we must lazily migrate users' connections states from the old structure to the new one.
// This is done by adding an idempotent migration function to this array.
const CONNECTION_STATE_MIGRATIONS: LegacyConnectionStateMigration[] = [
  function addModuleType(connection) {
    // This migration adds the moduleType property to the connection object.
    // All existing connections without moduleType are assumed to use the Roles mod, since that was the only supported module type at the time.
    let moduleType = connection.moduleType
    if (!moduleType && connection.moduleAddress) {
      moduleType = KnownContracts.ROLES_V1
    }
    return {
      ...connection,
      moduleType,
    }
  },

  function lowercaseAddresses(connection) {
    // This migration lowercases all addresses in the connection object.
    return {
      ...connection,
      moduleAddress: connection.moduleAddress
        ? connection.moduleAddress.toLowerCase()
        : '',
      avatarAddress: connection.avatarAddress.toLowerCase(),
      pilotAddress: connection.pilotAddress.toLowerCase(),
    }
  },

  function renameRolesV1ModuleType(connection) {
    // moduleType: 'roles' -> 'roles_v1' rename
    return {
      ...connection,
      moduleType:
        connection.moduleType === ('roles' as unknown)
          ? KnownContracts.ROLES_V1
          : connection.moduleType,
    }
  },

  async function queryRolesMultisend(connection) {
    // This migration adds the multisend & multisendCallOnly addresses to connection object going through a Roles mod.
    if (
      connection.moduleType === KnownContracts.ROLES_V1 &&
      !('multisend' in connection)
    ) {
      return {
        ...connection,
        multisend: await queryRolesV1MultiSend(
          connection.chainId,
          connection.moduleAddress
        ),
      }
    }

    if (
      connection.moduleType === KnownContracts.ROLES_V2 &&
      !('multisend' in connection)
    ) {
      return {
        ...connection,
        ...(await queryRolesV2MultiSend(
          connection.chainId,
          connection.moduleAddress
        )),
      }
    }

    return connection
  },
]

// Apply all migrations to the given connections
export const migrateLegacyConnections = async (
  connections: LegacyConnection[]
): Promise<LegacyConnection[]> => {
  let migratedConnections = connections
  for (const migration of CONNECTION_STATE_MIGRATIONS) {
    migratedConnections = await Promise.all(migratedConnections.map(migration))
  }
  return migratedConnections
}

export function fromLegacyConnection(
  connection: LegacyConnection
): Route | undefined {
  const { chainId, providerType, moduleType } = connection

  // We assume an EOA if the providerType is MetaMask, a Safe otherwise
  const isEoa = providerType === ProviderType.MetaMask

  if (!validateAddress(connection.avatarAddress)) {
    // we don't migrate connections without a valid avatar address
    return undefined
  }
  const avatarPrefixedAddress = formatPrefixedAddress(
    chainId,
    connection.avatarAddress as `0x${string}`
  )

  const pilotPrefixedAddress = connection.pilotAddress
    ? formatPrefixedAddress(
        isEoa ? undefined : chainId,
        connection.pilotAddress as `0x${string}`
      )
    : undefined
  const modulePrefixedAddress =
    moduleType && connection.moduleAddress
      ? formatPrefixedAddress(
          chainId,
          connection.moduleAddress as `0x${string}`
        )
      : undefined

  const delayModuleWaypoint = moduleType === KnownContracts.DELAY && {
    account: {
      type: AccountType.DELAY,
      prefixedAddress: modulePrefixedAddress,
      address: connection.moduleAddress,
      chain: chainId,
    } as Delay,

    connection: {
      type: ConnectionType.IS_ENABLED,
      from: pilotPrefixedAddress,
    },
  }

  const rolesModuleWaypoint = (moduleType === KnownContracts.ROLES_V1 ||
    moduleType === KnownContracts.ROLES_V2) && {
    account: {
      type: AccountType.ROLES,
      prefixedAddress: modulePrefixedAddress,
      address: connection.moduleAddress,
      chain: chainId,
      version: moduleType === KnownContracts.ROLES_V1 ? 1 : 2,
      multisend: [connection.multisend, connection.multisendCallOnly].filter(
        Boolean
      ) as `0x${string}`[],
    } as Roles,
    connection: {
      type: ConnectionType.IS_MEMBER,
      from: pilotPrefixedAddress,
      roles: [connection.roleId].filter(Boolean) as string[],
    },
  }

  const moduleWaypoint = delayModuleWaypoint || rolesModuleWaypoint

  const waypoints: Route['waypoints'] = pilotPrefixedAddress
    ? [
        {
          account: isEoa
            ? {
                type: AccountType.EOA,
                prefixedAddress: pilotPrefixedAddress,
                address: connection.pilotAddress as `0x${string}`,
              }
            : {
                type: AccountType.SAFE,
                prefixedAddress: pilotPrefixedAddress,
                address: connection.pilotAddress as `0x${string}`,
                chain: chainId,
                threshold: NaN, // we don't know the threshold
              },
        },

        ...((moduleWaypoint ? [moduleWaypoint] : []) as Waypoint[]),

        {
          account: {
            type: AccountType.SAFE,
            prefixedAddress: avatarPrefixedAddress,
            address: connection.avatarAddress as `0x${string}`,
            chain: chainId,
            threshold: NaN, // we don't know the threshold
          },
          connection: {
            type: modulePrefixedAddress
              ? ConnectionType.IS_ENABLED
              : ConnectionType.OWNS,
            from: modulePrefixedAddress || pilotPrefixedAddress,
          },
        },
      ]
    : undefined

  return {
    id: connection.id,
    label: connection.label,
    lastUsed: connection.lastUsed,
    providerType,
    waypoints,
    initiator: pilotPrefixedAddress,
    avatar: avatarPrefixedAddress,
    _migratedFromLegacyConnection: true,
  }
}

export function asLegacyConnection(route: Route): LegacyConnection {
  if (route.waypoints && route.waypoints.length > 3) {
    throw new Error('Not representable as legacy connection')
  }

  const [chainId, avatarAddressChecksummed] = parsePrefixedAddress(route.avatar)
  const avatarAddress = avatarAddressChecksummed.toLowerCase()
  if (!chainId) {
    throw new Error('chainId is empty')
  }

  const pilotAddress =
    (route.initiator &&
      parsePrefixedAddress(route.initiator)[1].toLowerCase()) ||
    ''

  const moduleWaypoint =
    route.waypoints && route.waypoints.length === 3
      ? route.waypoints[1]
      : undefined

  const moduleType = moduleWaypoint?.account.type

  const multisend =
    moduleWaypoint?.account.type === AccountType.ROLES
      ? moduleWaypoint?.account.multisend
      : []

  return {
    id: route.id,
    label: route.label,
    moduleAddress: moduleWaypoint?.account.address || '',
    avatarAddress,
    pilotAddress,
    chainId,
    providerType: route.providerType,
    moduleType:
      moduleType === AccountType.DELAY
        ? KnownContracts.DELAY
        : moduleType === AccountType.ROLES
          ? moduleWaypoint?.account.version === 1
            ? KnownContracts.ROLES_V1
            : KnownContracts.ROLES_V2
          : undefined,
    multisend: multisend.find((a) => MULTISEND.includes(a)),
    multisendCallOnly: multisend.find((a) => MULTISEND_CALL_ONLY.includes(a)),
    roleId:
      moduleWaypoint?.connection.type === ConnectionType.IS_MEMBER
        ? moduleWaypoint?.connection.roles[0]
        : undefined,
    lastUsed: route.lastUsed,
  }
}
