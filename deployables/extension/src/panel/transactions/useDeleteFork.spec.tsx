import { createConfirmedTransaction, renderHook } from '@/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { MockProvider } from './MockProvider'
import { useDeleteFork } from './useDeleteFork'

vi.mock('@/providers', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/providers')>()

  const { MockProvider } = await vi.importActual('./MockProvider')

  return {
    ...module,

    ForkProvider: MockProvider,
  }
})

describe('useDeleteFork', () => {
  it('deletes the current fork', async () => {
    await renderHook(() => useDeleteFork())

    expect(MockProvider.getInstance().deleteFork).toHaveBeenCalled()
  })

  it('does not delete the fork, when there are transactions', async () => {
    await renderHook(() => useDeleteFork(), {
      initialState: {
        executed: [createConfirmedTransaction()],
      },
    })

    expect(MockProvider.getInstance().deleteFork).not.toHaveBeenCalled()
  })

  it('deletes the fork when transactions exist and a refresh has been requested', async () => {
    await renderHook(() => useDeleteFork(), {
      initialState: { executed: [createConfirmedTransaction()], refresh: true },
    })

    expect(MockProvider.getInstance().deleteFork).toHaveBeenCalled()
  })
})
