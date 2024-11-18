import {
  callListeners,
  chromeMock,
  createMockPort,
  createMockTab,
} from '@/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createPort } from './createPort'
import { createPortWhenTabIsReady } from './createPortWhenTabIsReady'

vi.mock('./createPort', () => ({
  createPort: vi.fn(),
}))

const mockCreatePort = vi.mocked(createPort)

describe('createPortWhenTabIsReady', () => {
  it('resolves to a port when the tab is ready', async () => {
    const mockedPort = createMockPort()

    // @ts-expect-error type error in a detail -- not important
    mockCreatePort.mockResolvedValue(mockedPort)

    const tab = createMockTab()

    const port = await createPortWhenTabIsReady(tab)

    expect(port).toEqual(mockedPort)
  })

  it('waits for the tab to become ready before resolving', async () => {
    const mockedPort = createMockPort()

    // @ts-expect-error type error in a detail -- not important
    mockCreatePort.mockResolvedValue(mockedPort)

    const tab = createMockTab({ status: 'loading' })
    const { promise, resolve } = Promise.withResolvers()

    createPortWhenTabIsReady(tab).then(resolve)

    expect(mockCreatePort).not.toHaveBeenCalled()

    await callListeners(
      chromeMock.tabs.onUpdated,
      tab.id,
      { status: 'complete' },
      tab
    )

    await promise

    expect(createPort).toHaveBeenCalledWith(tab.id, tab.url)
  })
})
