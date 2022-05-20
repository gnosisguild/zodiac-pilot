import { nanoid } from 'nanoid'
import React from 'react'

import { Button } from '../../components'
import { usePushSettingsRoute } from '../../routing'
import { useConnections } from '../connectionHooks'

import EditConnection from './Edit'
import SelectConnection from './Select'

interface Props {
  editConnectionId?: string
  onLaunch(connectionId: string): void
}

const Connection: React.FC<Props> = ({ editConnectionId, onLaunch }) => {
  const [connections, setConnections] = useConnections()
  const pushSettingsRoute = usePushSettingsRoute()

  return editConnectionId &&
    connections.some((c) => c.id === editConnectionId) ? (
    <EditConnection id={editConnectionId} onLaunch={onLaunch} />
  ) : (
    <>
      <SelectConnection onLaunch={onLaunch} />
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
          pushSettingsRoute(id)
        }}
      >
        Add connection
      </Button>
    </>
  )
}

export default Connection
