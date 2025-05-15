import { ProvideAccount, toLocalAccount } from '@/accounts'
import { toAccount } from '@/companion'
import { ProvideTransactions, type State } from '@/state'
import {
  createConfirmedTransaction,
  createTransactionState,
  renderHook,
} from '@/test-utils'
import { createMockExecutionRoute } from '@zodiac/test-utils'
import type { PropsWithChildren } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { MockProvider } from './MockProvider'
import { ProvideProvider } from './ProvideProvider'
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
  type GetWrapperOptions = {
    initialState?: Partial<State>
  }

  const getWrapper =
    ({ initialState }: GetWrapperOptions = {}) =>
    ({ children }: PropsWithChildren) => {
      return (
        <ProvideAccount
          account={toLocalAccount(toAccount(createMockExecutionRoute()))}
        >
          <ProvideTransactions
            initialState={createTransactionState(initialState)}
          >
            <ProvideProvider>{children}</ProvideProvider>
          </ProvideTransactions>
        </ProvideAccount>
      )
    }

  it('deletes the current fork', async () => {
    await renderHook(() => useDeleteFork(), { wrapper: getWrapper() })

    expect(MockProvider.getInstance().deleteFork).toHaveBeenCalled()
  })

  it('does not delete the fork, when there are transactions', async () => {
    await renderHook(() => useDeleteFork(), {
      wrapper: getWrapper({
        initialState: {
          done: [createConfirmedTransaction()],
        },
      }),
    })

    expect(MockProvider.getInstance().deleteFork).not.toHaveBeenCalled()
  })

  it('deletes the fork when transactions exist and a refresh has been requested', async () => {
    await renderHook(() => useDeleteFork(), {
      wrapper: getWrapper({
        initialState: { done: [createConfirmedTransaction()], refresh: true },
      }),
    })

    expect(MockProvider.getInstance().deleteFork).toHaveBeenCalled()
  })
})
