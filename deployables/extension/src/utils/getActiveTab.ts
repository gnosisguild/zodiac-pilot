import { invariant } from '@epic-web/invariant'
import { useEffect, useState } from 'react'

export const getActiveTab = async () => {
  const [activeTab] = await chrome.tabs.query({
    currentWindow: true,
    active: true,
  })

  invariant(activeTab != null, 'Could not get active tab in current window.')

  return activeTab
}

export const useActiveTab = () => {
  const [activeTab, setActiveTab] = useState<chrome.tabs.Tab | null>(null)

  useEffect(() => {
    getActiveTab().then(setActiveTab)
  }, [])

  useEffect(() => {
    const handleActivate = () => getActiveTab().then(setActiveTab)

    chrome.tabs.onActivated.addListener(handleActivate)

    return () => {
      chrome.tabs.onActivated.removeListener(handleActivate)
    }
  }, [])

  useEffect(() => {
    if (activeTab == null) {
      return
    }

    const handleUpdate = (tabId: number) => {
      if (tabId !== activeTab.id) {
        return
      }

      getActiveTab().then(setActiveTab)
    }

    chrome.tabs.onUpdated.addListener(handleUpdate)

    return () => {
      chrome.tabs.onUpdated.removeListener(handleUpdate)
    }
  }, [activeTab])

  return activeTab
}
