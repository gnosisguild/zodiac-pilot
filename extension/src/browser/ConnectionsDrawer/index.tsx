import React from 'react'

import { Box, IconButton } from '../../components'
import ConnectionsIcon from '../../components/ConnectionBubble/ConnectionsIcon'
import OverlayDrawer from '../../components/OverlayDrawer'

import EditConnection from './Edit'
import ConnectionsList from './List'
import classes from './style.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  editConnectionId?: string
}

const CloseDrawerButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
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

const ConnectionsDrawer: React.FC<Props> = ({
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
          <EditConnection id={editConnectionId} />
        ) : (
          <ConnectionsList onClose={onClose} />
        )}
      </div>
    </OverlayDrawer>
  )
}

export default ConnectionsDrawer
