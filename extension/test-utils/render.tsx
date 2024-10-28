import { ProvideInjectedWallet, ProvideProvider } from '@/providers'
import { ProvideState } from '@/state'
import { render as baseRender, screen } from '@testing-library/react'
import { ComponentType } from 'react'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'

type Route = {
  path: string
  Component: ComponentType
}

type Options = Parameters<typeof baseRender>[1]

export const render = async (
  currentPath: string,
  routes: Route[],
  options?: Options
) => {
  vi.spyOn(chrome.tabs, 'query').mockResolvedValue([])

  const result = baseRender(
    <ProvideState>
      <ProvideInjectedWallet>
        <ProvideProvider>
          <MemoryRouter initialEntries={[currentPath]}>
            <Routes>
              <Route path="/" element={<TestElement />}>
                {routes.map(({ path, Component }) => (
                  <Route key={path} path={path} element={<Component />} />
                ))}
              </Route>
            </Routes>
          </MemoryRouter>
        </ProvideProvider>
      </ProvideInjectedWallet>
    </ProvideState>,
    options
  )

  await screen.findByTestId('test-element-id')

  return result
}

const TestElement = () => (
  <>
    <div data-testid="test-element-id" />
    <Outlet />
  </>
)
