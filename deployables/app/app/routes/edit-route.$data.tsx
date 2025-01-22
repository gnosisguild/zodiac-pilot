import {
  AvatarInput,
  ChainSelect,
  ConnectWallet,
  ConnectWalletFallback,
  WalletProvider,
  ZodiacMod,
} from '@/components'
import { dryRun, editRoute, jsonRpcProvider, parseRouteData } from '@/utils'
import { invariant } from '@epic-web/invariant'
import { Chain, getChainId, verifyChainId, ZERO_ADDRESS } from '@zodiac/chains'
import {
  formData,
  getHexString,
  getInt,
  getOptionalString,
  getString,
} from '@zodiac/form-data'
import { CompanionAppMessageType } from '@zodiac/messages'
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
  ProviderType,
  providerTypeSchema,
  type ExecutionRoute,
  type Waypoints,
} from '@zodiac/schema'
import {
  Error,
  PilotType,
  PrimaryButton,
  SecondaryButton,
  TextInput,
  ZodiacOsPlain,
} from '@zodiac/ui'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Form, useLoaderData, useNavigation, useSubmit } from 'react-router'
import type { Route } from './+types/edit-route.$data'
import { Intent } from './intents'

const DebugRouteData = lazy(async () => {
  const { DebugRouteData } = await import('./DebugRouteData')

  return { default: DebugRouteData }
})

export const meta: Route.MetaFunction = () => [
  { title: 'Pilot | Route configuration' },
]

export const loader = ({ params }: Route.LoaderArgs) => {
  const route = parseRouteData(params.data)

  const chainId = getChainId(route.avatar)

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

  return editRoute(updatedRoute)
}

export const clientAction = async ({
  serverAction,
  request,
  params,
}: Route.ClientActionArgs) => {
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

      const account = getHexString(data, 'account')
      const chainId = verifyChainId(getInt(data, 'chainId'))
      const providerType = verifyProviderType(getInt(data, 'providerType'))

      return editRoute(
        updatePilotAddress(
          updateChainId(updateProviderType(route, providerType), chainId),
          account,
        ),
      )
    }
    case Intent.DisconnectWallet: {
      const route = parseRouteData(params.data)

      return editRoute(updatePilotAddress(route, ZERO_ADDRESS))
    }

    default:
      return serverAction()
  }
}

const EditRoute = ({
  loaderData: { chainId, label, avatar, waypoints },
  actionData,
}: Route.ComponentProps) => {
  const submit = useSubmit()
  const optimisticRoute = useOptimisticRoute()

  const { state } = useNavigation()

  return (
    <div className="flex h-full flex-col gap-8">
      <main className="mx-auto flex w-3/4 flex-col gap-4 md:w-1/2 2xl:w-1/4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ZodiacOsPlain className="h-6 lg:h-8" />
            <PilotType className="h-8 lg:h-10 dark:invert" />
          </div>

          <h1 className="my-8 text-3xl font-extralight">Route configuration</h1>
        </div>

        <Form method="POST" className="flex flex-col gap-4">
          <TextInput label="Label" name="label" defaultValue={label} />

          <Suspense fallback={<ConnectWalletFallback />}>
            <WalletProvider fallback={<ConnectWalletFallback />}>
              <ConnectWallet
                chainId={optimisticRoute.chainId}
                pilotAddress={optimisticRoute.pilotAddress}
                providerType={optimisticRoute.providerType}
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
                onDisconnect={() => {
                  submit(formData({ intent: Intent.DisconnectWallet }), {
                    method: 'POST',
                  })
                }}
              />
            </WalletProvider>
          </Suspense>

          <ChainSelect
            value={chainId}
            onChange={(chainId) => {
              submit(formData({ intent: Intent.UpdateChain, chainId }), {
                method: 'POST',
              })
            }}
          />

          <AvatarInput
            value={avatar}
            waypoints={waypoints}
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

          <div className="mt-8 flex items-center justify-between gap-8">
            <div className="text-balance text-xs opacity-75">
              The Pilot extension must be open to save.
            </div>

            <div className="flex gap-2">
              <SecondaryButton
                submit
                intent={Intent.DryRun}
                disabled={state !== 'idle'}
              >
                Test route
              </SecondaryButton>

              <PrimaryButton
                submit
                intent={Intent.Save}
                disabled={state !== 'idle'}
              >
                Save
              </PrimaryButton>
            </div>
          </div>

          {actionData != null && actionData.error === true && (
            <div className="mt-8">
              <Error title="Dry run failed">{actionData.message}</Error>
            </div>
          )}
        </Form>
      </main>

      {process.env.NODE_ENV !== 'production' && <DebugRouteData />}
    </div>
  )
}

export default EditRoute

const useOptimisticRoute = () => {
  const { waypoints, chainId, providerType } = useLoaderData<typeof loader>()
  const pilotAddress = getPilotAddress(waypoints)

  const { formData } = useNavigation()

  const [optimisticConnection, setOptimisticConnection] = useState({
    pilotAddress,
    chainId,
    providerType,
  })

  useEffect(() => {
    setOptimisticConnection({ pilotAddress, chainId, providerType })
  }, [chainId, pilotAddress, providerType])

  useEffect(() => {
    if (formData == null) {
      return
    }

    const intent = getOptionalString(formData, 'intent')

    if (intent == null) {
      return
    }

    switch (intent) {
      case Intent.DisconnectWallet: {
        setOptimisticConnection({
          pilotAddress: ZERO_ADDRESS,
          chainId: Chain.ETH,
          providerType: undefined,
        })

        break
      }

      case Intent.ConnectWallet: {
        setOptimisticConnection({
          pilotAddress: getHexString(formData, 'account'),
          chainId: verifyChainId(getInt(formData, 'chainId')),
          providerType: verifyProviderType(getInt(formData, 'providerType')),
        })
      }
    }
  }, [formData])

  return optimisticConnection
}

const getPilotAddress = (waypoints?: Waypoints) => {
  if (waypoints == null) {
    return null
  }

  const [startingPoint] = waypoints

  return startingPoint.account.address
}

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

const verifyProviderType = (value: number): ProviderType =>
  providerTypeSchema.parse(value)
