import type { ExecutionRoute } from '@zodiac/schema'

export const updateLabel = (
  route: ExecutionRoute,
  label: string,
): ExecutionRoute => ({ ...route, label })
