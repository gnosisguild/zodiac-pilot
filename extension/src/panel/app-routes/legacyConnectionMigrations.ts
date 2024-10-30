import { LegacyConnection, ProviderType, ZodiacRoute } from '@/types'
import { KnownContracts } from '@gnosis.pm/zodiac'
import { ZeroAddress } from 'ethers'
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
} from '../integrations/zodiac/rolesMultisend'

export function fromLegacyConnection(
  connection: LegacyConnection
): ZodiacRoute {
  const { chainId, providerType, moduleType } = connection

  // We assume an EOA if the providerType is MetaMask, a Safe otherwise
  const isEoa = providerType === ProviderType.InjectedWallet

  const avatarAddress = (connection.avatarAddress ||
    ZeroAddress) as `0x${string}`
  const pilotAddress = (connection.pilotAddress || ZeroAddress) as `0x${string}`

  const avatarPrefixedAddress = formatPrefixedAddress(chainId, avatarAddress)

  const pilotPrefixedAddress = formatPrefixedAddress(
    isEoa ? undefined : chainId,
    pilotAddress
  )

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
    connection: pilotPrefixedAddress
      ? {
          type: ConnectionType.IS_MEMBER,
          from: pilotPrefixedAddress,
          roles: [connection.roleId].filter(Boolean) as string[],
        }
      : undefined,
  }

  const moduleWaypoint = delayModuleWaypoint || rolesModuleWaypoint

  const waypoints = [
    {
      account: isEoa
        ? ({
            type: AccountType.EOA,
            prefixedAddress: pilotPrefixedAddress,
            address: pilotAddress,
          } as const)
        : ({
            type: AccountType.SAFE,
            prefixedAddress: pilotPrefixedAddress,
            address: pilotAddress,
            chain: chainId,
            threshold: NaN, // we don't know the threshold
          } as const),
    },

    ...((moduleWaypoint ? [moduleWaypoint] : []) as Waypoint[]),

    {
      account: {
        type: AccountType.SAFE,
        prefixedAddress: avatarPrefixedAddress,
        address: avatarAddress,
        chain: chainId,
        threshold: NaN, // we don't know the threshold
      },
      connection: modulePrefixedAddress
        ? {
            type: ConnectionType.IS_ENABLED,
            from: modulePrefixedAddress,
          }
        : {
            type: ConnectionType.OWNS,
            from: pilotPrefixedAddress,
          },
    } as Waypoint,
  ]

  return {
    id: connection.id,
    label: connection.label,
    lastUsed: connection.lastUsed,
    providerType,
    waypoints: waypoints as ZodiacRoute['waypoints'],
    initiator: pilotAddress ? pilotPrefixedAddress : undefined,
    avatar: avatarPrefixedAddress,
  }
}

export function asLegacyConnection(route: ZodiacRoute): LegacyConnection {
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

  const moduleWaypoint = route.waypoints?.find(
    (w) =>
      w.account.type === AccountType.ROLES ||
      w.account.type === AccountType.DELAY
  )
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
    pilotAddress:
      pilotAddress && pilotAddress !== ZeroAddress ? pilotAddress : '',
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
      moduleWaypoint &&
      'connection' in moduleWaypoint &&
      moduleWaypoint.connection?.type === ConnectionType.IS_MEMBER
        ? moduleWaypoint?.connection.roles[0]
        : undefined,
    lastUsed: route.lastUsed,
  }
}