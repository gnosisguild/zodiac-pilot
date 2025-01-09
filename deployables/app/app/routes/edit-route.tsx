import { ChainSelect } from '@/components'
import { invariantResponse } from '@epic-web/invariant'
import { executionRouteSchema } from '@zodiac/schema'
import { TextInput } from '@zodiac/ui'
import { splitPrefixedAddress } from 'ser-kit'
import type { Route } from './+types/edit-route'

export const loader = ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url)

  const routeData = url.searchParams.get('route')

  console.log({ routeData })

  invariantResponse(routeData != null, 'Missing "route" parameter')

  const decodedData = Buffer.from(routeData, 'base64')

  try {
    const rawJson = JSON.parse(decodedData.toString())
    const route = executionRouteSchema.parse(rawJson)

    const [chainId] = splitPrefixedAddress(route.avatar)

    return { label: route.label, chainId }
  } catch {
    throw new Response(null, { status: 400 })
  }
}

const EditRoute = ({ loaderData }: Route.ComponentProps) => {
  return (
    <>
      <TextInput label="Label" defaultValue={loaderData.label} />
      <ChainSelect value={loaderData.chainId} onChange={() => {}} />
    </>
  )
}

export default EditRoute
