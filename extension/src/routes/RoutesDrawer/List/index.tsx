import { nanoid } from 'nanoid'
import React, { MouseEvent as ReactMouseEvent } from 'react'
import Moment from 'react-moment'

import {
  BlockLink,
  Box,
  BoxButton,
  ConnectionStack,
  Flex,
} from '../../../components'
import { useConfirmationModal } from '../../../components/ConfirmationModal'
import { usePushConnectionsRoute } from '../../../routing'
import { EditIcon, RouteIcon } from '../ConnectIcon'
import { useRoute, useRoutes, useSelectedRouteId } from '../../routeHooks'
import { ProviderType, Route } from '../../../types'
import { useClearTransactions } from '../../../state/transactionHooks'

import classes from './style.module.css'
import { asLegacyConnection } from '../../legacyConnectionMigrations'
import NetworkIcon from '../../../components/NetworkIcon'

interface RoutesListProps {
  onLaunched: () => void
}

interface RouteItemProps {
  route: Route
  onLaunch: (routeId: string) => void
  onModify: (routeId: string) => void
}

const RouteItem: React.FC<RouteItemProps> = ({ onLaunch, onModify, route }) => {
  const { connected, connect, chainId } = useRoute(route.id)
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

  const handleModify = () => {
    onModify(route.id)
  }

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

  const onEditIconClick = (
    event: ReactMouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation()
    handleModify()
  }

  return (
    <>
      <div className={classes.connection}>
        <BoxButton
          className={classes.connectionItemContainer}
          onClick={handleLaunch}
        >
          <Flex direction="column" gap={2}>
            <Flex
              direction="row"
              gap={2}
              alignItems="center"
              justifyContent="space-between"
              className={classes.labelContainer}
            >
              <Flex
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                style={{ width: '100%' }}
                gap={0}
              >
                <Flex
                  alignItems="center"
                  justifyContent="space-between"
                  gap={3}
                >
                  <Box className={classes.connectionIcon}>
                    <RouteIcon size={16} color="white" title="Pilot Route" />
                  </Box>
                  {chainId && <NetworkIcon size={24} chainId={chainId} />}
                  <h2>
                    {route.label || (
                      <>
                        <em>Unnamed route</em>
                      </>
                    )}
                  </h2>
                </Flex>

                <Flex alignItems="start" gap={3}>
                  <Flex
                    direction="column"
                    alignItems="start"
                    gap={2}
                    className={classes.info}
                  >
                    <div className={classes.infoLabel}>Last Used</div>
                    <div className={classes.infoDatum}>
                      {route.lastUsed ? (
                        <Moment unix fromNow>
                          {route.lastUsed}
                        </Moment>
                      ) : (
                        <>N/A</>
                      )}
                    </div>
                  </Flex>
                  <Box className={classes.editIcon} onClick={onEditIconClick}>
                    <EditIcon size={24} color="#B4B08F" />
                  </Box>
                </Flex>
              </Flex>
            </Flex>
            <hr />
            <Flex direction="row" gap={4} alignItems="baseline">
              <ConnectionStack
                connection={asLegacyConnection(route)}
                addressBoxClass={classes.addressBox}
                className={classes.connectionStack}
              />
            </Flex>
          </Flex>
        </BoxButton>
      </div>
      <ConfirmationModal />
    </>
  )
}

const ETH_ZERO_ADDRESS = 'eth:0x0000000000000000000000000000000000000000'

const RoutesList: React.FC<RoutesListProps> = ({ onLaunched }) => {
  const [, selectRoute] = useSelectedRouteId()
  const [routes, setRoutes] = useRoutes()
  const pushConnectionsRoute = usePushConnectionsRoute()

  const handleLaunch = (connectionId: string) => {
    selectRoute(connectionId)
    onLaunched()
  }
  const handleModify = (connectionId: string) => {
    pushConnectionsRoute(connectionId)
  }

  const handleCreate = () => {
    const id = nanoid()
    setRoutes([
      ...routes,
      {
        id,
        label: '',
        providerType: ProviderType.MetaMask,
        avatar: ETH_ZERO_ADDRESS,
        initiator: undefined,
        waypoints: undefined,
      },
    ])
    pushConnectionsRoute(id)
  }

  return (
    <Flex gap={1} direction="column">
      <Flex gap={1} direction="column">
        <Flex gap={1} justifyContent="space-between" alignItems="baseline">
          <h2>Choose a route:</h2>
          <BlockLink className={classes.addConnection} onClick={handleCreate}>
            Create route manually
          </BlockLink>
        </Flex>
      </Flex>
      <Flex gap={3} direction="column" className={classes.routeContainer}>
        {routes.map((route) => (
          <RouteItem
            key={route.id}
            route={route}
            onLaunch={handleLaunch}
            onModify={handleModify}
          />
        ))}
      </Flex>
    </Flex>
  )
}

export default RoutesList
