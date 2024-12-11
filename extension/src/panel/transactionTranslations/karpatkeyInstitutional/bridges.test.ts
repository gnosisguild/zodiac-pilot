import { describe, expect, it } from 'vitest'
import {
  ETH_CIRCLE_TOKEN_MESSENGER,
  ETH_GNO_XDAI_BRIDGE,
  extractBridgedTokenAddress,
} from './bridges'

describe('extractBridgedTokenAddress', () => {
  it('detects USDC bridging via ETH_CIRCLE_TOKEN_MESSENGER', () => {
    const result = extractBridgedTokenAddress(
      {
        to: ETH_CIRCLE_TOKEN_MESSENGER.address,
        data: '0x6fd3504e00000000000000000000000000000000000000000000000000000005d21dba000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000846e7f810e08f1e2af2c5afd06847cc95f5cae1b000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        value: 0n,
      },
      1,
    )
    expect(result).toBe('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')
  })

  it('detects DAI transfers via ETH_GNO_XDAI_BRIDGE', () => {
    const result = extractBridgedTokenAddress(
      {
        to: ETH_GNO_XDAI_BRIDGE.address,
        data: '0x01e4f53a000000000000000000000000123412341234123412341234123412341234123400000000000000000000000000000000000000000000000000000000499602d2',
        value: 0n,
      },
      1,
    )
    expect(result).toBe('0x6B175474E89094C44Da98b954EedeAC495271d0F')
  })
})
