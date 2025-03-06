import {
  createMockTab,
  mockActiveTab,
  mockTabSwitch,
  mockTabUpdate,
  renderHook,
} from '@/test-utils'
import { cleanup, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { COMPANION_APP_PORT, useCompanionAppPort } from './useCompanionAppPort'

vi.mock('@zodiac/env', async (importOriginal) => {
  const module = await importOriginal<typeof import('@zodiac/env')>()

  return {
    ...module,

    getCompanionAppUrl: () => 'http://localhost',
  }
})

describe('useCompanionAppPort', () => {
  afterEach(cleanup)

  it('opens a port', async () => {
    const tab = mockActiveTab()

    await renderHook(() => useCompanionAppPort(), {
      activeTab: tab,
    })

    await waitFor(() => {
      expect(chrome.runtime.connect).toHaveBeenCalledWith({
        name: COMPANION_APP_PORT,
      })
    })
  })

  it('waits for the current tab to complete loading before opening the port', async () => {
    const tab = mockActiveTab({ status: 'loading' })

    const { mockedRuntimePort } = await renderHook(
      () => useCompanionAppPort(),
      {
        activeTab: tab,
      },
    )

    expect(mockedRuntimePort.current).toBeNull()

    await mockTabUpdate({ status: 'complete' })

    await waitFor(() => {
      expect(chrome.runtime.connect).toHaveBeenCalledWith({
        name: COMPANION_APP_PORT,
      })
    })
  })

  it('waits for a non-chrome tab to become active before opening the port', async () => {
    const chromeTab = createMockTab({ url: 'chrome://extensions' })
    const regularTab = createMockTab({ url: 'http://test.com' })

    const { mockedRuntimePort } = await renderHook(
      () => useCompanionAppPort(),
      {
        activeTab: chromeTab,
      },
    )

    expect(mockedRuntimePort.current).toBeNull()

    await mockTabSwitch(regularTab)

    expect(chrome.runtime.connect).toHaveBeenCalledWith({
      name: COMPANION_APP_PORT,
    })
  })

  it('allows companion URLs that are on a denylist', async () => {
    await renderHook(() => useCompanionAppPort(), {
      activeTab: createMockTab({
        url: 'http://localhost/edit/route-id/route-data',
      }),
    })

    await waitFor(() => {
      expect(chrome.runtime.connect).toHaveBeenCalledWith({
        name: COMPANION_APP_PORT,
      })
    })
  })

  it('does not connect again, when another tab becomes active', async () => {
    await renderHook(() => useCompanionAppPort(), {
      activeTab: mockActiveTab({ id: 1, windowId: 1 }),
    })

    expect(chrome.runtime.connect).toHaveBeenCalledTimes(1)

    await mockTabSwitch({ id: 2, windowId: 1 })

    expect(chrome.runtime.connect).toHaveBeenCalledTimes(1)
  })
})
