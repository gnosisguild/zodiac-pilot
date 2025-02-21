import { getTokenBalances } from '@/balances-server'
import {
  connectWallet,
  createMockTokenBalance,
  disconnectWallet,
  render,
} from '@/test-utils'
import { screen } from '@testing-library/react'
import { randomAddress } from '@zodiac/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/wagmi', async () => {
  const { mock, custom, createConfig } =
    await vi.importActual<typeof import('wagmi')>('wagmi')
  const { mainnet } =
    await vi.importActual<typeof import('wagmi/chains')>('wagmi/chains')

  const config = createConfig({
    chains: [mainnet],
    storage: null,
    transports: {
      [mainnet.id]: custom({
        request() {
          return Promise.resolve(null)
        },
      }),
    },
    connectors: [
      mock({
        accounts: ['0xd6be23396764a212e04399ca31c0ad7b7a3df8fc'],
        features: {
          reconnect: true,
        },
      }),
    ],
  })

  return {
    getWagmiConfig: () => config,
  }
})

const mockGetTokenBalances = vi.mocked(getTokenBalances)

describe('Token balances', () => {
  beforeEach(async () => {
    await connectWallet()
  })
  afterEach(() => disconnectWallet())

  it('is possible to send funds of a token', async () => {
    const address = randomAddress()

    mockGetTokenBalances.mockResolvedValue([
      createMockTokenBalance({ contractId: address }),
    ])

    await render('/tokens/balances')

    expect(await screen.findByRole('link', { name: 'Send' })).toHaveAttribute(
      'href',
      `/tokens/send/eth/${address}`,
    )
  })
})
