type UpdateSimulationBadgeOptions = {
  windowId: number
  text: string
}

export const updateBadge = ({
  windowId,
  text,
}: UpdateSimulationBadgeOptions) => {
  chrome.tabs.query({ windowId }, (tabs) => {
    for (const tab of tabs) {
      chrome.action.setBadgeText({
        text,
        tabId: tab.id,
      })
    }
  })
}
