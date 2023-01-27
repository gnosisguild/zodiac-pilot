import React from 'react'

import { Box, IconButton } from '../../components'
import ConnectionsIcon from '../../components/ConnectionBubble/ConnectionsIcon'
import OverlayDrawer from '../../components/OverlayDrawer'

import EditConnection from './Edit'
import ConnectionsList from './List'
import classes from './style.module.css'

interface ConnectionsDrawerProps {
  isOpen: boolean
  onClose: () => void
  editConnectionId?: string
}

interface CloseDrawerButtonProps {
  onClick: () => void
}

const CloseDrawerButton: React.FC<CloseDrawerButtonProps> = ({ onClick }) => (
  <div className={classes.toggleContainer}>
    <IconButton onClick={onClick}>
      <div>
        <Box rounded className={classes.toggleBackground}>
          <Box rounded className={classes.toggle}>
            <ConnectionsIcon width="auto" height="100%" />
          </Box>
        </Box>
      </div>
    </IconButton>
  </div>
)

const ConnectionsDrawer: React.FC<ConnectionsDrawerProps> = ({
  editConnectionId,
  isOpen,
  onClose,
}) => {
  return (
    <OverlayDrawer
      isOpen={isOpen}
      onClose={onClose}
      position="right"
      className={classes.drawer}
    >
      <CloseDrawerButton onClick={onClose} />
      <div className={classes.drawerContent}>
        {editConnectionId ? (
          <EditConnection
            connectionId={editConnectionId}
            onLaunched={onClose}
          />
        ) : (
          <ConnectionsList onLaunched={onClose} />
        )}
      </div>
    </OverlayDrawer>
  )
}

export default ConnectionsDrawer
