import type { Route } from './+types/edit-route'

export const loader = ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url)

  return { url }
}

const EditRoute = ({ loaderData }: Route.ComponentProps) => {
  return null
}

export default EditRoute
