import { KnownContracts } from '@gnosis.pm/zodiac'
import React from 'react'
import { RiAlertLine } from 'react-icons/ri'

import { Box, Button, Field, Flex, IconButton, Select } from '../../components'
import Blockie from '../../components/Blockie'
import ModSelect from '../../components/Select/ModSelect'
import { useConnection, useConnections } from '../connectionHooks'
import useConnectionDryRun from '../useConnectionDryRun'

import ConnectButton from './ConnectButton'
import classes from './style.module.css'
import {
  MODULE_NAMES,
  SupportedModuleType,
  useZodiacModules,
} from './useZodiacModules'

type ConnectionPatch = {
  label?: string
  avatarAddress?: string
  moduleAddress?: string
  moduleType?: SupportedModuleType
  roleId?: string
}

interface Props {
  id: string
}

const EditConnection: React.FC<Props> = ({ id }) => {
  const [connections, setConnections] = useConnections()
  const { connection } = useConnection(id)

  const { label, avatarAddress, moduleAddress, roleId } = connection

  // TODO modules is a nested list, but we currently only render the top-level items
  const { loading, isValidSafe, modules } = useZodiacModules(avatarAddress, id)

  const selectedModule = moduleAddress
    ? modules.find((mod) => mod.moduleAddress === moduleAddress)
    : undefined

  const updateConnection = (patch: ConnectionPatch) => {
    setConnections(
      connections.map((c) =>
        c.id === connection.id ? { ...connection, ...patch } : c
      )
    )
  }

  const error = useConnectionDryRun(connection)

  return (
    <Flex direction="column" gap={3}>
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
          <Field label="Connection name">
            <input
              type="text"
              value={label}
              placeholder="Label this connection"
              onChange={(ev) => {
                updateConnection({
                  label: ev.target.value,
                })
              }}
            />
          </Field>
          <Field label="Pilot Account" labelFor="">
            <ConnectButton id={id} />
          </Field>
          <Field label="Impersonated Safe" labelFor="">
            {connection.avatarAddress.length > 0 ? (
              <div className={classes.avatarContainer}>
                <div className={classes.avatar}>
                  <Box rounded>
                    <Blockie
                      address={connection.avatarAddress}
                      className={classes.avatarBlockie}
                    />
                  </Box>
                  <div className={classes.avatarAddress}>
                    {connection.avatarAddress}
                  </div>
                </div>
                <Button
                  className={classes.removeButton}
                  onClick={() => {
                    updateConnection({
                      avatarAddress: '',
                      moduleAddress: '',
                      moduleType: undefined,
                    })
                  }}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <input
                type="text"
                value={avatarAddress}
                placeholder="Paste in Safe address"
                onChange={(ev) => {
                  const avatarAddress = ev.target.value.replace(
                    /^[a-z]{3}:/g,
                    ''
                  )
                  updateConnection({
                    avatarAddress,
                    moduleAddress: '',
                    moduleType: undefined,
                  })
                }}
              />
            )}
          </Field>
          <Field
            label="Zodiac Modifier or Module address"
            disabled={modules.length === 0}
          >
            <ModSelect
              options={modules.map((mod) => ({
                value: mod.moduleAddress,
                label: MODULE_NAMES[mod.type],
              }))}
              onChange={(selected) => {
                const mod = modules.find(
                  (mod) =>
                    mod.moduleAddress ===
                    (selected as { value: string; label: string }).value
                )
                updateConnection({
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
                  : ''
              }
              isDisabled={loading || !isValidSafe}
              placeholder={loading || !isValidSafe ? '' : 'Select a module'}
            />
          </Field>
          {selectedModule?.type === KnownContracts.ROLES && (
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
        </Flex>
      </Flex>
    </Flex>
  )
}

export default EditConnection
