import { KnownContracts } from '@gnosis.pm/zodiac'
import React from 'react'

import { Box, Field, Flex } from '../../components'
import { useSafesWithOwner } from '../../safe'
import { useSafeDelegates } from '../../safe'
import { useConnection, useConnections } from '../connectionHooks'
import useConnectionDryRun from '../useConnectionDryRun'

import AvatarInput from './AvatarInput'
import ConnectButton from './ConnectButton'
import ModSelect, { NO_MODULE_OPTION, Option } from './ModSelect'
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

  const { label, avatarAddress, pilotAddress, moduleAddress, roleId } =
    connection

  const { safes } = useSafesWithOwner(pilotAddress, id)
  const { delegates } = useSafeDelegates(avatarAddress, id)

  // TODO modules is a nested list, but we currently only render the top-level items
  const {
    loading: loadingMods,
    isValidSafe,
    modules,
  } = useZodiacModules(avatarAddress, id)

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

  const pilotIsOwner = safes.some(
    (safe) => safe.toLowerCase() === avatarAddress.toLowerCase()
  )
  const pilotIsDelegate = delegates.some(
    (delegate) => delegate.toLowerCase() === pilotAddress.toLowerCase()
  )
  const defaultModOption =
    pilotIsOwner || pilotIsDelegate ? NO_MODULE_OPTION : ''

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
          <Field label="Connection Label">
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
          <Field label="Piloted Safe" labelFor="">
            <AvatarInput
              availableSafes={safes}
              value={avatarAddress}
              onChange={(address) =>
                updateConnection({
                  avatarAddress: address,
                  moduleAddress: '',
                  moduleType: undefined,
                })
              }
            />
          </Field>
          <Field label="Pilot Method" disabled={modules.length === 0}>
            <ModSelect
              options={[
                ...(pilotIsOwner || pilotIsDelegate ? [NO_MODULE_OPTION] : []),
                ...modules.map((mod) => ({
                  value: mod.moduleAddress,
                  label: `${MODULE_NAMES[mod.type]} Mod`,
                })),
              ]}
              onChange={(selected) => {
                const mod = modules.find(
                  (mod) => mod.moduleAddress === (selected as Option).value
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
                  : defaultModOption
              }
              isDisabled={loadingMods || !isValidSafe}
              placeholder={loadingMods || !isValidSafe ? '' : 'Select a module'}
              avatarAddress={avatarAddress}
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
