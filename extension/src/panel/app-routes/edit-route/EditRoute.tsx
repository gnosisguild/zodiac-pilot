import { Divider, Error, Section, TextInput } from '@/components'
import { useDisconnectWalletConnectIfNeeded } from '@/providers'
import { LegacyConnection } from '@/types'
import { INITIAL_DEFAULT_ROUTE, useZodiacRoutes } from '@/zodiac-routes'
import { KnownContracts } from '@gnosis.pm/zodiac'
import { ZeroAddress } from 'ethers'
import { ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  queryRolesV1MultiSend,
  queryRolesV2MultiSend,
} from '../../integrations/zodiac/rolesMultisend'
import { useZodiacModules } from '../../integrations/zodiac/useZodiacModules'
import { decodeRoleKey, encodeRoleKey } from '../../utils'
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
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-col gap-1 p-4">
          <Link
            className="flex items-center gap-2 font-mono text-xs uppercase no-underline opacity-75"
            to="/routes"
          >
            <ChevronLeft size={16} /> All routes
          </Link>

          <h2 className="text-xl">
            {currentRouteState.label || 'New connection'}
          </h2>
        </div>

        <Divider />

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          <Section>
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
          </Section>

          <Section title="Chain">
            <ChainSelect
              value={chainId}
              onChange={(chainId) => updateRoute({ chainId })}
            />
          </Section>

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

          <Section title={safes.length > 0 ? 'Piloted Safe' : undefined}>
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
          </Section>

          <Section title="Zodiac Mod">
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
          </Section>

          {selectedModule?.type === KnownContracts.ROLES_V1 && (
            <Section>
              <TextInput
                label="Role ID"
                value={roleId}
                onChange={(ev) => {
                  updateRoute({ roleId: ev.target.value })
                }}
                placeholder="0"
              />
            </Section>
          )}
          {selectedModule?.type === KnownContracts.ROLES_V2 && (
            <Section>
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
            </Section>
          )}
        </div>

        <Divider />

        <div className="flex flex-col gap-4 p-4">
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
        </div>
      </div>

      <ConfirmationModal />
    </>
  )
}
