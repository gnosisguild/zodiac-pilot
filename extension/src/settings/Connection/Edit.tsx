import React from 'react'

import { Box, Field, Flex, Select } from '../../components'
import { useConnection, useConnections } from '../connectionHooks'
import useConnectionDryRun from '../useConnectionDryRun'

import ConnectButton from './ConnectButton'
import classes from './style.module.css'
import { useSafeModuleInfo } from './useSafeModuleInfo'

type ConnectionPatch = {
  label?: string
  avatarAddress?: string
  moduleAddress?: string
  roleId?: string
}

interface Props {
  id: string
}

const EditConnection: React.FC<Props> = ({ id }) => {
  const [connections, setConnections] = useConnections()
  const { connection } = useConnection(id)

  const { label, avatarAddress, moduleAddress, roleId } = connection
  const { loading, isValidSafe, enabledModules } = useSafeModuleInfo(
    avatarAddress,
    id
  )

  const validatedModuleAddress =
    moduleAddress && enabledModules.includes(moduleAddress) ? moduleAddress : ''

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
                })
              }}
            />
          </Field>
          <Field label="Zodiac Modifier or Module address">
            <Select
              options={enabledModules.map((address) => ({
                value: address,
                label: address,
              }))}
              onChange={(selected) => {
                updateConnection({
                  moduleAddress: (selected as { value: string; label: string })
                    .value,
                })
              }}
              value={
                validatedModuleAddress
                  ? {
                      value: validatedModuleAddress,
                      label: validatedModuleAddress,
                    }
                  : ''
              }
              isDisabled={loading || !isValidSafe}
              placeholder={loading || !isValidSafe ? '' : 'Select a module'}
              noOptionsMessage={() => 'No modules are enabled on this Safe'}
            />
          </Field>
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
        </Flex>
      </Flex>
    </Flex>
  )
}

export default EditConnection
