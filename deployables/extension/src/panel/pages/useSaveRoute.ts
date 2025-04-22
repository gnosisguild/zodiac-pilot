import { getActiveRoute } from '@/accounts'
import { getRoute, saveRoute } from '@/execution-routes'
import { useTransactions } from '@/state'
import { invariant } from '@epic-web/invariant'
import { CompanionAppMessageType, useTabMessageHandler } from '@zodiac/messages'
import type { ExecutionRoute } from '@zodiac/schema'
import { useStableHandler } from '@zodiac/ui'
import { useCallback, useState } from 'react'
import { useRevalidator } from 'react-router'
import { useActivateAccount } from './useActivateAccount'

type UseSaveOptions = {
  onSave?: (route: ExecutionRoute, tabId: number) => void
}

export const useSaveRoute = (
  lastUsedRouteId: string | null,
  { onSave }: UseSaveOptions = {},
) => {
  const transactions = useTransactions()
  const { revalidate } = useRevalidator()
  const [routeUpdate, setPendingRouteUpdate] = useState<{
    incomingRoute: ExecutionRoute
    tabId: number
  } | null>(null)
  const [launchRoute, launchOptions] = useActivateAccount({
    onActivate: async (accountId, tabId) => {
      if (onSaveRef.current) {
        invariant(tabId != null, `tabId was not provided to launchRoute`)

        onSaveRef.current(await getActiveRoute(accountId), tabId)
      }
    },
  })

  const onSaveRef = useStableHandler(onSave)

  useTabMessageHandler(
    [
      CompanionAppMessageType.SAVE_ROUTE,
      CompanionAppMessageType.SAVE_AND_LAUNCH,
    ],
    async (message, { tabId }) => {
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
          setPendingRouteUpdate({ incomingRoute, tabId })

          return
        }
      }

      saveRoute(incomingRoute).then(() => {
        revalidate()

        if (message.type === CompanionAppMessageType.SAVE_AND_LAUNCH) {
          launchRoute(incomingRoute.id, tabId)
        } else {
          if (onSaveRef.current) {
            onSaveRef.current(incomingRoute, tabId)
          }
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

    const { incomingRoute, tabId } = routeUpdate

    await saveRoute(incomingRoute)

    if (onSaveRef.current) {
      onSaveRef.current(incomingRoute, tabId)
    }

    setPendingRouteUpdate(null)

    return incomingRoute
  }, [onSaveRef, routeUpdate])

  return [
    {
      isUpdatePending: routeUpdate != null,
      cancelUpdate,
      saveUpdate,
    },
    launchOptions,
  ] as const
}
