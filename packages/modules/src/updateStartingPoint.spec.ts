import {
  createMockDelayWaypoint,
  createMockEndWaypoint,
  createMockEoaAccount,
  createMockExecutionRoute,
  createMockRoleWaypoint,
  createMockSafeAccount,
  createMockStartingWaypoint,
  createMockWaypoints,
} from '@zodiac/test-utils'
import { describe, expect, it } from 'vitest'
import { getStartingWaypoint } from './getStartingWaypoint'
import { getWaypoints } from './getWaypoints'
import { updateStartingPoint } from './updateStartingPoint'

describe('updateStartingPoint', () => {
  it('updates the starting waypoint', () => {
    const route = createMockExecutionRoute()

    const newAccount = createMockEoaAccount()

    const updatedRoute = updateStartingPoint(route, newAccount)
    const startingPoint = getStartingWaypoint(updatedRoute.waypoints)

    expect(startingPoint.account).toEqual(newAccount)
  })

  it('updates the initiator field', () => {
    const route = createMockExecutionRoute()

    const newAccount = createMockEoaAccount()

    const updatedRoute = updateStartingPoint(route, newAccount)

    expect(updatedRoute).toHaveProperty('initiator', newAccount.prefixedAddress)
  })

  it('updates the connection of the waypoint connected to the starting point', () => {
    const route = createMockExecutionRoute({
      waypoints: createMockWaypoints({
        start: createMockStartingWaypoint(createMockSafeAccount()),
        waypoints: [createMockRoleWaypoint(), createMockEndWaypoint()],
      }),
    })
    const newAccount = createMockEoaAccount()
    const updatedRoute = updateStartingPoint(route, newAccount)

    const [updatedWaypoint] = getWaypoints(updatedRoute)

    expect(updatedWaypoint.connection).toHaveProperty(
      'from',
      newAccount.prefixedAddress,
    )
  })

  it('leaves other waypoints unchanged', () => {
    const delayWaypoint = createMockDelayWaypoint()
    const endWaypoint = createMockEndWaypoint()
    const route = createMockExecutionRoute({
      waypoints: createMockWaypoints({
        start: createMockStartingWaypoint(createMockSafeAccount()),
        waypoints: [createMockRoleWaypoint(), delayWaypoint, endWaypoint],
      }),
    })

    const newAccount = createMockEoaAccount()
    const updatedRoute = updateStartingPoint(route, newAccount)

    const [, updatedDelayWaypoint, updatedEndWaypoint] =
      getWaypoints(updatedRoute)

    expect(updatedDelayWaypoint).toEqual(delayWaypoint)
    expect(updatedEndWaypoint).toEqual(endWaypoint)
  })
})
