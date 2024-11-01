import { Message, PILOT_PANEL_PORT, PilotMessageType } from '@/pilot-messages'
import { chromeMock } from './chromeMock'
import { createMockPort } from './createMockPort'

type StartSessionOptions = {
  windowId: number
  tabId?: number
}

type AnotherSessionStartOptions = {
  tabId: number
}

export const startPilotSession = ({ windowId, tabId }: StartSessionOptions) => {
  const port = createMockPort({ name: PILOT_PANEL_PORT })

  chromeMock.runtime.onConnect.callListeners(port)

  port.onMessage.callListeners(
    {
      type: PilotMessageType.PILOT_PANEL_OPENED,
      windowId,
      tabId,
    } satisfies Message,
    port
  )

  return {
    stopPilotSession: () => {
      port.onDisconnect.callListeners(port)
    },
    startAnotherSession: ({ tabId }: AnotherSessionStartOptions) => {
      port.onMessage.callListeners(
        {
          type: PilotMessageType.PILOT_PANEL_OPENED,
          windowId,
          tabId,
        } satisfies Message,
        port
      )
    },
  }
}
