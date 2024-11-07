import { ProvideInjectedWallet, ProvideProvider } from '@/providers'
import { ProvideState } from '@/state'
import { ProvideZodiacRoutes } from '@/zodiac-routes'
import { render as baseRender, screen, waitFor } from '@testing-library/react'
import { ComponentType } from 'react'
import {
  MemoryRouter,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { expect } from 'vitest'
import { createMockPort } from './createMockPort'
import { mockActiveTab } from './mockActiveTab'
import { mockTabConnect } from './mockTabConnect'

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
    <ProvideState>
      <ProvideInjectedWallet>
        <ProvideProvider>
          <ProvideZodiacRoutes>
            <MemoryRouter initialEntries={[currentPath]}>
              <Routes>
                <Route path="/" element={<TestElement />}>
                  {routes.map(({ path, Component }) => (
                    <Route key={path} path={path} element={<Component />} />
                  ))}

                  {inspectRoutes.map((route) => (
                    <Route
                      key={route}
                      path={route}
                      element={<InspectRoute />}
                    />
                  ))}
                </Route>
              </Routes>
            </MemoryRouter>
          </ProvideZodiacRoutes>
        </ProvideProvider>
      </ProvideInjectedWallet>
    </ProvideState>,
    options
  )

  await screen.findByTestId('test-element-id')

  return { ...result, mockedTab, mockedPort }
}

const TestElement = () => (
  <>
    <div data-testid="test-element-id" />
    <Outlet />
  </>
)

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
