import { chromeMock } from '@/test-utils'
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

  describe('New tabs', () => {
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

  describe('Closed tabs', () => {
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
})
