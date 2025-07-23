import { getTokenBalances } from '@/balances-server'
import { createMockTokenBalance, render } from '@/test-utils'
import { screen } from '@testing-library/react'
import { Chain } from '@zodiac/chains'
import { randomAddress } from '@zodiac/test-utils'
import { useAccount } from '@zodiac/web3'
import { href } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@zodiac/web3', async (importOriginal) => {
  const module = await importOriginal<typeof import('@zodiac/web3')>()

  return {
    ...module,

    useAccount: vi.fn(module.useAccount),
    useConnectorClient: vi.fn(module.useConnectorClient),
  }
})

const mockUseAccount = vi.mocked(useAccount)

const mockGetTokenBalances = vi.mocked(getTokenBalances)

describe('Token balances', () => {
  beforeEach(async () => {
    // @ts-expect-error OK for this test
    mockUseAccount.mockReturnValue({
      address: randomAddress(),
      chainId: Chain.ETH,
    })
  })

  it('is possible to send funds of a token', async () => {
    const address = randomAddress()

    mockGetTokenBalances.mockResolvedValue([
      createMockTokenBalance({ contractId: address }),
    ])

    await render(href('/offline/tokens/balances'))

    expect(await screen.findByRole('link', { name: 'Send' })).toHaveAttribute(
      'href',
      href(`/offline/tokens/send/:chain?/:token?`, {
        chain: 'eth',
        token: address,
      }),
    )
  })
})
