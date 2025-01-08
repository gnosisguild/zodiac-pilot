import { useLocation } from 'react-router'

export const InspectRoute = () => {
  const location = useLocation()

  return (
    <div
      data-testid="test-route-element-id"
      data-pathname={location.pathname}
    />
  )
}
