import { type Message, PilotMessageType } from '@/messages'
import { isValidTab, useActiveTab } from '@/utils'
import { useEffect, useState } from 'react'
import { PILOT_PANEL_PORT } from '../const'

// notify the background script that the panel has been opened
export const usePilotPort = () => {
  const activeTab = useActiveTab()
  const [portIsActive, setPortIsActive] = useState(false)
  const [activeWindowId, setActiveWindowId] = useState<number | null>(null)

  useEffect(() => {
    if (portIsActive) {
      return
    }

    if (activeTab == null) {
      return
    }

    if (!isValidTab(activeTab.url)) {
      return
    }

    if (activeTab.status !== 'complete') {
      return
    }

    connectPort({ windowId: activeTab.windowId, tabId: activeTab.id })

    setActiveWindowId(activeTab.windowId)
    setPortIsActive(true)
  }, [activeTab, portIsActive])

  return { activeWindowId, portIsActive }
}

type ConnectPortOptions = {
  tabId?: number
  windowId: number
}

const connectPort = ({ tabId, windowId }: ConnectPortOptions) => {
  const port = chrome.runtime.connect({ name: PILOT_PANEL_PORT })

  port.postMessage({
    type: PilotMessageType.PILOT_PANEL_OPENED,
    windowId,
    tabId,
  } satisfies Message)
}
