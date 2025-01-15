import { Chain, ZERO_ADDRESS } from '@zodiac/chains'
import {
  createEndWaypoint,
  createMockExecutionRoute,
  createStartingWaypoint,
  randomAddress,
} from '@zodiac/test-utils'
import { formatPrefixedAddress } from 'ser-kit'
import { describe, expect, it } from 'vitest'
import { removeAvatar } from './removeAvatar'

describe('removeAvatar', () => {
  it('removes the last waypoint', () => {
    const startingPoint = createStartingWaypoint()

    const route = createMockExecutionRoute({
      waypoints: [startingPoint, createEndWaypoint()],
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
})
