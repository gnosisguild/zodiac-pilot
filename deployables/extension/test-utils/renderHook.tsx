import type { ExecutionRoute } from '@/types'
import {
  renderHook as renderHookBase,
  type RenderHookOptions,
} from '@zodiac/test-utils'
import type { VitestChromeNamespace } from 'vitest-chrome/types'
import {
  createMockPort,
  mockActiveTab,
  mockRuntimeConnect,
  mockTabConnect,
} from './chrome'
import { mockRoutes } from './executionRoutes'

type Fn<Result, Props> = (props: Props) => Result

type ExtendedOptions = {
  routes?: ExecutionRoute[]
  activeTab?: Partial<chrome.tabs.Tab>
  port?: Partial<VitestChromeNamespace.runtime.Port>
}

export const renderHook = async <Result, Props>(
  fn: Fn<Result, Props>,
  {
    routes = [],
    activeTab,
    port,
    ...options
  }: RenderHookOptions<Props> & ExtendedOptions = {},
) => {
  const mockedTab = mockActiveTab(activeTab)

  const mockedRuntimePort = mockRuntimeConnect()
  const mockedPort = mockTabConnect(createMockPort(port))

  mockRoutes(...routes)

  const result = await renderHookBase<Result, Props>(fn, options)

  return { ...result, mockedTab, mockedPort, mockedRuntimePort }
}
