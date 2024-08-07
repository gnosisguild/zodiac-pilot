import { KnownContracts } from '@gnosis.pm/zodiac'
import React, { useEffect } from 'react'
import TrashIcon from '../../../assets/icons/trash.svg'

import { Box, Button, Field, Flex, IconButton } from '../../../components'
import { useConfirmationModal } from '../../../components/ConfirmationModal'
import { useConnectionsHash, usePushConnectionsRoute } from '../../../routing'
import { useSafesWithOwner } from '../../../integrations/safe'
import { useSafeDelegates } from '../../../integrations/safe'
import AvatarInput from '../AvatarInput'
import ConnectButton from '../ConnectButton'
import ModSelect, { NO_MODULE_OPTION, Option } from '../ModSelect'
import {
  MODULE_NAMES,
  useZodiacModules,
} from '../../../integrations/zodiac/useZodiacModules'
import { SupportedModuleType } from '../../../integrations/zodiac/types'
import { useRoute, useRoutes } from '../../routeHooks'
import useConnectionDryRun from '../../useConnectionDryRun'
import { useClearTransactions } from '../../../state/transactionHooks'

import classes from './style.module.css'
import { decodeRoleKey, encodeRoleKey } from '../../../utils'
import ChainSelect from '../ChainSelect'
import {
  queryRolesV1MultiSend,
  queryRolesV2MultiSend,
} from '../../../integrations/zodiac/rolesMultisend'
import { ChainId } from 'ser-kit'
import {
  asLegacyConnection,
  fromLegacyConnection,
} from '../../legacyConnectionMigrations'
import { ZeroAddress } from 'ethers'
import PUBLIC_PATH from '../../../publicPath'
import RouteBadgeIcon from '../../../components/RouteBadgeIcon'
import {PiPlus, PiChevronLeft, PiChevronRight, PiArrowLeft, PiArrowRight} from 'react-icons/pi'
import {RxChevronLeft, RxChevronRight} from 'react-icons/rx'
import Checkbox from '../../../components/Checkbox'
import Blockie from '../../../components/Blockie'
import classNames from 'classnames'
import { Carousel } from '../../../components/Carousel'

interface Props {
  connectionId: string
  onLaunched: () => void
}

type ConnectionPatch = {
  label?: string
  avatarAddress?: string
  moduleAddress?: string
  moduleType?: SupportedModuleType
  roleId?: string
  chainId?: ChainId
  multisend?: string
  multisendCallOnly?: string
}

