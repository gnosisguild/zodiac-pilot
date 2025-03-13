import { getChain, getTokenBalances, isValidToken } from '@/balances-server'
import {
  connectWallet,
  createMockChain,
  createMockTokenBalance,
  disconnectWallet,
  render,
} from '@/test-utils'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

const mockGetChain = vi.mocked(getChain)
const mockIsValidToken = vi.mocked(isValidToken)
const mockGetTokenBalances = vi.mocked(getTokenBalances)

describe.sequential('Send Tokens', { skip: process.env.CI != null }, () => {
  beforeEach(async () => {
    await connectWallet()

    mockGetChain.mockResolvedValue(createMockChain())
    mockIsValidToken.mockResolvedValue(true)
  })
  afterEach(() => disconnectWallet())

  it('is possible to select the token you want to send', async () => {
    mockGetTokenBalances.mockResolvedValue([
      createMockTokenBalance({ name: 'Test token' }),
    ])

    await render('/tokens/send')

    await userEvent.click(
      await screen.findByRole('combobox', { name: 'Available tokens' }),
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
