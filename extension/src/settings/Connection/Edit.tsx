import { KnownContracts } from '@gnosis.pm/zodiac'
import React from 'react'

import { Box, Field, Flex, Select } from '../../components'
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
        {error && (
          <>
            <div>There seems to be a problem with this connection:</div>
            <Box p={3} className={classes.error}>
              {error}
            </Box>
          </>
        )}
        <Flex direction="column" gap={3} className={classes.form}>
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
          <Field label="Impersonated Safe">
            <input
              type="text"
              value={avatarAddress}
              onChange={(ev) => {
                const avatarAddress = ev.target.value.replace(/^[a-z]{3}:/g, '')
                updateConnection({
                  avatarAddress,
                  moduleAddress: '',
                  moduleType: undefined,
                })
              }}
            />
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
