import { EOA_ZERO_ADDRESS } from '@/chains'
import {
  Breadcrumbs,
  Error,
  errorToast,
  Page,
  Section,
  TextInput,
} from '@/components'
import {
  asLegacyConnection,
  fromLegacyConnection,
  INITIAL_DEFAULT_ROUTE,
  useExecutionRoutes,
} from '@/execution-routes'
import { useDisconnectWalletConnectIfNeeded } from '@/providers'
import { HexAddress, LegacyConnection } from '@/types'
import { decodeRoleKey, encodeRoleKey } from '@/utils'
import { ConnectWallet } from '@/wallet'
import {
  queryRolesV1MultiSend,
  queryRolesV2MultiSend,
  useZodiacModules,
} from '@/zodiac'
import { KnownContracts } from '@gnosis.pm/zodiac'
import { ZeroAddress } from 'ethers'
import { useState } from 'react'
import { formatPrefixedAddress } from 'ser-kit'
import { useConfirmClearTransactions } from '../../useConfirmClearTransaction'
import { ChainSelect } from '../ChainSelect'
import { AvatarInput } from './AvatarInput'
import { LaunchButton } from './LaunchButton'
import { RemoveButton } from './RemoveButton'
import { useConnectionDryRun } from './useConnectionDryRun'
import { useRouteId } from './useRouteId'
import { useSafesWithOwner } from './useSafesWithOwner'
import { ZodiacMod } from './ZodiacMod'

type ConnectionPatch = Omit<Partial<LegacyConnection>, 'id' | 'lastUsed'>

export const EditRoute = () => {
  const routes = useExecutionRoutes()
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

  const prefixedAvatarAddress = formatPrefixedAddress(
    chainId,
    avatarAddress as HexAddress
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

          <Page.Title>{currentRouteState.label || 'New connection'}</Page.Title>
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
