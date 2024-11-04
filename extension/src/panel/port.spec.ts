import { PilotMessageType } from '@/messages'
import {
  chromeMock,
  createMockPort,
  mockActiveTab,
  mockRuntimeConnect,
} from '@/test-utils'
import { describe, expect, it } from 'vitest'
import { initPort } from './port'

describe('Init port', () => {
  it('sends the PILOT_PANEL_OPEN event to the current tab', async () => {
    const tab = mockActiveTab()
    const port = createMockPort()

    mockRuntimeConnect(port)

    await initPort()

    expect(port.postMessage).toHaveBeenCalledWith({
      type: PilotMessageType.PILOT_PANEL_OPENED,
      windowId: tab.windowId,
      tabId: tab.id,
    })
  })

  it('waits for the current tab to complete loading before sending the message', async () => {
    const tab = mockActiveTab({ status: 'loading' })
    const port = createMockPort()

    mockRuntimeConnect(port)

    await initPort()

    expect(port.postMessage).not.toHaveBeenCalled()

    chromeMock.tabs.onUpdated.callListeners(tab.id, { status: 'complete' }, tab)

    expect(port.postMessage).toHaveBeenCalledWith({
      type: PilotMessageType.PILOT_PANEL_OPENED,
      windowId: tab.windowId,
      tabId: tab.id,
    })
  })
})
