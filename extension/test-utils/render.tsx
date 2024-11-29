import { sleepTillIdle } from '@/utils'
import { render as baseRender, screen, waitFor } from '@testing-library/react'
import { ComponentType } from 'react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { expect } from 'vitest'
import { mockActiveTab, mockTabConnect } from './chrome'
import { createMockPort } from './creators'
import { RenderWrapper } from './RenderWrapper'
import { TestElement, waitForTestElement } from './TestElement'

type Route = {
  path: string
  Component: ComponentType
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
}

export const render = async (
  currentPath: string,
  routes: Route[],
  { activeTab, inspectRoutes = [], ...options }: Options = {}
) => {
  const mockedTab = mockActiveTab(activeTab)
  const mockedPort = createMockPort()

  mockTabConnect(mockedPort)

  const result = baseRender(
    <RenderWrapper>
      <MemoryRouter initialEntries={[currentPath]}>
        <Routes>
          <Route path="/" element={<TestElement />}>
            {routes.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}

            {inspectRoutes.map((route) => (
              <Route key={route} path={route} element={<InspectRoute />} />
            ))}
          </Route>
        </Routes>
      </MemoryRouter>
    </RenderWrapper>,
    options
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
      path
    )
  )
