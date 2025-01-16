import {
  AvatarInput,
  ChainSelect,
  ConnectWallet,
  ZodiacMod,
} from '@/components'
import { editRoute, jsonRpcProvider } from '@/utils'
import { invariantResponse } from '@epic-web/invariant'
import { verifyChainId } from '@zodiac/chains'
import {
  formData,
  getHexString,
  getInt,
  getOptionalString,
  getString,
} from '@zodiac/form-data'
import {
  getRolesVersion,
  queryRolesV1MultiSend,
  queryRolesV2MultiSend,
  removeAvatar,
  SupportedZodiacModuleType,
  updateAvatar,
  updateChainId,
  updateLabel,
  updatePilotAddress,
  updateProviderType,
  updateRoleId,
  updateRolesWaypoint,
  zodiacModuleSchema,
  type ZodiacModule,
} from '@zodiac/modules'
import {
  executionRouteSchema,
  ProviderType,
  providerTypeSchema,
  type ExecutionRoute,
  type Waypoints,
} from '@zodiac/schema'
import { PrimaryButton, TextInput } from '@zodiac/ui'
import { Form, useSubmit } from 'react-router'
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

  return editRoute(request.url, updatedRoute)
}

export const clientAction = async ({
  serverAction,
  request,
  params,
}: Route.ClientActionArgs) => {
  const data = await request.formData()

  const intent = getOptionalString(data, 'intent')

  switch (intent) {
    case Intent.Save: {
      let route = parseRouteData(params.data)

      const roleId = getOptionalString(data, 'roleId')

      if (roleId != null) {
        route = updateRoleId(route, roleId)
      }

      route = updateLabel(route, getString(data, 'label'))

      chrome.runtime.sendMessage('', route)

      return editRoute(request.url, route)
    }
    case Intent.UpdateChain: {
      const route = parseRouteData(params.data)
      const chainId = verifyChainId(getInt(data, 'chainId'))

      return editRoute(request.url, updateChainId(route, chainId))
    }
    case Intent.UpdateAvatar: {
      const route = parseRouteData(params.data)
      const avatar = getHexString(data, 'avatar')

      return editRoute(request.url, updateAvatar(route, { safe: avatar }))
    }
    case Intent.RemoveAvatar: {
      const route = parseRouteData(params.data)

      return editRoute(request.url, removeAvatar(route))
    }
    case Intent.ConnectWallet: {
      const route = parseRouteData(params.data)

      const account = getHexString(data, 'account')
      const chainId = verifyChainId(getInt(data, 'chainId'))
      const providerType = verifyProviderType(getInt(data, 'providerType'))

      return editRoute(
        request.url,
        updatePilotAddress(
          updateChainId(updateProviderType(route, providerType), chainId),
          account,
        ),
      )
    }
    default:
      return serverAction()
  }
}

const EditRoute = ({
  loaderData: { chainId, label, avatar, providerType, waypoints },
}: Route.ComponentProps) => {
  const startingWaypoint = (waypoints || []).at(0)
  const submit = useSubmit()

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4">
      <h1 className="my-8 text-3xl font-semibold">Route configuration</h1>

      <Form method="POST" className="flex flex-col gap-4">
        <TextInput label="Label" name="label" defaultValue={label} />

        <ChainSelect
          value={chainId}
          onChange={(chainId) => {
            submit(formData({ intent: Intent.UpdateChain, chainId }), {
              method: 'POST',
            })
          }}
        />

        <ConnectWallet
          chainId={chainId}
          pilotAddress={getPilotAddress(waypoints)}
          providerType={providerType}
          onConnect={({ account, chainId, providerType }) => {
            submit(
              formData({
                intent: Intent.ConnectWallet,
                account,
                chainId,
                providerType,
              }),
              { method: 'POST' },
            )
          }}
          onDisconnect={() => {}}
        />

        <AvatarInput
          value={avatar}
          startingWaypoint={startingWaypoint}
          onChange={(avatar) => {
            if (avatar != null) {
              submit(formData({ intent: Intent.UpdateAvatar, avatar }), {
                method: 'POST',
              })
            } else {
              submit(formData({ intent: Intent.RemoveAvatar }), {
                method: 'POST',
              })
            }
          }}
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

        <div className="mt-8 flex justify-end">
          <PrimaryButton submit intent={Intent.Save}>
            Save
          </PrimaryButton>
        </div>
      </Form>
    </main>
  )
}

export default EditRoute

enum Intent {
  Save = 'Save',
  UpdateChain = 'UpdateChain',
  UpdateAvatar = 'UpdateAvatar',
  RemoveAvatar = 'RemoveAvatar',
  ConnectWallet = 'ConnectWallet',
}

const getPilotAddress = (waypoints?: Waypoints) => {
  if (waypoints == null) {
    return null
  }

  const [startingPoint] = waypoints

  return startingPoint.account.address
}

const parseRouteData = (routeData: string) => {
  invariantResponse(routeData != null, 'Missing "route" parameter')

  const decodedData = atob(routeData)

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

const verifyProviderType = (value: number): ProviderType =>
  providerTypeSchema.parse(value)
