import { invariantResponse } from '@epic-web/invariant'
import { executionRouteSchema } from '@zodiac/schema'
import { TextInput } from '@zodiac/ui'
import type { Route } from './+types/edit-route'

export const loader = ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url)

  const routeData = url.searchParams.get('route')

  invariantResponse(routeData != null, 'Missing "route" parameter')

  const decodedData = Buffer.from(routeData, 'base64')

  try {
    const rawJson = JSON.parse(decodedData.toString())

    return { route: executionRouteSchema.parse(rawJson) }
  } catch {
    throw new Response(null, { status: 400 })
  }
}

const EditRoute = ({ loaderData }: Route.ComponentProps) => {
  return (
    <>
      <TextInput label="Label" defaultValue={loaderData.route.label} />
    </>
  )
}

export default EditRoute
