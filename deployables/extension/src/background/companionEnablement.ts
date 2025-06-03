import { getRoute, getRoutes } from '@/execution-routes'
import { COMPANION_APP_PORT } from '@/port-handling'
import { captureLastError } from '@/sentry'
import { getLastTransactionExecutedAt } from '@/transactions'
import { sendMessageToCompanionApp } from '@/utils'
import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
  createTabMessageHandler,
} from '@zodiac/messages'
import type { TrackSessionsResult } from './sessionTracking'
import type { TrackSimulationResult } from './simulationTracking'

export const companionEnablement = (
  { withPilotSession }: TrackSessionsResult,
  { onSimulationUpdate }: TrackSimulationResult,
) => {
  chrome.runtime.onMessage.addListener(
    createTabMessageHandler(
      CompanionAppMessageType.REQUEST_FORK_INFO,
      (_, { tabId, windowId }) => {
        withPilotSession(windowId, async (session) => {
          if (!session.isForked()) {
            return
          }
          const { rpcUrl, vnetId } = session.getFork()

          await sendMessageToCompanionApp(tabId, {
            type: CompanionResponseMessageType.FORK_UPDATED,
            forkUrl: rpcUrl ?? null,
            vnetId: vnetId ?? null,
          })
        })

        console.debug('Companion App connected!')

        const dispose = onSimulationUpdate.addListener(async (fork) => {
          console.debug('Sending updated fork to companion app', { fork })
          await sendMessageToCompanionApp(tabId, {
            type: CompanionResponseMessageType.FORK_UPDATED,
            forkUrl: fork?.rpcUrl ?? null,
            vnetId: fork?.vnetId ?? null,
          })

          captureLastError()
        })

        const handleTabClose = (closedTabId: number) => {
          if (tabId !== closedTabId) {
            return
          }

          chrome.tabs.onRemoved.removeListener(handleTabClose)

          dispose()
        }

        chrome.tabs.onRemoved.addListener(handleTabClose)
      },
    ),
  )

  chrome.runtime.onMessage.addListener(
    createTabMessageHandler(
      CompanionAppMessageType.REQUEST_ROUTES,
      async (_, { tabId }) => {
        const routes = await getRoutes()

        await sendMessageToCompanionApp(tabId, {
          type: CompanionResponseMessageType.LIST_ROUTES,
          routes,
        })
      },
    ),
  )

  chrome.runtime.onMessage.addListener(
    createTabMessageHandler(
      CompanionAppMessageType.REQUEST_ROUTE,
      async ({ routeId }, { tabId }) => {
        const route = await getRoute(routeId)

        await sendMessageToCompanionApp(tabId, {
          type: CompanionResponseMessageType.PROVIDE_ROUTE,
          route,
        })
      },
    ),
  )

  chrome.runtime.onConnect.addListener((port) => {
    if (port.name !== COMPANION_APP_PORT) {
      return
    }

    const handlePing = createTabMessageHandler(
      CompanionAppMessageType.PING,
      async (_, { tabId }) => {
        sendMessageToCompanionApp(tabId, {
          type: CompanionResponseMessageType.PONG,
          lastTransactionExecutedAt: await getLastTransactionExecutedAt(),
        })
      },
    )

    chrome.runtime.onMessage.addListener(handlePing)

    port.onDisconnect.addListener(async () => {
      chrome.runtime.onMessage.removeListener(handlePing)
    })
  })
}
