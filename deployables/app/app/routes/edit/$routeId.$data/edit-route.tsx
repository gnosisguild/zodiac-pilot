import {
  AvatarInput,
  ConnectWalletButton,
  InitiatorInput,
  Page,
  useConnected,
  useIsDev,
} from '@/components'
import { ChainSelect, getRouteId, RouteSelect } from '@/routes-ui'
import { editRoute, jsonRpcProvider, parseRouteData, routeTitle } from '@/utils'
import { invariant, invariantResponse } from '@epic-web/invariant'
import { getChainId, verifyChainId } from '@zodiac/chains'
import {
  getHexString,
  getInt,
  getOptionalString,
  getString,
} from '@zodiac/form-data'
import { useIsPending } from '@zodiac/hooks'
import { CompanionAppMessageType, companionRequest } from '@zodiac/messages'
import {
  createAccount,
  createRouteId,
  queryRoutes,
  updateAvatar,
  updateChainId,
  updateLabel,
  updateStartingPoint,
} from '@zodiac/modules'
import { type ExecutionRoute } from '@zodiac/schema'
import {
  Form,
  PrimaryButtonGroup,
  SecondaryLinkButton,
  TextInput,
} from '@zodiac/ui'
import { useId } from 'react'
import { href, redirect, useParams } from 'react-router'
import { rankRoutes, type ChainId, type PrefixedAddress } from 'ser-kit'
import type { Route as RouteType } from './+types/edit-route'
import { Intent } from './intents'

export const meta: RouteType.MetaFunction = ({ data, matches }) => [
  { title: routeTitle(matches, data?.currentRoute.label || 'Unnamed route') },
]

export const loader = async ({ params }: RouteType.LoaderArgs) => {
  const route = parseRouteData(params.data)

  const queryRoutesResult =
    route.initiator == null
      ? { routes: [] }
      : await queryRoutes(route.initiator, route.avatar)

  return {
    currentRoute: {
      comparableId:
        route.initiator == null ? undefined : getRouteId(route.waypoints),
      label: route.label,
      initiator: route.initiator,
      avatar: route.avatar,
      waypoints:
        queryRoutesResult.routes.length === 0 ? route.waypoints : undefined,
    },

    possibleRoutes: rankRoutes(queryRoutesResult.routes),
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

  if (selectedRouteId === getRouteId(route.waypoints)) {
    return route
  }

  const queryRoutesResult =
    route.initiator == null
      ? { routes: [] }
      : await queryRoutes(route.initiator, route.avatar)

  const selectedRoute = queryRoutesResult.routes.find(
    (route) => getRouteId(route.waypoints) === selectedRouteId,
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

      companionRequest(
        { type: CompanionAppMessageType.SAVE_ROUTE, data: serverResult },
        () => resolve(),
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

        <Avatar avatar={avatar} initiator={initiator} />

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
          label="Pilot Signer"
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
}

const Avatar = ({ initiator, avatar }: AvatarProps) => {
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
