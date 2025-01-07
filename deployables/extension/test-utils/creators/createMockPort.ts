import { vi } from 'vitest'
import type { Runtime } from 'vitest-chrome/types'
import { createMockEvent } from './createMockEvent'

export const createMockPort = (
  port: Partial<Runtime.Port> = {},
): Runtime.Port => ({
  disconnect: vi.fn(),
  name: 'test-port',
  onDisconnect: createMockEvent(),
  onMessage: createMockEvent(),
  postMessage: vi.fn(),

  ...port,
})
