import type { ExecutionRoute } from '@/types'
import { saveRoute } from './saveRoute'

export const markRouteAsUsed = (route: ExecutionRoute) =>
  saveRoute({ ...route, lastUsed: Date.now() })
