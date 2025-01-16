import { Chain, ZERO_ADDRESS } from '@zodiac/chains'
import { splitPrefixedAddress } from 'ser-kit'
import { describe, expect, it } from 'vitest'
import { createBlankRoute } from './createBlankRoute'

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
})
