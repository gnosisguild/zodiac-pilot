import { invariant } from '@epic-web/invariant'

export const getActiveTab = async () => {
  const [activeTab] = await chrome.tabs.query({
    currentWindow: true,
    active: true,
  })

  invariant(activeTab != null, 'Could not get active tab in current window.')

  return activeTab
}
