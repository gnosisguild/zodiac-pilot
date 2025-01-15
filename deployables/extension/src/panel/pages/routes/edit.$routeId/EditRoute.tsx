import {
  getLastUsedRouteId,
  getRoute,
  getRoutes,
  removeRoute,
  saveLastUsedRouteId,
  saveRoute,
} from '@/execution-routes'
import { useDisconnectWalletConnectIfNeeded } from '@/providers'
import { useTransactions } from '@/state'
import type { HexAddress, LegacyConnection } from '@/types'
import { formData, getInt, getOptionalString, getString } from '@/utils'
import {
  fetchZodiacModules,
  queryRolesV1MultiSend,
  queryRolesV2MultiSend,
  SupportedZodiacModuleType,
} from '@/zodiac'
import { invariantResponse } from '@epic-web/invariant'
import { EOA_ZERO_ADDRESS } from '@zodiac/chains'
import { decodeRoleKey, encodeRoleKey } from '@zodiac/modules'
import {
  Breadcrumbs,
  Error,
  errorToast,
  InlineForm,
  Page,
  PrimaryButton,
  Section,
  Select,
  TextInput,
  Warning,
} from '@zodiac/ui'
import { getAddress, ZeroAddress } from 'ethers'
import { Rocket } from 'lucide-react'
import { Suspense, useEffect, useRef, useState } from 'react'
import {
  Await,
  redirect,
  useLoaderData,
  useSubmit,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from 'react-router'
import {
  formatPrefixedAddress,
  splitPrefixedAddress,
  type ChainId,
} from 'ser-kit'
import { ClearTransactionsModal } from '../../ClearTransactionsModal'
import {
  asLegacyConnection,
  fromLegacyConnection,
} from '../../legacyConnectionMigrations'
import { AvatarInput } from './AvatarInput'
import { ChainSelect } from './ChainSelect'
import { getRouteId } from './getRouteId'
import { Intent } from './intents'
import { RemoveButton } from './RemoveButton'
import { useConnectionDryRun } from './useConnectionDryRun'
import { useSafesWithOwner } from './useSafesWithOwner'
import { ConnectWallet } from './wallet'
import { ZodiacMod } from './ZodiacMod'

type ConnectionPatch = Omit<Partial<LegacyConnection>, 'id' | 'lastUsed'>

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const lastUsedRouteId = await getLastUsedRouteId()
  const routeId = getRouteId(params)

  const route = await getRoute(routeId)

  const preliminaryAvatarAddress = getPreliminaryAvatarAddress(
    url.searchParams.get('avatarAddress'),
  )
  const preliminaryChainId = url.searchParams.get('chainId')
  const [chainId, avatarAddress] = splitPrefixedAddress(route.avatar)

  invariantResponse(
    chainId != null,
    `Could not parse chain ID from address "${route.avatar}"`,
  )

  const zodiacModules = fetchZodiacModules(
    preliminaryAvatarAddress != null ? preliminaryAvatarAddress : avatarAddress,
    preliminaryChainId != null
      ? (parseInt(preliminaryChainId) as ChainId)
      : chainId,
  )

  return {
    initialRouteState: route,
    currentExecutionRoute:
      lastUsedRouteId != null ? await getRoute(lastUsedRouteId) : null,
    zodiacModules,
  }
}

