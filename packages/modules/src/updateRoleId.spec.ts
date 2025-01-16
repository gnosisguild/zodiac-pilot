import {
  createMockExecutionRoute,
  createMockRoleWaypoint,
  createMockWaypoints,
} from '@zodiac/test-utils'
import { describe, expect, it } from 'vitest'
import { getWaypoints } from './getWaypoints'
import { updateRoleId } from './updateRoleId'

describe('updateRoleId', () => {
  it('updates the role in a roles waypoint', () => {
    const route = createMockExecutionRoute({
      waypoints: createMockWaypoints({ waypoints: [createMockRoleWaypoint()] }),
    })

    const updatedRoute = updateRoleId(route, 'test-role')

    const [updatedWaypoint] = getWaypoints(updatedRoute)

    expect(updatedWaypoint.connection).toHaveProperty('roles', ['test-role'])
  })
})
