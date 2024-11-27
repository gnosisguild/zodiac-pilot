import { Breadcrumbs, Error, Page, Section, TextInput } from '@/components'
import { useDisconnectWalletConnectIfNeeded } from '@/providers'
import { LegacyConnection } from '@/types'
import { decodeRoleKey, encodeRoleKey } from '@/utils'
import { INITIAL_DEFAULT_ROUTE, useZodiacRoutes } from '@/zodiac-routes'
import { KnownContracts } from '@gnosis.pm/zodiac'
import { ZeroAddress } from 'ethers'
import { useState } from 'react'
import {
  queryRolesV1MultiSend,
  queryRolesV2MultiSend,
} from '../../integrations/zodiac/rolesMultisend'
import { useZodiacModules } from '../../integrations/zodiac/useZodiacModules'
import {
  asLegacyConnection,
  fromLegacyConnection,
} from '../legacyConnectionMigrations'
import { useConfirmClearTransactions } from '../useConfirmClearTransaction'
import { AvatarInput } from './AvatarInput'
import { ChainSelect } from './ChainSelect'
import { LaunchButton } from './LaunchButton'
import { RemoveButton } from './RemoveButton'
import { useConnectionDryRun } from './useConnectionDryRun'
import { useRouteId } from './useRouteId'
import { useSafesWithOwner } from './useSafesWithOwner'
import { ConnectWallet } from './wallet'
import { ZodiacMod } from './ZodiacMod'

type ConnectionPatch = Omit<Partial<LegacyConnection>, 'id' | 'lastUsed'>

export const EditRoute = () => {
  const routes = useZodiacRoutes()
  const routeId = useRouteId()

  const initialRouteState = routes.find((r) => r.id === routeId) || {
    ...INITIAL_DEFAULT_ROUTE,
    id: routeId,
  }
  const [currentRouteState, setRoute] = useState(initialRouteState)

  const { label, avatarAddress, pilotAddress, moduleAddress, roleId, chainId } =
    asLegacyConnection(currentRouteState)

  const { safes } = useSafesWithOwner(pilotAddress, routeId)

  const decodedRoleKey = roleId && decodeRoleKey(roleId)

  // TODO modules is a nested list, but we currently only render the top-level items
  const { modules } = useZodiacModules(avatarAddress, routeId)

  const [confirmClearTransactions, ConfirmationModal] =
    useConfirmClearTransactions()

  const selectedModule = moduleAddress
    ? modules.find((mod) => mod.moduleAddress === moduleAddress)
    : undefined

  const updateRoute = (patch: ConnectionPatch) => {
    console.debug('updateRoute', patch)
    setRoute((route) =>
      fromLegacyConnection({ ...asLegacyConnection(route), ...patch })
    )
  }

  const error = useConnectionDryRun(asLegacyConnection(currentRouteState))

  const [roleIdError, setRoleIdError] = useState<string | null>(null)

  useDisconnectWalletConnectIfNeeded(currentRouteState, {
    onDisconnect: () => updateRoute({ pilotAddress: '' }),
  })

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
          <TextInput
            label="Route label"
            value={label}
            placeholder="Label this route"
            onChange={(ev) => {
              updateRoute({
                label: ev.target.value,
              })
            }}
          />

          <ChainSelect
            value={chainId}
            onChange={(chainId) => updateRoute({ chainId })}
          />

          <Section title="Pilot Account">
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
            avatarAddress={avatarAddress}
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
                      value.moduleAddress
                    ),
                  })

                  break
                }

                case KnownContracts.ROLES_V2: {
                  updateRoute({
                    ...value,
                    ...(await queryRolesV2MultiSend(
                      chainId,
                      value.moduleAddress
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
              defaultValue={decodedRoleKey || roleId}
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
        </Page.Content>

        <Page.Footer>
          {error && (
            <Error title="There is a problem with this connection">
              {error}
            </Error>
          )}

          <div className="flex items-center justify-between gap-4">
            <RemoveButton />

            <LaunchButton
              disabled={!avatarAddress}
              initialRouteState={initialRouteState}
              currentRouteState={currentRouteState}
              onNeedConfirmationToClearTransactions={confirmClearTransactions}
            />
          </div>
        </Page.Footer>
      </Page>

      <ConfirmationModal />
    </>
  )
}
