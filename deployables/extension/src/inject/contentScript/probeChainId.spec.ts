import { Chain } from '@zodiac/chains'
import { describe, expect, it } from 'vitest'
import { probeChainId } from './probeChainId'

describe('probeChainId', () => {
  it('fast tracks known URLs', async () => {
    await expect(
      probeChainId('https://arbitrum-mainnet.infura.io/v3/some-api-key'),
    ).resolves.toEqual(Chain.ARB1)
  })
})
