import { Runtime } from 'vitest-chrome/types/vitest-chrome'
import { chromeMock } from './chromeMock'

export const mockTabConnect = (port: Runtime.Port) =>
  // @ts-expect-error The native chrome and mock chrome events
  // that can be part of the result are not compatible.
  // we ignore this fact for now
  chromeMock.tabs.connect.mockReturnValue(port)
