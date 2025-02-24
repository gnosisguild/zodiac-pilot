import { mockActiveTab, mockTabSwitch, renderHook } from '@/test-utils'
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

  it('does not connect again, when another tab becomes active', async () => {
    const { mockedRuntimePort } = await renderHook(() => usePilotPort(), {
      activeTab: mockActiveTab({ id: 1, windowId: 1 }),
    })

    expect(mockedRuntimePort.current?.postMessage).toHaveBeenCalledTimes(1)

    await mockTabSwitch({ id: 2, windowId: 1 })

    expect(mockedRuntimePort.current?.postMessage).toHaveBeenCalledTimes(1)
  })
})
