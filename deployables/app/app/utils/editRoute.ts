import { encode, type ExecutionRoute } from '@zodiac/schema'
import { href, redirect } from 'react-router'

export const editRoute = (route: ExecutionRoute) =>
  redirect(href('/edit/:data', { data: encode(route) }))
