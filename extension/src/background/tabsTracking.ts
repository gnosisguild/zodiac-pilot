// Track which tabs belong to which active Pilot sessions, so we can dynamically adjust the declarativeNetRequest rule.
// This rule removes some headers so foreign pages can be loaded in iframes.

import { updateSimulatingBadge } from './updateSimulationBadge'

type StartTrackingTabOptions = { windowId: number; tabId: number }

export const startTrackingTab = ({
  windowId,
  tabId,
}: StartTrackingTabOptions) => {
  updateSimulatingBadge(windowId)

  console.log('Pilot: started tracking tab', tabId, windowId)
}

type StopTrackingTabOptions = {
  windowId: number
  tabId: number
}

export const stopTrackingTab = ({
  windowId,
  tabId,
}: StopTrackingTabOptions) => {
  console.log('stop tracking tab', tabId, windowId)

  updateSimulatingBadge(windowId)
  console.log('Pilot: stopped tracking tab', tabId, windowId)
}
