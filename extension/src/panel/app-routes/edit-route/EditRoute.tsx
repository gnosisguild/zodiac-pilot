import {
  Box,
  Button,
  Divider,
  Field,
  Flex,
  IconButton,
  useConfirmationModal,
} from '@/components'
import { ProviderType, Route } from '@/types'
import { useRoutes, useSelectedRouteId, useZodiacRoute } from '@/zodiac-routes'
import { KnownContracts } from '@gnosis.pm/zodiac'
import { ZeroAddress } from 'ethers'
import React, { useState } from 'react'
import { RiDeleteBinLine } from 'react-icons/ri'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChainId } from 'ser-kit'
import { MODULE_NAMES } from '../../../const'
import { useSafeDelegates, useSafesWithOwner } from '../../integrations/safe'
import {
  queryRolesV1MultiSend,
  queryRolesV2MultiSend,
} from '../../integrations/zodiac/rolesMultisend'
import { SupportedModuleType } from '../../integrations/zodiac/types'
import { useZodiacModules } from '../../integrations/zodiac/useZodiacModules'
import { useClearTransactions } from '../../state/transactionHooks'
import { decodeRoleKey, encodeRoleKey } from '../../utils'
import {
  asLegacyConnection,
  fromLegacyConnection,
} from '../legacyConnectionMigrations'
import { AvatarInput } from './AvatarInput'
import { ChainSelect } from './ChainSelect'
import { ModSelect, NO_MODULE_OPTION } from './ModSelect'
import classes from './style.module.css'
import { useConnectionDryRun } from './useConnectionDryRun'
import { ConnectWallet } from './wallet'

type ConnectionPatch = {
  label?: string
  avatarAddress?: string
  moduleAddress?: string
  pilotAddress?: string
  moduleType?: SupportedModuleType
  roleId?: string
  chainId?: ChainId
  multisend?: string
  multisendCallOnly?: string
  providerType?: ProviderType
}

const ETH_ZERO_ADDRESS = 'eth:0x0000000000000000000000000000000000000000'

export const EditRoute = () => {
  const [routes, saveRoute, removeRouteById] = useRoutes()
  const { routeId } = useParams()
  if (!routeId) {
    throw new Error('Route ID is required')
  }
  const originalRoute =
    routes.find((r) => r.id === routeId) ||
    ({
      id: routeId,
      label: '',
      providerType: ProviderType.InjectedWallet,
      avatar: ETH_ZERO_ADDRESS,
      initiator: undefined,
      waypoints: undefined,
    } satisfies Route)
  const [route, setRoute] = useState(originalRoute)

  const navigate = useNavigate()

  const [, setSelectedRouteId] = useSelectedRouteId()
  const currentlySelected = useZodiacRoute()

  const connection = asLegacyConnection(route)
  const { label, avatarAddress, pilotAddress, moduleAddress, roleId } =
    connection

  const { safes } = useSafesWithOwner(pilotAddress, routeId)
  const { delegates } = useSafeDelegates(avatarAddress, routeId)

  const decodedRoleKey = roleId && decodeRoleKey(roleId)

  // TODO modules is a nested list, but we currently only render the top-level items
  const {
    loading: loadingMods,
    isValidSafe,
    modules,
  } = useZodiacModules(avatarAddress, routeId)

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

  const selectedModule = moduleAddress
    ? modules.find((mod) => mod.moduleAddress === moduleAddress)
    : undefined

  const updateConnection = (patch: ConnectionPatch) => {
    console.log('updateConnection', patch)
    setRoute((route) =>
      fromLegacyConnection({ ...asLegacyConnection(route), ...patch })
    )
  }

  const removeRoute = () => {
    removeRouteById(routeId)
    navigate('/routes')
  }

  const launchRoute = async () => {
    if (route !== originalRoute) {
      saveRoute(route)
    }

    // we continue working with the same avatar, so don't have to clear the recorded transaction
    const keepTransactionBundle =
      currentlySelected.route.avatar === route.avatar

    const confirmed =
      keepTransactionBundle || (await confirmClearTransactions())

    if (!confirmed) {
      return
    }

    setSelectedRouteId(route.id)
    navigate('/')
  }

  const error = useConnectionDryRun(asLegacyConnection(route))

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
              <h2>{route.label || 'New connection'}</h2>
              <Link className={classes.backLink} to="/routes">
                &#8592; All Connections
              </Link>
            </Flex>
            <div className="flex items-center gap-4">
              <Button
                className={classes.launchButton}
                disabled={!connection.avatarAddress}
                onClick={launchRoute}
              >
                {route !== originalRoute ? 'Save & Launch' : 'Launch'}
              </Button>
              <IconButton
                onClick={removeRoute}
                danger
                className={classes.removeButton}
              >
                <RiDeleteBinLine size={24} title="Remove this connection" />
              </IconButton>
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
                value={connection.chainId}
                onChange={(chainId) => updateConnection({ chainId })}
              />
            </Field>
            <Field label="Pilot Account" labelFor="">
              <ConnectWallet
                route={route}
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
                    address.toLowerCase() ===
                    connection.avatarAddress.toLowerCase()
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
                        connection.chainId,
                        mod.moduleAddress
                      ),
                    })
                  }
                  if (mod?.type === KnownContracts.ROLES_V2) {
                    updateConnection(
                      await queryRolesV2MultiSend(
                        connection.chainId,
                        mod.moduleAddress
                      )
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
                  onChange={async (ev) => {
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
                  key={route.id} // makes sure the defaultValue is reset when switching connections
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
