import React from 'react'

import { Button, Field, Flex, Select } from '../../components'
import { useConnection, useConnections } from '../connectionHooks'

import ConnectButton from './ConnectButton'
import { useSafeModuleInfo } from './useSafeModuleInfo'

type ConnectionPatch = {
  label?: string
  avatarAddress?: string
  moduleAddress?: string
  roleId?: string
}

const EditConnection: React.FC = () => {
  const [connections, setConnections] = useConnections()
  const { connection } = useConnection()

  const { avatarAddress, moduleAddress, roleId } = connection
  const { loading, isValidSafe, enabledModules } =
    useSafeModuleInfo(avatarAddress)

  const validatedModuleAddress =
    moduleAddress && enabledModules.includes(moduleAddress) ? moduleAddress : ''

  const updateConnection = (patch: ConnectionPatch) => {
    setConnections(
      connections.map((c) =>
        c.id === connection.id ? { ...connection, ...patch } : c
      )
    )
  }
  const removeConnection = () => {
    const newConnections = connections.filter((c) => c.id !== connection.id)
    setConnections(newConnections)
  }

  return (
    <Flex direction="column" gap={3}>
      <Field>
        <ConnectButton />
      </Field>
      <Field label="DAO Safe">
        <input
          type="text"
          value={avatarAddress}
          onChange={(ev) => {
            updateConnection({
              avatarAddress: ev.target.value,
              moduleAddress: '',
            })
          }}
        />
      </Field>
      <Field label="Zodiac Modifier or Module Address">
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
      <Button onClick={removeConnection} disabled={connections.length === 1}>
        Remove
      </Button>
    </Flex>
  )
}

export default EditConnection
