import { render } from '@testing-library/react'
import {
  createMemoryRouter,
  RouterProvider,
  type RouteObject,
} from 'react-router'
import { getCurrentPath } from './getCurrentPath'
import { InspectRoute } from './InspectRoute'
import { type RenderOptions } from './render'
import { TestElement, waitForTestElement } from './TestElement'

export type RenderDataOptions = Omit<RenderOptions, 'inspectRoutes'>

export const createRenderDataMode = (routes: RouteObject[]) => {
  return async (
    currentPath: string,
    { searchParams = {}, ...options }: RenderDataOptions,
  ) => {
    const router = createMemoryRouter(
      [
        {
          Component: CombinedTestElement,
          children: routes,
        },
      ],
      { initialEntries: [getCurrentPath(currentPath, searchParams)] },
    )

    const renderResult = render(<RouterProvider router={router} />, options)

    await waitForTestElement()

    return renderResult
  }
}

const CombinedTestElement = () => (
  <TestElement>
    <InspectRoute />
  </TestElement>
)
