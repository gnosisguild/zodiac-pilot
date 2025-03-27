import {
  AvatarInput,
  ConnectWalletButton,
  fromVersion,
  InitiatorInput,
  Page,
  useConnected,
  useIsDev,
  WalletProvider,
} from '@/components'
import { useIsPending } from '@/hooks'
import {
  ChainSelect,
  Route,
  routeId,
  Routes,
  Waypoint,
  Waypoints,
} from '@/routes-ui'
import { editRoute, jsonRpcProvider, parseRouteData, routeTitle } from '@/utils'
import { invariant, invariantResponse } from '@epic-web/invariant'
import { getChainId, verifyChainId } from '@zodiac/chains'
import {
  getHexString,
  getInt,
  getOptionalString,
  getString,
} from '@zodiac/form-data'
import { CompanionAppMessageType, companionRequest } from '@zodiac/messages'
import {
  createAccount,
  createRouteId,
  updateAvatar,
  updateChainId,
  updateLabel,
  updateStartingPoint,
} from '@zodiac/modules'
import {
  type ExecutionRoute,
  type Waypoints as WaypointsType,
} from '@zodiac/schema'
import {
  Form,
  Info,
  Labeled,
  PrimaryButtonGroup,
  SecondaryLinkButton,
  TextInput,
  Warning,
} from '@zodiac/ui'
import { useId } from 'react'
import { href, redirect, useParams } from 'react-router'
import {
  queryRoutes,
  rankRoutes,
  unprefixAddress,
  type ChainId,
  type PrefixedAddress,
} from 'ser-kit'

import type { Route as RouteType } from './+types/edit-route'
import { Intent } from './intents'

export const meta: RouteType.MetaFunction = ({ data, matches }) => [
  { title: routeTitle(matches, data.currentRoute.label || 'Unnamed route') },
]

export const loader = async ({ params }: RouteType.LoaderArgs) => {
  const route = parseRouteData(params.data)

  const routes =
    route.initiator == null
      ? []
      : await queryRoutes(unprefixAddress(route.initiator), route.avatar)

  return {
    currentRoute: {
      comparableId: route.initiator == null ? undefined : routeId(route),
      label: route.label,
      initiator: route.initiator,
      avatar: route.avatar,
      waypoints: routes.length === 0 ? route.waypoints : undefined,
    },

    possibleRoutes: rankRoutes(routes),
  }
}

export const clientLoader = async ({
  serverLoader,
}: RouteType.ClientLoaderArgs) => {
  const { promise, resolve } = Promise.withResolvers<ExecutionRoute[]>()

  companionRequest(
    {
      type: CompanionAppMessageType.REQUEST_ROUTES,
    },
    (response) => resolve(response.routes),
  )

  const [serverData, routes] = await Promise.all([serverLoader(), promise])

  return { ...serverData, routes }
}

clientLoader.hydrate = true as const

export const action = async ({ request, params }: RouteType.ActionArgs) => {
  const data = await request.formData()
  const intent = getString(data, 'intent')

  let route = parseRouteData(params.data)

  switch (intent) {
    case Intent.Save: {
      const selectedRoute = await findSelectedRoute(route, data)

      route = { ...route, ...selectedRoute, id: route.id }

      return updateLabel(route, getString(data, 'label'))
    }

    case Intent.SaveAsCopy: {
      const selectedRoute = await findSelectedRoute(route, data)

      route = { ...route, ...selectedRoute, id: createRouteId() }

      const label = getString(data, 'label')

      return updateLabel(
        route,
        label === route.label ? `${label} (copy)` : label,
      )
    }

    case Intent.UpdateInitiator: {
      const account = await createAccount(
        jsonRpcProvider(getChainId(route.avatar)),
        getHexString(data, 'initiator'),
      )

      return editRoute(updateStartingPoint(route, account))
    }

    case Intent.UpdateAvatar: {
      const avatar = getHexString(data, 'avatar')

      return editRoute(updateAvatar(route, { safe: avatar }))
    }

    case Intent.UpdateChain: {
      const chainId = verifyChainId(getInt(data, 'chainId'))

      return editRoute(updateChainId(route, chainId))
    }
  }
}

