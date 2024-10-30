import { Message, SIMULATE_START, SIMULATE_STOP } from '../messages'
import { getForkedSessions, getPilotSession } from './activePilotSessions'
import { enableRPCDebugLogging, updateRpcRedirectRules } from './rpcRedirect'
import { updateSimulatingBadge } from './updateSimulationBadge'

export const trackSimulations = () => {
  enableRPCDebugLogging()

  // track when a Pilot session is started for a window and when the simulation is started/stopped
  chrome.runtime.onMessage.addListener((message: Message, sender) => {
    // ignore messages that don't come from the extension itself
    if (sender.id !== chrome.runtime.id) {
      return
    }

    switch (message.type) {
      case SIMULATE_START: {
        const { networkId, rpcUrl } = message
        const session = getPilotSession(message.windowId)
        const fork = session.createFork({ networkId, rpcUrl })

        updateRpcRedirectRules(getForkedSessions())
        console.debug(
          `start intercepting JSON RPC requests in window #${message.windowId}`,
          fork
        )
        updateSimulatingBadge(message.windowId)

        break
      }

      case SIMULATE_STOP: {
        const session = getPilotSession(message.windowId)

        session.clearFork()

        updateRpcRedirectRules(getForkedSessions())

        console.debug(
          `stop intercepting JSON RPC requests in window #${message.windowId}`
        )
        updateSimulatingBadge(message.windowId)

        break
      }
    }
  })
}
