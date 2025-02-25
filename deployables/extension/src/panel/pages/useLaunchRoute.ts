import { getLastUsedRouteId, getRoute } from '@/execution-routes'
import { useTransactions } from '@/state'
import {
  CompanionAppMessageType,
  type CompanionAppMessage,
} from '@zodiac/messages'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

export const useLaunchRoute = () => {
  const navigate = useNavigate()
  const [pendingRouteId, setPendingRouteId] = useState<string | null>(null)
  const transactions = useTransactions()

  useEffect(() => {
    const handleLaunch = async (
      message: CompanionAppMessage,
      { id, tab }: chrome.runtime.MessageSender,
    ) => {
      if (id !== chrome.runtime.id) {
        return
      }

      if (tab == null || tab.id == null) {
        return
      }

      if (message.type !== CompanionAppMessageType.LAUNCH_ROUTE) {
        return
      }

      const activeRouteId = await getLastUsedRouteId()

      if (activeRouteId != null) {
        const activeRoute = await getRoute(activeRouteId)
        const newRoute = await getRoute(message.routeId)

        if (transactions.length > 0 && activeRoute.avatar !== newRoute.avatar) {
          setPendingRouteId(message.routeId)

          return
        }
      }

      navigate(`/${message.routeId}`)
    }

    chrome.runtime.onMessage.addListener(handleLaunch)

    return () => {
      chrome.runtime.onMessage.removeListener(handleLaunch)
    }
  }, [navigate, transactions.length])

  const cancelLaunch = useCallback(() => setPendingRouteId(null), [])

  const proceedWithLaunch = useCallback(async () => {
    const activeRouteId = await getLastUsedRouteId()

    setPendingRouteId(null)

    navigate(`/${activeRouteId}/clear-transactions/${pendingRouteId}`)
  }, [navigate, pendingRouteId])

  return {
    isLaunchPending: pendingRouteId != null,
    cancelLaunch,
    proceedWithLaunch,
  }
}
