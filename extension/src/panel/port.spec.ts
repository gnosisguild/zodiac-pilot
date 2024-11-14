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
import { sleep } from '@/utils'
import { cleanup, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { initPort, usePilotPort } from './port'

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

  it('waits for a non-chrome tab to become active before sending the message', async () => {
    const chromeTab = createMockTab({ url: 'chrome://extensions' })
    const regularTab = createMockTab({ url: 'http://test.com' })

    mockActiveTab(chromeTab)

    const port = createMockPort()

    mockRuntimeConnect(port)

    const { promise, resolve } = Promise.withResolvers()

    initPort().then(resolve)

    await sleep(1)

    expect(port.postMessage).not.toHaveBeenCalled()

    mockActiveTab(regularTab)

    await callListeners(chromeMock.tabs.onActivated, {
      tabId: regularTab.id,
      windowId: regularTab.windowId,
    })

    await sleep(1)

    expect(port.postMessage).toHaveBeenCalledWith({
      type: PilotMessageType.PILOT_PANEL_OPENED,
      windowId: regularTab.windowId,
      tabId: regularTab.id,
    })

    return promise
  })

  it('sends the message to the same tab when it moves to a proper URL', async () => {
    const tab = createMockTab({ url: 'chrome://extensions' })

    mockActiveTab(tab)

    const port = createMockPort()

    mockRuntimeConnect(port)

    const { promise, resolve } = Promise.withResolvers()

    initPort().then(resolve)

    await sleep(1)

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

    await sleep(1)

    expect(port.postMessage).toHaveBeenCalledWith({
      type: PilotMessageType.PILOT_PANEL_OPENED,
      windowId: tab.windowId,
      tabId: tab.id,
    })

    return promise
  })
})

describe('usePilotPort', () => {
  afterEach(cleanup)

  it('sends the PILOT_PANEL_OPEN event to the current tab', async () => {
    const tab = mockActiveTab()
    const port = createMockPort()

    mockRuntimeConnect(port)

    await renderHook(() => usePilotPort())

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

    await renderHook(() => usePilotPort())

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

    mockActiveTab(chromeTab)

    const port = createMockPort()

    mockRuntimeConnect(port)

    await renderHook(() => usePilotPort())

    expect(port.postMessage).not.toHaveBeenCalled()

    mockActiveTab(regularTab)

    await callListeners(chromeMock.tabs.onActivated, {
      tabId: regularTab.id,
      windowId: regularTab.windowId,
    })

    await sleep(1)

    expect(port.postMessage).toHaveBeenCalledWith({
      type: PilotMessageType.PILOT_PANEL_OPENED,
      windowId: regularTab.windowId,
      tabId: regularTab.id,
    })
  })

  it('sends the message to the same tab when it moves to a proper URL', async () => {
    const tab = createMockTab({ url: 'chrome://extensions' })

    mockActiveTab(tab)

    const port = createMockPort()

    mockRuntimeConnect(port)

    await renderHook(() => usePilotPort())

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

    await sleep(1)

    expect(port.postMessage).toHaveBeenCalledWith({
      type: PilotMessageType.PILOT_PANEL_OPENED,
      windowId: tab.windowId,
      tabId: tab.id,
    })
  })
})
