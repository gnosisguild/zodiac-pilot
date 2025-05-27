import {
  createConfirmedTransaction,
  createTransaction,
  renderHook,
} from '@/test-utils'
import { waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MockProvider } from './MockProvider'
import { useExecutionTracking } from './useExecutionTracking'

vi.mock('@/providers', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/providers')>()

  const { MockProvider } =
    await vi.importActual<typeof import('./MockProvider')>('./MockProvider')

  return {
    ...module,

    ForkProvider: MockProvider,
  }
})

vi.mock('ethers', async (importOriginal) => {
  const module = await importOriginal<typeof import('ethers')>()

  const { MockBrowserProvider } = await vi.importActual<
    typeof import('./MockBrowserProvider')
  >('./MockBrowserProvider')

  return {
    ...module,

    BrowserProvider: MockBrowserProvider,
  }
})

describe('useExecutionTracking', () => {
  it('sends pending transactions', async () => {
    await renderHook(() => useExecutionTracking(), {
      initialState: { pending: [createTransaction(), createTransaction()] },
    })

    await waitFor(() => {
      expect(
        MockProvider.getInstance().sendMetaTransaction,
      ).toHaveBeenCalledTimes(2)
    })
  })

  it('does not send pending transaction when a rollback is in progress', async () => {
    await renderHook(() => useExecutionTracking(), {
      initialState: {
        pending: [createTransaction()],

        rollback: createConfirmedTransaction(),
      },
    })

    expect(
      MockProvider.getInstance().sendMetaTransaction,
    ).not.toHaveBeenCalled()
  })

  it('does not send pending transactions when a refresh is in progress', async () => {
    await renderHook(() => useExecutionTracking(), {
      initialState: {
        pending: [createTransaction()],

        refresh: true,
      },
    })

    expect(
      MockProvider.getInstance().sendMetaTransaction,
    ).not.toHaveBeenCalled()
  })
})
