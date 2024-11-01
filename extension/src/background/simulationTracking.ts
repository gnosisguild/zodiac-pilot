import { Message, PilotSimulationMessageType } from '@/pilot-messages'
import { getPilotSession } from './activePilotSessions'
import { enableRPCDebugLogging } from './rpcRedirect'

export const trackSimulations = () => {
  enableRPCDebugLogging()

  // track when a Pilot session is started for a window and when the simulation is started/stopped
  chrome.runtime.onMessage.addListener((message: Message, sender) => {
    // ignore messages that don't come from the extension itself
    if (sender.id !== chrome.runtime.id) {
      return
    }

    switch (message.type) {
      case PilotSimulationMessageType.SIMULATE_START: {
        const { networkId, rpcUrl } = message
        const session = getPilotSession(message.windowId)
        const fork = session.createFork({ networkId, rpcUrl })

        console.debug(
          `start intercepting JSON RPC requests in window #${message.windowId}`,
          fork
        )
        updateSimulatingBadge({
          windowId: message.windowId,
          isSimulating: true,
        })

        break
      }

      case PilotSimulationMessageType.SIMULATE_STOP: {
        const session = getPilotSession(message.windowId)

        session.clearFork()

        console.debug(
          `stop intercepting JSON RPC requests in window #${message.windowId}`
        )
        updateSimulatingBadge({
          windowId: message.windowId,
          isSimulating: false,
        })

        break
      }
    }
  })
}

type UpdateSimulationBadgeOptions = {
  windowId: number
  isSimulating: boolean
}

export const updateSimulatingBadge = ({
  windowId,
  isSimulating,
}: UpdateSimulationBadgeOptions) => {
  chrome.tabs.query({ windowId }, (tabs) => {
    for (const tab of tabs) {
      // TODO use a different icon while simulating to make this more beautiful
      chrome.action.setBadgeText({
        text: isSimulating ? '🟢' : '',
        tabId: tab.id,
      })
    }
  })
}
