import { getStorageEntries } from '@/storage'
import type { ExecutionRoute } from '@/types'
import { ZERO_ADDRESS } from '@zodiac/chains'
import { createEoaStartingPoint, sortRoutes } from '@zodiac/modules'

export const getRoutes = async (): Promise<ExecutionRoute[]> => {
  const routes = await getStorageEntries<ExecutionRoute>('routes')

  return Object.values(routes)
    .map((route) =>
      route.waypoints == null
        ? ({
            ...route,
            waypoints: [
              createEoaStartingPoint({
                address: ZERO_ADDRESS,
              }),
            ],
          } satisfies ExecutionRoute)
        : route,
    )
    .toSorted(sortRoutes)
}
