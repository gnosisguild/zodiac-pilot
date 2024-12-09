import type { MutableRefObject } from 'react'
import { Runtime } from 'vitest-chrome/types/vitest-chrome'
import { chromeMock } from './chromeMock'

type PortCreateFn = () => Runtime.Port

export const mockRuntimeConnect = (port: Runtime.Port | PortCreateFn) => {
  const portRef: MutableRefObject<Runtime.Port | null> = { current: null }

  // @ts-expect-error The native chrome and mock chrome events
  // that can be part of the result are not compatible.
  // we ignore this fact for now
  chromeMock.runtime.connect.mockImplementation(() => {
    const mockPort = typeof port === 'function' ? port() : port

    portRef.current = mockPort

    return mockPort
  })

  return portRef
}
