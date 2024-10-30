import { chromeMock, createMockTab } from '@/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { clearAllSessions, getPilotSession } from './activePilotSessions'
import { startPilotSession, stopPilotSession } from './sessionTracking'

describe('Session tracking', () => {
  beforeEach(clearAllSessions)

  describe('Start session', () => {
    it('tracks a new session for a given window', () => {
      startPilotSession({ windowId: 1 })

      expect(getPilotSession(1)).toMatchObject({
        fork: null,
        id: 1,
        tabs: new Set(),
      })
    })

    it('starts tracking a tab if provided with a tabId', () => {
      startPilotSession({ windowId: 1, tabId: 2 })

      expect(getPilotSession(1)).toMatchObject({
        fork: null,
        id: 1,
        tabs: new Set([2]),
      })
    })
  })

  describe('Stop session', () => {
    it('removes the session', () => {
      startPilotSession({ windowId: 1 })
      stopPilotSession(1)

      expect(() => getPilotSession(1)).toThrow()
    })
  })

  describe('Tab handling', () => {
    describe('When a tab is opened', () => {
      it('tracks new tabs in a window, when a session is active', () => {
        startPilotSession({ windowId: 1 })

        chromeMock.tabs.onActivated.callListeners({ windowId: 1, tabId: 1 })

        expect(getPilotSession(1)).toMatchObject({
          id: 1,
          fork: null,
          tabs: new Set([1]),
        })
      })

      it('does nothing when no pilot session is active', () => {
        chromeMock.tabs.onActivated.callListeners({ windowId: 1, tabId: 1 })

        expect(() => getPilotSession(1)).toThrow()
      })
    })

    describe('When a tab is closed', () => {
      it('stops tracking tabs in a window, when they are closed', () => {
        startPilotSession({ windowId: 1, tabId: 1 })

        chromeMock.tabs.onRemoved.callListeners(1, {
          windowId: 1,
          isWindowClosing: false,
        })

        expect(getPilotSession(1)).toMatchObject({
          id: 1,
          fork: null,
          tabs: new Set(),
        })
      })

      it('does nothing when no pilot session is active', () => {
        chromeMock.tabs.onRemoved.callListeners(1, {
          windowId: 1,
          isWindowClosing: false,
        })

        expect(() => getPilotSession(1)).toThrow()
      })
    })

    describe('When a tab updates', () => {
      it('injects the provider script when new pages are loaded', () => {
        startPilotSession({ windowId: 1, tabId: 1 })

        chromeMock.tabs.onUpdated.callListeners(
          1,
          { status: 'loading' },
          createMockTab({ windowId: 1 })
        )

        expect(chromeMock.scripting.executeScript).toHaveBeenCalledWith({
          target: { tabId: 1, allFrames: true },
          files: ['build/inject/contentScript.js'],
          injectImmediately: true,
        })
      })

      it('does nothing for untracked tabs', () => {
        startPilotSession({ windowId: 1 })

        chromeMock.tabs.onUpdated.callListeners(
          1,
          { status: 'loading' },
          createMockTab({ windowId: 1 })
        )

        expect(chromeMock.scripting.executeScript).not.toHaveBeenCalled()
      })

      it('does nothing when no pilot session is active', () => {
        chromeMock.tabs.onUpdated.callListeners(
          1,
          { status: 'loading' },
          createMockTab({ windowId: 1 })
        )

        expect(chromeMock.scripting.executeScript).not.toHaveBeenCalled()
      })

      it('does nothing when the page is not in the loading state', () => {
        chromeMock.tabs.onUpdated.callListeners(
          1,
          { status: 'complete' },
          createMockTab({ windowId: 1 })
        )

        expect(chromeMock.scripting.executeScript).not.toHaveBeenCalled()
      })
    })
  })

  describe('CSPs', () => {
    describe('Start session', () => {
      it('removes CSP headers', () => {
        startPilotSession({ windowId: 1, tabId: 1 })

        expect(
          chromeMock.declarativeNetRequest.updateSessionRules
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
          expect.anything()
        )
      })

      it('removes CSP from the main frame and any sub frame', () => {
        startPilotSession({ windowId: 1, tabId: 1 })

        expect(
          chromeMock.declarativeNetRequest.updateSessionRules
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            addRules: [
              expect.objectContaining({
                condition: expect.objectContaining({
                  resourceTypes: [
                    chromeMock.declarativeNetRequest.ResourceType.MAIN_FRAME,
                    chromeMock.declarativeNetRequest.ResourceType.SUB_FRAME,
                  ],
                  // tabIds: [1],
                }),
              }),
            ],
          }),
          expect.anything()
        )
      })

      it('removes CSP headers only from tracked tabs', () => {
        startPilotSession({ windowId: 1, tabId: 1 })

        expect(
          chromeMock.declarativeNetRequest.updateSessionRules
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
          expect.anything()
        )
      })
    })

    describe('Stop session', () => {
      it('always removes the previous rules', () => {
        startPilotSession({ windowId: 1 })
        stopPilotSession(1)

        expect(
          chromeMock.declarativeNetRequest.updateSessionRules
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            removeRuleIds: [1],
          }),
          expect.anything()
        )
      })
    })
  })
})
