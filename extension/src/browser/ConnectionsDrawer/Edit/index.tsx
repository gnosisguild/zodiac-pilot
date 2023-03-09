import { KnownContracts } from '@gnosis.pm/zodiac'
import React, { useEffect } from 'react'
import { RiDeleteBinLine } from 'react-icons/ri'

import { Box, Button, Field, Flex, IconButton } from '../../../components'
import { useConfirmationModal } from '../../../components/ConfirmationModal'
import { useConnectionsHash, usePushConnectionsRoute } from '../../../routing'
import { useSafesWithOwner } from '../../../safe'
import { useSafeDelegates } from '../../../safe'
import AvatarInput from '../../../settings/Connection/AvatarInput'
import ConnectButton from '../../../settings/Connection/ConnectButton'
import ModSelect, {
  NO_MODULE_OPTION,
  Option,
} from '../../../settings/Connection/ModSelect'
import {
  MODULE_NAMES,
  SupportedModuleType,
  useZodiacModules,
} from '../../../settings/Connection/useZodiacModules'
import {
  useConnection,
  useConnections,
  useSelectedConnectionId,
} from '../../../settings/connectionHooks'
import useConnectionDryRun from '../../../settings/useConnectionDryRun'
import { useClearTransactions } from '../../state/transactionHooks'

import classes from './style.module.css'

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
}

const EditConnection: React.FC<Props> = ({ connectionId, onLaunched }) => {
  const [connections, setConnections] = useConnections()
  const { connection, connected, connect } = useConnection(connectionId)
  const connectionsHash = useConnectionsHash()
  const [, selectConnection] = useSelectedConnectionId()
  const pushConnectionsRoute = usePushConnectionsRoute()

  useEffect(() => {
    const exists = connections.some((c) => c.id === connectionId)

    if (!exists) {
      pushConnectionsRoute()
    }
  }, [connectionId, connections, pushConnectionsRoute])

  const { label, avatarAddress, pilotAddress, moduleAddress, roleId } =
    connection

  const { safes } = useSafesWithOwner(pilotAddress, connectionId)
  const { delegates } = useSafeDelegates(avatarAddress, connectionId)

  // TODO modules is a nested list, but we currently only render the top-level items
  const {
    loading: loadingMods,
    isValidSafe,
    modules,
  } = useZodiacModules(avatarAddress, connectionId)

  const { hasTransactions, clearTransactions } = useClearTransactions()
  const [getConfirmation, ConfirmationModal] = useConfirmationModal()

  const handleCanLaunch = async () => {
    if (!hasTransactions) {
      return true
    }

    const confirmation = await getConfirmation(
      'Switching connections will empty your current transaction bundle.'
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

  const handleUpdateConnection = (patch: ConnectionPatch) => {
    setConnections(
      connections.map((c) =>
        c.id === connection.id ? { ...connection, ...patch } : c
      )
    )
  }

  const handleRemoveConnection = () => {
    const newConnections = connections.filter((c) => c.id !== connection.id)
    setConnections(newConnections)
    pushConnectionsRoute()
  }

  const handleLaunchConnection = async () => {
    const canLaunch = await handleCanLaunch()

    if (!canLaunch) {
      return
    }

    if (connected) {
      selectConnection(connection.id)
      onLaunched()
      return
    }

    if (!connected && connect) {
      const success = await connect()
      if (success) {
        selectConnection(connection.id)
        onLaunched()
        return
      }
    }
  }

  const error = useConnectionDryRun(connection)

  const pilotIsOwner = safes.some(
    (safe) => safe.toLowerCase() === avatarAddress.toLowerCase()
  )
  const pilotIsDelegate = delegates.some(
    (delegate) => delegate.toLowerCase() === pilotAddress.toLowerCase()
  )
  const defaultModOption =
    pilotIsOwner || pilotIsDelegate ? NO_MODULE_OPTION : ''

  const canLaunch = connected || !!connect
  const canRemove = connections.length > 1

  return (
    <>
      <Flex direction="column" gap={4} className={classes.editContainer}>
        <Flex gap={2} direction="column">
          <Flex gap={1} justifyContent="space-between" alignItems="baseline">
            <Flex gap={1} direction="column" alignItems="baseline">
              <h2>{connection.label}</h2>
              <a className={classes.backLink} href={connectionsHash}>
                &#8592; All Connections
              </a>
            </Flex>
            <Flex gap={4} alignItems="center">
              <Button
                className={classes.launchButton}
                disabled={!canLaunch}
                onClick={handleLaunchConnection}
              >
                Launch
              </Button>
              <IconButton
                onClick={handleRemoveConnection}
                disabled={!canRemove}
                danger
                className={classes.removeButton}
              >
                <RiDeleteBinLine size={24} title="Remove this connection" />
              </IconButton>
            </Flex>
          </Flex>
          <hr />
        </Flex>
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
            <Field label="Connection Label">
              <input
                type="text"
                value={label}
                placeholder="Label this connection"
                onChange={(ev) => {
                  handleUpdateConnection({
                    label: ev.target.value,
                  })
                }}
              />
            </Field>
            <Field label="Pilot Account" labelFor="">
              <ConnectButton id={connectionId} />
            </Field>
            <Field label="Piloted Safe" labelFor="">
              <AvatarInput
                availableSafes={safes}
                value={avatarAddress}
                onChange={(address) =>
                  handleUpdateConnection({
                    avatarAddress: address,
                    moduleAddress: '',
                    moduleType: undefined,
                  })
                }
              />
            </Field>
            <Field label="Zodiac Mod" disabled={modules.length === 0}>
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
                onChange={(selected) => {
                  const mod = modules.find(
                    (mod) => mod.moduleAddress === (selected as Option).value
                  )
                  handleUpdateConnection({
                    moduleAddress: mod?.moduleAddress,
                    moduleType: mod?.type,
                  })
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
            {selectedModule?.type === KnownContracts.ROLES && (
              <Field label="Role ID">
                <input
                  type="text"
                  value={roleId}
                  onChange={(ev) => {
                    handleUpdateConnection({ roleId: ev.target.value })
                  }}
                  placeholder="0"
                />
              </Field>
            )}
          </Flex>
        </Flex>
      </Flex>
      <ConfirmationModal />
    </>
  )
}

export default EditConnection
