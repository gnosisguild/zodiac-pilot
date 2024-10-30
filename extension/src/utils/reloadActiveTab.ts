import { reloadTab } from './reloadTab'

export const reloadActiveTab = (windowId: number) => {
  chrome.tabs.query({ windowId, active: true }, (tabs) => {
    const [activeTab] = tabs

    if (activeTab == null) {
      return
    }

    if (activeTab.id != null) {
      reloadTab(activeTab.id)
    }
  })
}
