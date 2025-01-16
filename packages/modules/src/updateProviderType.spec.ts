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
} from '@zodiac/test-utils'
import { AccountType } from 'ser-kit'
import { describe, expect, it } from 'vitest'
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

    it('keeps the chain of the current starting point', () => {
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

      expect(getChainId(startingPoint.account.prefixedAddress)).toEqual(
        Chain.GNO,
      )
    })

    it('keeps the other waypoints untouched', () => {
      const waypoints = [createMockRoleWaypoint(), createMockEndWaypoint()]

      const route = createMockExecutionRoute({
        waypoints: createMockWaypoints({
          start: createMockStartingWaypoint(createMockSafeAccount()),
          waypoints,
        }),
      })

      const updatedRoute = updateProviderType(
        route,
        ProviderType.InjectedWallet,
      )

      expect(getWaypoints(updatedRoute)).toEqual(waypoints)
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

      const updatedRoute = updateProviderType(
        route,
        ProviderType.InjectedWallet,
      )

      const startingPoint = getStartingWaypoint(updatedRoute.waypoints)

      expect(startingPoint.account).toHaveProperty('address', address)
    })

    it('keeps the chain of the current starting point', () => {
      const route = createMockExecutionRoute({
        waypoints: createMockWaypoints({
          start: createMockStartingWaypoint(
            createMockEoaAccount({ chainId: Chain.GNO }),
          ),
        }),
      })

      const updatedRoute = updateProviderType(
        route,
        ProviderType.InjectedWallet,
      )

      const startingPoint = getStartingWaypoint(updatedRoute.waypoints)

      expect(getChainId(startingPoint.account.prefixedAddress)).toEqual(
        Chain.GNO,
      )
    })

    it('keeps the other waypoints untouched', () => {
      const waypoints = [createMockRoleWaypoint(), createMockEndWaypoint()]

      const route = createMockExecutionRoute({
        waypoints: createMockWaypoints({
          start: createMockStartingWaypoint(createMockEoaAccount()),
          waypoints,
        }),
      })

      const updatedRoute = updateProviderType(route, ProviderType.WalletConnect)

      expect(getWaypoints(updatedRoute)).toEqual(waypoints)
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
