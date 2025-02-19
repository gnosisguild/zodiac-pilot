import { getRoute, saveRoute } from '@/execution-routes'
import { useTransactions } from '@/state'
import { invariant } from '@epic-web/invariant'
import {
  CompanionAppMessageType,
  type CompanionAppMessage,
} from '@zodiac/messages'
import type { ExecutionRoute } from '@zodiac/schema'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useRevalidator } from 'react-router'

export const useSaveRoute = (lastUsedRouteId: string | null) => {
  const transactions = useTransactions()
  const { revalidate } = useRevalidator()
  const navigate = useNavigate()
  const [routeUpdate, setPendingRouteUpdate] = useState<ExecutionRoute | null>(
    null,
  )

  useEffect(() => {
    const handleSaveRoute = async (message: CompanionAppMessage) => {
      if (
        typeof message !== 'object' ||
        message == null ||
        !('type' in message)
      ) {
        return
      }

      if (
        message.type !== CompanionAppMessageType.SAVE_ROUTE &&
        message.type !== CompanionAppMessageType.SAVE_AND_LAUNCH
      ) {
        return
      }

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
          navigate(`/${incomingRoute.id}`)
        }
      })
    }

    chrome.runtime.onMessage.addListener(handleSaveRoute)

    return () => {
      chrome.runtime.onMessage.removeListener(handleSaveRoute)
    }
  }, [lastUsedRouteId, navigate, revalidate, transactions.length])

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

  return {
    isUpdatePending: routeUpdate != null,
    cancelUpdate,
    saveUpdate,
  }
}
