import type { Eip1193Provider } from '@/types'
import { invariant } from '@epic-web/invariant'
import EventEmitter from 'events'
import type { RefObject } from 'react'
import { vi, type MockedFunction } from 'vitest'

const instanceRef: RefObject<MockProvider | null> = { current: null }

export class MockProvider extends EventEmitter implements Eip1193Provider {
  request: MockedFunction<Eip1193Provider['request']>

  static getInstance() {
    invariant(instanceRef.current != null, 'No active MockProvider instance')

    return instanceRef.current
  }

  constructor() {
    super()

    this.request = vi.fn().mockResolvedValue(null)

    instanceRef.current = this
  }

  deleteFork() {}
}
