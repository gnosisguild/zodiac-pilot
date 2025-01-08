import { callListeners, chromeMock, createMockTab } from '@/test-utils'
import { sleepTillIdle } from '@zodiac/test-utils'
import { describe, expect, it } from 'vitest'
import { sendMessageToTab } from './sendMessageToTab'

describe('Send tab message', () => {
  it('sends the message to the specified tab', async () => {
    const tab = createMockTab({ status: 'complete' })

    chromeMock.tabs.get.mockResolvedValue(tab)

    await sendMessageToTab(tab.id, 'test-message')

    expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(
      tab.id,
      'test-message',
    )
  })

  it('waits for the specified tab to complete loading before sending the message', async () => {
    const tab = createMockTab({ status: 'loading' })

    chromeMock.tabs.get.mockResolvedValue(tab)

    const { promise, resolve } = Promise.withResolvers()

    sendMessageToTab(tab.id, 'test-message').then(resolve)

    await sleepTillIdle()

    expect(chromeMock.tabs.sendMessage).not.toHaveBeenCalled()

    tab.status = 'complete'

    await callListeners(
      chromeMock.tabs.onUpdated,
      tab.id,
      { status: 'complete' },
      tab,
    )

    expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(
      tab.id,
      'test-message',
    )

    return promise
  })

  it('waits for a non-chrome tab to become active before sending the message', async () => {
    const chromeTab = createMockTab({ url: 'chrome://extensions' })
    const regularTab = createMockTab({ url: 'http://test.com' })

    chromeMock.tabs.get.mockImplementation(async (tabId) => {
      if (tabId === chromeTab.id) {
        return chromeTab
      }

      return regularTab
    })

    const { promise, resolve } = Promise.withResolvers()

    sendMessageToTab(chromeTab.id, 'test-message').then(resolve)
    await sleepTillIdle()

    expect(chromeMock.tabs.sendMessage).not.toHaveBeenCalled()

    await callListeners(chromeMock.tabs.onActivated, {
      tabId: regularTab.id,
      windowId: regularTab.windowId,
    })

    expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(
      regularTab.id,
      'test-message',
    )

    return promise
  })

  it('sends the message to the same tab when it moves to a proper URL', async () => {
    const tab = createMockTab({ url: 'chrome://extensions' })

    chromeMock.tabs.get.mockResolvedValue(tab)

    const { promise, resolve } = Promise.withResolvers()

    sendMessageToTab(tab.id, 'test-message').then(resolve)

    await sleepTillIdle()

    expect(chromeMock.tabs.sendMessage).not.toHaveBeenCalled()

    chromeMock.tabs.get.mockResolvedValue({ ...tab, url: 'http://test.com' })

    await callListeners(
      chromeMock.tabs.onUpdated,
      tab.id,
      {
        url: 'http://test.com',
      },
      tab,
    )

    expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(
      tab.id,
      'test-message',
    )

    return promise
  })

  it('sends the message after another loading cycle when it initially fails.', async () => {
    const tab = createMockTab({ url: 'http://a-page-that-errors.com' })

    chromeMock.tabs.get.mockResolvedValue(tab)
    chromeMock.tabs.sendMessage.mockRejectedValue(
      'Receiving end does not exist.',
    )

    const { promise, resolve } = Promise.withResolvers()

    sendMessageToTab(tab.id, 'test-message').then(resolve)

    await sleepTillIdle()

    await callListeners(
      chromeMock.tabs.onUpdated,
      tab.id,
      {
        url: 'http://a-page-that-works.com',
        status: 'loading',
      },
      tab,
    )

    chromeMock.tabs.sendMessage.mockResolvedValue('Worked!')

    await callListeners(
      chromeMock.tabs.onUpdated,
      tab.id,
      {
        status: 'complete',
      },
      tab,
    )

    expect(chromeMock.tabs.sendMessage).toHaveBeenNthCalledWith(
      2,
      tab.id,
      'test-message',
    )

    return promise
  })
})
