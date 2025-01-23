import { Chain, ZERO_ADDRESS } from '@zodiac/chains'
import {
  createMockEndWaypoint,
  createMockExecutionRoute,
  createMockRoleWaypoint,
  createMockStartingWaypoint,
  createMockWaypoints,
  randomAddress,
} from '@zodiac/test-utils'
import { formatPrefixedAddress } from 'ser-kit'
import { describe, expect, it } from 'vitest'
import { removeAvatar } from './removeAvatar'

describe('removeAvatar', () => {
  it('removes the last waypoint', () => {
    const startingPoint = createMockStartingWaypoint()

    const route = createMockExecutionRoute({
      waypoints: [startingPoint, createMockEndWaypoint()],
    })

    const updatedRoute = removeAvatar(route)

    expect(updatedRoute.waypoints).toEqual([startingPoint])
  })

  it('resets the avatar address', () => {
    const route = createMockExecutionRoute({
      avatar: formatPrefixedAddress(Chain.GNO, randomAddress()),
    })

    const updatedRoute = removeAvatar(route)

    expect(updatedRoute).toHaveProperty(
      'avatar',
      formatPrefixedAddress(Chain.GNO, ZERO_ADDRESS),
    )
  })

  it('removes the role waypoint', () => {
    const rolesWaypoint = createMockRoleWaypoint()

    const route = createMockExecutionRoute({
      avatar: formatPrefixedAddress(Chain.GNO, randomAddress()),
      waypoints: createMockWaypoints({ waypoints: [rolesWaypoint] }),
    })

    const updatedRoute = removeAvatar(route)

    expect(updatedRoute.waypoints).not.toContain(rolesWaypoint)
  })
})
