import { vi } from 'vitest'
import { Runtime } from 'vitest-chrome/types/vitest-chrome'
import { createMockEvent } from './createMockEvent'

export const createMockPort = (
  port: Partial<Runtime.Port> = {}
): Runtime.Port => ({
  disconnect: vi.fn(),
  name: 'test-port',
  onDisconnect: createMockEvent(),
  onMessage: createMockEvent(),
  postMessage: vi.fn(),

  ...port,
})
