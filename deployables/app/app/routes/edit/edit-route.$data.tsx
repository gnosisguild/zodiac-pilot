import { getChain } from '@/balances-server'
import { useConnected, useIsDev } from '@/components'
import { useIsPending } from '@/hooks'
import { Route, Waypoint, Waypoints } from '@/routes-ui'
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
  getWaypoints,
  queryRolesV1MultiSend,
  queryRolesV2MultiSend,
  removeAvatar,
  SupportedZodiacModuleType,
  updateAvatar,
  updateChainId,
  updateLabel,
  updateRoleId,
  updateRolesWaypoint,
  updateStartingPoint,
  zodiacModuleSchema,
  type ZodiacModule,
} from '@zodiac/modules'
import { type ExecutionRoute } from '@zodiac/schema'
import {
  AddressInput,
  Error,
  Form,
  PrimaryButton,
  SecondaryButton,
  SecondaryLinkButton,
  Success,
  TextInput,
} from '@zodiac/ui'
import { useParams } from 'react-router'
import { unprefixAddress } from 'ser-kit'
import type { Route as RouteType } from './+types/edit-route.$data'
import { Intent } from './intents'

export const meta: RouteType.MetaFunction = ({ data, matches }) => [
  { title: routeTitle(matches, data.label || 'Unnamed route') },
]

export const loader = async ({ params }: RouteType.LoaderArgs) => {
  const route = parseRouteData(params.data)
  const chainId = getChainId(route.avatar)

  const chain = await getChain(chainId)

  return {
    label: route.label,
    initiator: route.initiator || ZERO_ADDRESS,
    chainId,
    chain,
    avatar: route.avatar,
    waypoints: getWaypoints(route),
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

      const roleId = getOptionalString(data, 'roleId')

      if (roleId != null) {
        route = updateRoleId(route, roleId)
      }

      route = updateLabel(route, getString(data, 'label'))

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
  loaderData: { label, avatar, chain, waypoints, initiator },
  actionData,
}: RouteType.ComponentProps) => {
  const isDev = useIsDev()
  const connected = useConnected()

  return (
    <>
      <Form>
        <TextInput label="Label" name="label" defaultValue={label} />

        <AddressInput
          readOnly
          label="Pilot Account"
          defaultValue={unprefixAddress(initiator)}
        />

        <Route selectable={false}>
          <Waypoints excludeEnd>
            {waypoints.map((waypoint) => (
              <Waypoint
                key={waypoint.account.prefixedAddress}
                account={waypoint.account}
                connection={waypoint.connection}
              />
            ))}
          </Waypoints>
        </Route>

        <AddressInput
          label="Avatar"
          readOnly
          action={
            <div className="leading-0 mr-2 flex items-center gap-2 text-xs font-semibold uppercase text-zinc-500">
              {chain.name}
              {chain.logo_url && (
                <img className="size-5" src={chain.logo_url} alt="" />
              )}
            </div>
          }
          defaultValue={unprefixAddress(avatar)}
        />

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
              Save & Close
            </PrimaryButton>
          </div>
        </Form.Actions>

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
    </>
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
