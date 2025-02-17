import { Page, useConnected, useIsDev } from '@/components'
import { useIsPending } from '@/hooks'
import { Route, Routes, Waypoint, Waypoints } from '@/routes-ui'
import {
  dryRun,
  editRoute,
  jsonRpcProvider,
  parseRouteData,
  routeTitle,
} from '@/utils'
import { invariant, invariantResponse } from '@epic-web/invariant'
import { getChainId, verifyChainId, ZERO_ADDRESS } from '@zodiac/chains'
import {
  getHexString,
  getInt,
  getOptionalString,
  getString,
} from '@zodiac/form-data'
import { CompanionAppMessageType } from '@zodiac/messages'
import {
  createAccount,
  createEoaAccount,
  getRolesVersion,
  getStartingWaypoint,
  getWaypoints,
  queryRolesV1MultiSend,
  queryRolesV2MultiSend,
  removeAvatar,
  SupportedZodiacModuleType,
  updateAvatar,
  updateChainId,
  updateLabel,
  updateRolesWaypoint,
  updateStartingPoint,
  zodiacModuleSchema,
  type ZodiacModule,
} from '@zodiac/modules'
import { type ExecutionRoute } from '@zodiac/schema'
import {
  Error,
  Form,
  PrimaryButton,
  SecondaryButton,
  SecondaryLinkButton,
  Success,
  TextInput,
} from '@zodiac/ui'
import { useState } from 'react'
import { useParams } from 'react-router'
import { queryRoutes, rankRoutes, unprefixAddress } from 'ser-kit'
import type { Route as RouteType } from './+types/edit-route.$data'
import { Intent } from './intents'

export const meta: RouteType.MetaFunction = ({ data, matches }) => [
  { title: routeTitle(matches, data.currentRoute.label || 'Unnamed route') },
]

export const loader = async ({ params }: RouteType.LoaderArgs) => {
  const route = parseRouteData(params.data)

  return {
    currentRoute: {
      id: route.id,
      label: route.label,
      startingPoint: getStartingWaypoint(route.waypoints),
      waypoints: getWaypoints(route),
    },

    possibleRoutes:
      route.initiator == null
        ? []
        : rankRoutes(
            await queryRoutes(unprefixAddress(route.initiator), route.avatar),
          ),
  }
}

export const action = async ({ request, params }: RouteType.ActionArgs) => {
  const route = parseRouteData(params.data)
  const data = await request.formData()

  const intent = getString(data, 'intent')

  invariantResponse(
    intent === Intent.UpdateModule,
    `Invalid intent "${intent}" received in server action`,
  )

  const module = zodiacModuleSchema.parse(JSON.parse(getString(data, 'module')))

  const updatedRoute = updateRolesWaypoint(route, {
    moduleAddress: module.moduleAddress,
    version: getRolesVersion(module.type),
    multisend: await getMultisend(route, module),
  })

  return editRoute(updatedRoute)
}

export const clientAction = async ({
  serverAction,
  request,
  params,
}: RouteType.ClientActionArgs) => {
  const data = await request.clone().formData()

  const intent = getOptionalString(data, 'intent')

  switch (intent) {
    case Intent.DryRun:
    case Intent.Save: {
      let route = parseRouteData(params.data)

      route = updateLabel(route, getString(data, 'label'))

      const selectedRouteId = getString(data, 'selectedRouteId')

      if (selectedRouteId !== route.id) {
        const possibleRoutes =
          route.initiator == null
            ? []
            : await queryRoutes(unprefixAddress(route.initiator), route.avatar)

        const selectedRoute = possibleRoutes.find(
          (route) => route.id === selectedRouteId,
        )

        invariantResponse(
          selectedRoute != null,
          `Could not find a route with id "${selectedRouteId}"`,
        )

        route = { ...selectedRoute, label: route.label, id: route.id }
      }

      if (intent === Intent.Save) {
        window.postMessage(
          { type: CompanionAppMessageType.SAVE_ROUTE, data: route },
          '*',
        )

        return editRoute(route)
      }

      const chainId = getChainId(route.avatar)

      return dryRun(jsonRpcProvider(chainId), route)
    }
    case Intent.UpdateChain: {
      const route = parseRouteData(params.data)
      const chainId = verifyChainId(getInt(data, 'chainId'))

      return editRoute(updateChainId(route, chainId))
    }
    case Intent.UpdateAvatar: {
      const route = parseRouteData(params.data)
      const avatar = getHexString(data, 'avatar')

      return editRoute(updateAvatar(route, { safe: avatar }))
    }
    case Intent.RemoveAvatar: {
      const route = parseRouteData(params.data)

      return editRoute(removeAvatar(route))
    }
    case Intent.ConnectWallet: {
      const route = parseRouteData(params.data)

      const address = getHexString(data, 'address')
      const account = await createAccount(
        jsonRpcProvider(getChainId(route.avatar)),
        address,
      )

      return editRoute(updateStartingPoint(route, account))
    }
    case Intent.DisconnectWallet: {
      const route = parseRouteData(params.data)

      return editRoute(
        updateStartingPoint(route, createEoaAccount({ address: ZERO_ADDRESS })),
      )
    }

    default:
      return serverAction()
  }
}

