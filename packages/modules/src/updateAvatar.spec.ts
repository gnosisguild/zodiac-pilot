import {
  createMockEndWaypoint,
  createMockEoaAccount,
  createMockExecutionRoute,
  createMockRoleWaypoint,
  createMockStartingWaypoint,
  createMockWaypoints,
} from '@/test-utils'
import { Chain } from '@zodiac/chains'
import { randomAddress, randomPrefixedAddress } from '@zodiac/test-utils'
import { ConnectionType, prefixAddress } from 'ser-kit'
import { describe, expect, it } from 'vitest'
import { getWaypoints } from './getWaypoints'
import { updateAvatar } from './updateAvatar'

describe('updateAvatar', () => {
  describe('Avatar', () => {
    it('updates the avatar prop on the route', () => {
      const currentSafe = randomAddress()

      const route = createMockExecutionRoute({
        avatar: prefixAddress(Chain.ETH, currentSafe),
        waypoints: createMockWaypoints({
          end: createMockEndWaypoint({
            account: {
              address: currentSafe,
              chainId: Chain.ETH,
            },
          }),
        }),
      })

      const safe = randomAddress()

      const updatedRoute = updateAvatar(route, { safe })

      expect(updatedRoute).toHaveProperty(
        'avatar',
        prefixAddress(Chain.ETH, safe),
      )
    })
  })

  describe('Account', () => {
    it('keeps existing waypoints', () => {
      const currentSafe = randomAddress()

      const startingPoint = createMockStartingWaypoint()
      const roleWaypoint = createMockRoleWaypoint()

      const route = createMockExecutionRoute({
        avatar: prefixAddress(Chain.ETH, currentSafe),
        waypoints: [startingPoint, roleWaypoint],
      })

      const safe = randomAddress()

      const updatedRoute = updateAvatar(route, { safe })

      expect(updatedRoute.waypoints).toEqual([
        startingPoint,
        roleWaypoint,
        expect.anything(),
      ])
    })

    it('updates an existing safe endpoint', () => {
      const currentSafe = randomAddress()

      const route = createMockExecutionRoute({
        avatar: prefixAddress(Chain.GNO, currentSafe),
        waypoints: createMockWaypoints({
          end: createMockEndWaypoint({
            account: {
              address: currentSafe,
              chainId: Chain.GNO,
            },
          }),
        }),
      })

      const safe = randomAddress()

      const updatedRoute = updateAvatar(route, { safe })

      const [updatedWaypoint] = getWaypoints(updatedRoute)

      expect(updatedWaypoint.account).toMatchObject({
        address: safe,
        chain: Chain.GNO,
        prefixedAddress: prefixAddress(Chain.GNO, safe),
      })
    })

    it('adds an endpoint if none exists', () => {
      const route = createMockExecutionRoute({
        avatar: randomPrefixedAddress({ chainId: Chain.GNO }),
      })

      const safe = randomAddress()

      const updatedRoute = updateAvatar(route, { safe })

      const [updatedWaypoint] = getWaypoints(updatedRoute)

      expect(updatedWaypoint.account).toMatchObject({
        address: safe,
        chain: Chain.GNO,
        prefixedAddress: prefixAddress(Chain.GNO, safe),
      })
    })
  })

  describe('Connection', () => {
    it('uses an "OWNS" connection type if not roles mod is configured', () => {
      const pilotAddress = randomAddress()

      const route = createMockExecutionRoute({
        waypoints: [
          createMockStartingWaypoint(
            createMockEoaAccount({ address: pilotAddress }),
          ),
        ],
      })

      const safe = randomAddress()

      const updatedRoute = updateAvatar(route, { safe })

      const [updatedWaypoint] = getWaypoints(updatedRoute)

      expect(updatedWaypoint.connection).toEqual({
        from: prefixAddress(undefined, pilotAddress),
        type: ConnectionType.OWNS,
      })
    })

    it('uses an "IS_ENABLED" connection type if a roles mod is configured', () => {
      const moduleAddress = randomAddress()

      const route = createMockExecutionRoute({
        waypoints: createMockWaypoints({
          waypoints: [
            createMockRoleWaypoint({ chainId: Chain.GNO, moduleAddress }),
          ],
        }),
      })

      const safe = randomAddress()

      const updatedRoute = updateAvatar(route, { safe })

      const [, updatedWaypoint] = getWaypoints(updatedRoute)

      expect(updatedWaypoint.connection).toEqual({
        from: prefixAddress(Chain.GNO, moduleAddress),
        type: ConnectionType.IS_ENABLED,
      })
    })
  })
})
