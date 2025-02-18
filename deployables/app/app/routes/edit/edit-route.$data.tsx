import { getAvailableChains } from '@/balances-server'
import { Page, useConnected, useIsDev } from '@/components'
import { useIsPending } from '@/hooks'
import { ProvideChains, Route, Routes, Waypoint, Waypoints } from '@/routes-ui'
import {
  dryRun,
  editRoute,
  jsonRpcProvider,
  parseRouteData,
  routeTitle,
} from '@/utils'
import { invariantResponse } from '@epic-web/invariant'
import { getChainId } from '@zodiac/chains'
import { getHexString, getOptionalString, getString } from '@zodiac/form-data'
import { CompanionAppMessageType } from '@zodiac/messages'
import {
  createAccount,
  getStartingWaypoint,
  getWaypoints,
  updateLabel,
  updateStartingPoint,
} from '@zodiac/modules'
import { type ExecutionRoute, type HexAddress } from '@zodiac/schema'
import {
  Address,
  Divider,
  Error,
  Form,
  PrimaryButton,
  SecondaryButton,
  SecondaryLinkButton,
  Select,
  Success,
  TextInput,
  Warning,
} from '@zodiac/ui'
import { useEffect, useState } from 'react'
import { redirect, useFetcher, useParams } from 'react-router'
import {
  queryRoutes,
  rankRoutes,
  splitPrefixedAddress,
  unprefixAddress,
  type PrefixedAddress,
} from 'ser-kit'
import type { Route as RouteType } from './+types/edit-route.$data'
import { Intent } from './intents'

export const meta: RouteType.MetaFunction = ({ data, matches }) => [
  { title: routeTitle(matches, data.currentRoute.label || 'Unnamed route') },
]

export const loader = async ({ params }: RouteType.LoaderArgs) => {
  const route = parseRouteData(params.data)

  const [routes, chains] = await Promise.all([
    route.initiator == null
      ? []
      : queryRoutes(unprefixAddress(route.initiator), route.avatar),
    getAvailableChains(),
  ])

  return {
    currentRoute: {
      id: route.id,
      comparableId: route.initiator == null ? null : routeId(route),
      label: route.label,
      initiator: route.initiator,
      avatar: route.avatar,
      startingPoint: getStartingWaypoint(route.waypoints),
      waypoints: getWaypoints(route),
    },

    possibleRoutes: rankRoutes(routes),

    chains,
  }
}

export const action = async ({ request, params }: RouteType.ActionArgs) => {
  const data = await request.formData()
  const intent = getString(data, 'intent')

  let route = parseRouteData(params.data)

  route = updateLabel(route, getString(data, 'label'))

  const selectedRouteId = getOptionalString(data, 'selectedRouteId')

  if (selectedRouteId != null && selectedRouteId !== routeId(route)) {
    const possibleRoutes =
      route.initiator == null
        ? []
        : await queryRoutes(unprefixAddress(route.initiator), route.avatar)

    const selectedRoute = possibleRoutes.find(
      (route) => routeId(route) === selectedRouteId,
    )

    invariantResponse(
      selectedRoute != null,
      `Could not find a route with id "${selectedRouteId}"`,
    )

    route = { ...selectedRoute, label: route.label, id: route.id }
  }

  switch (intent) {
    case Intent.Save: {
      return route
    }

    case Intent.DryRun: {
      const chainId = getChainId(route.avatar)

      return dryRun(jsonRpcProvider(chainId), route)
    }

    case Intent.UpdateInitiator: {
      const account = await createAccount(
        jsonRpcProvider(getChainId(route.avatar)),
        getHexString(data, 'initiator'),
      )

      return editRoute(updateStartingPoint(route, account))
    }
  }
}

export const clientAction = async ({
  serverAction,
  request,
}: RouteType.ClientActionArgs) => {
  const data = await request.clone().formData()

  const intent = getOptionalString(data, 'intent')
  const serverResult = await serverAction()

  switch (intent) {
    case Intent.Save: {
      window.postMessage(
        { type: CompanionAppMessageType.SAVE_ROUTE, data: serverResult },
        '*',
      )

      return redirect('../edit')
    }
    default:
      return serverResult
  }
}

