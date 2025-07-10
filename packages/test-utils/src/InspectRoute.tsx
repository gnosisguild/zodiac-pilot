import { screen, waitFor } from '@testing-library/react'
import { useLocation } from 'react-router'

const inspectRouteElementId = 'test-route-element-id'

export const InspectRoute = () => {
  const location = useLocation()

  return (
    <div
      data-testid={inspectRouteElementId}
      data-pathname={location.pathname}
    />
  )
}

export const expectRouteToBe = async (expectedPathName: string) => {
  // Importing this dynamically, because otherwise vitest
  // pollutes the global space and might conflight with playwright
  const { expect } = await import('vitest')

  return waitFor(() => {
    const testElement = screen.getByTestId(inspectRouteElementId)
    const foundPathName = testElement.getAttribute('data-pathname')

    expect(foundPathName).toEqual(expectedPathName)
  })
}