const findSelectedRoute = async (
  route: ExecutionRoute,
  data: FormData,
): Promise<ExecutionRoute | undefined> => {
  const selectedRouteId = getOptionalString(data, 'selectedRouteId')

  if (selectedRouteId == null) {
    return
  }

  if (selectedRouteId === routeId(route)) {
    return route
  }

  const possibleRoutes =
    route.initiator == null
      ? []
      : await queryRoutes(unprefixAddress(route.initiator), route.avatar)

  const selectedRoute = possibleRoutes.find(
    (route) => routeId(route) === selectedRouteId,
  )

  return selectedRoute
}

export const clientAction = async ({
  serverAction,
  request,
}: RouteType.ClientActionArgs) => {
  const data = await request.clone().formData()

  const intent = getOptionalString(data, 'intent')
  const serverResult = await serverAction()

  switch (intent) {
    case Intent.Save:
    case Intent.SaveAsCopy: {
      const { promise, resolve } = Promise.withResolvers<void>()

      invariantResponse(
        serverResult,
        'Route save was not processed correctly on the server',
      )

      await fromVersion(
        '3.8.2',
        () => {
          companionRequest(
            { type: CompanionAppMessageType.SAVE_ROUTE, data: serverResult },
            () => resolve(),
          )
        },
        () => {
          window.postMessage(
            { type: CompanionAppMessageType.SAVE_ROUTE, data: serverResult },
            '*',
          )

          resolve()
        },
      )

      await promise

      return redirect(href('/edit'))
    }
    default:
      return serverResult
  }
}

const EditRoute = ({ loaderData }: RouteType.ComponentProps) => {
  const {
    currentRoute: { comparableId, label, initiator, avatar, waypoints },
    possibleRoutes,
  } = loaderData

  const formId = useId()
  const isDev = useIsDev()
  const connected = useConnected()

  return (
    <WalletProvider>
      <Page>
        <Page.Header
          action={
            <ConnectWalletButton
              connectedLabel="Wallet"
              connectLabel="Connect wallet"
            />
          }
        >
          Edit Account
        </Page.Header>

        <Page.Main className="max-w-5xl">
          <TextInput
            form={formId}
            label="Label"
            name="label"
            defaultValue={label}
          />

          <Chain chainId={getChainId(avatar)} />

          <Initiator
            avatar={avatar}
            initiator={initiator}
            knownRoutes={'routes' in loaderData ? loaderData.routes : []}
          />

          <RouteSelect
            form={formId}
            name="selectedRouteId"
            defaultValue={comparableId}
            routes={possibleRoutes}
            initiator={initiator}
            waypoints={waypoints}
          />

          <Avatar
            avatar={avatar}
            initiator={initiator}
            knownRoutes={'routes' in loaderData ? loaderData.routes : []}
          />

          <Form id={formId}>
            <Form.Actions>
              <PrimaryButtonGroup
                submit
                intent={Intent.Save}
                disabled={!connected}
                groupLabel="Show save options"
                group={(GroupOption) => (
                  <GroupOption submit intent={Intent.SaveAsCopy}>
                    Save as copy
                  </GroupOption>
                )}
                busy={useIsPending([Intent.Save, Intent.SaveAsCopy])}
              >
                Save
              </PrimaryButtonGroup>

              {!connected && (
                <div className="text-balance text-xs opacity-75">
                  The Pilot extension must be open to save.
                </div>
              )}

              {isDev && <DebugRouteData />}
            </Form.Actions>
          </Form>
        </Page.Main>
      </Page>
    </WalletProvider>
  )
}

export default EditRoute

const DebugRouteData = () => {
  const { data } = useParams()

  invariant(typeof data === 'string', 'Expected string data parameter')

  return (
    <SecondaryLinkButton
      openInNewWindow
      to={href('/dev/decode/:data', { data })}
    >
      Debug route data
    </SecondaryLinkButton>
  )
}

