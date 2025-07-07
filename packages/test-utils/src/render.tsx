import { render as baseRender, screen, waitFor } from '@testing-library/react'
import {
  createMemoryRouter,
  RouterProvider,
  type RouteObject,
} from 'react-router'
import { InspectRoute } from './InspectRoute'
import { TestElement, waitForTestElement } from './TestElement'
import { sleepTillIdle } from './sleepTillIdle'

export type RenderOptions = Parameters<typeof baseRender>[1] & {
  /**
   * Routes that can be navigated to but that don't render anything.
   * You can use these to assert that navigation has happened using the
   * `expectRouteToBe` helper from the render result.
   */
  inspectRoutes?: string[]
  /**
   * Search params that should be added to the current route.
   * You can also include them in the route but this way is usually
   * more readable.
   */
  searchParams?: Record<string, string | number | null | undefined>
}

export const render = async (
  currentPath: string,
  routes: RouteObject[],
  { inspectRoutes = [], searchParams = {}, ...options }: RenderOptions = {},
) => {
  const url = new URL(currentPath, 'http://localhost')

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value == null) {
      url.searchParams.delete(key)
    } else if (typeof value === 'number') {
      url.searchParams.set(key, value.toString())
    } else {
      url.searchParams.set(key, value)
    }
  })

  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <TestElement />,
        children: [
          ...routes,

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

export const expectRouteToBe = async (expectedPathName: string) => {
  // Importing this dynamically, because otherwise vitest
  // pollutes the global space and might conflight with playwright
  const { expect } = await import('vitest')

  return waitFor(() => {
    const testElement = screen.getByTestId('test-route-element-id')
    const foundPathName = testElement.getAttribute('data-pathname')

    expect(foundPathName).toEqual(expectedPathName)
  })
}
