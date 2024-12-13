import { EOA_ZERO_ADDRESS } from '@/chains'
import {
  Breadcrumbs,
  Error,
  errorToast,
  InlineForm,
  Page,
  PrimaryButton,
  Section,
  TextInput,
} from '@/components'
import {
  getLastUsedRouteId,
  getRoute,
  getRoutes,
  removeRoute,
  saveLastUsedRouteId,
  saveRoute,
} from '@/execution-routes'
import { useDisconnectWalletConnectIfNeeded } from '@/providers'
import type { HexAddress, LegacyConnection } from '@/types'
import {
  decodeRoleKey,
  encodeRoleKey,
  getInt,
  getOptionalString,
  getString,
} from '@/utils'
import {
  queryRolesV1MultiSend,
  queryRolesV2MultiSend,
  useZodiacModules,
  type SupportedModuleType,
} from '@/zodiac'
import { KnownContracts } from '@gnosis.pm/zodiac'
import { ZeroAddress } from 'ethers'
import { Rocket } from 'lucide-react'
import { useRef, useState } from 'react'
import {
  redirect,
  useLoaderData,
  useSubmit,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from 'react-router'
import { formatPrefixedAddress, type ChainId } from 'ser-kit'
import {
  asLegacyConnection,
  fromLegacyConnection,
} from '../../legacyConnectionMigrations'
import { useConfirmClearTransactions } from '../../useConfirmClearTransaction'
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

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const lastUsedRouteId = await getLastUsedRouteId()
  const routeId = getRouteId(params)

  const route = await getRoute(routeId)

  return {
    initialRouteState: route,
    currentExecutionRoute:
      lastUsedRouteId != null ? await getRoute(lastUsedRouteId) : null,
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
          ) as SupportedModuleType,
          multisend: getOptionalString(data, 'multisend'),
          multisendCallOnly: getOptionalString(data, 'multisendCallOnly'),
          roleId: getOptionalString(data, 'roleId'),
        }),
      )

      return null
    }
  }
}

export const EditRoute = () => {
  const { initialRouteState, currentExecutionRoute } =
    useLoaderData<typeof loader>()
  const [currentRouteState, setCurrentRouteState] = useState(initialRouteState)

  const legacyConnection = asLegacyConnection(currentRouteState)
  const { label, avatarAddress, pilotAddress, moduleAddress, roleId, chainId } =
    legacyConnection

  const { safes } = useSafesWithOwner(initialRouteState, pilotAddress)

  const prefixedAvatarAddress = formatPrefixedAddress(
    chainId,
    avatarAddress as HexAddress,
  )
  // TODO modules is a nested list, but we currently only render the top-level items
  const { modules } = useZodiacModules(prefixedAvatarAddress)

  const [confirmClearTransactions, ConfirmationModal] =
    useConfirmClearTransactions()

  const selectedModule = moduleAddress
    ? modules.find((mod) => mod.moduleAddress === moduleAddress)
    : undefined

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
              onChange={async (address) => {
                const keepTransactionBundle =
                  address.toLowerCase() === avatarAddress.toLowerCase()
                const confirmed =
                  keepTransactionBundle || (await confirmClearTransactions())

                if (confirmed) {
                  updateRoute({
                    avatarAddress: address || undefined,
                    moduleAddress: '',
                    moduleType: undefined,
                  })
                }
              }}
            />

            <ZodiacMod
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
                  case KnownContracts.ROLES_V1: {
                    updateRoute({
                      ...value,
                      multisend: await queryRolesV1MultiSend(
                        chainId,
                        value.moduleAddress,
                      ),
                    })

                    break
                  }

                  case KnownContracts.ROLES_V2: {
                    updateRoute({
                      ...value,
                      ...(await queryRolesV2MultiSend(
                        chainId,
                        value.moduleAddress,
                      )),
                    })

                    break
                  }
                }
              }}
            />

            {selectedModule?.type === KnownContracts.ROLES_V1 && (
              <TextInput
                label="Role ID"
                value={roleId}
                onChange={(ev) => {
                  updateRoute({ roleId: ev.target.value })
                }}
                placeholder="0"
              />
            )}
            {selectedModule?.type === KnownContracts.ROLES_V2 && (
              <TextInput
                label="Role Key"
                key={currentRouteState.id} // makes sure the defaultValue is reset when switching connections
                error={roleIdError}
                defaultValue={
                  roleId != null ? decodeRoleKey(roleId) || roleId : roleId
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
                  currentExecutionRoute.avatar === currentRouteState.avatar

                const confirmed =
                  keepTransactionBundle || (await confirmClearTransactions())

                if (!confirmed) {
                  return
                }

                submit(formRef.current, { method: 'post' })
              }}
            >
              Save & Launch
            </PrimaryButton>
          </div>
        </Page.Footer>
      </Page>

      <ConfirmationModal />
    </>
  )
}
