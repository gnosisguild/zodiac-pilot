import { activePilotSessions } from './activePilotSessions'

export const updateSimulatingBadge = (windowId: number) => {
  const isSimulating = !!activePilotSessions.get(windowId)?.fork
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
