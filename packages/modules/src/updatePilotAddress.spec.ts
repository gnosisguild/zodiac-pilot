import { Chain, getChainId } from '@zodiac/chains'
import { createMockExecutionRoute, randomAddress } from '@zodiac/test-utils'
import { formatPrefixedAddress } from 'ser-kit'
import { describe, expect, it } from 'vitest'
import { getStartingWaypoint } from './getStartingWaypoint'
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
      formatPrefixedAddress(Chain.ETH, newAddress),
    )
  })
})
