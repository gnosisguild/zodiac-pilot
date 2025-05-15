import type { BrowserProvider } from 'ethers'
import { vi, type MockedFunction } from 'vitest'

export class MockBrowserProvider {
  getTransactionReceipt: MockedFunction<
    BrowserProvider['getTransactionReceipt']
  >

  constructor() {
    this.getTransactionReceipt = vi.fn().mockResolvedValue({})
  }
}
