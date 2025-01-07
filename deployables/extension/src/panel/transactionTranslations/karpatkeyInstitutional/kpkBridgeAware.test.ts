import { invariant } from '@epic-web/invariant'
import type { MetaTransactionRequest } from 'ser-kit'
import { describe, expect, it } from 'vitest'
import {
  ARB1_GATEWAY_ROUTER,
  BASE_CIRCLE_TOKEN_MESSENGER,
  ETH_CIRCLE_TOKEN_MESSENGER,
  ETH_GNO_XDAI_BRIDGE,
  ETH_HOP_DAI_BRIDGE,
  GNOSIS_XDAI_BRIDGE_2,
  OPTIMISM_L2_HOP_CCTP,
} from './bridges'
import {
  BRIDGE_AWARE_CONTRACT_ADDRESSES,
  kpkBridgeAware,
} from './kpkBridgeAware'

const avatarAddress = '0x846e7f810e08f1e2af2c5afd06847cc95f5cae1b'

describe('karpatkey bridge aware translations', () => {
  const getBridgeAwareContract = (sourceChainId: number) => {
    const bridgeAwareContract = BRIDGE_AWARE_CONTRACT_ADDRESSES.find(
      (contract) => contract.chainId === sourceChainId,
    )

    invariant(
      bridgeAwareContract != null,
      'Could not find bridge aware contract',
    )

    return bridgeAwareContract
  }

  it('auto-applies the translation if it does not yet exist in the batch', async () => {
    expect(kpkBridgeAware.autoApply).toBe(true)

    const tx = {
      to: ETH_CIRCLE_TOKEN_MESSENGER.address,
      data: '0x6fd3504e00000000000000000000000000000000000000000000000000000005d21dba000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000846e7f810e08f1e2af2c5afd06847cc95f5cae1b000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      value: 0n,
    } satisfies MetaTransactionRequest
    const result = await kpkBridgeAware.translateGlobal([tx], 1, avatarAddress)
    const bridgeAwareContract = getBridgeAwareContract(
      ETH_CIRCLE_TOKEN_MESSENGER.sourceChainId,
    )

    expect(result).toEqual([
      tx,
      {
        to: bridgeAwareContract.address,
        data: '0x56aa9cae000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        value: 0n,
      },
    ])
  })

  it('does not apply the translation if bridgeStart() for that tokens already exists the batch', async () => {
    const tx = {
      to: ETH_CIRCLE_TOKEN_MESSENGER.address,
      data: '0x6fd3504e00000000000000000000000000000000000000000000000000000005d21dba000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000846e7f810e08f1e2af2c5afd06847cc95f5cae1b000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      value: 0n,
    } satisfies MetaTransactionRequest
    const bridgeAwareContract = getBridgeAwareContract(
      ETH_CIRCLE_TOKEN_MESSENGER.sourceChainId,
    )

    const result = await kpkBridgeAware.translateGlobal(
      [
        tx,
        {
          to: bridgeAwareContract.address,
          data: '0x56aa9cae000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          value: 0n,
        } satisfies MetaTransactionRequest,
      ],
      1,
      avatarAddress,
    )
    expect(result).toBe(undefined)

    const resultDifferentOrder = await kpkBridgeAware.translateGlobal(
      [
        {
          to: bridgeAwareContract.address,
          data: '0x56aa9cae000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          value: 0n,
        },
        tx,
      ],
      1,
      avatarAddress,
    )
    expect(resultDifferentOrder).toBe(undefined)
  })

  it("applies the translation if the batch has a if bridgeStart() call but it's for another token", async () => {
    const tx = {
      to: ETH_CIRCLE_TOKEN_MESSENGER.address,
      data: '0x6fd3504e00000000000000000000000000000000000000000000000000000005d21dba000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000846e7f810e08f1e2af2c5afd06847cc95f5cae1b000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      value: 0n,
    } satisfies MetaTransactionRequest
    const bridgeAwareContract = getBridgeAwareContract(
      ETH_CIRCLE_TOKEN_MESSENGER.sourceChainId,
    )

    const result = await kpkBridgeAware.translateGlobal(
      [
        tx,
        {
          to: bridgeAwareContract.address,
          data: '0x56aa9cae0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f',
          value: 0n,
        },
      ],
      1,
      avatarAddress,
    )
    expect(result).toEqual([
      tx,
      {
        to: bridgeAwareContract.address,
        data: '0x56aa9cae0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f',
        value: 0n,
      },
      {
        to: bridgeAwareContract.address,
        data: '0x56aa9cae000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        value: 0n,
      },
    ])
  })

  describe('Mainnet specific bridge translations', () => {
    const chainId = 1

    it('detects bridging of usdc from mainnet using circle_token_bridge', async () => {
      const tx = {
        to: ETH_CIRCLE_TOKEN_MESSENGER.address,
        data: '0x6fd3504e00000000000000000000000000000000000000000000000000000005d21dba000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000846e7f810e08f1e2af2c5afd06847cc95f5cae1b000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        value: 0n,
      } satisfies MetaTransactionRequest
      const bridgeAwareContract = getBridgeAwareContract(
        ETH_CIRCLE_TOKEN_MESSENGER.sourceChainId,
      )

      const result = await kpkBridgeAware.translateGlobal(
        [tx],
        chainId,
        avatarAddress,
      )
      expect(result).toEqual([
        tx,
        {
          to: bridgeAwareContract.address,
          data: '0x56aa9cae000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          value: 0n,
        },
      ])
    })

    it('detects DAI transfers via ETH_GNO_XDAI_BRIDGE', async () => {
      const tx = {
        to: ETH_GNO_XDAI_BRIDGE.address,
        data: '0x01e4f53a000000000000000000000000123412341234123412341234123412341234123400000000000000000000000000000000000000000000000000000000499602d2',
        value: 0n,
      } satisfies MetaTransactionRequest
      const bridgeAwareContract = getBridgeAwareContract(
        ETH_GNO_XDAI_BRIDGE.sourceChainId,
      )

      const result = await kpkBridgeAware.translateGlobal(
        [tx],
        chainId,
        avatarAddress,
      )
      expect(result).toEqual([
        tx,
        {
          to: bridgeAwareContract.address,
          data: '0x56aa9cae0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f',
          value: 0n,
        },
      ])
    })

    it('detects DAI transfers via ETH_HOP_DAI_BRIDGE', async () => {
      const tx = {
        to: ETH_HOP_DAI_BRIDGE.address,
        data: '0xdeace8f50000000000000000000000000000000000000000000000000000000000000001000000000000000000000000123412341234123412341234123412341234123400000000000000000000000000000003a0c92075c0dbf3b8acbc5f96ce3f0ad2000000000000000000000000000000000000000c7748819dffb62438d1c67eea00000000000000000000000000000000000000000000000000000000673778790000000000000000000000001234123412341234123412341234123412341235000000000000000000000000000000000000000c7748819dffb62438d1c67eea',
        value: 0n,
      } satisfies MetaTransactionRequest
      const bridgeAwareContract = getBridgeAwareContract(
        ETH_HOP_DAI_BRIDGE.sourceChainId,
      )

      const result = await kpkBridgeAware.translateGlobal(
        [tx],
        chainId,
        avatarAddress,
      )
      expect(result).toEqual([
        tx,
        {
          to: bridgeAwareContract.address,
          data: '0x56aa9cae0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f',
          value: 0n,
        },
      ])
    })
  })

  describe('Arbitrum specific bridge translations', () => {
    const chainId = 42161

    it('detects bridging of DAI_eth from arbitrum using ARB1_GATEWAY_ROUTER', async () => {
      const tx = {
        to: ARB1_GATEWAY_ROUTER.address,
        data: '0x7b3a3c8b0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f0000000000000000000000001234123412341234123412341234123412341234000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000',
        value: 0n,
      } satisfies MetaTransactionRequest
      const bridgeAwareContract = getBridgeAwareContract(
        ARB1_GATEWAY_ROUTER.sourceChainId,
      )

      const result = await kpkBridgeAware.translateGlobal(
        [tx],
        chainId,
        avatarAddress,
      )
      expect(result).toEqual([
        {
          to: ARB1_GATEWAY_ROUTER.address,
          data: '0x7b3a3c8b0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f0000000000000000000000001234123412341234123412341234123412341234000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000',
          value: 0n,
        },
        {
          to: bridgeAwareContract.address,
          data: '0x56aa9cae0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f',
          value: 0n,
        },
      ])
    })
  })

  describe('Base specific bridge translations', () => {
    const chainId = 8453

    it('detects bridging of USDC from base using BASE_CIRCLE_TOKEN_MESSENGER', async () => {
      const tx = {
        to: BASE_CIRCLE_TOKEN_MESSENGER.address,
        data: '0x6fd3504e0000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000000000000012341234123412341234123412341234123412341234123412341234123412340000000000000000000000000b2c639c533813f4aa9d7837caf62653d097ff85',
        value: 0n,
      } satisfies MetaTransactionRequest
      const bridgeAwareContract = getBridgeAwareContract(
        BASE_CIRCLE_TOKEN_MESSENGER.sourceChainId,
      )

      const result = await kpkBridgeAware.translateGlobal(
        [tx],
        chainId,
        avatarAddress,
      )
      expect(result).toEqual([
        tx,
        {
          to: bridgeAwareContract.address,
          data: '0x56aa9cae000000000000000000000000833589fcd6edb6e08f4c7c32d4f71b54bda02913',
          value: 0n,
        },
      ])
    })
  })

  describe('Gnosis bridge translations', () => {
    const chainId = 100

    it('detects bridging of XDAI from gnosis using GNOSIS_XDAI_BRIDGE_2', async () => {
      const tx = {
        to: GNOSIS_XDAI_BRIDGE_2.address,
        data: '0x5d1e93070000000000000000000000001234123412341234123412341234123412341234',
        value: 0n,
      } satisfies MetaTransactionRequest
      const bridgeAwareContract = getBridgeAwareContract(
        GNOSIS_XDAI_BRIDGE_2.sourceChainId,
      )

      const result = await kpkBridgeAware.translateGlobal(
        [tx],
        chainId,
        avatarAddress,
      )
      expect(result).toEqual([
        tx,
        {
          to: bridgeAwareContract.address,
          data: '0x56aa9cae000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
          value: 0n,
        },
      ])
    })
  })

  describe('Optimism bridge translations', () => {
    const chainId = 10

    it('detects bridging of USDC from optimism using OPTIMISM_L2_HOP_CCTP', async () => {
      const tx = {
        to: OPTIMISM_L2_HOP_CCTP.address,
        data: '0xa134ce5b0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000123412341234123412341234123412341234123400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        value: 0n,
      } satisfies MetaTransactionRequest
      const bridgeAwareContract = getBridgeAwareContract(
        OPTIMISM_L2_HOP_CCTP.sourceChainId,
      )

      const result = await kpkBridgeAware.translateGlobal(
        [tx],
        chainId,
        avatarAddress,
      )
      expect(result).toEqual([
        tx,
        {
          to: bridgeAwareContract.address,
          data: '0x56aa9cae0000000000000000000000000b2c639c533813f4aa9d7837caf62653d097ff85',
          value: 0n,
        },
      ])
    })
  })
})
