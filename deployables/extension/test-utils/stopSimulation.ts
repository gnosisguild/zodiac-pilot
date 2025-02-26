import {
  PilotSimulationMessageType,
  type SimulationMessage,
} from '@zodiac/messages'
import { callListeners, chromeMock, createMockTab } from './chrome'

export const stopSimulation = (tab: Partial<chrome.tabs.Tab>) => {
  const currentTab = createMockTab(tab)

  return callListeners(
    chromeMock.runtime.onMessage,
    {
      type: PilotSimulationMessageType.SIMULATE_STOP,
      windowId: currentTab.windowId,
    } satisfies SimulationMessage,
    { id: chromeMock.runtime.id, tab: currentTab },
    () => {},
  )
}
