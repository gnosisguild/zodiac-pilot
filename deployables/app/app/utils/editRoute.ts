import { encode, type ExecutionRoute } from '@zodiac/schema'
import { redirect } from 'react-router'

export const editRoute = (route: ExecutionRoute) =>
  redirect(`/edit/${encode(route)}`)
