import {
  createMockTab,
  mockActiveTab,
  mockTabSwitch,
  mockTabUpdate,
  renderHook,
} from '@/test-utils'
import { cleanup, waitFor } from '@testing-library/react'
import { PilotMessageType } from '@zodiac/messages'
import { afterEach, describe, expect, it } from 'vitest'
import { usePilotPort } from './usePilotPort'

describe('usePilotPort', () => {
  afterEach(cleanup)

  it('sends the PILOT_PANEL_OPEN event to the current tab', async () => {
    const tab = mockActiveTab()

    const { mockedRuntimePort } = await renderHook(() => usePilotPort(), {
      activeTab: tab,
    })

    await waitFor(() => {
      expect(mockedRuntimePort.current?.postMessage).toHaveBeenCalledWith({
        type: PilotMessageType.PILOT_PANEL_OPENED,
        windowId: tab.windowId,
        tabId: tab.id,
      })
    })
  })

  it('waits for the current tab to complete loading before sending the message', async () => {
    const tab = mockActiveTab({ status: 'loading' })

    const { mockedRuntimePort } = await renderHook(() => usePilotPort(), {
      activeTab: tab,
    })

    expect(mockedRuntimePort.current).toBeNull()

    await mockTabUpdate({ status: 'complete' })

    await waitFor(() => {
      expect(mockedRuntimePort.current?.postMessage).toHaveBeenCalledWith({
        type: PilotMessageType.PILOT_PANEL_OPENED,
        windowId: tab.windowId,
        tabId: tab.id,
      })
    })
  })

  it('waits for a non-chrome tab to become active before sending the message', async () => {
    const chromeTab = createMockTab({ url: 'chrome://extensions' })
    const regularTab = createMockTab({ url: 'http://test.com' })

    const { mockedRuntimePort } = await renderHook(() => usePilotPort(), {
      activeTab: chromeTab,
    })

    expect(mockedRuntimePort.current).toBeNull()

    await mockTabSwitch(regularTab)

    expect(mockedRuntimePort.current?.postMessage).toHaveBeenCalledWith({
      type: PilotMessageType.PILOT_PANEL_OPENED,
      windowId: regularTab.windowId,
      tabId: regularTab.id,
    })
  })

  it('sends the message to the same tab when it moves to a proper URL', async () => {
    const tab = createMockTab({ url: 'chrome://extensions' })

    const { mockedRuntimePort } = await renderHook(() => usePilotPort(), {
      activeTab: tab,
    })

    expect(mockedRuntimePort.current).toBeNull()

    await mockTabUpdate({ url: 'http://test.com' })

    expect(mockedRuntimePort.current?.postMessage).toHaveBeenCalledWith({
      type: PilotMessageType.PILOT_PANEL_OPENED,
      windowId: tab.windowId,
      tabId: tab.id,
    })
  })

  it('does not connect again, when another tab becomes active', async () => {
    const { mockedRuntimePort } = await renderHook(() => usePilotPort(), {
      activeTab: mockActiveTab({ id: 1, windowId: 1 }),
    })

    expect(mockedRuntimePort.current?.postMessage).toHaveBeenCalledTimes(1)

    await mockTabSwitch({ id: 2, windowId: 1 })

    expect(mockedRuntimePort.current?.postMessage).toHaveBeenCalledTimes(1)
  })
})
