import { editRoute } from '@/utils'
import { createBlankRoute } from '@zodiac/modules'
import type { Route } from './+types/new-route'

export const loader = ({ request }: Route.LoaderArgs) =>
  editRoute(request.url, createBlankRoute())
