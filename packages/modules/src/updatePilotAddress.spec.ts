import { Chain, getChainId } from '@zodiac/chains'
import {
  createMockDelayWaypoint,
  createMockEnabledConnection,
  createMockEndWaypoint,
  createMockExecutionRoute,
  createMockOwnsConnection,
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
import { updatePilotAddress } from './updatePilotAddress'

describe('updatePilotAddress', () => {
  it('updates the starting waypoint', () => {
    const route = createMockExecutionRoute()

    const newAddress = randomAddress()

    const updatedRoute = updatePilotAddress(route, newAddress)
    const startingPoint = getStartingWaypoint(updatedRoute.waypoints)

    expect(startingPoint.account).toHaveProperty('address', newAddress)
    expect(startingPoint.account).toHaveProperty(
      'prefixedAddress',
      formatPrefixedAddress(
        getChainId(startingPoint.account.prefixedAddress),
        newAddress,
      ),
    )
  })

  it('updates the initiator field', () => {
    const route = createMockExecutionRoute()

    const newAddress = randomAddress()

    const updatedRoute = updatePilotAddress(route, newAddress)

    expect(updatedRoute).toHaveProperty(
      'initiator',
      formatPrefixedAddress(undefined, newAddress),
    )
  })

  it.each([
    [AccountType.ROLES, createMockRoleWaypoint()],
    [AccountType.DELAY, createMockDelayWaypoint()],
    [
      AccountType.SAFE,
      createMockEndWaypoint({ connection: createMockOwnsConnection() }),
    ],
  ])('it updates the connection for "%s" waypoints', (_, waypoint) => {
    const route = createMockExecutionRoute({
      waypoints: createMockWaypoints({
        start: createMockStartingWaypoint(createMockSafeAccount()),
        waypoints: [waypoint],
      }),
    })

    const newAddress = randomAddress()

    const updatedRoute = updatePilotAddress(route, newAddress)

    const [updatedWaypoint] = getWaypoints(updatedRoute)

    expect(updatedWaypoint.connection).toHaveProperty(
      'from',
      formatPrefixedAddress(Chain.ETH, newAddress),
    )
  })

  it('does not update Safe waypoints that have a IS_ENABLED relation', () => {
    const roleWaypoint = createMockRoleWaypoint()

    const route = createMockExecutionRoute({
      waypoints: createMockWaypoints({
        waypoints: [roleWaypoint],
        end: createMockEndWaypoint({
          connection: createMockEnabledConnection(
            roleWaypoint.account.prefixedAddress,
          ),
        }),
      }),
    })

    const updatedRoute = updatePilotAddress(route, randomAddress())

    const [, updatedWaypoint] = getWaypoints(updatedRoute)

    expect(updatedWaypoint.connection).toHaveProperty(
      'from',
      roleWaypoint.account.prefixedAddress,
    )
  })

  describe('EOA', () => {
    it('handles EOA addresses in the safe endpoint', () => {
      const route = createMockExecutionRoute({
        waypoints: createMockWaypoints({
          end: createMockEndWaypoint({
            connection: createMockOwnsConnection(
              formatPrefixedAddress(undefined, randomAddress()),
            ),
          }),
        }),
      })

      const address = randomAddress()

      const updatedRoute = updatePilotAddress(route, address)
      const [endPoint] = getWaypoints(updatedRoute)

      expect(endPoint.connection).toHaveProperty(
        'from',
        formatPrefixedAddress(undefined, address),
      )
    })
  })
})