const getPreliminaryAvatarAddress = (
  address: string | null,
): HexAddress | null => {
  if (address == null) {
    return null
  }

  try {
    return getAddress(address) as HexAddress
  } catch {
    return null
  }
}

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const data = await request.formData()
  const routeId = getRouteId(params)

  switch (getString(data, 'intent')) {
    case Intent.removeRoute: {
      const lastUsedRouteId = await getLastUsedRouteId()

      await removeRoute(routeId)

      if (lastUsedRouteId === routeId) {
        await saveLastUsedRouteId(null)
      }

      const routes = await getRoutes()

      if (routes.length === 0) {
        return redirect('/')
      }

      const [newActiveRoute] = routes

      await saveLastUsedRouteId(newActiveRoute.id)

      return redirect('/routes')
    }

    case Intent.saveRoute: {
      await saveRoute(
        fromLegacyConnection({
          id: routeId,
          label: getString(data, 'label'),
          chainId: getInt(data, 'chainId') as ChainId,
          avatarAddress: getString(data, 'avatarAddress'),
          moduleAddress: getString(data, 'moduleAddress'),
          pilotAddress: getString(data, 'pilotAddress'),
          providerType: getInt(data, 'providerType'),
          moduleType: getOptionalString(
            data,
            'moduleType',
          ) as SupportedZodiacModuleType,
          multisend: getOptionalString(data, 'multisend'),
          multisendCallOnly: getOptionalString(data, 'multisendCallOnly'),
          roleId: getOptionalString(data, 'roleId'),
        }),
      )

      return redirect(`/${routeId}`)
    }

    case Intent.clearTransactions: {
      const lastUsedRouteId = await getLastUsedRouteId()

      await saveRoute(
        fromLegacyConnection({
          id: routeId,
          label: getString(data, 'label'),
          chainId: getInt(data, 'chainId') as ChainId,
          avatarAddress: getString(data, 'avatarAddress'),
          moduleAddress: getString(data, 'moduleAddress'),
          pilotAddress: getString(data, 'pilotAddress'),
          providerType: getInt(data, 'providerType'),
          moduleType: getOptionalString(
            data,
            'moduleType',
          ) as SupportedZodiacModuleType,
          multisend: getOptionalString(data, 'multisend'),
          multisendCallOnly: getOptionalString(data, 'multisendCallOnly'),
          roleId: getOptionalString(data, 'roleId'),
        }),
      )

      return redirect(`/${lastUsedRouteId}/clear-transactions/${routeId}`)
    }
  }
}

