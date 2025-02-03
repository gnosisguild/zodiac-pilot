import { Chain, getChainId } from '@zodiac/chains'
import { ProviderType } from '@zodiac/schema'
import {
  createMockEndWaypoint,
  createMockEoaAccount,
  createMockExecutionRoute,
  createMockRoleWaypoint,
  createMockSafeAccount,
  createMockStartingWaypoint,
  createMockWaypoints,
  randomAddress,
  randomPrefixedAddress,
} from '@zodiac/test-utils'
import { AccountType, prefixAddress, splitPrefixedAddress } from 'ser-kit'
import { describe, expect, it } from 'vitest'
import { createOwnsConnection } from './createOwnsConnection'
import { getStartingWaypoint } from './getStartingWaypoint'
import { getWaypoints } from './getWaypoints'
import { updateProviderType } from './updateProviderType'

describe('updateProviderType', () => {
  it.each([ProviderType.InjectedWallet, ProviderType.WalletConnect])(
    'updates the property on the route to "%s"',
    (providerType) => {
      const route = createMockExecutionRoute()

      const updatedRoute = updateProviderType(route, providerType)

      expect(updatedRoute).toHaveProperty('providerType', providerType)
    },
  )

  describe('SAFE -> EOA', () => {
    it('updates the starting point to EOA when an injected provider is used', () => {
      const route = createMockExecutionRoute({
        waypoints: createMockWaypoints({
          start: createMockStartingWaypoint(createMockSafeAccount()),
        }),
      })

      const updatedRoute = updateProviderType(
        route,
        ProviderType.InjectedWallet,
      )

      const startingPoint = getStartingWaypoint(updatedRoute.waypoints)

      expect(startingPoint.account).toHaveProperty('type', AccountType.EOA)
    })

    it('keeps the address of the current starting point', () => {
      const address = randomAddress()

      const route = createMockExecutionRoute({
        waypoints: createMockWaypoints({
          start: createMockStartingWaypoint(createMockSafeAccount({ address })),
        }),
      })

      const updatedRoute = updateProviderType(
        route,
        ProviderType.InjectedWallet,
      )

      const startingPoint = getStartingWaypoint(updatedRoute.waypoints)

      expect(startingPoint.account).toHaveProperty('address', address)
    })

    it('switches the starting point to an EOA without chain', () => {
      const route = createMockExecutionRoute({
        waypoints: createMockWaypoints({
          start: createMockStartingWaypoint(
            createMockSafeAccount({ chainId: Chain.GNO }),
          ),
        }),
      })

      const updatedRoute = updateProviderType(
        route,
        ProviderType.InjectedWallet,
      )

      const startingPoint = getStartingWaypoint(updatedRoute.waypoints)

      const [chainId] = splitPrefixedAddress(
        startingPoint.account.prefixedAddress,
      )

      expect(chainId).not.toBeDefined()
    })

    it('switches the initiator field to an EOA without chain', () => {
      const safeAccount = createMockSafeAccount()

      const route = createMockExecutionRoute({
        initiator: safeAccount.prefixedAddress,
        waypoints: createMockWaypoints({
          start: createMockStartingWaypoint(safeAccount),
        }),
      })

      const updatedRoute = updateProviderType(
        route,
        ProviderType.InjectedWallet,
      )

      expect(updatedRoute).toHaveProperty(
        'initiator',
        prefixAddress(undefined, safeAccount.address),
      )
    })

    it('switches roles waypoints to EOA without chain', () => {
      const safeAccount = createMockSafeAccount()

      const route = createMockExecutionRoute({
        waypoints: createMockWaypoints({
          start: createMockStartingWaypoint(safeAccount),
          waypoints: [
            createMockRoleWaypoint({ from: safeAccount.prefixedAddress }),
          ],
        }),
      })

      const updatedRoute = updateProviderType(
        route,
        ProviderType.InjectedWallet,
      )

      const [rolesWaypoint] = getWaypoints(updatedRoute)

      expect(rolesWaypoint.connection).toHaveProperty(
        'from',
        prefixAddress(undefined, safeAccount.address),
      )
    })

    it('updates the safe endpoint to use the EOA address when no roles are in between', () => {
      const safeAccount = createMockSafeAccount()

      const route = createMockExecutionRoute({
        waypoints: createMockWaypoints({
          start: createMockStartingWaypoint(safeAccount),
          end: createMockEndWaypoint({
            connection: createOwnsConnection(safeAccount.prefixedAddress),
          }),
        }),
      })

      const updatedRoute = updateProviderType(
        route,
        ProviderType.InjectedWallet,
      )

      const [endPoint] = getWaypoints(updatedRoute)

      expect(endPoint.connection).toHaveProperty(
        'from',
        prefixAddress(undefined, safeAccount.address),
      )
    })
  })

  describe('EOA -> SAFE', () => {
    it('updates the starting point to SAFE if anything else is used', () => {
      const route = createMockExecutionRoute({
        waypoints: createMockWaypoints({
          start: createMockStartingWaypoint(createMockEoaAccount()),
        }),
      })

      const updatedRoute = updateProviderType(route, ProviderType.WalletConnect)

      const startingPoint = getStartingWaypoint(updatedRoute.waypoints)

      expect(startingPoint.account).toHaveProperty('type', AccountType.SAFE)
    })

    it('keeps the address of the current starting point', () => {
      const address = randomAddress()

      const route = createMockExecutionRoute({
        waypoints: createMockWaypoints({
          start: createMockStartingWaypoint(createMockEoaAccount({ address })),
        }),
      })

      const updatedRoute = updateProviderType(route, ProviderType.WalletConnect)

      const startingPoint = getStartingWaypoint(updatedRoute.waypoints)

      expect(startingPoint.account).toHaveProperty('address', address)
    })

    it('keeps the chain of the current starting point', () => {
      const route = createMockExecutionRoute({
        avatar: randomPrefixedAddress({ chainId: Chain.GNO }),
        waypoints: createMockWaypoints({
          start: createMockStartingWaypoint(createMockEoaAccount()),
        }),
      })

      const updatedRoute = updateProviderType(route, ProviderType.WalletConnect)

      const startingPoint = getStartingWaypoint(updatedRoute.waypoints)

      expect(getChainId(startingPoint.account.prefixedAddress)).toEqual(
        Chain.GNO,
      )
    })

    it('switches the initiator field to contain a chain', () => {
      const eoaAccount = createMockEoaAccount()

      const route = createMockExecutionRoute({
        avatar: randomPrefixedAddress({ chainId: Chain.GNO }),
        initiator: eoaAccount.prefixedAddress,
        waypoints: createMockWaypoints({
          start: createMockStartingWaypoint(eoaAccount),
        }),
      })

      const updatedRoute = updateProviderType(route, ProviderType.WalletConnect)

      expect(updatedRoute).toHaveProperty(
        'initiator',
        prefixAddress(Chain.GNO, eoaAccount.address),
      )
    })

    it('switches roles waypoints to connection to use a from address with chain', () => {
      const eoaAccount = createMockEoaAccount()

      const route = createMockExecutionRoute({
        avatar: randomPrefixedAddress({ chainId: Chain.GNO }),
        waypoints: createMockWaypoints({
          start: createMockStartingWaypoint(eoaAccount),
          waypoints: [
            createMockRoleWaypoint({ from: eoaAccount.prefixedAddress }),
          ],
        }),
      })

      const updatedRoute = updateProviderType(route, ProviderType.WalletConnect)

      const [rolesWaypoint] = getWaypoints(updatedRoute)

      expect(rolesWaypoint.connection).toHaveProperty(
        'from',
        prefixAddress(Chain.GNO, eoaAccount.address),
      )
    })

    it('updates the safe endpoint to use an address with a chain when no roles are in between', () => {
      const eoaAccount = createMockEoaAccount()

      const route = createMockExecutionRoute({
        avatar: randomPrefixedAddress({ chainId: Chain.GNO }),
        waypoints: createMockWaypoints({
          start: createMockStartingWaypoint(eoaAccount),
          end: createMockEndWaypoint({
            connection: createOwnsConnection(eoaAccount.prefixedAddress),
          }),
        }),
      })

      const updatedRoute = updateProviderType(route, ProviderType.WalletConnect)

      const [endPoint] = getWaypoints(updatedRoute)

      expect(endPoint.connection).toHaveProperty(
        'from',
        prefixAddress(Chain.GNO, eoaAccount.address),
      )
    })
  })

  it.each([
    ['EOA -> EOA', createMockEoaAccount(), ProviderType.InjectedWallet],
    ['SAFE -> SAFE', createMockSafeAccount(), ProviderType.WalletConnect],
  ])(
    'keeps the current configuration if the provider type does not change (%s)',
    (_, account, providerType) => {
      const startingPoint = createMockStartingWaypoint(account)

      const route = createMockExecutionRoute({
        waypoints: createMockWaypoints({
          start: startingPoint,
        }),
      })

      const updatedRoute = updateProviderType(route, providerType)
      const updatedStartingPoint = getStartingWaypoint(updatedRoute.waypoints)

      expect(updatedStartingPoint).toEqual(startingPoint)
    },
  )
})
