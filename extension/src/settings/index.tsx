import { nanoid } from 'nanoid'
import React from 'react'
import { RiDeleteBinLine } from 'react-icons/ri'

import { Box, Button, Flex, IconButton } from '../components'
import Layout from '../components/Layout'
import { usePushConnectionsRoute } from '../routing'
import { ProviderType } from '../types'

import EditConnection from './Connection/Edit'
import SelectConnection from './Connection/Select'
import {
  ProvideConnections,
  useConnection,
  useConnections,
  useSelectedConnectionId,
} from './connectionHooks'
import classes from './style.module.css'

export { useConnection, ProvideConnections }

type Props = {
  url: string
  onLaunch(url: string): void
  editConnectionId?: string
}

const Settings: React.FC<Props> = ({
  url,
  onLaunch,
  editConnectionId = '',
}) => {
  const [connections, setConnections] = useConnections()
  const pushConnectionsRoute = usePushConnectionsRoute()
  const [, selectConnection] = useSelectedConnectionId()
  const { connection, connected, connect } = useConnection(editConnectionId)

  const handleLaunch = (connectionId: string) => {
    selectConnection(connectionId)
    onLaunch(url)
  }

  const removeConnection = () => {
    const newConnections = connections.filter((c) => c.id !== connection.id)
    setConnections(newConnections)
  }

  const canLaunch = connected || !!connect

  return connections.some((c) => c.id === editConnectionId) ? (
    <Layout
      navBox={
        <Flex gap={1} className={classes.navStack}>
          <Box p={2} className={classes.navLabel}>
            Settings
          </Box>
          <Box p={2} className={classes.navLabel}>
            {connection.label || 'New connection'}
          </Box>
        </Flex>
      }
      headerRight={
        <Flex gap={3} justifyContent="right">
          <Button
            className={classes.headerButton}
            disabled={!canLaunch}
            onClick={async () => {
              if (!connected && connect) {
                const success = await connect()
                if (!success) {
                  return
                }
              }

              handleLaunch(editConnectionId)
            }}
          >
            Launch
          </Button>
          <IconButton
            onClick={removeConnection}
            disabled={connections.length === 1}
            danger
            className={classes.removeButton}
          >
            <RiDeleteBinLine size={24} title="Remove this connection" />
          </IconButton>
        </Flex>
      }
    >
      <Box p={2} className={classes.body}>
        <div className={classes.edit}>
          <Flex direction="column" gap={3}>
            <EditConnection id={editConnectionId} />
          </Flex>
        </div>
      </Box>
    </Layout>
  ) : (
    <Layout
      navBox={
        <Box p={2} className={classes.navLabel}>
          Connections
        </Box>
      }
      headerRight={
        <Button
          className={classes.headerButton}
          onClick={() => {
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
            pushConnectionsRoute(id)
          }}
        >
          Add Connection
        </Button>
      }
    >
      <Box p={2} className={classes.body}>
        <Flex direction="column" gap={3}>
          <SelectConnection onLaunch={handleLaunch} />
        </Flex>
      </Box>
    </Layout>
  )
}

export default Settings
