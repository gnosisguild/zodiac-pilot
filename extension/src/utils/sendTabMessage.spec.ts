import { chromeMock, createMockTab } from '@/test-utils'
import { describe, expect, it } from 'vitest'
import { sendTabMessage } from './sendTabMessage'
import { sleep } from './sleep'

describe('Send tab message', () => {
  it('sends the message to the specified tab', async () => {
    const tab = createMockTab({ status: 'complete' })

    chromeMock.tabs.get.mockResolvedValue(tab)

    await sendTabMessage(tab.id, 'test-message')

    expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(
      tab.id,
      'test-message'
    )
  })

  it('waits for the specified tab to complete loading before sending the message', async () => {
    const tab = createMockTab({ status: 'loading' })

    chromeMock.tabs.get.mockResolvedValue(tab)

    const { promise, resolve } = Promise.withResolvers()

    sendTabMessage(tab.id, 'test-message').then(resolve)

    // wait for next event loop so that listeners can be set up
    await sleep(1)

    expect(chromeMock.tabs.sendMessage).not.toHaveBeenCalled()

    chromeMock.tabs.onUpdated.callListeners(tab.id, { status: 'complete' }, tab)

    expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(
      tab.id,
      'test-message'
    )

    return promise
  })
})
