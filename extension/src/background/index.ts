import { PILOT_PANEL_OPENED } from '../messages'
import { updateRpcRedirectRules } from './rpcRedirect'
import { activePilotSessions } from './tabsTracking'
import { Fork } from './types'

chrome.runtime.onMessage.addListener((message, sender) => {
  // ignore messages that don't come from the extension itself
  if (sender.id === chrome.runtime.id) return

  console.debug('received message:', message)

  if (message.type === PILOT_PANEL_OPENED) {
    activePilotSessions.set(message.windowId, {
      fork: null,
      tabs: new Set([message.tabId]),
    })
    return true
  }

  // if (message.type === 'startSimulating') {
  //   const { networkId, rpcUrl } = message
  //   activeFork = { networkId, rpcUrl }
  //   updateRpcRedirectRules(activeFork)
  //   console.debug(
  //     `start intercepting JSON RPC requests for network #${networkId}`,
  //     rpcUrl
  //   )
  // }

  // if (message.type === 'stopSimulating') {
  //   activeFork = null
  //   updateRpcRedirectRules(activeFork)
  //   console.debug(
  //     `stop intercepting JSON RPC requests in tab #${sender.tab.id}`
  //   )
  // }
})

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error))

// TODO set status badge if a simulation is active
// chrome.action.setBadgeBackgroundColor(
//   { color: [0, 255, 0, 0] }, // Green
//   () => {
//     /* ... */
//   }
// )

export {}