const EditRoute = ({
  loaderData: {
    currentRoute: { id, label, waypoints, startingPoint },
    possibleRoutes,
  },
  actionData,
}: RouteType.ComponentProps) => {
  const isDev = useIsDev()
  const connected = useConnected()
  const endPoint = waypoints.at(-1)
  const [selectedRouteId, setSelectedRouteId] = useState(id)

  return (
    <Page fullWidth>
      <Page.Header>Edit route</Page.Header>

      <Page.Main>
        <Form context={{ selectedRouteId }}>
          <TextInput label="Label" name="label" defaultValue={label} />

          <div className="flex items-center justify-between">
            <div className="w-44">
              <Waypoint {...startingPoint} />
            </div>
          </div>

          <div className="flex">
            <div className="py-2 pr-4">
              <Route id={id} selectable={false}>
                <Waypoints excludeEnd>
                  {waypoints.map(({ account, connection }) => (
                    <Waypoint
                      key={`${account.address}-${connection.from}`}
                      account={account}
                      connection={connection}
                    />
                  ))}
                </Waypoints>
              </Route>
            </div>

            <div className="flex w-full snap-x snap-mandatory scroll-pl-2 overflow-x-scroll rounded-md border border-zinc-200 bg-zinc-50 px-2 py-2 dark:border-zinc-700 dark:bg-zinc-900">
              <Routes>
                {possibleRoutes.map((route) => {
                  const waypoints = getWaypoints(route)

                  return (
                    <Route
                      id={route.id}
                      key={route.id}
                      selected={route.id === selectedRouteId}
                      onSelect={() => setSelectedRouteId(route.id)}
                    >
                      <Waypoints excludeEnd>
                        {waypoints.map(({ account, connection }) => (
                          <Waypoint
                            key={`${account.address}-${connection.from}`}
                            account={account}
                            connection={connection}
                          />
                        ))}
                      </Waypoints>
                    </Route>
                  )
                })}
              </Routes>
            </div>
          </div>

          <div className="flex items-start justify-between">
            {endPoint && (
              <div className="w-44">
                <Waypoint {...endPoint} />
              </div>
            )}

            <div className="flex items-center justify-between">
              {!connected && (
                <div className="text-balance text-xs opacity-75">
                  The Pilot extension must be open to save.
                </div>
              )}

              <div className="flex gap-2">
                {isDev && <DebugRouteData />}

                <SecondaryButton
                  submit
                  intent={Intent.DryRun}
                  busy={useIsPending(Intent.DryRun)}
                >
                  Test route
                </SecondaryButton>

                <PrimaryButton
                  submit
                  intent={Intent.Save}
                  disabled={!connected}
                  busy={useIsPending(Intent.Save)}
                >
                  Save
                </PrimaryButton>
              </div>
            </div>
          </div>

          {actionData != null && (
            <div className="mt-8">
              {actionData.error === true && (
                <Error title="Dry run failed">{actionData.message}</Error>
              )}

              {actionData.error === false && (
                <Success title="Dry run succeeded">
                  Your route seems to be ready for execution!
                </Success>
              )}
            </div>
          )}
        </Form>
      </Page.Main>
    </Page>
  )
}

export default EditRoute

const getMultisend = (route: ExecutionRoute, module: ZodiacModule) => {
  const chainId = getChainId(route.avatar)

  switch (module.type) {
    case SupportedZodiacModuleType.ROLES_V1:
      return queryRolesV1MultiSend(
        jsonRpcProvider(chainId),
        module.moduleAddress,
      )
    case SupportedZodiacModuleType.ROLES_V2:
      return queryRolesV2MultiSend(chainId, module.moduleAddress)
  }

  invariant(false, `Cannot get multisend for module type "${module.type}"`)
}

const DebugRouteData = () => {
  const { data } = useParams()

  return (
    <SecondaryLinkButton openInNewWindow to={`/dev/decode/${data}`}>
      Debug route data
    </SecondaryLinkButton>
  )
}
