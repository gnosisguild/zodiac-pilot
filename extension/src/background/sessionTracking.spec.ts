import { PilotMessageType } from '@/messages'
import {
  callListeners,
  chromeMock,
  createMockTab,
  startPilotSession,
} from '@/test-utils'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { clearAllSessions, getPilotSession } from './activePilotSessions'
import { trackSessions } from './sessionTracking'

describe('Session tracking', () => {
  beforeAll(() => {
    trackSessions()
  })

  beforeEach(() => {
    clearAllSessions()
  })

  describe('Start session', () => {
    it('tracks a new session for a given window', async () => {
      await startPilotSession({ windowId: 1 })

      expect(getPilotSession(1)).toMatchObject({
        fork: null,
        id: 1,
        tabs: new Set(),
      })
    })

    it('starts tracking a tab if provided with a tabId', async () => {
      await startPilotSession({ windowId: 1, tabId: 2 })

      expect(getPilotSession(1)).toMatchObject({
        fork: null,
        id: 1,
        tabs: new Set([2]),
      })
    })

    it('sends a connect message the respective tab', async () => {
      await startPilotSession({ windowId: 1, tabId: 1 })

      expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(1, {
        type: PilotMessageType.PILOT_CONNECT,
      })
    })
  })

  describe('Stop session', () => {
    it('removes the session', async () => {
      const { stopPilotSession } = await startPilotSession({ windowId: 1 })
      await stopPilotSession()

      expect(() => getPilotSession(1)).toThrow()
    })

    it('sends a disconnect message to all connected tabs', async () => {
      const { stopPilotSession, startAnotherSession } = await startPilotSession(
        {
          windowId: 1,
          tabId: 1,
        }
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
        await startPilotSession({ windowId: 1 })
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
        await callListeners(chromeMock.tabs.onActivated, {
          windowId: 1,
          tabId: 1,
        })

        expect(() => getPilotSession(1)).toThrow()
      })

      it('sends a pilot connect method to the new tab', async () => {
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
        await startPilotSession({ windowId: 1, tabId: 1 })

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
        await callListeners(chromeMock.tabs.onRemoved, 1, {
          windowId: 1,
          isWindowClosing: false,
        })

        expect(() => getPilotSession(1)).toThrow()
      })

      it('does not send a pilot disconnect message', async () => {
        await startPilotSession({ windowId: 1, tabId: 1 })

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
      it('injects the provider script when new pages are loaded', async () => {
        await startPilotSession({ windowId: 1, tabId: 1 })

        await callListeners(
          chromeMock.tabs.onUpdated,
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

      it('does nothing for untracked tabs', async () => {
        await startPilotSession({ windowId: 1 })

        await callListeners(
          chromeMock.tabs.onUpdated,
          1,
          { status: 'loading' },
          createMockTab({ windowId: 1 })
        )

        expect(chromeMock.scripting.executeScript).not.toHaveBeenCalled()
      })

      it('does nothing when no pilot session is active', async () => {
        await callListeners(
          chromeMock.tabs.onUpdated,
          1,
          { status: 'loading' },
          createMockTab({ windowId: 1 })
        )

        expect(chromeMock.scripting.executeScript).not.toHaveBeenCalled()
      })

      it('does nothing when the page is not in the loading state', async () => {
        await callListeners(
          chromeMock.tabs.onUpdated,
          1,
          { status: 'complete' },
          createMockTab({ windowId: 1 })
        )

        expect(chromeMock.scripting.executeScript).not.toHaveBeenCalled()
      })
    })
  })

  describe('CSP rules', () => {
    describe('Start session', () => {
      it('removes CSP headers', async () => {
        await startPilotSession({ windowId: 1, tabId: 1 })

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

      it('removes CSP from the main frame and any sub frame', async () => {
        await startPilotSession({ windowId: 1, tabId: 1 })

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
                }),
              }),
            ],
          }),
          expect.anything()
        )
      })

      it('removes CSP headers only from tracked tabs', async () => {
        await startPilotSession({ windowId: 1, tabId: 1 })

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
      it('always removes the previous rules', async () => {
        const { stopPilotSession } = await startPilotSession({ windowId: 1 })
        await stopPilotSession()

        expect(
          chromeMock.declarativeNetRequest.updateSessionRules
        ).toHaveBeenCalledWith(
          {
            removeRuleIds: [1],
          },
          expect.anything()
        )
      })
    })

    describe('Tab opened', () => {
      it('updates the rules to include the new tab', async () => {
        await startPilotSession({ windowId: 1 })

        await callListeners(chromeMock.tabs.onActivated, {
          tabId: 1,
          windowId: 1,
        })

        expect(
          chromeMock.declarativeNetRequest.updateSessionRules
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
          expect.anything()
        )
      })
    })

    describe('Tab closed', () => {
      it('updates the rules and removes the closed tab', async () => {
        await startPilotSession({ windowId: 1, tabId: 2 })

        await callListeners(chromeMock.tabs.onActivated, {
          windowId: 1,
          tabId: 1,
        })
        await callListeners(chromeMock.tabs.onRemoved, 2, {
          windowId: 1,
          isWindowClosing: false,
        })

        expect(
          chromeMock.declarativeNetRequest.updateSessionRules
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
          expect.anything()
        )
      })
    })
  })
})
