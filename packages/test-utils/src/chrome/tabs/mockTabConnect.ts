import type { RefObject } from 'react'
import type { Runtime } from 'vitest-chrome/types'
import { chromeMock } from '../chromeMock'

type PortCreateFn = () => Runtime.Port

export const mockTabConnect = (port: Runtime.Port | PortCreateFn) => {
  const portRef: RefObject<Runtime.Port | null> = { current: null }

  // @ts-expect-error The native chrome and mock chrome events
  // that can be part of the result are not compatible.
  // we ignore this fact for now
  chromeMock.tabs.connect.mockImplementation(() => {
    const mockPort = typeof port === 'function' ? port() : port

    portRef.current = mockPort

    return mockPort
  })

  return portRef
}
