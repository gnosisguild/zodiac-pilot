import { getChain, getTokenBalances, isValidToken } from '@/balances-server'
import { createMockChain, createMockTokenBalance, render } from '@/test-utils'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Chain } from '@zodiac/chains'
import { randomAddress } from '@zodiac/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAccount } from 'wagmi'

vi.mock('wagmi', async (importOriginal) => {
  const module = await importOriginal<typeof import('wagmi')>()

  return {
    ...module,

    useAccount: vi.fn(module.useAccount),
    useConnectorClient: vi.fn(module.useConnectorClient),
  }
})

const mockUseAccount = vi.mocked(useAccount)

const mockGetChain = vi.mocked(getChain)
const mockIsValidToken = vi.mocked(isValidToken)
const mockGetTokenBalances = vi.mocked(getTokenBalances)

describe.sequential('Send Tokens', { skip: process.env.CI != null }, () => {
  beforeEach(async () => {
    // @ts-expect-error OK for this test
    mockUseAccount.mockReturnValue({
      address: randomAddress(),
      chainId: Chain.ETH,
    })

    mockGetChain.mockResolvedValue(createMockChain())
    mockIsValidToken.mockResolvedValue(true)
  })

  it('is possible to select the token you want to send', async () => {
    mockGetTokenBalances.mockResolvedValue([
      createMockTokenBalance({ name: 'Test token' }),
    ])

    await render('/tokens/send')

    await userEvent.click(
      await screen.findByRole('combobox', {
        name: 'Available tokens',
      }),
    )

    expect(
      await screen.findByRole('option', { name: 'Test token' }),
    ).toBeInTheDocument()
  })

  it('uses the balance of the selected token for the "Max" button', async () => {
    mockGetTokenBalances.mockResolvedValue([
      createMockTokenBalance({
        name: 'Test token',
        amount: '12.34',
        decimals: 2,
      }),
    ])

    await render('/tokens/send')

    await userEvent.click(
      await screen.findByRole('combobox', { name: 'Available tokens' }),
    )

    await userEvent.click(
      await screen.findByRole('option', { name: 'Test token' }),
    )

    await userEvent.click(screen.getByRole('button', { name: 'Max' }))

    expect(screen.getByRole('spinbutton', { name: 'Amount' })).toHaveValue(
      12.34,
    )
  })

  it('displays how many tokens are available', async () => {
    mockGetTokenBalances.mockResolvedValue([
      createMockTokenBalance({
        name: 'Test token',
        amount: '1234',
        symbol: 'T€$T',
      }),
    ])

    await render('/tokens/send')

    await userEvent.click(
      await screen.findByRole('combobox', { name: 'Available tokens' }),
    )

    await userEvent.click(
      await screen.findByRole('option', { name: 'Test token' }),
    )

    expect(
      screen.getByRole('spinbutton', { name: 'Amount' }),
    ).toHaveAccessibleDescription(`Max: 1234 T€$T`)
  })

  it('is possible to pre-select the token', async () => {
    const address = randomAddress()

    mockGetTokenBalances.mockResolvedValue([
      createMockTokenBalance({
        contractId: address,
        name: 'Test token',
        amount: '12.34',
        symbol: 'T€$T',
      }),
    ])

    await render(`/tokens/send/eth/${address}`)

    await waitFor(
      async () => {
        expect(await screen.findByText('Test token')).toBeInTheDocument()
      },
      { timeout: 5_000 },
    )
  })
})
