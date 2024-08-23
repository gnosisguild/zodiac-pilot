import {
  Message,
  PILOT_PANEL_OPENED,
  SIMULATE_START,
  SIMULATE_STOP,
} from '../messages'
import { updateRpcRedirectRules } from './rpcRedirect'
import { PilotSession } from './types'

/** maps `windowId` to pilot session */
export const activePilotSessions = new Map<number, PilotSession>()

// track when a Pilot session is started for a window and when the simulation is started/stopped
chrome.runtime.onMessage.addListener((message: Message, sender) => {
  // ignore messages that don't come from the extension itself
  if (sender.id === chrome.runtime.id) return

  console.debug('received message:', message)

  if (message.type === PILOT_PANEL_OPENED) {
    activePilotSessions.set(message.windowId, {
      fork: null,
      tabs: new Set([message.tabId]),
    })
  }

  if (message.type === SIMULATE_START) {
    const { networkId, rpcUrl } = message
    const session = activePilotSessions.get(message.windowId)
    if (!session) {
      throw new Error(`Pilot session not found for window #${message.windowId}`)
    }
    session.fork = { networkId, rpcUrl }
    updateRpcRedirectRules(activePilotSessions)
    console.debug(
      `start intercepting JSON RPC requests in window #${message.windowId}`,
      session.fork
    )

    // TODO set status badge if a simulation is active
    // chrome.action.setBadgeBackgroundColor(
    //   { color: [0, 255, 0, 0] }, // Green
    //   () => {
    //     /* ... */
    //   }
    // )
  }

  if (message.type === SIMULATE_STOP) {
    const session = activePilotSessions.get(message.windowId)
    if (!session) {
      throw new Error(`Pilot session not found for window #${message.windowId}`)
    }
    session.fork = null
    updateRpcRedirectRules(activePilotSessions)
    console.debug(
      `stop intercepting JSON RPC requests in window #${message.windowId}`
    )
  }
})
