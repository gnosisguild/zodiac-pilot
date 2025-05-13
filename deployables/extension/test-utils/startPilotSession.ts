import { invariant } from '@epic-web/invariant'
import { type Message, PilotMessageType } from '@zodiac/messages'
import {
  callListeners,
  chromeMock,
  createMockPort,
  createMockTab,
} from './chrome'

type AnotherSessionStartOptions = {
  tabId: number
}

type StartSessionOptions = { windowId: number }

const trackedTabs = new Map<number, chrome.tabs.Tab>()

export const startPilotSession = async (
  { windowId }: StartSessionOptions,
  tab?: chrome.tabs.Tab,
) => {
  chromeMock.tabs.get.mockImplementation((tabId) => {
    const tab = trackedTabs.get(tabId)

    invariant(
      tab != null,
      `Tab with id "${tabId}" not tracked in this test case`,
    )

    return Promise.resolve(tab)
  })

  if (tab != null && tab.id != null) {
    trackedTabs.set(tab.id, tab)
  }

  const port = createMockPort({ name: 'PILOT_PANEL_PORT' })

  await callListeners(chromeMock.runtime.onConnect, port)

  await callListeners(
    port.onMessage,
    {
      type: PilotMessageType.PILOT_PANEL_OPENED,
      windowId,
      tabId: tab != null && tab.id != null ? tab.id : undefined,
    } satisfies Message,
    port,
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
        port,
      )
    },
  }
}
