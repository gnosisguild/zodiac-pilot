import { nanoid } from 'nanoid'
import React from 'react'

import { Button } from '../../components'
import { useConnections, useSelectedConnectionId } from '../connectionHooks'

import EditConnection from './Edit'
import SelectConnection from './Select'

const Connection: React.FC<{ onLaunch(): void }> = ({ onLaunch }) => {
  const [connections, setConnections] = useConnections()
  const [selectedConnectionId, setSelectedConnectionId] =
    useSelectedConnectionId()

  const hasSelection =
    selectedConnectionId &&
    connections.some((c) => c.id === selectedConnectionId)

  return hasSelection ? (
    <EditConnection onLaunch={onLaunch} />
  ) : (
    <>
      <SelectConnection />
      <Button
        onClick={() => {
          const id = nanoid()
          setConnections([
            ...connections,
            {
              id,
              label: '',
              avatarAddress: '',
              moduleAddress: '',
              roleId: '',
            },
          ])
          setSelectedConnectionId(id)
        }}
      >
        Add connection
      </Button>
    </>
  )
}

export default Connection
