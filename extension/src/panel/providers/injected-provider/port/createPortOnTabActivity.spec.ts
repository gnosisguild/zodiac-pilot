import {
  callListeners,
  chromeMock,
  createMockPort,
  createMockTab,
  mockActiveTab,
} from '@/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPortOnTabActivity } from './createPortOnTabActivity'
import { createPortWhenTabIsReady } from './createPortWhenTabIsReady'

vi.mock('./createPortWhenTabIsReady', () => ({
  createPortWhenTabIsReady: vi.fn(),
}))

const mockCreatePortWhenTabIsReady = vi.mocked(createPortWhenTabIsReady)

describe('createPortOnTabActivity', () => {
  beforeEach(() => {
    // @ts-expect-error type error in a detail prop
    mockCreatePortWhenTabIsReady.mockResolvedValue(createMockPort())
  })

  it('creates a new port when a new tab becomes active', async () => {
    mockActiveTab({ windowId: 1 })

    const callback = vi.fn()

    await createPortOnTabActivity(callback, { windowId: 1 })

    const newTab = createMockTab({ windowId: 1 })

    chromeMock.tabs.get.mockResolvedValue(newTab)

    await callListeners(chromeMock.tabs.onActivated, {
      tabId: newTab.id,
      windowId: newTab.windowId,
    })

    expect(callback).toHaveBeenCalledWith(newTab.id, expect.anything())
  })

  it('does not create a new port when a tab in another window becomes active', async () => {
    mockActiveTab({ windowId: 1 })

    const callback = vi.fn()

    await createPortOnTabActivity(callback, { windowId: 1 })

    const newTab = createMockTab({ windowId: 2 })

    chromeMock.tabs.get.mockResolvedValue(newTab)

    await callListeners(chromeMock.tabs.onActivated, {
      tabId: newTab.id,
      windowId: newTab.windowId,
    })

    expect(callback).not.toHaveBeenCalledWith(newTab.id, expect.anything())
  })

  it('creates a new port when a tab changes to a different URL', async () => {
    const tab = mockActiveTab({ windowId: 1 })

    const callback = vi.fn()

    await createPortOnTabActivity(callback, { windowId: 1 })

    await callListeners(
      chromeMock.tabs.onUpdated,
      tab.id,
      { url: 'http://new-url.com' },
      tab,
    )

    expect(callback).toHaveBeenCalledWith(tab.id, expect.anything())
  })

  it('does not create a new port when the active tab in a different window changes to a different URL', async () => {
    mockActiveTab({ windowId: 1 })

    const callback = vi.fn()

    await createPortOnTabActivity(callback, { windowId: 1 })

    const newTab = mockActiveTab({ windowId: 2 })

    await callListeners(
      chromeMock.tabs.onUpdated,
      newTab.id,
      { url: 'http://new-url.com' },
      newTab,
    )

    expect(callback).not.toHaveBeenCalledWith(newTab.id, expect.anything())
  })

  it('returns a function that can be used to create a new port', async () => {
    const tab = mockActiveTab({ windowId: 1 })

    const callback = vi.fn()

    const createNewPort = await createPortOnTabActivity(callback, {
      windowId: 1,
    })

    await createNewPort()

    expect(callback).toHaveBeenNthCalledWith(2, tab.id, expect.anything())
  })
})