type InitiatorProps = {
  avatar: PrefixedAddress
  initiator?: PrefixedAddress
  knownRoutes: ExecutionRoute[]
}

const Initiator = ({ avatar, initiator, knownRoutes }: InitiatorProps) => {
  return (
    <Form intent={Intent.UpdateInitiator}>
      {({ submit }) => (
        <InitiatorInput
          avatar={avatar}
          label="Operator"
          name="initiator"
          required
          defaultValue={initiator}
          onChange={submit}
          knownRoutes={knownRoutes}
        />
      )}
    </Form>
  )
}

type AvatarProps = {
  avatar: PrefixedAddress
  initiator?: PrefixedAddress
  knownRoutes: ExecutionRoute[]
}

const Avatar = ({ initiator, avatar, knownRoutes }: AvatarProps) => {
  return (
    <Form intent={Intent.UpdateAvatar}>
      {({ submit }) => (
        <AvatarInput
          required
          label="Account"
          initiator={initiator}
          chainId={getChainId(avatar)}
          name="avatar"
          defaultValue={avatar}
          knownRoutes={knownRoutes}
          onChange={submit}
        />
      )}
    </Form>
  )
}

type ChainProps = { chainId: ChainId }

const Chain = ({ chainId }: ChainProps) => {
  return (
    <Form intent={Intent.UpdateChain}>
      {({ submit }) => (
        <ChainSelect defaultValue={chainId} name="chainId" onChange={submit} />
      )}
    </Form>
  )
}

type RouteSelectProps = {
  routes: ExecutionRoute[]
  waypoints?: WaypointsType
  defaultValue?: string
  initiator?: PrefixedAddress
  form?: string
  name?: string
}

const RouteSelect = ({
  routes,
  defaultValue,
  initiator,
  form,
  name,
  waypoints,
}: RouteSelectProps) => {
  return (
    <Labeled label="Selected route">
      {({ inputId }) =>
        routes.length === 0 ? (
          <>
            {initiator == null && (
              <Info title="Missing initiator">
                Once you select an initiator account you can select from all
                possible routes between the initiator and the account.
              </Info>
            )}

            {initiator != null && (
              <>
                <Warning title="Invalid route">
                  We could not find any routes between the initiator and the
                  selected account. Make you are using the correct chain.
                </Warning>

                {waypoints && (
                  <Routes disabled orientation="horizontal">
                    <Route>
                      <Waypoints>
                        {waypoints.map(({ account, ...waypoint }, index) => (
                          <Waypoint
                            key={`${account.address}-${index}`}
                            account={account}
                            connection={
                              'connection' in waypoint
                                ? waypoint.connection
                                : undefined
                            }
                          />
                        ))}
                      </Waypoints>
                    </Route>
                  </Routes>
                )}
              </>
            )}
          </>
        ) : (
          <Routes
            key={initiator}
            id={inputId}
            form={form}
            defaultValue={verifyDefaultValue(routes, defaultValue)}
          >
            {routes.map((route) => {
              const { waypoints } = route

              return (
                <Route id={routeId(route)} key={route.id} name={name}>
                  {waypoints && (
                    <Waypoints>
                      {waypoints.map(({ account, ...waypoint }, index) => (
                        <Waypoint
                          key={`${account.address}-${index}`}
                          account={account}
                          connection={
                            'connection' in waypoint
                              ? waypoint.connection
                              : undefined
                          }
                        />
                      ))}
                    </Waypoints>
                  )}
                </Route>
              )
            })}
          </Routes>
        )
      }
    </Labeled>
  )
}

const verifyDefaultValue = (
  routes: ExecutionRoute[],
  defaultValue?: string,
) => {
  if (defaultValue == null) {
    return defaultValue
  }

  const valueIsValid = routes.some((route) => routeId(route) === defaultValue)

  if (valueIsValid) {
    return defaultValue
  }

  const [route] = routes

  if (route == null) {
    return
  }

  return routeId(route)
}
