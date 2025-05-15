import type { ForkProvider } from '@/providers'
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

  static getInstance() {
    invariant(instanceRef.current != null, 'No active MockProvider instance')

    return instanceRef.current
  }

  constructor() {
    super()

    this.request = vi.fn<ForkProvider['request']>().mockResolvedValue(null)

    this.deleteFork = vi.fn<ForkProvider['deleteFork']>().mockResolvedValue()
    this.sendMetaTransaction = vi
      .fn<ForkProvider['sendMetaTransaction']>()
      .mockResolvedValue({
        checkpointId: 'test-checkpoint',
        transactionId: 'test-transaction',
        hash: 'test-hash',
      })

    instanceRef.current = this
  }
}
