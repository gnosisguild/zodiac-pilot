import { redirect } from 'react-router'
import type { Route } from './+types/old-edit-redirect'

export const loader = ({ params: { data } }: Route.LoaderArgs) =>
  redirect(`/edit/${data}`)
