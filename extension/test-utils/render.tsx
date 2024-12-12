import type { TransactionState } from '@/state'
import type { ExecutionRoute } from '@/types'
import { sleepTillIdle } from '@/utils'
import { render as baseRender, screen, waitFor } from '@testing-library/react'
import type { ComponentType } from 'react'
import {
  createMemoryRouter,
  RouterProvider,
  useLocation,
  type ActionFunction,
  type LoaderFunction,
} from 'react-router'
import { expect } from 'vitest'
import { mockActiveTab, mockTabConnect } from './chrome'
import { createMockPort } from './creators'
import { RenderWrapper } from './RenderWrapper'
import { TestElement, waitForTestElement } from './TestElement'

type Route = {
  path: string
  Component: ComponentType
  loader?: LoaderFunction
  action?: ActionFunction
}

type Options = Parameters<typeof baseRender>[1] & {
  /** Can be used to change the attributes of the currently active tab */
  activeTab?: Partial<chrome.tabs.Tab>
  /**
   * Routes that can be navigated to but that don't render anything.
   * You can use these to assert that navigation has happened using the
   * `expectRouteToBe` helper from the render result.
   */
  inspectRoutes?: string[]
  /**
   * Initial transaction state when the component renders
   */
  initialState?: TransactionState[]
  /**
   * Pass a route id here to define the currently launched route
   */
  initialSelectedRoute?: ExecutionRoute
}

export const render = async (
  currentPath: string,
  routes: Route[],
  {
    activeTab,
    inspectRoutes = [],
    initialState,
    initialSelectedRoute,
    ...options
  }: Options = {},
) => {
  const mockedTab = mockActiveTab(activeTab)
  const mockedPort = createMockPort()

  mockTabConnect(mockedPort)

  const router = createMemoryRouter(
    [
      {
        path: '',
        element: <TestElement />,
        children: [
          ...routes.map(({ Component, path, loader, action }) => ({
            path,
            loader,
            action,
            element: <Component />,
          })),
        ],
      },
      ...inspectRoutes.map((path) => ({ path, element: <InspectRoute /> })),
    ],

    { initialEntries: [currentPath] },
  )

  const result = baseRender(
    <RenderWrapper
      initialState={initialState}
      initialSelectedRoute={initialSelectedRoute}
    >
      <RouterProvider router={router} />
    </RenderWrapper>,
    options,
  )

  await waitForTestElement()
  await sleepTillIdle()

  return { ...result, mockedTab, mockedPort }
}

const InspectRoute = () => {
  const location = useLocation()

  return (
    <div
      data-testid="test-route-element-id"
      data-pathname={location.pathname}
    />
  )
}

export const expectRouteToBe = (path: string) =>
  waitFor(() =>
    expect(screen.getByTestId('test-route-element-id')).toHaveAttribute(
      'data-pathname',
      path,
    ),
  )
