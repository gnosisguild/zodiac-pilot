import { Chain, ZERO_ADDRESS } from '@zodiac/chains'
import { prefixAddress, splitPrefixedAddress } from 'ser-kit'
import { describe, expect, it } from 'vitest'
import { createBlankRoute } from './createBlankRoute'
import { getStartingWaypoint } from './getStartingWaypoint'

describe('createBlankRoute', () => {
  describe('Label', () => {
    it('creates an empty label', () => {
      const { label } = createBlankRoute()

      expect(label).toEqual('')
    })
  })

  describe('Avatar', () => {
    it('defaults to ethereum as the chain', () => {
      const { avatar } = createBlankRoute()

      const [chainId] = splitPrefixedAddress(avatar)

      expect(chainId).toEqual(Chain.ETH)
    })

    it('uses the zero address for the default avatar', () => {
      const { avatar } = createBlankRoute()

      const [, address] = splitPrefixedAddress(avatar)

      expect(address).toEqual(ZERO_ADDRESS)
    })
  })

  describe('Starting point', () => {
    it('creates a blank starting point', () => {
      const route = createBlankRoute()

      const startingPoint = getStartingWaypoint(route.waypoints)

      expect(startingPoint.account).toHaveProperty('address', ZERO_ADDRESS)
      expect(startingPoint.account).toHaveProperty(
        'prefixedAddress',
        prefixAddress(undefined, ZERO_ADDRESS),
      )
    })
  })
})
