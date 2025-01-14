import {
  ProviderType,
  type ExecutionRoute,
  type LegacyConnection,
} from '@/types'
import {
  MULTISEND,
  MULTISEND_CALL_ONLY,
  SupportedZodiacModuleType,
} from '@/zodiac'
import { invariant } from '@epic-web/invariant'
import { ZeroAddress } from 'ethers'
import {
  AccountType,
  ConnectionType,
  formatPrefixedAddress,
  parsePrefixedAddress,
  splitPrefixedAddress,
  type PrefixedAddress,
  type Waypoint,
} from 'ser-kit'

export function fromLegacyConnection(
  connection: LegacyConnection,
): ExecutionRoute {
  const { chainId, providerType, moduleType } = connection

  // We assume an EOA if the providerType is MetaMask, a Safe otherwise
  const isEoa = providerType === ProviderType.InjectedWallet

  const avatarAddress = (connection.avatarAddress ||
    ZeroAddress) as `0x${string}`
  const pilotAddress = (connection.pilotAddress || ZeroAddress) as `0x${string}`

  const avatarPrefixedAddress = formatPrefixedAddress(chainId, avatarAddress)

  const pilotPrefixedAddress = formatPrefixedAddress(
    isEoa ? undefined : chainId,
    pilotAddress,
  )

  const modulePrefixedAddress =
    moduleType && connection.moduleAddress
      ? formatPrefixedAddress(
          chainId,
          connection.moduleAddress as `0x${string}`,
        )
      : undefined

  const delayModuleWaypoint = moduleType ===
    SupportedZodiacModuleType.DELAY && {
    account: {
      type: AccountType.DELAY,
      prefixedAddress: modulePrefixedAddress?.toLowerCase(),
      address: connection.moduleAddress,
      chain: chainId,
    },

    connection: {
      type: ConnectionType.IS_ENABLED,
      from: pilotPrefixedAddress.toLowerCase(),
    },
  }

  const rolesModuleWaypoint = (moduleType ===
    SupportedZodiacModuleType.ROLES_V1 ||
    moduleType === SupportedZodiacModuleType.ROLES_V2) && {
    account: {
      type: AccountType.ROLES,
      prefixedAddress: modulePrefixedAddress?.toLowerCase(),
      address: connection.moduleAddress,
      chain: chainId,
      version: moduleType === SupportedZodiacModuleType.ROLES_V1 ? 1 : 2,
      multisend: [connection.multisend, connection.multisendCallOnly].filter(
        Boolean,
      ) as `0x${string}`[],
    },
    connection: pilotPrefixedAddress
      ? {
          type: ConnectionType.IS_MEMBER,
          from: pilotPrefixedAddress.toLowerCase(),
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
            prefixedAddress: pilotPrefixedAddress.toLowerCase(),
            address: pilotAddress,
          } as const)
        : ({
            type: AccountType.SAFE,
            prefixedAddress: pilotPrefixedAddress.toLowerCase(),
            address: pilotAddress,
            chain: chainId,
            threshold: NaN, // we don't know the threshold
          } as const),
    },

    ...((moduleWaypoint ? [moduleWaypoint] : []) as Waypoint[]),

    {
      account: {
        type: AccountType.SAFE,
        prefixedAddress: avatarPrefixedAddress.toLowerCase(),
        address: avatarAddress,
        chain: chainId,
        threshold: NaN, // we don't know the threshold
      },
      connection: modulePrefixedAddress
        ? {
            type: ConnectionType.IS_ENABLED,
            from: modulePrefixedAddress.toLowerCase(),
          }
        : {
            type: ConnectionType.OWNS,
            from: pilotPrefixedAddress.toLowerCase(),
          },
    } as Waypoint,
  ]

  return {
    id: connection.id,
    label: connection.label,
    lastUsed: connection.lastUsed,
    providerType,
    waypoints: waypoints as ExecutionRoute['waypoints'],
    initiator: pilotAddress
      ? (pilotPrefixedAddress.toLowerCase() as PrefixedAddress)
      : undefined,
    avatar: avatarPrefixedAddress.toLowerCase() as PrefixedAddress,
  }
}

export function asLegacyConnection(route: ExecutionRoute): LegacyConnection {
  if (route.waypoints && route.waypoints.length > 3) {
    throw new Error('Not representable as legacy connection')
  }

  const [chainId, avatarAddressChecksummed] = splitPrefixedAddress(route.avatar)
  const avatarAddress = avatarAddressChecksummed.toLowerCase()

  invariant(chainId != null, 'chainId is empty')

  const pilotAddress =
    (route.initiator && parsePrefixedAddress(route.initiator).toLowerCase()) ||
    ''

  const moduleWaypoint = route.waypoints?.find(
    (w) =>
      w.account.type === AccountType.ROLES ||
      w.account.type === AccountType.DELAY,
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
    providerType: route.providerType ?? ProviderType.InjectedWallet,
    moduleType:
      moduleType === AccountType.DELAY
        ? SupportedZodiacModuleType.DELAY
        : moduleType === AccountType.ROLES
          ? moduleWaypoint?.account.version === 1
            ? SupportedZodiacModuleType.ROLES_V1
            : SupportedZodiacModuleType.ROLES_V2
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
