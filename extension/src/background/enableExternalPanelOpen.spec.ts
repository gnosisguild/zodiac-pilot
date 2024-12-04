import { PilotMessageType } from '@/messages'
import { callListeners, chromeMock, createMockTab } from '@/test-utils'
import { describe, expect, it } from 'vitest'
import { enableExternalPanelOpen } from './enableExternalPanelOpen'

describe('External panel open', () => {
  it('opens the panel when the respective message is received', async () => {
    enableExternalPanelOpen()

    const tab = createMockTab({ id: 1, windowId: 2 })

    await callListeners(
      chromeMock.runtime.onMessageExternal,
      { type: PilotMessageType.PILOT_OPEN_SIDEPANEL },
      { tab },
      () => {}
    )

    expect(chromeMock.sidePanel.open).toHaveBeenCalledWith({
      tabId: 1,
      windowId: 2,
    })
  })

  it('does nothing otherwise', async () => {
    enableExternalPanelOpen()

    const tab = createMockTab()

    await callListeners(
      chromeMock.runtime.onMessageExternal,
      { type: 'some-other-event' },
      { tab },
      () => {}
    )

    expect(chromeMock.sidePanel.open).not.toHaveBeenCalled()
  })
})
