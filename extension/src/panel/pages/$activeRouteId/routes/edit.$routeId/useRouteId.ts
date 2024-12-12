import { invariant } from '@epic-web/invariant'
import { useParams } from 'react-router'

export const useRouteId = () => {
  const { routeId } = useParams()

  invariant(routeId != null, 'No "routeId" found in params')

  return routeId
}
