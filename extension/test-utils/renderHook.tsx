import type { ExecutionRoute } from '@/types'
import { sleepTillIdle } from '@/utils'
import {
  renderHook as renderHookBase,
  type RenderHookOptions,
} from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import type { VitestChromeNamespace } from 'vitest-chrome/types/vitest-chrome'
import { mockActiveTab, mockTabConnect } from './chrome'
import { createMockPort } from './creators'
import { mockRoutes } from './mockRoutes'
import { TestElement, waitForTestElement } from './TestElement'

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
    wrapper: Wrapper = ({ children }: PropsWithChildren) => <>{children}</>,
    ...options
  }: RenderHookOptions<Props> & ExtendedOptions = {}
) => {
  const mockedTab = mockActiveTab(activeTab)
  const mockedPort = mockTabConnect(createMockPort(port))
  mockRoutes(...routes)

  const wrapper = ({ children }: PropsWithChildren) => (
    <Wrapper>
      <TestElement>{children}</TestElement>
    </Wrapper>
  )

  const result = renderHookBase<Result, Props>(fn, { ...options, wrapper })

  await waitForTestElement()

  await sleepTillIdle()

  return { ...result, mockedTab, mockedPort }
}
