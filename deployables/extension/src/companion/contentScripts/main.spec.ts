import { callListeners, chromeMock, createMockRoute } from '@/test-utils'
import { waitFor } from '@testing-library/react'
import {
  CompanionAppMessageType,
  PilotMessageType,
  type CompanionAppMessage,
  type Message,
} from '@zodiac/messages'
import { randomUUID } from 'crypto'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/utils', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/utils')>()

  return {
    ...module,

    injectScript: vi.fn(),
  }
})

describe('Companion App Content Script', () => {
  const importModule = () =>
    vi.importActual<typeof import('./main')>(`./main?bust=${randomUUID()}`)

  describe('Event relaying', () => {
    it.each([
      [
        CompanionAppMessageType.SAVE_ROUTE,
        {
          type: CompanionAppMessageType.SAVE_ROUTE,
          data: createMockRoute(),
        } satisfies CompanionAppMessage,
      ],
      [
        CompanionAppMessageType.OPEN_PILOT,
        {
          type: CompanionAppMessageType.OPEN_PILOT,
        } satisfies CompanionAppMessage,
      ],
      [
        CompanionAppMessageType.SUBMIT_SUCCESS,
        {
          type: CompanionAppMessageType.SUBMIT_SUCCESS,
        } satisfies CompanionAppMessage,
      ],
      [
        CompanionAppMessageType.REQUEST_FORK_INFO,
        {
          type: CompanionAppMessageType.REQUEST_FORK_INFO,
        } satisfies CompanionAppMessage,
      ],
      [
        CompanionAppMessageType.PING,
        {
          type: CompanionAppMessageType.PING,
        } satisfies CompanionAppMessage,
      ],
    ])('forwards %s events to the extension', async (_, event) => {
      await importModule()

      window.postMessage(event, '*')

      await waitFor(() => {
        expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
          event,
          expect.anything(),
        )
      })
    })

    it.each([
      [
        CompanionAppMessageType.FORK_UPDATED,
        {
          type: CompanionAppMessageType.FORK_UPDATED,
          forkUrl: 'http://rpc.com',
        } satisfies CompanionAppMessage,
      ],
      [
        PilotMessageType.PILOT_CONNECT,
        {
          type: PilotMessageType.PILOT_CONNECT,
        } satisfies Message,
      ],
      [
        PilotMessageType.PILOT_DISCONNECT,
        {
          type: PilotMessageType.PILOT_DISCONNECT,
        } satisfies Message,
      ],
      [
        PilotMessageType.PONG,
        {
          type: PilotMessageType.PONG,
        } satisfies Message,
      ],
    ])('forwards %s events from the extension', async (_, event) => {
      await importModule()

      const mockPostMessage = vi.spyOn(window, 'postMessage')

      await callListeners(chromeMock.runtime.onMessage, event, {}, vi.fn())

      expect(mockPostMessage).toHaveBeenCalledWith(event, '*')
    })
  })

  describe('Fork info', () => {
    it('requests fork info directly on script load', async () => {
      await importModule()

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: CompanionAppMessageType.REQUEST_FORK_INFO,
      })
    })

    it('requests for info when pilot connects', async () => {
      await importModule()

      await callListeners(
        chromeMock.runtime.onMessage,
        { type: PilotMessageType.PILOT_CONNECT } satisfies Message,
        {},
        vi.fn(),
      )

      expect(chrome.runtime.sendMessage).toHaveBeenNthCalledWith(2, {
        type: CompanionAppMessageType.REQUEST_FORK_INFO,
      })
    })
  })
})
