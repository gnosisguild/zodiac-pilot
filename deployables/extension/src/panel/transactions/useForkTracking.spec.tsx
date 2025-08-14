import { createConfirmedTransaction, renderHook } from '@/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { MockProvider } from './MockProvider'
import { useForkTracking } from './useForkTracking'

vi.mock('@/providers', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/providers')>()

  const { MockProvider } = await vi.importActual('./MockProvider')

  return {
    ...module,

    ForkProvider: MockProvider,
  }
})

describe('useForkTracking', () => {
  it('deletes the current fork', async () => {
    await renderHook(() => useForkTracking())

    expect(MockProvider.getInstance().reset).toHaveBeenCalled()
  })

  it('does not delete the fork, when there are transactions', async () => {
    await renderHook(() => useForkTracking(), {
      initialState: {
        executed: [createConfirmedTransaction()],
      },
    })

    expect(MockProvider.getInstance().reset).not.toHaveBeenCalled()
  })

  it('deletes the fork when transactions exist and a refresh has been requested', async () => {
    await renderHook(() => useForkTracking(), {
      initialState: { executed: [createConfirmedTransaction()], refresh: true },
    })

    expect(MockProvider.getInstance().reset).toHaveBeenCalled()
  })
})
