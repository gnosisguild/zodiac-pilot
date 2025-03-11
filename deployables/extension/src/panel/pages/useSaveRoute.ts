import { getRoute, saveRoute } from '@/execution-routes'
import { useTransactions } from '@/state'
import { invariant } from '@epic-web/invariant'
import { CompanionAppMessageType, useTabMessageHandler } from '@zodiac/messages'
import type { ExecutionRoute } from '@zodiac/schema'
import { useCallback, useState } from 'react'
import { useRevalidator } from 'react-router'
import { useLaunchRoute } from './useLaunchRoute'

export const useSaveRoute = (lastUsedRouteId: string | null) => {
  const transactions = useTransactions()
  const { revalidate } = useRevalidator()
  const [routeUpdate, setPendingRouteUpdate] = useState<ExecutionRoute | null>(
    null,
  )
  const [launchRoute, launchOptions] = useLaunchRoute()

  useTabMessageHandler(
    [
      CompanionAppMessageType.SAVE_ROUTE,
      CompanionAppMessageType.SAVE_AND_LAUNCH,
    ],
    async (message) => {
      const incomingRoute = message.data

      if (
        lastUsedRouteId != null &&
        lastUsedRouteId === incomingRoute.id &&
        transactions.length > 0
      ) {
        const currentRoute = await getRoute(lastUsedRouteId)

        if (
          currentRoute.avatar.toLowerCase() !==
          incomingRoute.avatar.toLowerCase()
        ) {
          setPendingRouteUpdate(incomingRoute)

          return
        }
      }

      saveRoute(incomingRoute).then(() => {
        revalidate()

        if (message.type === CompanionAppMessageType.SAVE_AND_LAUNCH) {
          launchRoute(incomingRoute.id)
        }
      })
    },
  )

  const cancelUpdate = useCallback(() => setPendingRouteUpdate(null), [])

  const saveUpdate = useCallback(async () => {
    invariant(
      routeUpdate != null,
      'Tried to save a route when no save was pending',
    )

    await saveRoute(routeUpdate)

    setPendingRouteUpdate(null)

    return routeUpdate
  }, [routeUpdate])

  return [
    {
      isUpdatePending: routeUpdate != null,
      cancelUpdate,
      saveUpdate,
    },
    launchOptions,
  ] as const
}
