import React from 'react'

import { Box, IconButton } from '../../components'
import ConnectionsIcon from '../../components/ConnectionBubble/ConnectionsIcon'
import OverlayDrawer from '../../components/OverlayDrawer'

import EditConnection from './Edit'
import RoutesList from './List'
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
        <Box className={classes.toggleBackground}>
          <Box className={classes.toggle}>
            <ConnectionsIcon width="100%" height="100%" />
          </Box>
        </Box>
      </div>
    </IconButton>
  </div>
)

const RoutesDrawer: React.FC<ConnectionsDrawerProps> = ({
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
          <RoutesList onLaunched={onClose} />
        )}
      </div>
    </OverlayDrawer>
  )
}

export default RoutesDrawer
