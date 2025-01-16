import { Chain, getChainId } from '@zodiac/chains'
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
import { AccountType, formatPrefixedAddress } from 'ser-kit'
import { describe, expect, it } from 'vitest'
import { getStartingWaypoint } from './getStartingWaypoint'
import { getWaypoints } from './getWaypoints'
import { updateChainId } from './updateChainId'

describe('updateChainId', () => {
  describe('Avatar', () => {
    it('Updates the chain of the avatar', () => {
      const address = randomAddress()

      const route = createMockExecutionRoute({
        avatar: formatPrefixedAddress(Chain.ETH, address),
      })

      const updatedRoute = updateChainId(route, Chain.GNO)

      expect(updatedRoute).toHaveProperty(
        'avatar',
        formatPrefixedAddress(Chain.GNO, address),
      )
    })
  })

  describe('Waypoints', () => {
    describe('Starting point', () => {
      it('updates the chain of the starting point prefixed address', () => {
        const route = createMockExecutionRoute({
          waypoints: createMockWaypoints({
            start: createMockStartingWaypoint(
              createMockEoaAccount({ chainId: Chain.ETH }),
            ),
          }),
        })

        const updatedRoute = updateChainId(route, Chain.GNO)

        const startingPoint = getStartingWaypoint(updatedRoute.waypoints)

        expect(getChainId(startingPoint.account.prefixedAddress)).toEqual(
          Chain.GNO,
        )
      })

      it('updates the chain property of SAFE starting points', () => {
        const route = createMockExecutionRoute({
          waypoints: createMockWaypoints({
            start: createMockStartingWaypoint(
              createMockSafeAccount({ chainId: Chain.ETH }),
            ),
          }),
        })

        const updatedRoute = updateChainId(route, Chain.GNO)

        const startingPoint = getStartingWaypoint(updatedRoute.waypoints)

        expect(startingPoint.account).toHaveProperty('chain', Chain.GNO)
      })
    })

    describe.each([
      [AccountType.ROLES, createMockRoleWaypoint({ chainId: Chain.ETH })],
      [
        AccountType.SAFE,
        createMockEndWaypoint(createMockSafeAccount({ chainId: Chain.ETH })),
      ],
    ])('Waypoint with account type: "%s"', (_, waypoint) => {
      it('updates the prefixed address of roles modules', () => {
        const route = createMockExecutionRoute({
          waypoints: createMockWaypoints({
            waypoints: [waypoint],
          }),
        })

        const updatedRoute = updateChainId(route, Chain.GNO)

        const [updatedWaypoint] = getWaypoints(updatedRoute)

        expect(getChainId(updatedWaypoint.account.prefixedAddress)).toEqual(
          Chain.GNO,
        )
      })

      it('updates the chain property of roles modules', () => {
        const route = createMockExecutionRoute({
          waypoints: createMockWaypoints({
            waypoints: [waypoint],
          }),
        })

        const updatedRoute = updateChainId(route, Chain.GNO)

        const [updatedWaypoint] = getWaypoints(updatedRoute)

        expect(updatedWaypoint.account).toHaveProperty('chain', Chain.GNO)
      })

      it('updates the from address of the connection', () => {
        const route = createMockExecutionRoute({
          waypoints: createMockWaypoints({
            waypoints: [waypoint],
          }),
        })

        const updatedRoute = updateChainId(route, Chain.GNO)

        const [updatedWaypoint] = getWaypoints(updatedRoute)

        expect(getChainId(updatedWaypoint.connection.from)).toEqual(Chain.GNO)
      })
    })
  })
})
