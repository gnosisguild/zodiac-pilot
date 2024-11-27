import { ZodiacRoute } from '@/types'
import { sleep } from '@/utils'
import {
  renderHook as renderHookBase,
  RenderHookOptions,
} from '@testing-library/react'
import { VitestChromeNamespace } from 'vitest-chrome/types/vitest-chrome'
import { mockActiveTab, mockTabConnect } from './chrome'
import { createMockPort } from './creators'
import { mockRoutes } from './mockRoutes'

type Fn<Result, Props> = (props: Props) => Result

type ExtendedOptions = {
  routes?: ZodiacRoute[]
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
  }: RenderHookOptions<Props> & ExtendedOptions = {}
) => {
  const mockedTab = mockActiveTab(activeTab)
  const mockedPort = mockTabConnect(createMockPort(port))
  mockRoutes(...routes)

  const result = renderHookBase<Result, Props>(fn, options)

  await sleep(1)

  return { ...result, mockedTab, mockedPort }
}
