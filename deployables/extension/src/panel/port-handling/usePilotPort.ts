import { captureLastError } from '@/sentry'
import { useActiveTab } from '@/utils'
import { type Message, PilotMessageType } from '@zodiac/messages'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'

// we use a port to communicate between the panel app and the background script as this allows us to track when the panel is closed
export const PILOT_PANEL_PORT = 'PILOT_PANEL_PORT'

// notify the background script that the panel has been opened
export const usePilotPort = () => {
  const activeTab = useActiveTab()
  const [port, setPort] = useState<chrome.runtime.Port | null>(null)
  const [activeWindowId, setActiveWindowId] = useState<number | null>(null)

  useEffect(() => {
    if (activeTab == null) {
      setPort(null)

      return
    }

    if (port != null) {
      return
    }

    setPort(
      connectPort({
        windowId: activeTab.windowId,
        tabId: activeTab.id,
      }),
    )

    setActiveWindowId(activeTab.windowId)
  }, [activeTab, port])

  useEffect(() => {
    if (port == null) {
      return
    }

    const handleDisconnect = () => {
      console.log('Port disconnected', format(new Date(), 'HH:mm:ss'))

      setPort(null)
    }

    port.onDisconnect.addListener(handleDisconnect)

    return () => {
      port.onDisconnect.removeListener(handleDisconnect)
    }
  }, [port])

  return { activeWindowId, portIsActive: port != null }
}

type ConnectPortOptions = {
  tabId?: number
  windowId: number
}

const connectPort = ({ tabId, windowId }: ConnectPortOptions) => {
  console.log('Attempt to open port', format(new Date(), 'HH:mm:ss'))

  const port = chrome.runtime.connect({ name: PILOT_PANEL_PORT })

  captureLastError()

  console.log('Send panel opened message', format(new Date(), 'HH:mm:ss'))

  port.postMessage({
    type: PilotMessageType.PILOT_PANEL_OPENED,
    windowId,
    tabId,
  } satisfies Message)

  const interval = setInterval(() => {
    port.postMessage({
      type: PilotMessageType.PILOT_KEEP_ALIVE,
    } satisfies Message)
  }, 5_000)

  port.onDisconnect.addListener(() => clearInterval(interval))

  captureLastError()

  return port
}
