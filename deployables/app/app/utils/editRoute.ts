import type { ExecutionRoute } from '@zodiac/schema'
import { redirect } from 'react-router'

export const editRoute = (route: ExecutionRoute) =>
  redirect(`/edit-route/${btoa(JSON.stringify(route))}`)
