import { getTokenBalances } from '@/balances'
import { createMockTokenBalance, render } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockWeb3 } from '@zodiac/test-utils'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/balances', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/balances')>()

  return {
    ...module,

    getTokenBalances: vi.fn(),
  }
})

const mockGetTokenBalances = vi.mocked(getTokenBalances)

describe('Send Tokens', () => {
  it('is possible to select the token you want to send', async () => {
    mockWeb3()

    mockGetTokenBalances.mockResolvedValue([
      createMockTokenBalance({ name: 'Test token' }),
    ])

    await render('/tokens/send')

    await userEvent.click(
      await screen.findByRole('combobox', { name: 'Available tokens' }),
    )

    expect(
      screen.findByRole('option', { name: 'Test token' }),
    ).toBeInTheDocument()
  })
})
