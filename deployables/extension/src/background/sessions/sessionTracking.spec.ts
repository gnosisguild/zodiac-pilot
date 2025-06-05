import {
  callListeners,
  chromeMock,
  createMockTab,
  mockActiveTab,
  mockCompanionAppUrl,
  startPilotSession,
} from '@/test-utils'
import { reloadTab } from '@/utils'
import { getCompanionAppUrl } from '@zodiac/env'
import { PilotMessageType } from '@zodiac/messages'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { trackRequests } from '../rpcRedirects'
import { trackSessions } from './sessionTracking'

vi.mock('@/utils', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/utils')>()

  return {
    ...module,

    reloadTab: vi.fn(),
  }
})

const mockReloadTab = vi.mocked(reloadTab)

describe('Session tracking', () => {
  beforeEach(() => {
    mockActiveTab()

    mockCompanionAppUrl('http://companion-app.com')
  })

  describe('Start session', () => {
    it('tracks a new session for a given window', async () => {
      const { getPilotSession } = trackSessions(trackRequests())

      await startPilotSession({ windowId: 1 })

      expect(getPilotSession(1)).toMatchObject({
        fork: null,
        id: 1,
        tabs: new Set(),
      })
    })

    it('starts tracking a tab if provided with a tabId', async () => {
      const { getPilotSession } = trackSessions(trackRequests())

      await startPilotSession({ windowId: 1 }, createMockTab({ id: 2 }))

      expect(getPilotSession(1)).toMatchObject({
        fork: null,
        id: 1,
        tabs: new Set([2]),
      })
    })

    it('sends a connect message the respective tab', async () => {
      trackSessions(trackRequests())

      await startPilotSession({ windowId: 1 }, createMockTab({ id: 1 }))

      expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(1, {
        type: PilotMessageType.PILOT_CONNECT,
      })
    })

    it('only reloads a tab once', async () => {
      trackSessions(trackRequests())

      const tab = createMockTab({ id: 1 })

      await startPilotSession({ windowId: 1 }, tab)
      await startPilotSession({ windowId: 1 }, tab)

      expect(mockReloadTab).toHaveBeenCalledTimes(1)
    })
  })

  describe('Stop session', () => {
    it('removes the session', async () => {
      const { getPilotSession } = trackSessions(trackRequests())

      const { stopPilotSession } = await startPilotSession({ windowId: 1 })
      await stopPilotSession()

      expect(() => getPilotSession(1)).toThrow()
    })

    it('sends a disconnect message to all connected tabs', async () => {
      trackSessions(trackRequests())

      const { stopPilotSession, startAnotherSession } = await startPilotSession(
        {
          windowId: 1,
        },
        createMockTab({ id: 1 }),
      )
      await startAnotherSession({ tabId: 2 })

      await stopPilotSession()

      expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(1, {
        type: PilotMessageType.PILOT_DISCONNECT,
      })
      expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(2, {
        type: PilotMessageType.PILOT_DISCONNECT,
      })
    })
  })

  describe('Tab handling', () => {
    describe('When a tab is opened', () => {
      it('tracks new tabs in a window, when a session is active', async () => {
        const { getPilotSession } = trackSessions(trackRequests())

        await startPilotSession({ windowId: 1 }, createMockTab({ id: 1 }))
        await callListeners(chromeMock.tabs.onActivated, {
          windowId: 1,
          tabId: 1,
        })

        expect(getPilotSession(1)).toMatchObject({
          id: 1,
          fork: null,
          tabs: new Set([1]),
        })
      })

      it('does nothing when no pilot session is active', async () => {
        const { getPilotSession } = trackSessions(trackRequests())

        await callListeners(chromeMock.tabs.onActivated, {
          windowId: 1,
          tabId: 1,
        })

        expect(() => getPilotSession(1)).toThrow()
      })

      it('sends a pilot connect method to the new tab', async () => {
        trackSessions(trackRequests())

        await startPilotSession({ windowId: 1 })

        await callListeners(chromeMock.tabs.onActivated, {
          windowId: 1,
          tabId: 1,
        })

        expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(1, {
          type: PilotMessageType.PILOT_CONNECT,
        })
      })
    })

    describe('When a tab is closed', () => {
      it('stops tracking tabs in a window, when they are closed', async () => {
        const { getPilotSession } = trackSessions(trackRequests())

        await startPilotSession({ windowId: 1 }, createMockTab({ id: 1 }))

        await callListeners(chromeMock.tabs.onRemoved, 1, {
          windowId: 1,
          isWindowClosing: false,
        })

        expect(getPilotSession(1)).toMatchObject({
          id: 1,
          fork: null,
          tabs: new Set(),
        })
      })

      it('does nothing when no pilot session is active', async () => {
        const { getPilotSession } = trackSessions(trackRequests())

        await callListeners(chromeMock.tabs.onRemoved, 1, {
          windowId: 1,
          isWindowClosing: false,
        })

        expect(() => getPilotSession(1)).toThrow()
      })

      it('does not send a pilot disconnect message', async () => {
        trackSessions(trackRequests())

        await startPilotSession({ windowId: 1 }, createMockTab({ id: 1 }))

        await callListeners(chromeMock.tabs.onRemoved, 1, {
          windowId: 1,
          isWindowClosing: false,
        })

        expect(chrome.tabs.sendMessage).not.toHaveBeenCalledWith(1, {
          type: PilotMessageType.PILOT_DISCONNECT,
        })
      })
    })

    describe('When a tab updates', () => {
      beforeEach(() => {
        trackSessions(trackRequests())
      })

      it('injects the provider script when new pages are loaded', async () => {
        await startPilotSession({ windowId: 1 }, createMockTab({ id: 1 }))

        await callListeners(
          chromeMock.tabs.onUpdated,
          1,
          { status: 'loading' },
          createMockTab({ windowId: 1 }),
        )

        expect(chromeMock.scripting.executeScript).toHaveBeenCalledWith({
          target: { tabId: 1, allFrames: true },
          files: ['build/inject/contentScript/main.js'],
          injectImmediately: true,
        })
      })

      it('does nothing for untracked tabs', async () => {
        await startPilotSession({ windowId: 1 })

        await callListeners(
          chromeMock.tabs.onUpdated,
          1,
          { status: 'loading' },
          createMockTab({ windowId: 1 }),
        )

        expect(chromeMock.scripting.executeScript).not.toHaveBeenCalled()
      })

      it('does nothing when no pilot session is active', async () => {
        await callListeners(
          chromeMock.tabs.onUpdated,
          1,
          { status: 'loading' },
          createMockTab({ windowId: 1 }),
        )

        expect(chromeMock.scripting.executeScript).not.toHaveBeenCalled()
      })

      it.each(['complete', undefined])(
        'does nothing when the page is in the "%s" status',
        async (status) => {
          const tab = createMockTab({ windowId: 1 })
          await startPilotSession({ windowId: 1 }, tab)

          await callListeners(
            chromeMock.tabs.onUpdated,
            tab.id,
            { status },
            tab,
          )

          expect(chromeMock.scripting.executeScript).not.toHaveBeenCalled()
        },
      )

      it.each(['/edit', '/create', '/submit'])(
        'does nothing for the "%s" page of the companion app',
        async (path) => {
          const tab = createMockTab({
            windowId: 1,
            url: `${getCompanionAppUrl()}${path}`,
          })

          await startPilotSession({ windowId: 1 }, tab)

          await callListeners(
            chromeMock.tabs.onUpdated,
            tab.id,
            { status: 'loading' },
            tab,
          )

          expect(chromeMock.scripting.executeScript).not.toHaveBeenCalled()
        },
      )
    })
  })

  describe('CSP rules', () => {
    beforeEach(() => {
      trackSessions(trackRequests())
    })

    describe('Start session', () => {
      it('removes CSP headers', async () => {
        await startPilotSession({ windowId: 1 }, createMockTab({ id: 1 }))

        expect(
          chromeMock.declarativeNetRequest.updateSessionRules,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            addRules: [
              expect.objectContaining({
                id: 1,
                priority: 1,
                action: {
                  type: chromeMock.declarativeNetRequest.RuleActionType
                    .MODIFY_HEADERS,
                  responseHeaders: [
                    {
                      header: 'content-security-policy',
                      operation:
                        chrome.declarativeNetRequest.HeaderOperation.REMOVE,
                    },
                    {
                      header: 'content-security-policy-report-only',
                      operation:
                        chrome.declarativeNetRequest.HeaderOperation.REMOVE,
                    },
                  ],
                },
              }),
            ],
          }),
          expect.anything(),
        )
      })

      it('removes CSP from the main frame and any sub frame', async () => {
        await startPilotSession({ windowId: 1 }, createMockTab({ id: 1 }))

        expect(
          chromeMock.declarativeNetRequest.updateSessionRules,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            addRules: [
              expect.objectContaining({
                condition: expect.objectContaining({
                  resourceTypes: [
                    chromeMock.declarativeNetRequest.ResourceType.MAIN_FRAME,
                    chromeMock.declarativeNetRequest.ResourceType.SUB_FRAME,
                  ],
                }),
              }),
            ],
          }),
          expect.anything(),
        )
      })

      it('removes CSP headers only from tracked tabs', async () => {
        await startPilotSession({ windowId: 1 }, createMockTab({ id: 1 }))

        expect(
          chromeMock.declarativeNetRequest.updateSessionRules,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            addRules: [
              expect.objectContaining({
                condition: expect.objectContaining({
                  tabIds: [1],
                }),
              }),
            ],
          }),
          expect.anything(),
        )
      })
    })

    describe('Stop session', () => {
      it('always removes the previous rules', async () => {
        const { stopPilotSession } = await startPilotSession({ windowId: 1 })
        await stopPilotSession()

        expect(
          chromeMock.declarativeNetRequest.updateSessionRules,
        ).toHaveBeenCalledWith(
          {
            removeRuleIds: [1],
          },
          expect.anything(),
        )
      })
    })

    describe('Tab opened', () => {
      it('updates the rules to include the new tab', async () => {
        await startPilotSession({ windowId: 1 }, createMockTab({ id: 1 }))

        await callListeners(chromeMock.tabs.onActivated, {
          tabId: 1,
          windowId: 1,
        })

        expect(
          chromeMock.declarativeNetRequest.updateSessionRules,
        ).toHaveBeenLastCalledWith(
          expect.objectContaining({
            addRules: [
              expect.objectContaining({
                condition: expect.objectContaining({
                  tabIds: [1],
                }),
              }),
            ],
          }),
          expect.anything(),
        )
      })
    })

    describe('Tab closed', () => {
      it('updates the rules and removes the closed tab', async () => {
        await startPilotSession({ windowId: 1 }, createMockTab({ id: 2 }))

        await callListeners(chromeMock.tabs.onActivated, {
          windowId: 1,
          tabId: 1,
        })
        await callListeners(chromeMock.tabs.onRemoved, 2, {
          windowId: 1,
          isWindowClosing: false,
        })

        expect(
          chromeMock.declarativeNetRequest.updateSessionRules,
        ).toHaveBeenLastCalledWith(
          expect.objectContaining({
            addRules: [
              expect.objectContaining({
                condition: expect.objectContaining({
                  tabIds: [1],
                }),
              }),
            ],
          }),
          expect.anything(),
        )
      })
    })
  })

  describe('onDeleted', () => {
    it('is possible to get notified when a session ends', async () => {
      const { onDeleted } = trackSessions(trackRequests())

      const handler = vi.fn()

      onDeleted.addListener(handler)

      const { stopPilotSession } = await startPilotSession({ windowId: 1 })
      await stopPilotSession()

      expect(handler).toHaveBeenCalled()
    })
  })
})
