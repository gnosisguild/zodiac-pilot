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
  getRolesVersion,
  queryRolesV1MultiSend,
  queryRolesV2MultiSend,
  SupportedZodiacModuleType,
  updateRolesWaypoint,
  zodiacModuleSchema,
  type ZodiacModule,
} from '@zodiac/modules'
import {
  executionRouteSchema,
  type ExecutionRoute,
  type Waypoints,
} from '@zodiac/schema'
import { TextInput } from '@zodiac/ui'
import { useSubmit } from 'react-router'
import { splitPrefixedAddress } from 'ser-kit'
import type { Route } from './+types/edit-route.$data'

export const loader = ({ params }: Route.LoaderArgs) => {
  const route = parseRouteData(params.data)

  const [chainId] = splitPrefixedAddress(route.avatar)

  return {
    label: route.label,
    chainId,
    avatar: route.avatar,
    providerType: route.providerType,
    waypoints: route.waypoints,
  }
}

export const action = async ({ request, params }: Route.ActionArgs) => {
  const route = parseRouteData(params.data)
  const data = await request.formData()

  const module = zodiacModuleSchema.parse(JSON.parse(getString(data, 'module')))

  const updatedRoute = updateRolesWaypoint(route, {
    moduleAddress: module.moduleAddress,
    version: getRolesVersion(module.type),
    multisend: await getMultisend(route, module),
  })

  const url = new URL(request.url)

  return Response.redirect(
    new URL(`/edit-route/${btoa(JSON.stringify(updatedRoute))}`, url.origin),
  )
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

const parseRouteData = (routeData: string) => {
  console.log({ routeData })

  invariantResponse(routeData != null, 'Missing "route" parameter')

  const decodedData = Buffer.from(routeData, 'base64')

  try {
    const rawJson = JSON.parse(decodedData.toString())

    return executionRouteSchema.parse(rawJson)
  } catch (error) {
    console.error('Error parsing the route from the URL', { error })

    throw new Response(JSON.stringify(error), { status: 400 })
  }
}

const getMultisend = (route: ExecutionRoute, module: ZodiacModule) => {
  const [chainId] = splitPrefixedAddress(route.avatar)

  invariantResponse(
    chainId != null,
    `chainId is required but could not be retrieved from avatar "${route.avatar}"`,
  )

  switch (module.type) {
    case SupportedZodiacModuleType.ROLES_V1:
      return queryRolesV1MultiSend(
        jsonRpcProvider(chainId),
        module.moduleAddress,
      )
    case SupportedZodiacModuleType.ROLES_V2:
      return queryRolesV2MultiSend(chainId, module.moduleAddress)
  }

  throw new Error(`Cannot get multisend for module type "${module.type}"`)
}
