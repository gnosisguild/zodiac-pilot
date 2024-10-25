import { Box, Divider, Field, Flex, useConfirmationModal } from '@/components'
import { LegacyConnection } from '@/types'
import { INITIAL_DEFAULT_ROUTE, useZodiacRoutes } from '@/zodiac-routes'
import { KnownContracts } from '@gnosis.pm/zodiac'
import { ZeroAddress } from 'ethers'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { MODULE_NAMES } from '../../../const'
import { useSafeDelegates, useSafesWithOwner } from '../../integrations/safe'
import {
  queryRolesV1MultiSend,
  queryRolesV2MultiSend,
} from '../../integrations/zodiac/rolesMultisend'
import { useZodiacModules } from '../../integrations/zodiac/useZodiacModules'
import { useClearTransactions } from '../../state/transactionHooks'
import { decodeRoleKey, encodeRoleKey } from '../../utils'
import {
  asLegacyConnection,
  fromLegacyConnection,
} from '../legacyConnectionMigrations'
import { AvatarInput } from './AvatarInput'
import { ChainSelect } from './ChainSelect'
import { LaunchButton } from './LaunchButton'
import { ModSelect, NO_MODULE_OPTION } from './ModSelect'
import { RemoveButton } from './RemoveButton'
import classes from './style.module.css'
import { useConnectionDryRun } from './useConnectionDryRun'
import { useRouteId } from './useRouteId'
import { ConnectWallet } from './wallet'

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
  const { delegates } = useSafeDelegates(avatarAddress, routeId)

  const decodedRoleKey = roleId && decodeRoleKey(roleId)

  // TODO modules is a nested list, but we currently only render the top-level items
  const {
    loading: loadingMods,
    isValidSafe,
    modules,
  } = useZodiacModules(avatarAddress, routeId)

  const [confirmClearTransactions, ConfirmationModal] =
    useConfirmClearTransactions()

  const selectedModule = moduleAddress
    ? modules.find((mod) => mod.moduleAddress === moduleAddress)
    : undefined

  const updateConnection = (patch: ConnectionPatch) => {
    console.log('updateConnection', patch)
    setRoute((route) =>
      fromLegacyConnection({ ...asLegacyConnection(route), ...patch })
    )
  }

  const error = useConnectionDryRun(asLegacyConnection(currentRouteState))

  const [roleIdError, setRoleIdError] = React.useState<string | null>(null)

  const pilotIsOwner = safes.some(
    (safe) => safe.toLowerCase() === avatarAddress.toLowerCase()
  )
  const pilotIsDelegate = delegates.some(
    (delegate) => delegate.toLowerCase() === pilotAddress.toLowerCase()
  )
  const defaultModOption =
    pilotIsOwner || pilotIsDelegate ? NO_MODULE_OPTION : undefined

  return (
    <>
      <div className="relative flex flex-1 flex-col gap-4 px-6 py-8">
        <Flex gap={2} direction="column">
          <Flex gap={1} justifyContent="space-between" alignItems="baseline">
            <Flex gap={1} direction="column" alignItems="baseline">
              <h2>{currentRouteState.label || 'New connection'}</h2>
              <Link className={classes.backLink} to="/routes">
                &#8592; All Connections
              </Link>
            </Flex>
            <div className="flex items-center gap-4">
              <LaunchButton
                disabled={!avatarAddress}
                initialRouteState={initialRouteState}
                currentRouteState={currentRouteState}
                onNeedConfirmationToClearTransactions={confirmClearTransactions}
              />

              <RemoveButton />
            </div>
          </Flex>
        </Flex>

        <Divider />

        <Flex direction="column" gap={2}>
          <Flex direction="column" gap={3} className={classes.form}>
            {error && (
              <Box double p={3}>
                <div className={classes.errorInfo}>
                  <p>There seems to be a problem with this connection:</p>
                  <Box p={3} className={classes.error}>
                    {error}
                  </Box>
                </div>
              </Box>
            )}
            <Field label="Route Label">
              <input
                type="text"
                value={label}
                placeholder="Label this route"
                onChange={(ev) => {
                  updateConnection({
                    label: ev.target.value,
                  })
                }}
              />
            </Field>
            <Field label="Chain">
              <ChainSelect
                value={chainId}
                onChange={(chainId) => updateConnection({ chainId })}
              />
            </Field>
            <Field label="Pilot Account" labelFor="">
              <ConnectWallet
                route={currentRouteState}
                onConnect={({ providerType, chainId, account }) => {
                  updateConnection({
                    providerType,
                    chainId,
                    pilotAddress: account,
                  })
                }}
                onDisconnect={() => {
                  updateConnection({ pilotAddress: '' })
                }}
              />
            </Field>
            <Field label="Piloted Safe" labelFor="">
              <AvatarInput
                availableSafes={safes}
                value={avatarAddress === ZeroAddress ? '' : avatarAddress || ''}
                onChange={async (address) => {
                  const keepTransactionBundle =
                    address.toLowerCase() === avatarAddress.toLowerCase()
                  const confirmed =
                    keepTransactionBundle || (await confirmClearTransactions())

                  if (confirmed) {
                    updateConnection({
                      avatarAddress: address || undefined,
                      moduleAddress: '',
                      moduleType: undefined,
                    })
                  }
                }}
              />
            </Field>
            <Field label="Zodiac Mod" disabled={modules.length === 0}>
              <ModSelect
                isMulti={false}
                options={[
                  ...(pilotIsOwner || pilotIsDelegate
                    ? [NO_MODULE_OPTION]
                    : []),
                  ...modules.map((mod) => ({
                    value: mod.moduleAddress,
                    label: `${MODULE_NAMES[mod.type]} Mod`,
                  })),
                ]}
                onChange={async (selected) => {
                  if (selected == null) {
                    updateConnection({
                      moduleAddress: undefined,
                      moduleType: undefined,
                    })

                    return
                  }

                  const mod = modules.find(
                    (mod) => mod.moduleAddress === selected.value
                  )
                  updateConnection({
                    moduleAddress: mod?.moduleAddress,
                    moduleType: mod?.type,
                  })

                  if (mod?.type === KnownContracts.ROLES_V1) {
                    updateConnection({
                      multisend: await queryRolesV1MultiSend(
                        chainId,
                        mod.moduleAddress
                      ),
                    })
                  }
                  if (mod?.type === KnownContracts.ROLES_V2) {
                    updateConnection(
                      await queryRolesV2MultiSend(chainId, mod.moduleAddress)
                    )
                  }
                }}
                value={
                  selectedModule
                    ? {
                        value: selectedModule.moduleAddress,
                        label: MODULE_NAMES[selectedModule.type],
                      }
                    : defaultModOption
                }
                isDisabled={loadingMods || !isValidSafe}
                placeholder={
                  loadingMods || !isValidSafe ? '' : 'Select a module'
                }
                avatarAddress={avatarAddress}
              />
            </Field>
            {selectedModule?.type === KnownContracts.ROLES_V1 && (
              <Field label="Role ID">
                <input
                  type="text"
                  value={roleId}
                  onChange={(ev) => {
                    updateConnection({ roleId: ev.target.value })
                  }}
                  placeholder="0"
                />
              </Field>
            )}
            {selectedModule?.type === KnownContracts.ROLES_V2 && (
              <Field label="Role Key">
                <input
                  type="text"
                  key={currentRouteState.id} // makes sure the defaultValue is reset when switching connections
                  defaultValue={decodedRoleKey || roleId}
                  onChange={(ev) => {
                    try {
                      const roleId = encodeRoleKey(ev.target.value)
                      setRoleIdError(null)
                      updateConnection({ roleId })
                    } catch (e) {
                      updateConnection({ roleId: '' })
                      setRoleIdError((e as Error).message)
                    }
                  }}
                  placeholder="Enter key as bytes32 hex string or in human-readable decoding"
                />

                {roleIdError && (
                  <Box p={3} className={classes.error}>
                    {roleIdError}
                  </Box>
                )}
              </Field>
            )}
          </Flex>
        </Flex>
      </div>
      <ConfirmationModal />
    </>
  )
}

const useConfirmClearTransactions = () => {
  const { hasTransactions, clearTransactions } = useClearTransactions()
  const [getConfirmation, ConfirmationModal] = useConfirmationModal()

  const confirmClearTransactions = async () => {
    if (!hasTransactions) {
      return true
    }

    const confirmation = await getConfirmation(
      'Switching the Piloted Safe will empty your current transaction bundle.'
    )

    if (!confirmation) {
      return false
    }

    clearTransactions()

    return true
  }

  return [confirmClearTransactions, ConfirmationModal] as const
}