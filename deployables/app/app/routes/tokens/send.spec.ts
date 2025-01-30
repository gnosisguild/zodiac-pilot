import { getTokenBalances } from '@/balances-server'
import {
  connectWallet,
  createMockTokenBalance,
  disconnectWallet,
  render,
} from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/wagmi', async () => {
  const { mock, custom, createConfig } =
    await vi.importActual<typeof import('wagmi')>('wagmi')
  const { mainnet } =
    await vi.importActual<typeof import('wagmi/chains')>('wagmi/chains')

  const config = createConfig({
    chains: [mainnet],
    storage: null,
    transports: {
      [mainnet.id]: custom(window.ethereum),
    },
    connectors: [
      mock({
        accounts: ['0xd6be23396764a212e04399ca31c0ad7b7a3df8fc'],
        features: {
          defaultConnected: true,
          reconnect: true,
        },
      }),
    ],
  })

  return {
    getWagmiConfig: () => config,
  }
})

vi.mock('@/balances-server', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/balances-server')>()

  return {
    ...module,

    getTokenBalances: vi.fn(),
  }
})

const mockGetTokenBalances = vi.mocked(getTokenBalances)

describe('Send Tokens', () => {
  afterEach(() => disconnectWallet())

  it('is possible to select the token you want to send', async () => {
    mockGetTokenBalances.mockResolvedValue([
      createMockTokenBalance({ name: 'Test token' }),
    ])

    await render('/tokens/send')

    await connectWallet()

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
        balance: '1234',
        decimals: 2,
      }),
    ])

    await render('/tokens/send')

    await connectWallet()

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
})
