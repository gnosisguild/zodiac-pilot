import type { TransactionState } from '@/state'
import type { Eip1193Provider, ExecutionRoute } from '@/types'
import {
  render as baseRender,
  type RenderOptions,
  type Route,
} from '@zodiac/test-utils'
import { ToastContainer } from '@zodiac/ui'
import { type PropsWithChildren } from 'react'
import {
  createMockPort,
  mockActiveTab,
  mockRuntimeConnect,
  mockTabConnect,
} from './chrome'
import { RenderWrapper } from './RenderWrapper'

type Options = RenderOptions & {
  /** Can be used to change the attributes of the currently active tab */
  activeTab?: Partial<chrome.tabs.Tab>
  /**
   * Initial transaction state when the component renders
   */
  initialState?: TransactionState[]
  /**
   * Pass a route id here to define the currently launched route
   */
  initialSelectedRoute?: ExecutionRoute | null
  /**
   * Pass a custom provider instance to be used as the connect provider
   */
  initialProvider?: Eip1193Provider
  /**
   * URL of the companion app that extends certain features
   * like route editing
   *
   * @default http://localhost:3040
   */
  companionAppUrl?: string
}

export const render = async (
  currentPath: string,
  routes: Route[],
  {
    activeTab,
    initialState,
    initialSelectedRoute,
    initialProvider,
    wrapper: Wrapper = ({ children }: PropsWithChildren) => <>{children}</>,
    companionAppUrl = 'http://localhost:3040',
    ...options
  }: Options = {},
) => {
  const mockedTab = mockActiveTab(activeTab)
  const mockedPort = createMockPort()
  const mockedRuntimePort = createMockPort()

  mockRuntimeConnect(mockedRuntimePort)
  mockTabConnect(mockedPort)

  const FinalRenderWrapper = ({ children }: PropsWithChildren) => (
    <Wrapper>
      <RenderWrapper
        initialProvider={initialProvider}
        initialSelectedRoute={initialSelectedRoute}
        initialState={initialState}
        companionAppUrl={companionAppUrl}
      >
        {children}
        <ToastContainer />
      </RenderWrapper>
    </Wrapper>
  )

  const result = await baseRender(currentPath, routes, {
    ...options,
    wrapper: FinalRenderWrapper,
  })

  return { ...result, mockedTab, mockedPort, mockedRuntimePort }
}
