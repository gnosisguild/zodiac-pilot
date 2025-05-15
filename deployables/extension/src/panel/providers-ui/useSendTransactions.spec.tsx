import { createTransaction, renderHook } from '@/test-utils'
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

describe('useSendTransactions', () => {
  it('sends pending transactions', async () => {
    const transaction = createTransaction()

    await renderHook(() => useSendTransactions(), {
      initialState: { pending: [transaction] },
    })

    expect(MockProvider.getInstance().sendMetaTransaction).toHaveBeenCalledWith(
      transaction,
    )
  })
})
