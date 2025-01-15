import {
  AvatarInput,
  ChainSelect,
  ConnectWallet,
  ZodiacMod,
} from '@/components'
import { jsonRpcProvider } from '@/utils'
import { invariantResponse } from '@epic-web/invariant'
import { formData, getString } from '@zodiac/form-data'
import {
  SupportedZodiacModuleType,
  updateRolesWaypoint,
  zodiacModuleSchema,
} from '@zodiac/modules'
import { executionRouteSchema, type Waypoints } from '@zodiac/schema'
import { TextInput } from '@zodiac/ui'
import { useSubmit } from 'react-router'
import { splitPrefixedAddress } from 'ser-kit'
import type { Route } from './+types/edit-route'

export const loader = ({ request }: Route.LoaderArgs) => {
  const route = getRouteFromRequest(request)

  const [chainId] = splitPrefixedAddress(route.avatar)

  return {
    label: route.label,
    chainId,
    avatar: route.avatar,
    providerType: route.providerType,
    waypoints: route.waypoints,
  }
}

export const action = async ({ request }: Route.ActionArgs) => {
  const route = getRouteFromRequest(request)
  const data = await request.formData()

  const module = zodiacModuleSchema.parse(JSON.parse(getString(data, 'module')))

  switch (module.type) {
    case SupportedZodiacModuleType.ROLES_V1: {
      const [chainId] = splitPrefixedAddress(route.avatar)

      invariantResponse(
        chainId != null,
        `chainId is required but could not be retrieved from avatar "${route.avatar}"`,
      )

      const updatedRoute = updateRolesWaypoint(
        jsonRpcProvider(chainId),
        route,
        module,
      )

      const url = new URL(request.url)

      url.searchParams.set('route', btoa(JSON.stringify(updatedRoute)))

      return Response.redirect(`${url.pathname}?${url.search}`)
    }
  }

  return null
  // TODO: intent to update role, then encode into current route and redirect
  // so that new param becomes active and the view refreshes with proper values
}

const EditRoute = ({
  loaderData: { chainId, label, avatar, providerType, waypoints },
}: Route.ComponentProps) => {
  const startingWaypoint = (waypoints || []).at(0)
  const submit = useSubmit()

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4">
      <h1 className="my-8 text-3xl font-semibold">Route configuration</h1>

      <TextInput label="Label" defaultValue={label} />
      <ChainSelect value={chainId} onChange={() => {}} />
      <ConnectWallet
        chainId={chainId}
        pilotAddress={getPilotAddress(waypoints)}
        providerType={providerType}
        onConnect={() => {}}
        onDisconnect={() => {}}
      />
      <AvatarInput
        value={avatar}
        startingWaypoint={startingWaypoint}
        onChange={() => {}}
      />
      <ZodiacMod
        avatar={avatar}
        waypoints={waypoints}
        onSelect={(module) => {
          submit(formData({ module: JSON.stringify(module) }), {
            method: 'POST',
          })
        }}
      />
    </main>
  )
}

export default EditRoute

const getPilotAddress = (waypoints?: Waypoints) => {
  if (waypoints == null) {
    return null
  }

  const [startingPoint] = waypoints

  return startingPoint.account.address
}

const getRouteFromRequest = (request: Request) => {
  const url = new URL(request.url)

  const routeData = url.searchParams.get('route')

  console.log({ routeData })

  invariantResponse(routeData != null, 'Missing "route" parameter')

  const decodedData = Buffer.from(routeData, 'base64')

  try {
    const rawJson = JSON.parse(decodedData.toString())

    return executionRouteSchema.parse(rawJson)
  } catch (error) {
    console.error('Error parsing the route from the URL', { error })

    throw new Response(null, { status: 400 })
  }
}
