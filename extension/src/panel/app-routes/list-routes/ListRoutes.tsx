import {
  Box,
  BoxButton,
  Button,
  ConnectionStack,
  Divider,
  Flex,
  useConfirmationModal,
} from '@/components'
import { Route } from '@/types'
import { useRoutes, useSelectedRouteId, useZodiacRoute } from '@/zodiac-routes'
import { formatDistanceToNow } from 'date-fns'
import { nanoid } from 'nanoid'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useClearTransactions } from '../../state/transactionHooks'
import { asLegacyConnection } from '../legacyConnectionMigrations'
import { ConnectedIcon } from './ConnectedIcon'
import { DisconnectedIcon } from './DisconnectedIcon'
import classes from './style.module.css'

interface RouteItemProps {
  route: Route
  onLaunch: (routeId: string) => void
  onModify: (routeId: string) => void
}

const RouteItem: React.FC<RouteItemProps> = ({ onLaunch, onModify, route }) => {
  const { connected, connect, chainId } = useZodiacRoute(route.id)
  const { route: currentlySelectedRoute } = useZodiacRoute()
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
      <div className="relative">
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
                  {connected ? (
                    <ConnectedIcon>Pilot wallet is connected</ConnectedIcon>
                  ) : connect ? (
                    <ConnectedIcon color="orange">
                      Pilot wallet is connected to a different chain
                    </ConnectedIcon>
                  ) : (
                    <DisconnectedIcon>
                      Pilot wallet is not connected
                    </DisconnectedIcon>
                  )}
                </Box>
                <h2>
                  {route.label || <em>Unnamed route</em>}

                  <div className="flex items-end gap-2 text-sm font-normal">
                    <div className="text-xs uppercase text-zodiac-light-mustard">
                      Last Used
                    </div>
                    <div className="font-mono opacity-70">
                      {route.lastUsed ? (
                        `${formatDistanceToNow(route.lastUsed)} ago`
                      ) : (
                        <>N/A</>
                      )}
                    </div>
                  </div>
                </h2>
              </Flex>
            </Flex>

            <ConnectionStack
              chainId={chainId}
              connection={asLegacyConnection(route)}
              addressBoxClass={classes.addressBox}
              className={classes.connectionStack}
            />
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

export const ListRoutes = () => {
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
    <div className="flex flex-1 flex-col gap-4 px-6 py-8">
      <Flex gap={2} direction="column">
        <Flex gap={1} justifyContent="space-between" alignItems="baseline">
          <h2>Pilot Routes</h2>
          <Button onClick={handleCreate} className={classes.addConnection}>
            Add Route
          </Button>
        </Flex>
      </Flex>

      <Divider />

      {routes.map((route) => (
        <RouteItem
          key={route.id}
          route={route}
          onLaunch={handleLaunch}
          onModify={handleModify}
        />
      ))}
    </div>
  )
}
