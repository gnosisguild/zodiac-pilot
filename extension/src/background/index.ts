import { updateRpcRedirectRules } from './rpcRedirect'
import {
  activeExtensionTabs,
  startTrackingTab,
  stopTrackingTab,
} from './tabsTracking'

interface Fork {
  networkId: number
  rpcUrl: string
}

let activeFork: Fork | null = null

chrome.tabs.onRemoved.addListener(stopTrackingTab)

chrome.runtime.onMessage.addListener((message, sender) => {
  if (!sender.tab?.id) return

  if (message.type === 'startSimulating') {
    const { networkId, rpcUrl } = message
    activeFork = { networkId, rpcUrl }
    updateRpcRedirectRules(activeFork)
    console.debug(
      `start intercepting JSON RPC requests for network #${networkId}`,
      rpcUrl
    )
  }

  if (message.type === 'stopSimulating') {
    activeFork = null
    updateRpcRedirectRules(activeFork)
    console.debug(
      `stop intercepting JSON RPC requests in tab #${sender.tab.id}`
    )
  }
})

chrome.action.onClicked.addListener((tab) => {
  const tabId = tab.id
  if (!tabId) return

  if (!activeExtensionTabs.has(tabId)) {
    chrome.sidePanel.setOptions({
      tabId,
      path: 'sidepanel.html',
      enabled: true,
    })
    chrome.sidePanel.open({ tabId })
    startTrackingTab(tabId)
  } else {
    chrome.sidePanel.setOptions({
      tabId,
      enabled: false,
    })
    stopTrackingTab(tabId)
  }

  if (activeFork) {
    updateRpcRedirectRules(activeFork)
    // TODO Force tab reload if simulation is running
    // (this makes sure the app connects to the latest fork state / reconnects back to actual origin chain state)
  }
})

// TODO set status badge if a simulation is active
// chrome.action.setBadgeBackgroundColor(
//   { color: [0, 255, 0, 0] }, // Green
//   () => {
//     /* ... */
//   }
// )

export {}
