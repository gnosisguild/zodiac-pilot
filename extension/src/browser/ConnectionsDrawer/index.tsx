import { nanoid } from 'nanoid'
import React from 'react'

import { Box, Button, Flex, IconButton } from '../../components'
import ConnectionsIcon from '../../components/ConnectionBubble/ConnectionsIcon'
import OverlayDrawer from '../../components/OverlayDrawer'
import { usePushSettingsRoute } from '../../routing'
import {
  useConnections,
  useSelectedConnectionId,
} from '../../settings/connectionHooks'
import { ProviderType } from '../../types'

import ConnectionsList from './ConnectionsList'
import classes from './style.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const CloseDrawerButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div className={classes.toggleContainer}>
    <IconButton onClick={onClick}>
      <div>
        <Box rounded>
          <Box rounded className={classes.toggle}>
            <ConnectionsIcon />
          </Box>
        </Box>
      </div>
    </IconButton>
  </div>
)

const ConnectionsDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const [, selectConnection] = useSelectedConnectionId()
  const [connections, setConnections] = useConnections()
  const pushSettingsRoute = usePushSettingsRoute()

  const handleLaunch = (connectionId: string) => {
    selectConnection(connectionId)
    onClose()
  }
  const handleModify = (connectionId: string) => {
    pushSettingsRoute(connectionId)
  }

  const handleAddConnection = () => {
    const id = nanoid()
    setConnections([
      ...connections,
      {
        id,
        label: '',
        chainId: 1,
        moduleAddress: '',
        avatarAddress: '',
        pilotAddress: '',
        providerType: ProviderType.WalletConnect,
        moduleType: undefined,
        roleId: '',
      },
    ])
    pushSettingsRoute(id)
  }

  return (
    <OverlayDrawer
      isOpen={isOpen}
      onClose={onClose}
      position="right"
      className={classes.drawer}
    >
      <CloseDrawerButton onClick={onClose} />
      <Flex gap={1} justifyContent="space-between" alignItems="center">
        <Box borderless>
          <h2>Pilot Connections</h2>
        </Box>
        <Box borderless>
          <Button onClick={handleAddConnection}>Add Connection</Button>
        </Box>
      </Flex>
      <hr />
      <Box borderless className={classes.connectionsList}>
        <ConnectionsList onLaunch={handleLaunch} onModify={handleModify} />
      </Box>
    </OverlayDrawer>
  )
}

export default ConnectionsDrawer
