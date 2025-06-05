import {
  createInternalMessageHandler,
  PilotSimulationMessageType,
} from '@zodiac/messages'
import type { Event } from '../events'
import { createEventListener } from '../events'
import type { TrackSessionsResult } from '../sessionTracking'
import type { Fork } from '../types'
import { updateBadge } from './updateBadge'

type SimulationUpdateEventListener = (fork: Fork | null) => void

export type TrackSimulationResult = {
  onSimulationUpdate: Event<SimulationUpdateEventListener>
}

export const trackSimulations = ({
  withPilotSession,
  getPilotSession,
  onDeleted,
}: TrackSessionsResult): TrackSimulationResult => {
  const onSimulationUpdate =
    createEventListener<SimulationUpdateEventListener>()

  chrome.runtime.onMessage.addListener(
    createInternalMessageHandler(
      PilotSimulationMessageType.SIMULATE_START,
      async ({ chainId, rpcUrl, windowId, vnetId }) => {
        const session = getPilotSession(windowId)
        const fork = await session.createFork({ chainId, rpcUrl, vnetId })

        console.debug(
          `start intercepting JSON RPC requests in window #${windowId}`,
          fork,
        )

        // TODO use a different icon while simulating to make this more beautiful
        updateBadge({
          windowId,
          text: '🟢',
        })

        onSimulationUpdate.callListeners(fork)
      },
    ),
  )

  chrome.runtime.onMessage.addListener(
    createInternalMessageHandler(
      PilotSimulationMessageType.SIMULATE_UPDATE,
      ({ windowId, rpcUrl, vnetId }) => {
        withPilotSession(windowId, async (session) => {
          console.debug('Updating current session', rpcUrl)

          const fork = await session.updateFork({ rpcUrl, vnetId })
          onSimulationUpdate.callListeners(fork)
        })
      },
    ),
  )

  chrome.runtime.onMessage.addListener(
    createInternalMessageHandler(
      PilotSimulationMessageType.SIMULATE_STOP,
      ({ windowId }) => {
        withPilotSession(windowId, async (session) => {
          if (!session.isForked()) {
            return
          }

          await session.clearFork()

          console.debug(
            `stop intercepting JSON RPC requests in window #${windowId}`,
          )

          updateBadge({
            windowId,
            text: '',
          })
        })

        onSimulationUpdate.callListeners(null)
      },
    ),
  )

  onDeleted.addListener((windowId) => updateBadge({ windowId, text: '' }))

  return { onSimulationUpdate: onSimulationUpdate.toEvent() }
}
