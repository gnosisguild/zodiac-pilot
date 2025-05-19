import { callListeners, chromeMock, createMockRoute } from '@/test-utils'
import { waitFor } from '@testing-library/react'
import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
  PilotMessageType,
  type CompanionAppMessage,
  type CompanionResponseMessage,
  type Message,
} from '@zodiac/messages'
import { createMockExecutionRoute } from '@zodiac/test-utils'
import { createMockManifest, createMockTab } from '@zodiac/test-utils/chrome'
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
          signedIn: false,
        } satisfies CompanionAppMessage,
      ],
      [
        CompanionAppMessageType.REQUEST_ROUTES,
        {
          type: CompanionAppMessageType.REQUEST_ROUTES,
        } satisfies CompanionAppMessage,
      ],
      [
        CompanionAppMessageType.REQUEST_ROUTE,
        {
          type: CompanionAppMessageType.REQUEST_ROUTE,
          routeId: 'test-route',
        } satisfies CompanionAppMessage,
      ],
      [
        CompanionAppMessageType.SAVE_AND_LAUNCH,
        {
          type: CompanionAppMessageType.SAVE_AND_LAUNCH,
          data: createMockExecutionRoute(),
        } satisfies CompanionAppMessage,
      ],
      [
        CompanionAppMessageType.DELETE_ROUTE,
        {
          type: CompanionAppMessageType.DELETE_ROUTE,
          routeId: 'test-route',
        } satisfies CompanionAppMessage,
      ],
      [
        CompanionAppMessageType.REQUEST_ACTIVE_ROUTE,
        {
          type: CompanionAppMessageType.REQUEST_ACTIVE_ROUTE,
        } satisfies CompanionAppMessage,
      ],
    ])('forwards %s events to the extension', async (_, event) => {
      await importModule()

      window.postMessage(event, '*')

      await waitFor(() => {
        expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(event)
      })
    })

    it.each([
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
        CompanionResponseMessageType.FORK_UPDATED,
        {
          type: CompanionResponseMessageType.FORK_UPDATED,
          forkUrl: 'http://rpc.com',
          vnetId: 'df87555f-93d3-4cbc-9e6c-8248e8ffb13f',
        } satisfies CompanionResponseMessage,
      ],
      [
        CompanionResponseMessageType.PONG,
        {
          type: CompanionResponseMessageType.PONG,
          lastTransactionExecutedAt: new Date().toISOString(),
        } satisfies CompanionResponseMessage,
      ],
      [
        CompanionResponseMessageType.LIST_ROUTES,
        {
          type: CompanionResponseMessageType.LIST_ROUTES,
          routes: [],
        } satisfies CompanionResponseMessage,
      ],
      [
        CompanionResponseMessageType.PROVIDE_ROUTE,
        {
          type: CompanionResponseMessageType.PROVIDE_ROUTE,
          route: createMockExecutionRoute(),
        } satisfies CompanionResponseMessage,
      ],
      [
        CompanionResponseMessageType.DELETED_ROUTE,
        {
          type: CompanionResponseMessageType.DELETED_ROUTE,
        } satisfies CompanionResponseMessage,
      ],
      [
        CompanionResponseMessageType.PROVIDE_ACTIVE_ROUTE,
        {
          type: CompanionResponseMessageType.PROVIDE_ACTIVE_ROUTE,
          activeRouteId: 'test-route',
        } satisfies CompanionResponseMessage,
      ],
    ])('forwards %s events from the extension', async (_, event) => {
      await importModule()

      const tab = createMockTab()

      const mockPostMessage = vi.spyOn(window, 'postMessage')

      await callListeners(
        chromeMock.runtime.onMessage,
        event,
        { id: chrome.runtime.id, tab },
        vi.fn(),
      )

      expect(mockPostMessage).toHaveBeenCalledWith(event, '*')
    })
  })

  describe('Fork info', () => {
    it('requests for info when pilot connects', async () => {
      await importModule()

      const tab = createMockTab()

      await callListeners(
        chromeMock.runtime.onMessage,
        { type: PilotMessageType.PILOT_CONNECT } satisfies Message,
        { id: chrome.runtime.id, tab },
        vi.fn(),
      )

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: CompanionAppMessageType.REQUEST_FORK_INFO,
      })
    })
  })

  describe('Version info', () => {
    it('provides the current version from the manifest', async () => {
      await importModule()

      const mockPostMessage = vi.spyOn(window, 'postMessage')

      chromeMock.runtime.getManifest.mockReturnValue(
        createMockManifest({ version: '1.2.3' }),
      )

      window.postMessage(
        {
          type: CompanionAppMessageType.REQUEST_VERSION,
        } satisfies CompanionAppMessage,
        '*',
      )

      await waitFor(() => {
        expect(mockPostMessage).toHaveBeenCalledWith(
          {
            type: CompanionResponseMessageType.PROVIDE_VERSION,
            version: '1.2.3',
          } satisfies CompanionResponseMessage,
          '*',
        )
      })
    })
  })
})
