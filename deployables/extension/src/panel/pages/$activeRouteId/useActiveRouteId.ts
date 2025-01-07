import { invariant } from '@epic-web/invariant'
import { useParams } from 'react-router'

export const useActiveRouteId = () => {
  const { activeRouteId } = useParams()

  invariant(activeRouteId != null, '"activeRouteId" not found in path params')

  return activeRouteId
}
