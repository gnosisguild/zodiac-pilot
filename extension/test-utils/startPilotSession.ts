import { Message, PilotMessageType } from '@/messages'
import { invariant } from '@epic-web/invariant'
import { PILOT_PANEL_PORT } from '../src/const'
import { callListeners, chromeMock } from './chrome'
import { createMockPort, createMockTab, MockTab } from './creators'

type StartSessionOptions = {
  windowId: number
  tabId?: number
}

type AnotherSessionStartOptions = {
  tabId: number
}

const trackedTabs = new Map<number, MockTab>()

export const startPilotSession = async ({
  windowId,
  tabId,
}: StartSessionOptions) => {
  chromeMock.tabs.get.mockImplementation((tabId) => {
    const tab = trackedTabs.get(tabId)

    invariant(
      tab != null,
      `Tab with id "${tabId}" not tracked in this test case`
    )

    return Promise.resolve(tab)
  })

  if (tabId != null) {
    trackedTabs.set(tabId, createMockTab({ id: tabId }))
  }

  const port = createMockPort({ name: PILOT_PANEL_PORT })

  await callListeners(chromeMock.runtime.onConnect, port)

  await callListeners(
    port.onMessage,
    {
      type: PilotMessageType.PILOT_PANEL_OPENED,
      windowId,
      tabId,
    } satisfies Message,
    port
  )

  return {
    stopPilotSession: () => callListeners(port.onDisconnect, port),

    startAnotherSession: ({ tabId }: AnotherSessionStartOptions) => {
      trackedTabs.set(tabId, createMockTab({ id: tabId }))

      return callListeners(
        port.onMessage,
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
