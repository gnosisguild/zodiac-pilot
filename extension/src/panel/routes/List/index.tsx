import { nanoid } from 'nanoid'
import React from 'react'
import Moment from 'react-moment'

import {
  Box,
  BoxButton,
  Button,
  ConnectionStack,
  Flex,
} from '../../../components'
import { useConfirmationModal } from '../../../components/ConfirmationModal'
import { ConnectedIcon, DisconnectedIcon } from '../ConnectIcon'
import { useRoute, useRoutes, useSelectedRouteId } from '../routeHooks'
import { Route } from '../../../types'
import { useClearTransactions } from '../../state/transactionHooks'

import classes from './style.module.css'
import { asLegacyConnection } from '../legacyConnectionMigrations'
import { useNavigate } from 'react-router-dom'

interface RouteItemProps {
  route: Route
  onLaunch: (routeId: string) => void
  onModify: (routeId: string) => void
}

const RouteItem: React.FC<RouteItemProps> = ({ onLaunch, onModify, route }) => {
  const { connected, connect } = useRoute(route.id)
  const { route: currentlySelectedRoute } = useRoute()
  const [getConfirmation, ConfirmationModal] = useConfirmationModal()
  const { hasTransactions, clearTransactions } = useClearTransactions()

  const confirmClearTransactions = async () => {
    if (!hasTransactions) {
      return true
    }

    const confirmation = await getConfirmation(
      'Switching the Piloted Safe will empty your current transaction bundle.'
    )

    if (!confirmation) {
      return false
    }

    clearTransactions()

    return true
  }

  const handleModify = () => onModify(route.id)

  const handleLaunch = async () => {
    // we continue working with the same avatar, so don't have to clear the recorded transaction
    const keepTransactionBundle =
      currentlySelectedRoute && currentlySelectedRoute.avatar === route.avatar

    const confirmed =
      keepTransactionBundle || (await confirmClearTransactions())

    if (!confirmed) {
      return
    }

    if (connected) {
      onLaunch(route.id)
      return
    }

    if (!connected && connect) {
      const success = await connect()
      if (success) {
        onLaunch(route.id)
        return
      }
    }

    handleModify()
  }

  return (
    <>
      <div className={classes.connection}>
        <BoxButton
          className={classes.connectionItemContainer}
          onClick={handleLaunch}
        >
          <Flex direction="column" gap={4}>
            <Flex
              direction="row"
              gap={2}
              justifyContent="space-between"
              className={classes.labelContainer}
            >
              <Flex direction="row" alignItems="center" gap={3}>
                <Box className={classes.connectionIcon}>
                  {connected && (
                    <ConnectedIcon
                      role="status"
                      size={24}
                      color="green"
                      title="Pilot wallet is connected"
                    />
                  )}
                  {!connected && !connect && (
                    <DisconnectedIcon
                      role="status"
                      size={24}
                      color="crimson"
                      title="Pilot wallet is not connected"
                    />
                  )}
                  {!connected && connect && (
                    <ConnectedIcon
                      role="status"
                      size={24}
                      color="orange"
                      title="Pilot wallet is connected to a different chain"
                    />
                  )}
                </Box>
                <h2>
                  {route.label || (
                    <>
                      <em>Unnamed route</em>
                    </>
                  )}
                </h2>
              </Flex>
            </Flex>
            <Flex
              direction="row"
              gap={4}
              alignItems="baseline"
              className={classes.infoContainer}
            >
              <ConnectionStack
                connection={asLegacyConnection(route)}
                addressBoxClass={classes.addressBox}
                className={classes.connectionStack}
              />
              <Flex
                direction="column"
                alignItems="start"
                gap={2}
                className={classes.info}
              >
                <div className={classes.infoDatum}>
                  {route.lastUsed ? (
                    <Moment unix fromNow>
                      {route.lastUsed}
                    </Moment>
                  ) : (
                    <>N/A</>
                  )}
                </div>
                <div className={classes.infoLabel}>Last Used</div>
              </Flex>
            </Flex>
          </Flex>
        </BoxButton>
        <BoxButton onClick={handleModify} className={classes.modifyButton}>
          Modify
        </BoxButton>
      </div>
      <ConfirmationModal />
    </>
  )
}

const RoutesList: React.FC = () => {
  const [, selectRoute] = useSelectedRouteId()
  const [routes] = useRoutes()
  const navigate = useNavigate()

  const handleLaunch = (routeId: string) => {
    selectRoute(routeId)
    navigate('/')
  }
  const handleModify = (routeId: string) => {
    navigate('/routes/' + routeId)
  }

  const handleCreate = () => {
    const newRouteId = nanoid()
    navigate('/routes/' + newRouteId)
  }

  return (
    <Flex gap={4} direction="column">
      <Flex gap={2} direction="column">
        <Flex gap={1} justifyContent="space-between" alignItems="baseline">
          <h2>Pilot Routes</h2>
          <Button onClick={handleCreate} className={classes.addConnection}>
            Add Route
          </Button>
        </Flex>
        <hr />
      </Flex>
      {routes.map((route) => (
        <RouteItem
          key={route.id}
          route={route}
          onLaunch={handleLaunch}
          onModify={handleModify}
        />
      ))}
    </Flex>
  )
}

export default RoutesList
