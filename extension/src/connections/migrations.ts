import { KnownContracts } from '@gnosis.pm/zodiac'
import {
  queryRolesV1MultiSend,
  queryRolesV2MultiSend,
} from '../integrations/zodiac/rolesMultisend'
import { Connection } from '../types'

type ConnectionStateMigration = (
  connection: Connection
) => Connection | Promise<Connection>

// If the Connection state structure changes we must lazily migrate users' connections states from the old structure to the new one.
// This is done by adding an idempotent migration function to this array.
const CONNECTION_STATE_MIGRATIONS: ConnectionStateMigration[] = [
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
export const migrateConnections = async (
  connections: Connection[]
): Promise<Connection[]> => {
  let migratedConnections = connections
  for (const migration of CONNECTION_STATE_MIGRATIONS) {
    migratedConnections = await Promise.all(migratedConnections.map(migration))
  }
  return migratedConnections
}
