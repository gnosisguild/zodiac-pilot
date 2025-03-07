import type { ExecutionRoute } from '@zodiac/schema'

export const sortRoutes = (routeA: ExecutionRoute, routeB: ExecutionRoute) => {
  if (routeA.label == null && routeB.label == null) {
    return 0
  }

  if (routeA.label == null) {
    return -1
  }

  if (routeB.label == null) {
    return 1
  }

  return routeA.label.localeCompare(routeB.label)
}
