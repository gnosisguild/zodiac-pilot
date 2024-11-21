import { Eip1193Provider } from '@/types'
import { MockedFunction, vi } from 'vitest'

export class MockProvider implements Eip1193Provider {
  request: MockedFunction<Eip1193Provider['request']>

  on = vi.fn()
  removeListener = vi.fn()

  constructor() {
    this.request = vi.fn().mockResolvedValue(null)
  }
}
