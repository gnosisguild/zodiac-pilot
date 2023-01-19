import React from 'react'

import { Box, Flex } from '../../components'
import OverlayDrawer from '../../components/OverlayDrawer'
import SelectConnection from '../../settings/Connection/Select'
import { useSelectedConnectionId } from '../../settings/connectionHooks'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const ConnectionsDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const [, selectConnection] = useSelectedConnectionId()

  const handleLaunch = (connectionId: string) => {
    selectConnection(connectionId)
  }

  return (
    <OverlayDrawer isOpen={isOpen} onClose={onClose} position="right">
      <SelectConnection onLaunch={handleLaunch} />
    </OverlayDrawer>
  )
}

export default ConnectionsDrawer
