// Track which tabs belong to which active Pilot sessions, so we can dynamically adjust the declarativeNetRequest rule.
// This rule removes some headers so foreign pages can be loaded in iframes.

import { Message, PILOT_CONNECT, PILOT_DISCONNECT } from '../messages'
import { updateSimulatingBadge } from './updateSimulationBadge'

export const startTrackingTab = (tabId: number, windowId: number) => {
  updateSimulatingBadge(windowId)

  console.log('Pilot: started tracking tab', tabId, windowId)
  chrome.tabs.sendMessage(tabId, { type: PILOT_CONNECT } satisfies Message)
}

export const stopTrackingTab = (
  tabId: number,
  windowId: number,
  closed?: boolean
) => {
  console.log('stop tracking tab', tabId, windowId)

  updateSimulatingBadge(windowId)
  console.log('Pilot: stopped tracking tab', tabId, windowId)

  // important to check if closed to avoid errors from sending messages to closed tabs
  if (!closed) {
    chrome.tabs.sendMessage(tabId, { type: PILOT_DISCONNECT })
  }
}