const EditRoute = ({
  loaderData: {
    currentRoute: {
      id,
      comparableId,
      label,
      initiator,
      waypoints,
      startingPoint,
      avatar,
    },
    possibleRoutes,
    chains,
  },
  actionData,
}: RouteType.ComponentProps) => {
  const isDev = useIsDev()
  const connected = useConnected()
  const endPoint = waypoints.at(-1)
  const [selectedRouteId, setSelectedRouteId] = useState(comparableId)

  useEffect(() => {
    if (selectedRouteId != null) {
      return
    }

    if (comparableId == null) {
      return
    }

    setSelectedRouteId(comparableId)
  }, [comparableId, selectedRouteId])

  return (
    <ProvideChains chains={chains}>
      <Page fullWidth>
        <Page.Header>Edit route</Page.Header>

        <Page.Main>
          <Form
            context={{
              selectedRouteId,
            }}
          >
            <TextInput label="Label" name="label" defaultValue={label} />

            {initiator == null && <UpdateInitiator avatar={avatar} />}

            <Divider />

            <div className="w-44">
              <Waypoint {...startingPoint} />
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

              {possibleRoutes.length === 0 ? (
                <div className="flex flex-1 items-center justify-center">
                  <Warning>
                    We could not find any routes between the initiator account
                    and the avatar
                  </Warning>
                </div>
              ) : (
                <div className="flex w-full snap-x snap-mandatory scroll-pl-2 overflow-x-scroll rounded-md border border-zinc-200 bg-zinc-50 px-2 py-2 dark:border-zinc-700 dark:bg-zinc-900">
                  <Routes>
                    {possibleRoutes.map((route) => {
                      const waypoints = getWaypoints(route)

                      return (
                        <Route
                          id={route.id}
                          key={route.id}
                          selected={selectedRouteId === routeId(route)}
                          onSelect={() => setSelectedRouteId(routeId(route))}
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
              )}
            </div>

            {endPoint && (
              <div className="w-44">
                <Waypoint {...endPoint} />
              </div>
            )}

            <Divider />

            <Form.Actions>
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
            </Form.Actions>

            {actionData != null && (
              <div className="mt-8">
                {'error' in actionData && actionData.error === true && (
                  <Error title="Dry run failed">{actionData.message}</Error>
                )}

                {'error' in actionData && actionData.error === false && (
                  <Success title="Dry run succeeded">
                    Your route seems to be ready for execution!
                  </Success>
                )}
              </div>
            )}
          </Form>
        </Page.Main>
      </Page>
    </ProvideChains>
  )
}

export default EditRoute

const DebugRouteData = () => {
  const { data } = useParams()

  return (
    <SecondaryLinkButton openInNewWindow to={`/dev/decode/${data}`}>
      Debug route data
    </SecondaryLinkButton>
  )
}

const UpdateInitiator = ({ avatar }: { avatar: PrefixedAddress }) => {
  const [chainId, address] = splitPrefixedAddress(avatar)

  const { load, state, data = [] } = useFetcher<HexAddress[]>()

  useEffect(() => {
    load(`/${address}/${chainId}/initiators`)
  }, [address, chainId, load])

  return (
    <div className="flex w-full items-end gap-2">
      <Select
        label="Initiator"
        name="initiator"
        placeholder="Select an initiator"
        dropdownLabel="View possible initiators"
        required
        isMulti={false}
        isDisabled={state === 'loading'}
        options={data.map((address) => ({ value: address, label: address }))}
      >
        {({ data: { value } }) => <Address>{value}</Address>}
      </Select>

      <SecondaryButton
        submit
        busy={useIsPending(Intent.UpdateInitiator)}
        intent={Intent.UpdateInitiator}
      >
        Update initiator
      </SecondaryButton>
    </div>
  )
}

const routeId = ({ waypoints }: ExecutionRoute) =>
  waypoints == null
    ? ''
    : waypoints
        .map(({ account }) => account.prefixedAddress)
        .join(',')
        .toLowerCase()
