import { captureLastError } from '@/sentry'
import { isValidTab, useActiveTab } from '@/utils'
import { useEffect, useState } from 'react'

export const COMPANION_APP_PORT = 'COMPANION_APP_PORT'

export const useCompanionAppPort = () => {
  const activeTab = useActiveTab()
  const [port, setPort] = useState<chrome.runtime.Port | null>(null)

  useEffect(() => {
    if (activeTab == null) {
      setPort(null)

      return
    }

    if (!isValidTab(activeTab.url, { protocolOnly: true })) {
      setPort(null)

      return
    }

    if (activeTab.status !== 'complete') {
      // do not reset the port here because
      // a tab might go into the loading state
      // multiple times during its lifecycle.
      // This, however, does not mean that our
      // port has disconnected and needs to be reset.
      return
    }

    if (port != null) {
      return
    }

    setPort(connectPort())
  }, [activeTab, port])

  useEffect(() => {
    if (port == null) {
      return
    }

    const handleDisconnect = () => {
      setPort(null)
    }

    port.onDisconnect.addListener(handleDisconnect)

    return () => {
      port.onDisconnect.removeListener(handleDisconnect)
    }
  }, [port])
}

const connectPort = () => {
  const port = chrome.runtime.connect({ name: COMPANION_APP_PORT })

  captureLastError()

  return port
}
