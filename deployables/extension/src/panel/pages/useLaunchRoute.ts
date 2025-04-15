import { getLastUsedRouteId, getRoute } from '@/execution-routes'
import { useTransactions } from '@/state'
import { invariant } from '@epic-web/invariant'
import { CompanionAppMessageType, useTabMessageHandler } from '@zodiac/messages'
import { useStableHandler } from '@zodiac/ui'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'

type OnLaunchOptions = {
  onLaunch?: (routeId: string, tabId?: number) => void
}

export const useLaunchRoute = ({ onLaunch }: OnLaunchOptions = {}) => {
  const navigate = useNavigate()
  const [pendingRouteId, setPendingRouteId] = useState<string | null>(null)
  const transactions = useTransactions()
  const onLaunchRef = useStableHandler(onLaunch)

  const launchRoute = useCallback(
    async (routeId: string, tabId?: number) => {
      const activeRouteId = await getLastUsedRouteId()

      if (activeRouteId == null || activeRouteId !== routeId) {
        if (onLaunchRef.current) {
          onLaunchRef.current(routeId, tabId)
        }

        navigate(`/${routeId}`)
        return
      }

      const activeRoute = await getRoute(activeRouteId)
      const newRoute = await getRoute(routeId)
      if (transactions.length > 0 && activeRoute.avatar !== newRoute.avatar) {
        setPendingRouteId(routeId)
        return
      }

      if (onLaunchRef.current) {
        onLaunchRef.current(routeId, tabId)
      }

      navigate(`/${activeRouteId}/clear-transactions/${routeId}`)
    },
    [onLaunchRef, transactions.length, navigate],
  )

  const cancelLaunch = useCallback(() => setPendingRouteId(null), [])

  const proceedWithLaunch = useCallback(async () => {
    const activeRouteId = await getLastUsedRouteId()
    invariant(pendingRouteId != null, 'No route launch was pending')
    if (onLaunchRef.current) {
      onLaunchRef.current(pendingRouteId)
    }

    navigate(`/${activeRouteId}/clear-transactions/${pendingRouteId}`)
    setPendingRouteId(null)
  }, [navigate, onLaunchRef, pendingRouteId])

  return [
    launchRoute,
    {
      isLaunchPending: pendingRouteId != null,
      cancelLaunch,
      proceedWithLaunch,
    },
  ] as const
}

export const useLaunchRouteOnMessage = (launchOptions: OnLaunchOptions) => {
  const [launchRoute, options] = useLaunchRoute(launchOptions)

  useTabMessageHandler(
    CompanionAppMessageType.LAUNCH_ROUTE,
    async ({ routeId }) => launchRoute(routeId),
  )

  return options
}
