import { PilotMessageType } from '@/messages'
import {
  callListeners,
  chromeMock,
  createMockPort,
  createMockTab,
  mockActiveTab,
  mockRuntimeConnect,
  renderHook,
} from '@/test-utils'
import { sleepTillIdle } from '@/utils'
import { cleanup, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { usePilotPort } from './usePilotPort'

describe('usePilotPort', () => {
  afterEach(cleanup)

  it('sends the PILOT_PANEL_OPEN event to the current tab', async () => {
    const tab = mockActiveTab()
    const port = createMockPort()

    mockRuntimeConnect(port)

    await renderHook(() => usePilotPort(), { activeTab: tab })

    await waitFor(() => {
      expect(port.postMessage).toHaveBeenCalledWith({
        type: PilotMessageType.PILOT_PANEL_OPENED,
        windowId: tab.windowId,
        tabId: tab.id,
      })
    })
  })

  it('waits for the current tab to complete loading before sending the message', async () => {
    const tab = mockActiveTab({ status: 'loading' })
    const port = createMockPort()

    mockRuntimeConnect(port)

    await renderHook(() => usePilotPort(), { activeTab: tab })

    expect(port.postMessage).not.toHaveBeenCalled()

    mockActiveTab({ ...tab, status: 'complete' })

    await callListeners(
      chromeMock.tabs.onUpdated,
      tab.id,
      { status: 'complete' },
      tab
    )

    await waitFor(() => {
      expect(port.postMessage).toHaveBeenCalledWith({
        type: PilotMessageType.PILOT_PANEL_OPENED,
        windowId: tab.windowId,
        tabId: tab.id,
      })
    })
  })

  it('waits for a non-chrome tab to become active before sending the message', async () => {
    const chromeTab = createMockTab({ url: 'chrome://extensions' })
    const regularTab = createMockTab({ url: 'http://test.com' })

    const port = createMockPort()

    mockRuntimeConnect(port)

    await renderHook(() => usePilotPort(), { activeTab: chromeTab })

    expect(port.postMessage).not.toHaveBeenCalled()

    mockActiveTab(regularTab)

    await callListeners(chromeMock.tabs.onActivated, {
      tabId: regularTab.id,
      windowId: regularTab.windowId,
    })

    await sleepTillIdle()

    expect(port.postMessage).toHaveBeenCalledWith({
      type: PilotMessageType.PILOT_PANEL_OPENED,
      windowId: regularTab.windowId,
      tabId: regularTab.id,
    })
  })

  it('sends the message to the same tab when it moves to a proper URL', async () => {
    const tab = createMockTab({ url: 'chrome://extensions' })

    const port = createMockPort()

    mockRuntimeConnect(port)

    await renderHook(() => usePilotPort(), { activeTab: tab })

    expect(port.postMessage).not.toHaveBeenCalled()

    mockActiveTab({ ...tab, url: 'http://test.com' })

    await callListeners(
      chromeMock.tabs.onUpdated,
      tab.id,
      {
        url: 'http://test.com',
      },
      tab
    )

    await sleepTillIdle()

    expect(port.postMessage).toHaveBeenCalledWith({
      type: PilotMessageType.PILOT_PANEL_OPENED,
      windowId: tab.windowId,
      tabId: tab.id,
    })
  })

  it('does not connect again, when another tab becomes active', async () => {
    const port = createMockPort()

    mockRuntimeConnect(port)

    await renderHook(() => usePilotPort(), {
      activeTab: mockActiveTab({ id: 1, windowId: 1 }),
    })

    expect(port.postMessage).toHaveBeenCalledTimes(1)

    mockActiveTab({ id: 2, windowId: 1 })

    await callListeners(chromeMock.tabs.onActivated, { tabId: 2, windowId: 2 })

    expect(port.postMessage).toHaveBeenCalledTimes(1)
  })
})
