import { Chain } from '@zodiac/chains'
import {
  createMockEndWaypoint,
  createMockExecutionRoute,
  createMockOwnsConnection,
  createMockRoleWaypoint,
  createMockWaypoints,
  randomAddress,
} from '@zodiac/test-utils'
import { prefixAddress } from 'ser-kit'
import { describe, expect, it } from 'vitest'
import { createEnabledConnection } from './createEnabledConnection'
import { getWaypoints } from './getWaypoints'
import { updateRolesWaypoint } from './updateRolesWaypoint'

describe('updateRolesWaypoint', () => {
  describe('Create', () => {
    it('changes an existing endpoint to a IS_ENABLED connection', () => {
      const route = createMockExecutionRoute({
        waypoints: createMockWaypoints({
          end: createMockEndWaypoint({
            connection: createMockOwnsConnection(),
          }),
        }),
      })

      const address = randomAddress()

      const updatedRoute = updateRolesWaypoint(route, {
        moduleAddress: address,
        multisend: [],
        version: 1,
      })

      const [, endPoint] = getWaypoints(updatedRoute)

      expect(endPoint).toHaveProperty(
        'connection',
        createEnabledConnection(prefixAddress(Chain.ETH, address)),
      )
    })
  })

  describe('Update', () => {
    it('changes an existing endpoint to a IS_ENABLED connection', () => {
      const route = createMockExecutionRoute({
        waypoints: createMockWaypoints({
          waypoints: [createMockRoleWaypoint()],
          end: createMockEndWaypoint({
            connection: createMockOwnsConnection(),
          }),
        }),
      })

      const address = randomAddress()

      const updatedRoute = updateRolesWaypoint(route, {
        moduleAddress: address,
        multisend: [],
        version: 1,
      })

      const [, endPoint] = getWaypoints(updatedRoute)

      expect(endPoint).toHaveProperty(
        'connection',
        createEnabledConnection(prefixAddress(Chain.ETH, address)),
      )
    })
  })
})
