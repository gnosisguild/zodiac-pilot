import type { RefObject } from 'react'
import type { Runtime } from 'vitest-chrome/types'
import { createMockPort } from '../creators'
import { chromeMock } from './chromeMock'

type PortCreateFn = () => Partial<Runtime.Port>

export const mockRuntimeConnect = (
  port: Partial<Runtime.Port> | PortCreateFn = {},
) => {
  const portRef: RefObject<Runtime.Port | null> = { current: null }

  // @ts-expect-error The native chrome and mock chrome events
  // that can be part of the result are not compatible.
  // we ignore this fact for now
  chromeMock.runtime.connect.mockImplementation(() => {
    const mockPort =
      typeof port === 'function' ? createMockPort(port()) : createMockPort(port)

    portRef.current = mockPort

    return mockPort
  })

  return portRef
}
