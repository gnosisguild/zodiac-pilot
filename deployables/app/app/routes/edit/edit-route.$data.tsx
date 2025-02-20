import { getAvailableChains } from '@/balances-server'
import {
  AvatarInput,
  KnownFromRoutes,
  Page,
  useConnected,
  useIsDev,
} from '@/components'
import { useIsPending } from '@/hooks'
import {
  ChainSelect,
  ProvideChains,
  Route,
  Routes,
  Waypoint,
  Waypoints,
} from '@/routes-ui'
import {
  dryRun,
  editRoute,
  jsonRpcProvider,
  parseRouteData,
  routeTitle,
} from '@/utils'
import { invariantResponse } from '@epic-web/invariant'
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
  getWaypoints,
  updateAvatar,
  updateChainId,
  updateLabel,
  updateStartingPoint,
} from '@zodiac/modules'
import { type ExecutionRoute, type HexAddress } from '@zodiac/schema'
import {
  AddressSelect,
  Error,
  Form,
  Info,
  Labeled,
  PrimaryButton,
  SecondaryButton,
  SecondaryLinkButton,
  Success,
  TextInput,
  Warning,
} from '@zodiac/ui'
import { useEffect, useId, useState } from 'react'
import { redirect, useFetcher, useParams } from 'react-router'
import {
  prefixAddress,
  queryRoutes,
  rankRoutes,
  splitPrefixedAddress,
  unprefixAddress,
  type ChainId,
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
      comparableId: route.initiator == null ? null : routeId(route),
      label: route.label,
      initiator: route.initiator,
      avatar: route.avatar,
    },

    possibleRoutes: rankRoutes(routes),

    chains,
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
    case Intent.DryRun:
    case Intent.Save: {
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

      if (intent === Intent.Save) {
        return route
      }
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

const EditRoute = ({ loaderData, actionData }: RouteType.ComponentProps) => {
  const {
    currentRoute: { comparableId, label, initiator, avatar },
    possibleRoutes,
    chains,
  } = loaderData

  const formId = useId()
  const isDev = useIsDev()
  const connected = useConnected()
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
        <Page.Header>Edit account</Page.Header>

        <Page.Main>
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
            value={selectedRouteId}
            onSelect={setSelectedRouteId}
            routes={possibleRoutes}
          />

          <Avatar
            avatar={avatar}
            initiator={initiator}
            knownRoutes={'routes' in loaderData ? loaderData.routes : []}
          />

          <Form
            id={formId}
            context={{
              selectedRouteId,
            }}
          >
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

type InitiatorProps = {
  avatar: PrefixedAddress
  initiator?: PrefixedAddress
  knownRoutes: ExecutionRoute[]
}

const Initiator = ({ avatar, initiator, knownRoutes }: InitiatorProps) => {
  const [chainId, address] = splitPrefixedAddress(avatar)

  const { load, state, data = [] } = useFetcher<HexAddress[]>()

  useEffect(() => {
    load(`/${address}/${chainId}/initiators`)
  }, [address, chainId, load])

  return (
    <Form>
      <div className="flex w-full items-end gap-2">
        <AddressSelect
          label="Initiator"
          name="initiator"
          placeholder="Select an initiator"
          dropdownLabel="View possible initiators"
          required
          isMulti={false}
          isDisabled={state === 'loading'}
          defaultValue={initiator}
          options={data}
        >
          {({ data: { value }, isSelected }) =>
            isSelected != null && (
              <KnownFromRoutes
                routes={knownRoutes}
                address={prefixAddress(undefined, value)}
              />
            )
          }
        </AddressSelect>

        <SecondaryButton
          submit
          busy={useIsPending(Intent.UpdateInitiator)}
          intent={Intent.UpdateInitiator}
        >
          Update initiator
        </SecondaryButton>
      </div>
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
    <Form>
      <div className="flex w-full items-end gap-2">
        <AvatarInput
          required
          label="Account"
          initiator={initiator}
          chainId={getChainId(avatar)}
          name="avatar"
          defaultValue={avatar}
          knownRoutes={knownRoutes}
        ></AvatarInput>

        <SecondaryButton
          submit
          busy={useIsPending(Intent.UpdateAvatar)}
          intent={Intent.UpdateAvatar}
        >
          Update avatar
        </SecondaryButton>
      </div>
    </Form>
  )
}

type ChainProps = { chainId: ChainId }

const Chain = ({ chainId }: ChainProps) => {
  return (
    <Form>
      <div className="flex w-full items-end gap-2">
        <ChainSelect defaultValue={chainId} name="chainId" />

        <SecondaryButton
          submit
          busy={useIsPending(Intent.UpdateChain)}
          intent={Intent.UpdateChain}
        >
          Update chain
        </SecondaryButton>
      </div>
    </Form>
  )
}

type RouteSelectProps = {
  routes: ExecutionRoute[]
  value: string | null
  initiator?: PrefixedAddress
  onSelect: (value: string) => void
}

const RouteSelect = ({
  routes,
  value,
  initiator,
  onSelect,
}: RouteSelectProps) => {
  return (
    <Labeled label="Selected route">
      {routes.length === 0 ? (
        <div className="flex w-1/2 flex-1 items-center">
          {initiator == null && (
            <Info title="Missing initiator">
              Once you select an initiator account you can select from all
              possible routes between the initiator and the account.
            </Info>
          )}

          {initiator != null && (
            <Warning>
              We could not find any routes between the initiator and the
              selected account. Make you are using the correct chain.
            </Warning>
          )}
        </div>
      ) : (
        <div className="flex w-full snap-x snap-mandatory scroll-pl-2 overflow-x-scroll rounded-md border border-zinc-200 bg-zinc-50 px-2 py-2 dark:border-zinc-700 dark:bg-zinc-900">
          <Routes>
            {routes.map((route) => {
              const waypoints = getWaypoints(route)

              return (
                <Route
                  id={route.id}
                  key={route.id}
                  selected={value === routeId(route)}
                  onSelect={() => onSelect(routeId(route))}
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
    </Labeled>
  )
}

const routeId = ({ waypoints }: ExecutionRoute) =>
  waypoints == null
    ? ''
    : waypoints
        .map(({ account }) => account.prefixedAddress)
        .join(',')
        .toLowerCase()
