import { callListeners } from './callListeners'
import { chromeMock } from './chromeMock'

export const mockTabClose = (tabId: number) =>
  callListeners(chromeMock.tabs.onRemoved, tabId, {
    isWindowClosing: false,
    windowId: 1,
  })