export const EditRoute = () => {
  const { initialRouteState, currentExecutionRoute, zodiacModules } =
    useLoaderData<typeof loader>()
  const [currentRouteState, setCurrentRouteState] = useState(initialRouteState)
  const [confirmClearTransactions, setConfirmClearTransactions] =
    useState(false)
  const transactions = useTransactions()

  const legacyConnection = asLegacyConnection(currentRouteState)
  const { label, avatarAddress, pilotAddress, roleId, chainId, moduleAddress } =
    legacyConnection

  const { safes } = useSafesWithOwner(initialRouteState, pilotAddress)

  const prefixedAvatarAddress = formatPrefixedAddress(
    chainId,
    avatarAddress as HexAddress,
  )

  const updateRoute = (patch: ConnectionPatch) => {
    console.debug('updateRoute', patch)
    setCurrentRouteState((route) =>
      fromLegacyConnection({ ...asLegacyConnection(route), ...patch }),
    )
  }

  const error = useConnectionDryRun({
    currentRoute: initialRouteState,
    futureRoute: currentRouteState,
  })

  const [roleIdError, setRoleIdError] = useState<string | null>(null)

  useDisconnectWalletConnectIfNeeded(currentRouteState, {
    onDisconnect: () => updateRoute({ pilotAddress: '' }),
  })

  const formRef = useRef(null)
  const submit = useSubmit()

  useEffect(() => {
    submit(formData({ avatarAddress, chainId }), { method: 'get' })
  }, [chainId, avatarAddress, submit])

  return (
    <>
      <Page>
        <Page.Header>
          <Breadcrumbs>
            <Breadcrumbs.Entry to="/">Transactions</Breadcrumbs.Entry>
            <Breadcrumbs.Entry to="/routes">All routes</Breadcrumbs.Entry>
          </Breadcrumbs>

          <h2 className="mt-1 text-xl">
            {currentRouteState.label || 'New connection'}
          </h2>
        </Page.Header>

        <Page.Content>
          <InlineForm
            ref={formRef}
            className="flex flex-col gap-4"
            intent={Intent.saveRoute}
            context={{ ...legacyConnection }}
          >
            <TextInput
              label="Route label"
              name="label"
              value={label}
              onChange={(event) => updateRoute({ label: event.target.value })}
              placeholder="Label this route"
            />

            <ChainSelect
              value={chainId}
              onChange={(chainId) => updateRoute({ chainId })}
            />

            <Section
              title={
                currentRouteState.initiator === EOA_ZERO_ADDRESS
                  ? 'Pilot Account'
                  : undefined
              }
            >
              <ConnectWallet
                route={currentRouteState}
                onConnect={({ providerType, chainId, account }) => {
                  updateRoute({
                    providerType,
                    chainId,
                    pilotAddress: account,
                  })
                }}
                onDisconnect={() => {
                  updateRoute({ pilotAddress: '' })
                }}
                onError={() => {
                  errorToast({
                    title: 'Connection error',
                    message: 'Could not connect to the wallet.',
                  })
                }}
              />
            </Section>

            <AvatarInput
              availableSafes={safes}
              value={avatarAddress === ZeroAddress ? '' : avatarAddress || ''}
              onChange={(address) => {
                updateRoute({
                  avatarAddress: address || undefined,
                  moduleAddress: '',
                  moduleType: undefined,
                })
              }}
            />

            <Suspense
              fallback={
                <Select
                  isDisabled
                  label="Zodiac Mod"
                  placeholder="Loading modules..."
                />
              }
            >
              <Await
                resolve={zodiacModules}
                errorElement={
                  <Warning title="Selected safe is not valid">
                    Please select a valid safe to be able to select a mod.
                  </Warning>
                }
              >
                {(modules) => {
                  const selectedModule = modules.find(
                    (module) => module.moduleAddress === moduleAddress,
                  )

                  return (
                    <>
                      <ZodiacMod
                        modules={modules}
                        route={initialRouteState}
                        avatarAddress={prefixedAvatarAddress}
                        pilotAddress={pilotAddress}
                        value={
                          selectedModule
                            ? {
                                moduleAddress: selectedModule.moduleAddress,
                                moduleType: selectedModule.type,
                              }
                            : null
                        }
                        onSelect={async (value) => {
                          if (value == null) {
                            updateRoute({
                              moduleAddress: undefined,
                              moduleType: undefined,
                            })

                            return
                          }

                          switch (value.moduleType) {
                            case SupportedZodiacModuleType.ROLES_V1: {
                              const multisend = await queryRolesV1MultiSend(
                                chainId,
                                value.moduleAddress,
                              )

                              updateRoute({
                                ...value,
                                multisend: multisend[0],
                              })

                              break
                            }

                            case SupportedZodiacModuleType.ROLES_V2: {
                              const [multisend, multisendCallOnly] =
                                await queryRolesV2MultiSend(
                                  chainId,
                                  value.moduleAddress,
                                )

                              updateRoute({
                                ...value,
                                multisend,
                                multisendCallOnly,
                              })

                              break
                            }
                          }
                        }}
                      />

                      {selectedModule?.type ===
                        SupportedZodiacModuleType.ROLES_V1 && (
                        <TextInput
                          label="Role ID"
                          value={roleId}
                          onChange={(ev) => {
                            updateRoute({ roleId: ev.target.value })
                          }}
                          placeholder="0"
                        />
                      )}

                      {selectedModule?.type ===
                        SupportedZodiacModuleType.ROLES_V2 && (
                        <TextInput
                          label="Role Key"
                          key={currentRouteState.id} // makes sure the defaultValue is reset when switching connections
                          error={roleIdError}
                          defaultValue={
                            roleId != null
                              ? decodeRoleKey(roleId) || roleId
                              : roleId
                          }
                          onChange={(ev) => {
                            try {
                              const roleId = encodeRoleKey(ev.target.value)
                              setRoleIdError(null)
                              updateRoute({ roleId })
                            } catch (e) {
                              updateRoute({ roleId: '' })
                              setRoleIdError((e as Error).message)
                            }
                          }}
                          placeholder="Enter key as bytes32 hex string or in human-readable decoding"
                        />
                      )}
                    </>
                  )
                }}
              </Await>
            </Suspense>
          </InlineForm>
        </Page.Content>

        <Page.Footer>
          {error && (
            <Error title="There is a problem with this connection">
              {error}
            </Error>
          )}

          <div className="flex items-center justify-between gap-4">
            <RemoveButton />

            <PrimaryButton
              disabled={!avatarAddress}
              icon={Rocket}
              onClick={async () => {
                // we continue working with the same avatar, so don't have to clear the recorded transaction
                const keepTransactionBundle =
                  currentExecutionRoute == null ||
                  currentExecutionRoute.avatar.toLowerCase() ===
                    currentRouteState.avatar.toLowerCase() ||
                  transactions.length === 0

                if (keepTransactionBundle) {
                  submit(formRef.current, { method: 'post' })

                  return
                }

                setConfirmClearTransactions(true)
              }}
            >
              Save & Launch
            </PrimaryButton>
          </div>
        </Page.Footer>
      </Page>

      <ClearTransactionsModal
        newActiveRouteId={initialRouteState.id}
        additionalContext={{ ...legacyConnection }}
        open={confirmClearTransactions}
        intent={Intent.clearTransactions}
        onClose={() => setConfirmClearTransactions(false)}
      />
    </>
  )
}
