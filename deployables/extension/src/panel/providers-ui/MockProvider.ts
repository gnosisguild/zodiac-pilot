import type { ForkProvider, TransactionResult } from '@/providers'
import type { Eip1193Provider } from '@/types'
import { invariant } from '@epic-web/invariant'
import EventEmitter from 'events'
import type { RefObject } from 'react'
import { vi, type MockedFunction } from 'vitest'

const instanceRef: RefObject<MockProvider | null> = { current: null }

export class MockProvider extends EventEmitter implements Eip1193Provider {
  // Default stuff
  request: MockedFunction<Eip1193Provider['request']>

  // ForkProvider specific
  deleteFork: MockedFunction<ForkProvider['deleteFork']>
  sendMetaTransaction: MockedFunction<ForkProvider['sendMetaTransaction']>
  getTransactionLink: MockedFunction<ForkProvider['getTransactionLink']>

  private static nextTransactionResult: Promise<TransactionResult> | null

  static getInstance() {
    invariant(instanceRef.current != null, 'No active MockProvider instance')

    return instanceRef.current
  }

  static setNextTransactionResult(result: TransactionResult) {
    const { promise, resolve } = Promise.withResolvers<TransactionResult>()

    MockProvider.nextTransactionResult = promise

    return () => resolve(result)
  }

  constructor() {
    super()

    this.request = vi.fn<ForkProvider['request']>().mockResolvedValue(null)

    this.deleteFork = vi.fn<ForkProvider['deleteFork']>().mockResolvedValue()
    this.sendMetaTransaction = vi.fn<ForkProvider['sendMetaTransaction']>()

    this.getTransactionLink = vi
      .fn<ForkProvider['getTransactionLink']>()
      .mockReturnValue('http://test.com')

    instanceRef.current = this

    if (MockProvider.nextTransactionResult) {
      this.sendMetaTransaction.mockReturnValue(
        MockProvider.nextTransactionResult,
      )

      MockProvider.nextTransactionResult = null
    } else {
      this.sendMetaTransaction.mockResolvedValue({
        checkpointId: 'test-checkpoint',
        hash: 'test-hash',
      })
    }
  }
}
