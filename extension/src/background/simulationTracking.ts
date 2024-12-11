import { PilotSimulationMessageType, type SimulationMessage } from '@/messages'
import type { TrackSessionsResult } from './sessionTracking'
import { updateBadge } from './updateBadge'

export const trackSimulations = ({
  withPilotSession,
  getPilotSession,
  onDeleted,
}: TrackSessionsResult) => {
  // track when a Pilot session is started for a window and when the simulation is started/stopped
  chrome.runtime.onMessage.addListener(
    async (message: SimulationMessage, sender) => {
      // ignore messages that don't come from the extension itself
      if (sender.id !== chrome.runtime.id) {
        return
      }

      switch (message.type) {
        case PilotSimulationMessageType.SIMULATE_START: {
          const { chainId, rpcUrl } = message
          const session = getPilotSession(message.windowId)
          const fork = await session.createFork({ chainId, rpcUrl })

          console.debug(
            `start intercepting JSON RPC requests in window #${message.windowId}`,
            fork,
          )

          // TODO use a different icon while simulating to make this more beautiful
          updateBadge({
            windowId: message.windowId,
            text: '🟢',
          })

          break
        }

        case PilotSimulationMessageType.SIMULATE_UPDATE: {
          withPilotSession(message.windowId, (session) => {
            console.debug('Updating current session', message.rpcUrl)

            session.updateFork(message.rpcUrl)
          })

          break
        }

        case PilotSimulationMessageType.SIMULATE_STOP: {
          withPilotSession(message.windowId, async (session) => {
            if (!session.isForked()) {
              return
            }

            await session.clearFork()

            console.debug(
              `stop intercepting JSON RPC requests in window #${message.windowId}`,
            )

            updateBadge({
              windowId: message.windowId,
              text: '',
            })
          })

          break
        }
      }
    },
  )

  onDeleted.addListener((windowId) => updateBadge({ windowId, text: '' }))
}
