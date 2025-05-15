import {
  createConfirmedTransaction,
  createTransaction,
  renderHook,
} from '@/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { MockProvider } from './MockProvider'
import { useSendTransactions } from './useSendTransactions'

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

describe('useSendTransactions', () => {
  it('sends pending transactions', async () => {
    const transaction = createTransaction()

    await renderHook(() => useSendTransactions(), {
      initialState: { pending: [transaction] },
    })

    expect(MockProvider.getInstance().sendMetaTransaction).toHaveBeenCalled()
  })

  it('does not send pending transaction when a rollback is in progress', async () => {
    await renderHook(() => useSendTransactions(), {
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
    await renderHook(() => useSendTransactions(), {
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