const EditConnection: React.FC<Props> = ({ connectionId }) => {
  const [routes, setRoutes] = useRoutes()
  const { route } = useRoute(connectionId)
  // const [, setSelectedRouteId] = useSelectedRouteId()
  // const currentlySelected = useRoute()
  const connectionsHash = useConnectionsHash()
  const pushConnectionsRoute = usePushConnectionsRoute()

  useEffect(() => {
    const exists = routes.some((c) => c.id === connectionId)

    if (!exists) {
      pushConnectionsRoute()
    }
  }, [connectionId, routes, pushConnectionsRoute])

  const connection = asLegacyConnection(route)
  const { label, avatarAddress, pilotAddress, moduleAddress, roleId } =
    connection

  const { safes } = useSafesWithOwner(pilotAddress, connectionId)
  const { delegates } = useSafeDelegates(avatarAddress, connectionId)

  const decodedRoleKey = roleId && decodeRoleKey(roleId)

  // TODO modules is a nested list, but we currently only render the top-level items
  const {
    loading: loadingMods,
    isValidSafe,
    modules,
  } = useZodiacModules(avatarAddress, connectionId)

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
    setRoutes((routes) =>
      routes.map((r) => {
        if (r.id !== route.id) return r
        return fromLegacyConnection({ ...asLegacyConnection(r), ...patch })
      })
    )
  }

  const removeRoute = () => {
    const newRoutes = routes.filter((c) => c.id !== route.id)
    setRoutes(newRoutes)
    pushConnectionsRoute()
  }

  // TODO: uncomment this code once the launch button is added
  // const launchRoute = async () => {
  //   // we continue working with the same avatar, so don't have to clear the recorded transaction
  //   const keepTransactionBundle =
  //     currentlySelected.route.avatar === route.avatar

  //   const confirmed =
  //     keepTransactionBundle || (await confirmClearTransactions())

  //   if (!confirmed) {
  //     return
  //   }

  //   setSelectedRouteId(route.id)
  //   onLaunched()
  // }

  const error = useConnectionDryRun(asLegacyConnection(route))

  const [roleIdError, setRoleIdError] = React.useState<string | null>(null)

  const pilotIsOwner = safes.some(
    (safe) => safe.toLowerCase() === avatarAddress.toLowerCase()
  )
  const pilotIsDelegate = delegates.some(
    (delegate) => delegate.toLowerCase() === pilotAddress.toLowerCase()
  )
  const defaultModOption =
    pilotIsOwner || pilotIsDelegate ? NO_MODULE_OPTION : ''

  const canRemove = routes.length > 1

  return (
    <>
      <Flex direction="column" gap={3} className={classes.editContainer}>
        <Flex gap={4} justifyContent="space-between" alignItems="center">
          <Flex
            gap={1}
            direction="column"
            alignItems="baseline"
            style={{ width: '100%' }}
          >
            <input
              type="text"
              value={label}
              placeholder="New Route"
              onChange={(ev) => {
                updateConnection({
                  label: ev.target.value,
                })
              }}
            />
            <a className={classes.backLink} href={connectionsHash}>
              &#8592; All Routes
            </a>
          </Flex>
          <IconButton
            onClick={removeRoute}
            disabled={!canRemove}
            danger
            className={classes.removeButton}
          >
            <img src={PUBLIC_PATH + TrashIcon} alt="delete-icon" />
          </IconButton>
          {/* <Flex gap={4} alignItems="center">
              <Button
                className={classes.launchButton}
                disabled={!connection.avatarAddress}
                onClick={launchRoute}
              >
                Launch
              </Button>
              <IconButton
                onClick={removeRoute}
                disabled={!canRemove}
                danger
                className={classes.removeButton}
              >
                <RiDeleteBinLine size={24} title="Remove this connection" />
              </IconButton>
            </Flex> */}
        </Flex>
        <hr style={{ marginTop: 0 }} />
        <Flex direction="column" gap={2}>
          <Flex direction="column" gap={0} className={classes.form}>
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
            <Flex direction="column" gap={2}>
              <Flex direction="row" gap={2}>
                <RouteBadgeIcon badgeType="pilot" label="Set Pilot" />
              </Flex>
              <ConnectButton id={connectionId}>
                <ChainSelect
                  value={connection.chainId}
                  onChange={(chainId) => updateConnection({ chainId })}
                />
              </ConnectButton>
            </Flex>

            <Flex direction="row" gap={2}>
              <Box className={classes.connectionsLeft}>
                <Box className={classes.connectionsLeftArrow}/>
                <Box className={classes.connectionsLeftButton}>
                  <PiPlus size={20} />
                </Box>
              </Box>
              <Flex direction='column' gap={2} className={classes.connectionsRight}>
                {true ? (
                  <>
                    <Flex direction='row' alignItems='center' justifyContent='space-between' gap={1}>
                      <h4 style={{margin: 0}}>Select Connection Route</h4>
                      <Flex direction='row' alignItems='center' gap={4}>
                        <Flex direction='row' alignItems='center' gap={2}>
                          <div className={classNames(classes.dot, true && classes.dotSelected)}/>
                          <div className={classNames(classes.dot, false && classes.dotSelected)}/>
                          <div className={classNames(classes.dot, false && classes.dotSelected)}/>
                        </Flex>
                        <Flex direction='row' alignItems='center' gap={2}>
                          <IconButton className={classes.arrowButton} disabled>
                            <RxChevronLeft size={24} />
                          </IconButton>
                          <IconButton className={classes.arrowButton}>
                            <RxChevronRight size={24} />
                          </IconButton>
                        </Flex>
                      </Flex>
                    </Flex>
                    <Carousel>
                      {[{manual: false, selected: true}, {manual: false, selected: false}, {manual: false, selected: false}].map(({manual, selected}, i) => {
                        return (
                          <Box key={i} className={classNames(classes.connections, selected && classes.isSelected)}>
                            <Flex direction='column' gap={2}>
                                {!manual && (
                                  <Flex direction='row' justifyContent='space-between' gap={2}>
                                    <div>Option {i+1} / <span style={{opacity: 0.5}}>{3}</span></div>
                                    <Checkbox checked={selected}/>
                                  </Flex>
                                )}
                                {/* Fake Route Connection #1 */}
                                <Flex direction="column" gap={2}>
                                  <Box bg p={2}>
                                    <Flex direction='column' gap={1}>
                                      <div>Roles Modifier</div>
                                      <Flex direction='row' gap={1} alignItems='center'>
                                        <Blockie className={classes.addressBlockie} address={'0x36469af4c82852f676c57d036bd163B82e63CF69'}/>
                                        <div className={classes.addressText}>
                                          {'0x485E...F0eb'}
                                        </div>
                                      </Flex>
                                    </Flex>
                                  </Box>
                                </Flex>
                                {/* Fake Route Connection #2 */}
                                <Flex direction="column" gap={2}>
                                  <Box bg p={2}>
                                    <Flex direction='column' gap={1}>
                                      <div>Contract</div>
                                      <Flex direction='row' gap={1} alignItems='center'>
                                        <Blockie className={classes.addressBlockie} address={'0x31ABEc2D5727FCf21eA55B6aD773e273180c65CD'}/>
                                        <div className={classes.addressText}>
                                          {'0x485E...F0eb'}
                                        </div>
                                      </Flex>
                                    </Flex>
                                  </Box>
                                </Flex>
                              </Flex>
                          </Box>
                        )
                      })}
                    </Carousel>
                    <Flex direction='row' gap={1} alignItems='center' justifyContent='space-between' style={{marginTop: 8}}>
                      <div style={{fontSize: 14}}>Can't find what you're looking for?</div>
                      <Flex direction='row' gap={1} alignItems='center' className={classes.manualLink}>
                        Create route manually
                        <PiArrowRight size={14} style={{marginLeft: 2}} />
                      </Flex>
                    </Flex>
                  </>
                ) : (
                  <>
                    <h4>Configure connections</h4>
                    <Box className={classes.connections}>
                      {true ? (
                        <Flex direction='column' gap={2}>
                          {/* Fake Route Connection #1 */}
                          <Flex direction="column" gap={2}>
                            <Box bg p={2}>
                              <Flex direction='column' gap={1}>
                                <div>Roles Modifier</div>
                                <Flex direction='row' gap={1} alignItems='center'>
                                  <Blockie className={classes.addressBlockie} address={'0x36469af4c82852f676c57d036bd163B82e63CF69'}/>
                                  <div className={classes.addressText}>
                                    {'0x485E...F0eb'}
                                  </div>
                                </Flex>
                              </Flex>
                            </Box>
                          </Flex>
                          {/* Fake Route Connection #2 */}
                          <Flex direction="column" gap={2}>
                            <Box bg p={2}>
                              <Flex direction='column' gap={1}>
                                <div>Contract</div>
                                <Flex direction='row' gap={1} alignItems='center'>
                                  <Blockie className={classes.addressBlockie} address={'0x31ABEc2D5727FCf21eA55B6aD773e273180c65CD'}/>
                                  <div className={classes.addressText}>
                                    {'0x485E...F0eb'}
                                  </div>
                                </Flex>
                              </Flex>
                            </Box>
                          </Flex>
                          <Button secondary>
                            Add Connection
                            <PiPlus style={{marginLeft: 8}}/>
                          </Button>
                        </Flex>
                      ) : (
                        <Flex direction='column' gap={2} alignItems='center'>
                          <p style={{width: "100%", textAlign: "center"}}>No route options available</p>
                          <Button secondary style={{maxWidth: 500}}>
                            Add Connection
                            <PiPlus style={{marginLeft: 8}}/>
                          </Button>
                        </Flex>
                      )}
                      {/* <Field label="Zodiac Mod" disabled={modules.length === 0}>
                        <ModSelect
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
                            const mod = modules.find(
                              (mod) => mod.moduleAddress === (selected as Option).value
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
                      )} */}
                    </Box>
                  </>
                )}
              </Flex>
            </Flex>

            <Flex direction="column" gap={2}>
              <Flex direction="column" gap={2}>
                <RouteBadgeIcon badgeType="target" label="Set Target Safe" />
                <Field>
                  <AvatarInput
                    availableSafes={safes}
                    value={
                      avatarAddress === ZeroAddress ? '' : avatarAddress || ''
                    }
                    onChange={async (address) => {
                      const keepTransactionBundle =
                        address.toLowerCase() ===
                        connection.avatarAddress.toLowerCase()
                      const confirmed =
                        keepTransactionBundle ||
                        (await confirmClearTransactions())

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
              </Flex>
            </Flex>

            <hr style={{ marginTop: 16, marginBottom: 16 }} />
            <Flex direction="row" gap={2}>
              <Button secondary>
                <PiArrowLeft style={{marginRight: 8}}/>
                Back
              </Button>
              <Button>
                Create Route
                <PiArrowRight style={{marginLeft: 8}}/>
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <ConfirmationModal />
    </>
  )
}

export default EditConnection
