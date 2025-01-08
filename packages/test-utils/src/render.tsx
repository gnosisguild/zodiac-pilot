import { invariant } from '@epic-web/invariant'
import { render as baseRender, screen, waitFor } from '@testing-library/react'
import type { ComponentType } from 'react'
import {
  createMemoryRouter,
  RouterProvider,
  useLocation,
  type ActionFunction,
  type LoaderFunction,
} from 'react-router'
import { TestElement, waitForTestElement } from './TestElement'
import { sleepTillIdle } from './sleepTillIdle'

export type Route = {
  path: string
  Component: ComponentType
  loader?: LoaderFunction
  action?: ActionFunction
}

export type RenderOptions = Parameters<typeof baseRender>[1] & {
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
  { inspectRoutes = [], ...options }: RenderOptions = {},
) => {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <TestElement />,
        children: [
          ...routes.map(({ Component, path, loader, action }) => ({
            path,
            loader,
            action,
            element: <Component />,
          })),

          ...inspectRoutes.map((path) => ({ path, element: <InspectRoute /> })),
        ],
      },
    ],

    { initialEntries: [currentPath] },
  )

  const result = baseRender(<RouterProvider router={router} />, options)

  await waitForTestElement()
  await sleepTillIdle()

  return result
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

export const expectRouteToBe = (expectedPathName: string) =>
  waitFor(() => {
    const testElement = screen.getByTestId('test-route-element-id')
    const foundPathName = testElement.getAttribute('data-pathname')

    invariant(
      expectedPathName === foundPathName,
      `Expected pathname to be "${expectedPathName}" but got "${foundPathName}"`,
    )
  })
