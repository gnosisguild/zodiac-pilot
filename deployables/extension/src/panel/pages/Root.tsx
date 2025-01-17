import { saveRoute } from '@/execution-routes'
import {
  CompanionAppMessageType,
  type CompanionAppMessage,
} from '@zodiac/messages'
import { useEffect } from 'react'
import { Outlet } from 'react-router'

export const loader = () => null

export const Root = () => {
  useEffect(() => {
    const handleSaveRoute = (message: CompanionAppMessage) => {
      if (
        typeof message !== 'object' ||
        message == null ||
        !('type' in message)
      ) {
        return
      }

      if (message.type !== CompanionAppMessageType.SAVE_ROUTE) {
        return
      }

      saveRoute(message.data)
    }

    chrome.runtime.onMessage.addListener(handleSaveRoute)

    return () => {
      chrome.runtime.onMessage.removeListener(handleSaveRoute)
    }
  }, [])

  return <Outlet />
}
