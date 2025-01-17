import { getLastUsedRouteId, getRoute, saveRoute } from '@/execution-routes'
import { useTransactions } from '@/state'
import { invariant } from '@epic-web/invariant'
import {
  CompanionAppMessageType,
  type CompanionAppMessage,
} from '@zodiac/messages'
import type { ExecutionRoute } from '@zodiac/schema'
import { useEffect, useState } from 'react'
import { Outlet, useLoaderData, useNavigate } from 'react-router'
import { FutureClearTransactionsModal } from './ClearTransactionsModal'

export const loader = async () => {
  const lastUsedRouteId = await getLastUsedRouteId()

  return { lastUsedRouteId }
}

export const Root = () => {
  const { lastUsedRouteId } = useLoaderData<typeof loader>()

  const [pendingRouteUpdate, setPendingRouteUpdate] =
    useState<ExecutionRoute | null>(null)

  const transactions = useTransactions()
  const navigate = useNavigate()

  useEffect(() => {
    const handleSaveRoute = async (message: CompanionAppMessage) => {
      if (
        typeof message !== 'object' ||
        message == null ||
        !('type' in message)
      ) {
        return
      }

      if (message.type !== CompanionAppMessageType.SAVE_ROUTE) {
        return
      }

      const incomingRoute = message.data

      if (
        lastUsedRouteId == null ||
        lastUsedRouteId !== incomingRoute.id ||
        transactions.length === 0
      ) {
        saveRoute(incomingRoute)
      } else {
        const currentRoute = await getRoute(lastUsedRouteId)

        if (
          currentRoute.avatar.toLowerCase() !==
          incomingRoute.avatar.toLowerCase()
        ) {
          setPendingRouteUpdate(incomingRoute)
        }
      }
    }

    chrome.runtime.onMessage.addListener(handleSaveRoute)

    return () => {
      chrome.runtime.onMessage.removeListener(handleSaveRoute)
    }
  }, [lastUsedRouteId, transactions.length])

  return (
    <>
      <Outlet />

      <FutureClearTransactionsModal
        open={pendingRouteUpdate != null}
        onCancel={() => setPendingRouteUpdate(null)}
        onAccept={() => {
          invariant(
            pendingRouteUpdate != null,
            'Tried to save a route when no save was pending',
          )

          saveRoute(pendingRouteUpdate).then(() => {
            setPendingRouteUpdate(null)

            navigate(
              `/${pendingRouteUpdate.id}/clear-transactions/${pendingRouteUpdate.id}`,
            )
          })
        }}
      />
    </>
  )
}
