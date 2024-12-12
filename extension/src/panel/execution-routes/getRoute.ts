import { type ExecutionRoute } from '@/types'
import { invariant } from '@epic-web/invariant'
import { getStorageEntry } from '../utils'

export const getRoute = async (routeId: string) => {
  const route = await getStorageEntry<ExecutionRoute | undefined>({
    collection: 'routes',
    key: routeId,
  })

  invariant(route != null, `Could not find route with id "${routeId}"`)

  return route
}
