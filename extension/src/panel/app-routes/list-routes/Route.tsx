import { getChainId } from '@/chains'
import { Box, BoxButton, BoxLink, ConnectionStack, Flex } from '@/components'
import { ZodiacRoute } from '@/types'
import { useRouteConnect, useZodiacRoute } from '@/zodiac-routes'
import { formatDistanceToNow } from 'date-fns'
import { asLegacyConnection } from '../legacyConnectionMigrations'
import { useConfirmClearTransactions } from '../useConfirmClearTransaction'
import { ConnectedIcon } from './ConnectedIcon'
import { DisconnectedIcon } from './DisconnectedIcon'

interface RouteProps {
  route: ZodiacRoute
  onLaunch: (routeId: string) => void
  onModify: (routeId: string) => void
}

export const Route = ({ onLaunch, onModify, route }: RouteProps) => {
  const chainId = getChainId(route.avatar)
  const [connected, connect] = useRouteConnect(route)
  const currentlySelectedRoute = useZodiacRoute()

  const [confirmClearTransactions, ConfirmationModal] =
    useConfirmClearTransactions()

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

    onModify(route.id)
  }

  return (
    <>
      <div className="relative">
        <BoxButton
          className="w-full border-white border-opacity-30 bg-zodiac-very-dark-blue bg-opacity-70 p-4 hover:border-zodiac-light-mustard hover:border-opacity-50"
          onClick={handleLaunch}
        >
          <Flex direction="column" gap={4}>
            <div className="flex items-center justify-between gap-2 overflow-hidden">
              <Flex direction="row" alignItems="center" gap={3}>
                <Box className="relative m-1 flex items-center justify-center rounded-full border-[4px] border-double bg-black bg-opacity-30">
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
                <h2 className="overflow-hidden text-ellipsis whitespace-nowrap text-left text-2xl">
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

              <BoxLink
                to={`/routes/${route.id}`}
                className="bg-none px-4 py-1 before:content-none"
                onClick={(event) => event.stopPropagation()}
              >
                Modify
              </BoxLink>
            </div>

            <div className="my-6 flex justify-center">
              <ConnectionStack
                chainId={chainId}
                connection={asLegacyConnection(route)}
              />
            </div>
          </Flex>
        </BoxButton>
      </div>
      <ConfirmationModal />
    </>
  )
}
